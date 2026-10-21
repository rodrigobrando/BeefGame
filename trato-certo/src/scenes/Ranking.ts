import { ctx } from '../contexto';
import { ranking } from '../persist/dados';
import { botao, estrelasTxt, fmt, h } from '../ui/dom';
import { Foco } from '../ui/foco';
import type { Cena } from './GerenciadorCenas';

export function criarRanking(): Cena {
  const cena: Cena = {
    montar(raiz) {
      const lista = ranking.listar();
      const corpo = lista.length
        ? h('table', { class: 'tabela' }, h('thead', {}, h('tr', {}, ...['#', 'Jogador', 'Dieta', 'Pontos', 'Estrelas', 'Desvio', 'Data'].map((t) => h('th', { text: t })))), h('tbody', {}, ...lista.map((e, i) => h('tr', {}, h('td', { text: `${i + 1}º` }), h('td', { text: e.jogador }), h('td', { text: e.dieta }), h('td', { class: 'num', text: String(e.score) }), h('td', { text: estrelasTxt(e.estrelas) }), h('td', { class: 'num', text: `${fmt(e.desvioPct, 2)}%` }), h('td', { text: new Date(e.data).toLocaleDateString('pt-BR') })))))
        : h('p', { class: 'sub', text: 'Ainda não há partidas no modo Desafio.' });
      raiz.append(
        h(
          'div',
          { class: 'cartao largo' },
          h('h2', { text: '🏆 Ranking local (Desafio)' }),
          corpo,
          h('div', { class: 'linha' }, botao('◀ Voltar', () => ctx.cenas.ir('menu'), { classe: 'primario' }), lista.length ? botao('Limpar ranking', () => { ranking.limpar(); ctx.cenas.ir('ranking'); }) : null),
        ),
      );
      cena.foco = new Foco(raiz);
    },
    voltar: () => ctx.cenas.ir('menu'),
  };
  return cena;
}
