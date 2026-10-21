import type { AdaptadorEntrada, Leitura, PerfilMapeamento } from '../acoes';
import { ACOES } from '../acoes';

/**
 * Gamepad API (controle Bluetooth em TV/Android TV).
 * Bindings: "Pad:<botão>" (usa o valor analógico, ex. gatilho RT = 7) e "PadAxis:<eixo><+|->".
 * O valor analógico de ACAO vira o eixo INTENSIDADE (vazão variável da rosca).
 */
export class GamepadAdapter implements AdaptadorEntrada {
  readonly tipo = 'gamepad' as const;
  private perfil: PerfilMapeamento = { zonaMorta: 0.1, sensibilidade: 1, bindings: {} };
  private atividade = false;
  private idAtual = 'gamepad';

  private pad(): Gamepad | null {
    const l = navigator.getGamepads?.() ?? [];
    for (const p of l) if (p && p.connected) return p;
    return null;
  }

  iniciar(): void {
    window.addEventListener('gamepadconnected', this.marcar);
  }
  parar(): void {
    window.removeEventListener('gamepadconnected', this.marcar);
  }
  private marcar = () => {
    this.atividade = true;
  };

  ler(): Leitura {
    const r: Leitura = {};
    const p = this.pad();
    if (!p) return r;
    this.idAtual = p.id;
    let algum = false;
    for (const a of ACOES) {
      let v = 0;
      for (const b of this.perfil.bindings[a] ?? []) {
        const [tipo, id] = b.split(':');
        if (tipo === 'Pad') {
          const btn = p.buttons[+id];
          if (btn) v = Math.max(v, btn.pressed ? Math.max(btn.value, 0.05) : btn.value);
        } else if (tipo === 'PadAxis') {
          const eixo = +id.slice(0, -1);
          const sinal = id.endsWith('-') ? -1 : 1;
          const x = (p.axes[eixo] ?? 0) * sinal;
          if (x > 0) v = Math.max(v, x);
        }
      }
      if (v > 0.3) algum = true;
      if (v > 0) r[a] = v;
    }
    if (algum) this.atividade = true;
    return r;
  }

  consumirAtividade(): boolean {
    const a = this.atividade;
    this.atividade = false;
    return a;
  }
  aplicarPerfil(p: PerfilMapeamento): void {
    this.perfil = p;
  }
  chaveDispositivo(): string {
    return this.pad()?.id ?? this.idAtual;
  }
  conectado(): boolean {
    return this.pad() !== null;
  }

  capturarProximo(timeoutMs: number): Promise<string | null> {
    return new Promise((resolve) => {
      const ini = performance.now();
      const base = this.pad();
      // ignora o que já estava pressionado ao iniciar a captura
      const seguros = new Set<string>();
      base?.buttons.forEach((b, i) => b.pressed && seguros.add(`Pad:${i}`));
      const passo = () => {
        const p = this.pad();
        if (p) {
          for (let i = 0; i < p.buttons.length; i++) {
            const id = `Pad:${i}`;
            if (p.buttons[i].pressed || p.buttons[i].value > 0.6) {
              if (!seguros.has(id)) return resolve(id);
            } else seguros.delete(id);
          }
          for (let i = 0; i < p.axes.length; i++) {
            if (Math.abs(p.axes[i]) > 0.7) return resolve(`PadAxis:${i}${p.axes[i] < 0 ? '-' : '+'}`);
          }
        }
        if (performance.now() - ini > timeoutMs) return resolve(null);
        requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    });
  }
}
