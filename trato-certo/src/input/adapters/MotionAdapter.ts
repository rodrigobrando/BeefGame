import type { AdaptadorEntrada, Leitura, PerfilMapeamento } from '../acoes';
import { ACOES } from '../acoes';

/**
 * ============================ PONTO DE EXTENSÃO: ACELERÔMETRO ============================
 * A leitura do sensor NÃO está implementada. A fonte física será definida depois:
 *   • DeviceMotion/DeviceOrientation no celular (precisa de permissão no iOS);
 *   • WebHID para controles com giroscópio;
 *   • bridge nativa Android (WebView.addJavascriptInterface → window.postMessage).
 * Para plugar: implemente `FonteMovimento` e passe a `new MotionAdapter(fonte)`,
 * depois chame `entrada.registrar(adapter)` (veja README, seção "Acelerômetro").
 *
 * Contrato: `ler()` devolve a inclinação NORMALIZADA em -1..1 por eixo
 * (x = esquerda/direita, y = frente/trás, z = giro). A normalização (graus → -1..1)
 * é responsabilidade da fonte. Bindings no perfil "movimento": "Tilt:y+" = inclinar à frente.
 * Zona morta e sensibilidade vêm do perfil (calibração por dispositivo).
 * ========================================================================================
 */
export interface FonteMovimento {
  iniciar(): void | Promise<void>;
  parar(): void;
  ler(): { x: number; y: number; z: number };
}

/** Fonte nula: tudo parado. É o padrão enquanto não há sensor. */
export class FonteMovimentoNula implements FonteMovimento {
  iniciar(): void {}
  parar(): void {}
  ler() {
    return { x: 0, y: 0, z: 0 };
  }
}

/** Mock para desenvolvimento/testes: altere `valor` à mão (ex. pelo console: __movimento.valor.y = 0.8). */
export class FonteMovimentoMock implements FonteMovimento {
  valor = { x: 0, y: 0, z: 0 };
  iniciar(): void {}
  parar(): void {}
  ler() {
    return { ...this.valor };
  }
}

export class MotionAdapter implements AdaptadorEntrada {
  readonly tipo = 'movimento' as const;
  private perfil: PerfilMapeamento = { zonaMorta: 0.08, sensibilidade: 1, bindings: {} };
  private atividade = false;

  constructor(private fonte: FonteMovimento = new FonteMovimentoNula()) {}

  iniciar(): void {
    void this.fonte.iniciar();
  }
  parar(): void {
    this.fonte.parar();
  }

  ler(): Leitura {
    const s = this.fonte.ler();
    const r: Leitura = {};
    for (const a of ACOES) {
      let v = 0;
      for (const b of this.perfil.bindings[a] ?? []) {
        const [tipo, id] = b.split(':');
        if (tipo !== 'Tilt') continue;
        const eixo = id.slice(0, -1) as 'x' | 'y' | 'z';
        const x = (s[eixo] ?? 0) * (id.endsWith('-') ? -1 : 1);
        if (x > 0) v = Math.max(v, Math.min(1, x));
      }
      if (v > 0) r[a] = v;
    }
    if (Object.keys(r).length) this.atividade = true;
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
    return 'movimento';
  }
}
