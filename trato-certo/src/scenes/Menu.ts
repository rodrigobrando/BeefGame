import { ctx } from '../contexto';
import { sortearDesafio } from '../core/sorteio';
import { botao, h } from '../ui/dom';
import { Foco } from '../ui/foco';
import type { Cena } from './GerenciadorCenas';

export function criarMenu(): Cena {
  return {
    foco: undefined,
    montar(raiz) {
      const dica = h('p', { class: 'dica-menu', text: 'Carregue o vagão no peso certo. Cada quilo errado vira erro na ração do animal.' });
      const itens = h(
        'div',
        { class: 'coluna' },
        botao('▶  Jogar', () => ctx.cenas.ir('selecao'), { classe: 'primario' }),
        botao('★  Desafio (dieta sorteada)', () => {
          const nivel = ctx.niveis.find((n) => n.id === 'desafio')!;
          const s = sortearDesafio(ctx.dietas(), nivel, ctx.cfg, Date.now() & 0x7fffffff);
          ctx.cenas.ir('ordem', { dieta: s.dieta, nivel, params: s.params, modo: 'desafio', semente: s.semente });
        }),
        botao('🏆  Ranking', () => ctx.cenas.ir('ranking')),
        botao('📋  Editor de dietas', () => ctx.cenas.ir('editor')),
        botao('🎮  Configurar controles', () => ctx.cenas.ir('controles')),
        botao('⚙  Configurações', () => ctx.cenas.ir('config')),
      );
      raiz.append(
        h('div', { class: 'cartao centro' }, h('div', { class: 'logo', text: '🐂' }), h('h1', { text: 'TRATO CERTO' }), h('p', { class: 'sub', text: 'Carregamento do vagão misturador' }), itens, dica),
      );
      (this as Cena).foco = new Foco(raiz);
    },
  };
}
