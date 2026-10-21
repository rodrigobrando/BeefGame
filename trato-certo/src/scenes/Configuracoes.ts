import { ctx } from '../contexto';
import { prefs, progresso, ranking, type Preferencias } from '../persist/dados';
import { botao, h, seletor } from '../ui/dom';
import { Foco } from '../ui/foco';
import type { Cena } from './GerenciadorCenas';

function ciclo<T>(lista: readonly T[], atual: T, d: number): T {
  return lista[(lista.indexOf(atual) + d + lista.length) % lista.length];
}

export function criarConfiguracoes(): Cena {
  const cena: Cena = {
    montar(raiz) {
      const p: Preferencias = prefs.ler();
      const salvar = () => {
        prefs.salvar(p);
        ctx.toque.lado = p.lado;
        ctx.aplicarModoUI();
      };
      const modos = ['auto', 'tv', 'celular'] as const;
      const nomeModo = { auto: 'Automático', tv: 'TV (10-foot)', celular: 'Celular' };
      const lados = ['direita', 'esquerda'] as const;
      const inputNome = h('input', { class: 'campo', attrs: { type: 'text', maxlength: '16', value: p.jogador, 'data-foco': '', 'aria-label': 'Nome do jogador' } });
      inputNome.addEventListener('input', () => {
        p.jogador = inputNome.value.trim() || 'Tratador';
        prefs.salvar(p);
      });
      let confirmar = false;
      const limpar = botao('Apagar progresso e ranking', () => {
        if (!confirmar) {
          confirmar = true;
          limpar.textContent = 'Tem certeza? Toque de novo';
          return;
        }
        progresso.limpar();
        ranking.limpar();
        confirmar = false;
        limpar.textContent = 'Apagado ✔';
      });
      raiz.append(
        h(
          'div',
          { class: 'cartao' },
          h('h2', { text: '⚙ Configurações' }),
          seletor('Interface', () => nomeModo[p.modoUI], (d) => { p.modoUI = ciclo(modos, p.modoUI, d); salvar(); }),
          seletor('Som', () => (p.som ? 'Ligado' : 'Desligado'), () => { p.som = !p.som; salvar(); if (!p.som) ctx.audio.silenciar(); }),
          seletor('Vibração', () => (p.vibracao ? 'Ligada' : 'Desligada'), () => { p.vibracao = !p.vibracao; salvar(); }),
          seletor('Botões do celular', () => `Lado ${p.lado}`, (d) => { p.lado = ciclo(lados, p.lado, d); salvar(); }),
          h('label', { class: 'campo-rot' }, 'Nome no ranking', inputNome),
          h('p', { class: 'sub', text: `Último dispositivo usado: ${ctx.entrada.ultimoTipo}` }),
          limpar,
          botao('◀ Voltar', () => ctx.cenas.ir('menu'), { classe: 'primario' }),
        ),
      );
      cena.foco = new Foco(raiz);
    },
    voltar: () => ctx.cenas.ir('menu'),
  };
  return cena;
}
