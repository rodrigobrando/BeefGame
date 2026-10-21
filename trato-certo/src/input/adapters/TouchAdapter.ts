import type { Acao, AdaptadorEntrada, Leitura, PerfilMapeamento } from '../acoes';

export interface BotaoToque {
  acao: Acao;
  rotulo: string;
  /** 'grande' | 'medio' | 'pequeno' — todos respeitam o mínimo de 56 px. */
  tamanho: 'grande' | 'medio' | 'pequeno';
}

/**
 * Celular: botões grandes na tela. ACAO fica embaixo, no lado do polegar (direita por padrão).
 * Multi-toque (um dedo em ACAO, outro em AJUSTE FINO) via Pointer Events.
 */
export class TouchAdapter implements AdaptadorEntrada {
  readonly tipo = 'toque' as const;
  private ativos = new Map<number, Acao>();
  private atividade = false;
  private raiz: HTMLElement | null = null;
  lado: 'direita' | 'esquerda' = 'direita';

  private onPointer = () => {
    this.atividade = true;
  };

  iniciar(): void {
    window.addEventListener('pointerdown', this.onPointer, true);
  }
  parar(): void {
    window.removeEventListener('pointerdown', this.onPointer, true);
    this.ocultar();
  }

  /** Mostra os botões dentro de `pai`. Chamado pela cena de jogo. */
  mostrar(pai: HTMLElement, botoes: BotaoToque[]): void {
    this.ocultar();
    const raiz = document.createElement('div');
    raiz.className = `toque-controles lado-${this.lado}`;
    for (const b of botoes) {
      const el = document.createElement('div');
      el.className = `toque-btn t-${b.tamanho} a-${b.acao}`;
      el.textContent = b.rotulo;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        el.setPointerCapture(e.pointerId);
        this.ativos.set(e.pointerId, b.acao);
        el.classList.add('ativo');
      });
      const soltar = (e: PointerEvent) => {
        this.ativos.delete(e.pointerId);
        el.classList.remove('ativo');
      };
      el.addEventListener('pointerup', soltar);
      el.addEventListener('pointercancel', soltar);
      el.addEventListener('lostpointercapture', soltar);
      raiz.appendChild(el);
    }
    pai.appendChild(raiz);
    this.raiz = raiz;
  }

  ocultar(): void {
    this.raiz?.remove();
    this.raiz = null;
    this.ativos.clear();
  }

  ler(): Leitura {
    const r: Leitura = {};
    for (const a of this.ativos.values()) r[a] = 1;
    return r;
  }
  consumirAtividade(): boolean {
    const a = this.atividade;
    this.atividade = false;
    return a;
  }
  aplicarPerfil(_p: PerfilMapeamento): void {}
  chaveDispositivo(): string {
    return 'toque';
  }
}
