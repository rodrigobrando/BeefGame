import { ctx } from '../contexto';
import { validarDieta } from '../core/nutricao';
import { criarRng } from '../core/rng';
import { escolher } from '../core/rng';
import { progresso } from '../persist/dados';
import { botao, estrelasTxt, h, seletor } from '../ui/dom';
import { Foco } from '../ui/foco';
import type { Cena } from './GerenciadorCenas';

export function criarSelecao(): Cena {
  const cena: Cena = {
    montar(raiz) {
      const dietas = ctx.dietas();
      const niveis = ctx.niveis.filter((n) => n.id !== 'desafio');
      let di = 0;
      let ni = 0;
      const info = h('div', { class: 'info-sel' });

      const atualizar = () => {
        const d = dietas[di];
        const n = niveis[ni];
        const av = validarDieta(d);
        const melhor = progresso.melhor(d.id, n.id);
        const linhas: Node[] = [
          h('p', { text: n.descricao }),
          h('p', { class: 'sub', text: `${d.ingredientes.length} ingredientes · ${n.cabecas} cabeças · mistura ${n.misturaSeg} s` }),
          melhor ? h('p', { class: 'estrelas', text: `Melhor: ${estrelasTxt(melhor.estrelas)}  ${melhor.score} pts` }) : h('p', { class: 'sub', text: 'Ainda não jogado' }),
        ];
        if (av.length) linhas.push(h('p', { class: 'aviso', text: `⚠ ${av.length} aviso(s) na dieta — veja o Editor de dietas` }));
        info.replaceChildren(...linhas);
      };

      const sDieta = seletor('Dieta', () => dietas[di].nome, (d) => {
        di = (di + dietas.length + d) % dietas.length;
        atualizar();
      });
      const sNivel = seletor('Nível', () => niveis[ni].nome, (d) => {
        ni = (ni + niveis.length + d) % niveis.length;
        atualizar();
      });
      sDieta.setAttribute('data-foco-inicial', '');
      atualizar();

      raiz.append(
        h(
          'div',
          { class: 'cartao' },
          h('h2', { text: 'Escolha a dieta e o nível' }),
          sDieta,
          sNivel,
          info,
          h(
            'div',
            { class: 'linha' },
            botao('Ver ordem de trato ▶', () => {
              const n = niveis[ni];
              const rng = criarRng(Date.now() & 0x7fffffff);
              ctx.cenas.ir('ordem', { dieta: dietas[di], nivel: n, params: { cabecas: n.cabecas, fracaoTrato: n.fracaoTrato, curral: escolher(ctx.cfg.currais, rng) }, modo: 'jogar', semente: 1 });
            }, { classe: 'primario' }),
            botao('◀ Voltar', () => ctx.cenas.ir('menu')),
          ),
        ),
      );
      cena.foco = new Foco(raiz);
    },
    voltar: () => ctx.cenas.ir('menu'),
  };
  return cena;
}
