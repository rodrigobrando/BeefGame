import { ctx } from '../contexto';
import { sortearDesafio } from '../core/sorteio';
import { calcularOrdem, dividirEmCargas, ordemDeCarga } from '../core/nutricao';
import type { ParamsOrdem } from '../core/nutricao';
import type { Dieta, Nivel } from '../core/tipos';
import { botao, fmt, h } from '../ui/dom';
import { Foco } from '../ui/foco';
import type { Cena } from './GerenciadorCenas';

export interface ParamsCenaOrdem {
  dieta: Dieta;
  nivel: Nivel;
  params: ParamsOrdem;
  modo: 'jogar' | 'desafio';
  semente: number;
}

/** "Ordem de trato" que o tratador recebe antes de carregar. */
export function criarOrdem(p: ParamsCenaOrdem): Cena {
  const cena: Cena = {
    montar(raiz) {
      const ordem = calcularOrdem(p.dieta, p.params);
      const cargas = dividirEmCargas(ordem, ctx.cfg.vagao.capacidadeKg);
      const mostrarSequencia = p.nivel.listaOrdem !== 'embaralhada';
      const seq = ordemDeCarga(p.dieta);

      const ficha = h(
        'div',
        { class: 'ficha' },
        ...[
          ['Curral', ordem.curral],
          ['Cabeças', String(ordem.cabecas)],
          ['Consumo MS/cab/dia', `${fmt(ordem.consumoMSCabDia, 1)} kg`],
          ['Trato', `${fmt(ordem.fracaoTrato * 100, 0)}% do dia`],
          ['MS total', `${fmt(ordem.msTotalKg, 1)} kg`],
          ['MO total', `${fmt(ordem.moTotalKg, 1)} kg`],
          ['MS da dieta', `${fmt(ordem.msDietaPct, 2)}%`],
          ['Cargas', `${cargas.length}${cargas.length > 1 ? ` (${fmt(cargas[0].moTotalKg, 0)} kg cada)` : ''}`],
        ].map(([k, v]) => h('div', { class: 'ficha-item' }, h('span', { class: 'k', text: k }), h('span', { class: 'v', text: v }))),
      );

      const linhas = (mostrarSequencia ? seq : p.dieta.ingredientes).map((ing) => {
        const it = cargas[0].itens.find((i) => i.ingrediente.id === ing.id)!;
        return h(
          'tr',
          {},
          h('td', { text: mostrarSequencia ? `${seq.indexOf(ing) + 1}º` : '?' }),
          h('td', {}, h('span', { class: 'bolinha', style: `background:${ing.cor}` }), ` ${ing.icone} ${ing.nome}`),
          h('td', { class: 'num', text: `${fmt(it.moKg, 1)} kg` }),
          h('td', { text: ing.modoCarga === 'pa' ? 'Pá' : 'Rosca' }),
        );
      });
      const tabela = h('table', { class: 'tabela' }, h('thead', {}, h('tr', {}, h('th', { text: 'Seq.' }), h('th', { text: 'Alimento' }), h('th', { text: 'Alvo (MO)' }), h('th', { text: 'Carga' }))), h('tbody', {}, ...linhas));

      raiz.append(
        h(
          'div',
          { class: 'cartao largo' },
          h('h2', { text: `Ordem de trato — ${p.dieta.nome}` }),
          h('p', { class: 'sub', text: p.nivel.nome + (p.modo === 'desafio' ? ' · lote sorteado' : '') }),
          ficha,
          tabela,
          mostrarSequencia ? null : h('p', { class: 'aviso', text: 'Sequência de carga oculta neste nível: lembre-se — volumosos e úmidos primeiro, concentrados depois.' }),
          h(
            'div',
            { class: 'linha' },
            botao('Começar ▶', () => ctx.cenas.ir('jogo', { ...p, ordem, cargas }), { classe: 'primario' }),
            p.modo === 'desafio' ? botao('Sortear outro', () => {
              const s = sortearDesafio(ctx.dietas(), p.nivel, ctx.cfg, Date.now() & 0x7fffffff);
              ctx.cenas.ir('ordem', { dieta: s.dieta, nivel: p.nivel, params: s.params, modo: 'desafio', semente: s.semente });
            }) : null,
            botao('◀ Voltar', () => ctx.cenas.ir(p.modo === 'desafio' ? 'menu' : 'selecao')),
          ),
        ),
      );
      cena.foco = new Foco(raiz);
    },
    voltar: () => ctx.cenas.ir(p.modo === 'desafio' ? 'menu' : 'selecao'),
  };
  return cena;
}
