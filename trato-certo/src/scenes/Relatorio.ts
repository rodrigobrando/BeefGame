import { ctx } from '../contexto';
import type { Faixa } from '../core/tipos';
import type { Resultado } from '../core/pontuacao';
import { botao, estrelasTxt, fmt, fmtTempo, h } from '../ui/dom';
import { Foco } from '../ui/foco';
import type { Cena } from './GerenciadorCenas';
import type { ParamsJogo } from './Jogo';

export interface ParamsRelatorio extends ParamsJogo {
  resultados: Resultado[];
  agregado: { score: number; estrelas: 1 | 2 | 3; desvioTotalPct: number };
  posRanking: number;
  recorde: boolean;
}

const ROTULO_FAIXA: Record<Faixa, string> = { perfeito: 'Perfeito', bom: 'Bom', aceitavel: 'Aceitável', fora: 'Fora' };
const sinal = (n: number, c: number) => (n > 0 ? '+' : '') + fmt(n, c);

function tabelaCarga(r: Resultado) {
  const linhas = r.itens.map((i) =>
    h(
      'tr',
      {},
      h('td', {}, i.nome),
      h('td', { class: 'num', text: fmt(i.alvoKg, 1) }),
      h('td', { class: 'num', text: fmt(i.realKg, 1) }),
      h('td', { class: 'num', text: sinal(i.desvioKg, 1) }),
      h('td', { class: 'num', text: `${sinal(i.desvioPct, 2)}%` }),
      h('td', {}, h('span', { class: `selo ${i.faixa}`, text: ROTULO_FAIXA[i.faixa] })),
    ),
  );
  for (const c of r.contaminantes) {
    linhas.push(
      h('tr', { class: 'linha-erro' }, h('td', {}, `${c.nome} (fora da dieta)`), h('td', { class: 'num', text: '0,0' }), h('td', { class: 'num', text: fmt(c.realKg, 1) }), h('td', { class: 'num', text: sinal(c.realKg, 1) }), h('td', { class: 'num', text: '—' }), h('td', {}, h('span', { class: 'selo fora', text: 'Errado' }))),
    );
  }
  return h('table', { class: 'tabela' }, h('thead', {}, h('tr', {}, ...['Alimento', 'Alvo kg', 'Real kg', 'Desvio kg', 'Desvio %', 'Faixa'].map((t) => h('th', { text: t })))), h('tbody', {}, ...linhas));
}

function tabelaNutricional(r: Resultado) {
  const linhas = r.itens.map((i) =>
    h('tr', {}, h('td', {}, i.nome), h('td', { class: 'num', text: `${fmt(i.inclMS, 2)}%` }), h('td', { class: 'num', text: `${fmt(i.inclMSReal, 2)}%` }), h('td', { class: 'num', text: `${sinal(i.desvioPP, 2)} p.p.` })),
  );
  return h('table', { class: 'tabela' }, h('thead', {}, h('tr', {}, ...['Alimento', 'Incl. MS dieta', 'Incl. MS real', 'Desvio'].map((t) => h('th', { text: t })))), h('tbody', {}, ...linhas));
}

/** Relatório no estilo dos softwares de carregamento: alvo × real × desvio, mais o desvio nutricional. */
export function criarRelatorio(p: ParamsRelatorio): Cena {
  const cena: Cena = {
    montar(raiz) {
      const ag = p.agregado;
      const blocos = p.resultados.map((r, k) => {
        const pen: string[] = [];
        if (r.penalOrdem) pen.push(`ordem −${r.penalOrdem}`);
        if (r.penalErrado) pen.push(`ingrediente errado −${r.penalErrado}`);
        if (r.penalDescarte) pen.push(`descarte −${r.penalDescarte}`);
        if (r.penalMistura > 0.5) pen.push(`mistura −${fmt(r.penalMistura, 0)}`);
        return h(
          'section',
          { class: 'bloco' },
          p.resultados.length > 1 ? h('h3', { text: `Carga ${k + 1}/${p.resultados.length} — ${r.score} pts` }) : null,
          tabelaCarga(r),
          h('div', { class: 'destaque-nutri' },
            h('h3', { text: 'Desvio nutricional (o erro que chega ao animal)' }),
            tabelaNutricional(r),
            h('p', { text: `MS da dieta: prevista ${fmt(r.msDietaPrevista, 2)}% · real ${fmt(r.msDietaReal, 2)}% · Σ|desvio| = ${fmt(r.desvioNutricionalPP, 2)} p.p.` }),
          ),
          h('p', { class: 'sub', text: `Desvio total da carga: ${fmt(r.desvioTotalKg, 1)} kg (${fmt(r.desvioTotalPct, 2)}%) · mistura ${fmt(r.uniformidade * 100, 0)}% · tempo ${fmtTempo(r.tempo)} (bônus +${fmt(r.bonusTempo, 0)})${pen.length ? ' · penalidades: ' + pen.join(', ') : ''}`, }),
        );
      });
      raiz.append(
        h(
          'div',
          { class: 'cartao largo relatorio' },
          h('h2', { text: `Relatório de carregamento — ${p.dieta.nome}` }),
          h('p', { class: 'sub', text: `${p.ordem.curral} · ${p.ordem.cabecas} cab. · ${p.nivel.nome}` }),
          h('div', { class: 'placar' }, h('div', { class: 'estrelas-grandes', text: estrelasTxt(ag.estrelas) }), h('div', { class: 'score-grande', text: `${ag.score} pts` }), h('div', { class: 'sub', text: `Desvio total ${fmt(ag.desvioTotalPct, 2)}%` })),
          p.recorde ? h('p', { class: 'ok', text: '🏅 Novo recorde neste nível!' }) : null,
          p.posRanking ? h('p', { class: 'ok', text: `🏆 Posição ${p.posRanking}º no ranking local` }) : null,
          ...blocos,
          h(
            'div',
            { class: 'linha' },
            botao('↻ Jogar de novo', () => ctx.cenas.ir('jogo', { ...p, semente: p.semente + 1 }), { classe: 'primario' }),
            p.modo === 'desafio' ? botao('🏆 Ranking', () => ctx.cenas.ir('ranking')) : botao('Escolher nível', () => ctx.cenas.ir('selecao')),
            botao('⌂ Menu', () => ctx.cenas.ir('menu')),
          ),
        ),
      );
      cena.foco = new Foco(raiz);
    },
    voltar: () => ctx.cenas.ir('menu'),
  };
  return cena;
}
