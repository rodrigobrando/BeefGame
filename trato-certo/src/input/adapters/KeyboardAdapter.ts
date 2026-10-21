import type { AdaptadorEntrada, Leitura, PerfilMapeamento } from '../acoes';
import { ACOES } from '../acoes';

const digitando = () => {
  const el = document.activeElement;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');
};

/** Teclado (desenvolvimento / PC). Bindings "Key:<KeyboardEvent.code>". */
export class KeyboardAdapter implements AdaptadorEntrada {
  readonly tipo = 'teclado' as const;
  private down = new Set<string>();
  private atividade = false;
  private perfil: PerfilMapeamento = { zonaMorta: 0, sensibilidade: 1, bindings: {} };
  private captura: ((codigo: string) => void) | null = null;

  private onDown = (e: KeyboardEvent) => {
    if (digitando()) return;
    if (this.captura) {
      e.preventDefault();
      e.stopPropagation();
      if (!e.repeat) this.captura(e.code);
      return;
    }
    this.atividade = true;
    this.down.add(e.code);
    if (this.estaVinculada(e.code)) e.preventDefault();
  };
  private onUp = (e: KeyboardEvent) => this.down.delete(e.code);
  private onBlur = () => this.down.clear();

  private estaVinculada(codigo: string): boolean {
    return ACOES.some((a) => (this.perfil.bindings[a] ?? []).includes(`Key:${codigo}`));
  }

  iniciar(): void {
    window.addEventListener('keydown', this.onDown, true);
    window.addEventListener('keyup', this.onUp, true);
    window.addEventListener('blur', this.onBlur);
  }
  parar(): void {
    window.removeEventListener('keydown', this.onDown, true);
    window.removeEventListener('keyup', this.onUp, true);
    window.removeEventListener('blur', this.onBlur);
  }
  ler(): Leitura {
    const r: Leitura = {};
    if (digitando()) return r;
    for (const a of ACOES) {
      if ((this.perfil.bindings[a] ?? []).some((b) => b.startsWith('Key:') && this.down.has(b.slice(4)))) r[a] = 1;
    }
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
    return 'teclado';
  }
  capturarProximo(timeoutMs: number): Promise<string | null> {
    return new Promise((resolve) => {
      const fim = (v: string | null) => {
        clearTimeout(t);
        this.captura = null;
        resolve(v);
      };
      const t = setTimeout(() => fim(null), timeoutMs);
      this.captura = (codigo) => fim(`Key:${codigo}`);
    });
  }
}
