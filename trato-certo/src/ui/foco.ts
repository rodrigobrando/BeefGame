import type { ElementoAjustavel } from './dom';

export type Direcao = 'cima' | 'baixo' | 'esq' | 'dir';

/** Navegação espacial por foco (D-pad) sobre elementos `[data-foco]`. */
export class Foco {
  atual: HTMLElement | null = null;

  constructor(private raiz: HTMLElement) {}

  itens(): HTMLElement[] {
    return [...this.raiz.querySelectorAll<HTMLElement>('[data-foco]')].filter((e) => !e.hasAttribute('data-desab') && e.offsetParent !== null);
  }

  definir(el: HTMLElement | null): void {
    this.atual?.classList.remove('foco');
    this.atual = el;
    if (el) {
      el.classList.add('foco');
      el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }

  iniciar(): void {
    const l = this.itens();
    this.definir(l.find((e) => e.hasAttribute('data-foco-inicial')) ?? l[0] ?? null);
  }

  mover(dir: Direcao): void {
    const lista = this.itens();
    if (!lista.length) return;
    if (!this.atual || !lista.includes(this.atual)) return this.definir(lista[0]);
    const c = this.atual.getBoundingClientRect();
    const cx = c.left + c.width / 2;
    const cy = c.top + c.height / 2;
    let melhor: HTMLElement | null = null;
    let melhorScore = Infinity;
    for (const el of lista) {
      if (el === this.atual) continue;
      const r = el.getBoundingClientRect();
      const dx = r.left + r.width / 2 - cx;
      const dy = r.top + r.height / 2 - cy;
      const prim = dir === 'dir' ? dx : dir === 'esq' ? -dx : dir === 'baixo' ? dy : -dy;
      const sec = dir === 'dir' || dir === 'esq' ? Math.abs(dy) : Math.abs(dx);
      if (prim <= 2) continue;
      const score = prim + sec * 2.5;
      if (score < melhorScore) {
        melhorScore = score;
        melhor = el;
      }
    }
    if (melhor) this.definir(melhor);
  }

  ajustar(delta: number): boolean {
    const el = this.atual as ElementoAjustavel | null;
    if (el?.ajustar) {
      el.ajustar(delta);
      return true;
    }
    return false;
  }

  ativar(): void {
    const el = this.atual;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) el.focus();
    else el?.click();
  }
}
