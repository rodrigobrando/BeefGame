import type { Acao } from '../input/acoes';
import type { GerenciadorEntrada } from '../input/GerenciadorEntrada';
import { Foco } from '../ui/foco';

export interface Cena {
  /** Monta a UI dentro de `raiz`. Crie `this.foco = new Foco(raiz)` para navegação por D-pad. */
  montar(raiz: HTMLElement): void;
  desmontar?(): void;
  /** Chamado a cada quadro (dt em segundos). */
  quadro?(dt: number): void;
  /** Retorne true para consumir a ação (impede a navegação padrão). */
  aoAcao?(acao: Acao, tipo: 'press' | 'release'): boolean | void;
  voltar?(): void;
  foco?: Foco;
}

type Fabrica = (params: any) => Cena;

/** Troca de cenas + roteamento padrão das ações abstratas para a navegação por foco. */
export class GerenciadorCenas {
  private fabricas = new Map<string, Fabrica>();
  private cena: Cena | null = null;
  private ultimo = 0;
  nome = '';

  constructor(
    private raiz: HTMLElement,
    private entrada: GerenciadorEntrada,
  ) {
    entrada.aoAcao((a, t) => this.rotear(a, t));
  }

  registrar(nome: string, f: Fabrica): void {
    this.fabricas.set(nome, f);
  }

  ir(nome: string, params?: unknown): void {
    const f = this.fabricas.get(nome);
    if (!f) throw new Error(`Cena desconhecida: ${nome}`);
    this.cena?.desmontar?.();
    this.raiz.replaceChildren();
    const c = f(params);
    this.cena = c;
    this.nome = nome;
    const tela = document.createElement('div');
    tela.className = `tela tela-${nome}`;
    this.raiz.appendChild(tela);
    c.montar(tela);
    c.foco?.iniciar();
  }

  iniciar(): void {
    const laco = (agora: number) => {
      const dt = Math.min(0.05, (agora - (this.ultimo || agora)) / 1000);
      this.ultimo = agora;
      this.entrada.atualizar();
      this.cena?.quadro?.(dt);
      requestAnimationFrame(laco);
    };
    requestAnimationFrame(laco);
  }

  private rotear(a: Acao, tipo: 'press' | 'release'): void {
    const c = this.cena;
    if (!c) return;
    if (c.aoAcao?.(a, tipo) === true) return;
    if (tipo !== 'press') return;
    const f = c.foco;
    switch (a) {
      case 'NAVEGAR_CIMA': f?.mover('cima'); break;
      case 'NAVEGAR_BAIXO': f?.mover('baixo'); break;
      case 'NAVEGAR_ESQ': if (!f?.ajustar(-1)) f?.mover('esq'); break;
      case 'NAVEGAR_DIR': if (!f?.ajustar(1)) f?.mover('dir'); break;
      case 'CONFIRMAR': f?.ativar(); break;
      case 'VOLTAR': c.voltar?.(); break;
      default: break;
    }
  }
}
