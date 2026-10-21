import { ctx } from '../contexto';
import { criarRng } from '../core/rng';
import { SessaoCarga, type Evento } from '../core/simulacao';
import { agregar, classificar, type Resultado } from '../core/pontuacao';
import type { Carga, Dieta, Nivel, OrdemTrato } from '../core/tipos';
import type { Acao } from '../input/acoes';
import { progresso, ranking, prefs } from '../persist/dados';
import { CenaVagao } from '../ui/cenaVagao';
import { botao, fmt, fmtTempo, h } from '../ui/dom';
import { Foco } from '../ui/foco';
import { vibrar } from '../ui/haptico';
import type { Cena } from './GerenciadorCenas';

export interface ParamsJogo {
  dieta: Dieta;
  nivel: Nivel;
  ordem: OrdemTrato;
  cargas: Carga[];
  modo: 'jogar' | 'desafio';
  semente: number;
}

export function criarJogo(p: ParamsJogo): Cena {
  const { entrada, audio, cfg } = ctx;
  const nivel = p.nivel;
  const rng = criarRng((Date.now() ^ (p.semente * 2654435761)) >>> 0);
  let idx = 0;
  const resultados: Resultado[] = [];

  let sessao!: SessaoCarga;
  let vagao!: CenaVagao;
  let canvas!: HTMLCanvasElement;
  let tela!: HTMLElement;
  let pausado = false;
  let transicao = false;
  let toastT = 0;
  let relogio = 0;
  let overlay: HTMLElement | null = null;
  let focoOverlay: Foco | null = null;
  let onResize: (() => void) | null = null;

  const el = {} as Record<string, HTMLElement>;
  let itensLista: HTMLElement[] = [];

  const toast = (txt: string, tipo: 'erro' | 'ok' = 'erro') => {
    el.toast.textContent = txt;
    el.toast.className = `toast mostra ${tipo}`;
    toastT = 2.2;
  };

  function novaSessao() {
    sessao = new SessaoCarga(p.cargas[idx], nivel, cfg, ctx.distratores, rng);
    montarLista();
  }

  function montarLista() {
    el.lista.replaceChildren();
    itensLista = sessao.fontes.map((s, i) => {
      const f = s.fonte;
      const li = h(
        'li',
        { class: 'ing' },
        h('span', { class: 'bolinha', style: `background:${f.cor}` }),
        h('span', { class: 'ing-ico', text: f.icone }),
        h('span', { class: 'ing-nome', text: f.nome }),
        h('span', { class: 'ing-tag', text: f.modoCarga === 'pa' ? 'PÁ' : 'ROSCA' }),
        h('span', { class: 'ing-alvo', text: f.alvoKg !== null ? `${fmt(f.alvoKg, 0)} kg` : '—' }),
        h('span', { class: 'ing-st' }),
      );
      if (nivel.listaOrdem === 'carga' && f.posicao > 0) li.insertBefore(h('span', { class: 'ing-seq', text: `${f.posicao}º` }), li.firstChild);
      li.addEventListener('click', () => {
        if (!pausado && sessao.fase === 'carga' && !sessao.selecionar(i)) toast('Termine o que está carregando antes de trocar.');
      });
      el.lista.appendChild(li);
      return li;
    });
  }

  function dica(): string {
    if (sessao.fase === 'mistura') return 'Segure AÇÃO para misturar até a barra encher. AVANÇAR encerra antes (penaliza uniformidade).';
    const a = sessao.atual;
    const f = a.fonte;
    if (f.alvoKg === null) return '⚠ Este ingrediente NÃO é da dieta. Escolha outro na lista.';
    if (!nivel.guia) return sessao.ocupado ? '' : a.realKg > 0 ? 'AVANÇAR confirma. AJUSTE FINO completa o peso.' : '';
    if (a.realKg === 0 && !sessao.ocupado) {
      return f.modoCarga === 'rosca'
        ? 'Segure AÇÃO para abrir a rosca. Solte quando o marcador amarelo encostar no alvo: a rosca ainda cai um pouco.'
        : 'Segure AÇÃO para encher a concha e solte para despejar no vagão. Complete com AJUSTE FINO.';
    }
    if (sessao.ocupado) return f.modoCarga === 'rosca' ? 'Solte antes do alvo — a rosca continua caindo!' : '';
    return 'Quando estiver no alvo, aperte AVANÇAR.';
  }

  function atualizarHUD() {
    const s = sessao;
    const a = s.atual;
    const f = a.fonte;
    el.topo.textContent = `${p.dieta.nome} · ${p.ordem.curral} · ${p.ordem.cabecas} cab.${s.carga.total > 1 ? ` · carga ${s.carga.numero}/${s.carga.total}` : ''}`;
    el.tempo.textContent = `⏱ ${fmtTempo(s.tempo)}`;
    const mistura = s.fase === 'mistura';
    tela.classList.toggle('fase-mistura', mistura);
    el.pTotal.textContent = fmt(s.balTotal.valor, 0);
    el.pItem.textContent = mistura ? '—' : fmt(s.balItem.valor, 0);
    el.pAlvo.textContent = mistura ? '—' : f.alvoKg !== null ? fmt(f.alvoKg, 0) : '—';
    el.itemNome.textContent = mistura ? 'MISTURA' : `${f.icone} ${f.nome}`;

    // barra-guia (somente quando o nível permite) e barra de mistura
    el.guia.style.display = nivel.guia && !mistura && f.alvoKg !== null ? '' : 'none';
    if (nivel.guia && f.alvoKg !== null && !mistura) {
      const max = f.alvoKg * 1.25;
      const pct = (v: number) => `${Math.max(0, Math.min(100, (v / max) * 100))}%`;
      const tolB = cfg.faixas.bom * nivel.fatorTolerancia;
      const tolP = cfg.faixas.perfeito * nivel.fatorTolerancia;
      const faixa = (e: HTMLElement, t: number) => {
        e.style.left = pct(f.alvoKg! * (1 - t / 100));
        e.style.width = `${((f.alvoKg! * 2 * t) / 100 / max) * 100}%`;
      };
      faixa(el.bandaBom, tolB);
      faixa(el.bandaPerf, tolP);
      el.barraNivel.style.width = pct(s.balItem.valor);
      el.marcaPrev.style.left = pct(s.previsto());
      el.marcaPrev.style.display = s.ocupado || s.atual.realKg > 0 ? '' : 'none';
      el.marcaPrev.classList.toggle('passou', s.previsto() > f.alvoKg * (1 + tolB / 100));
    }
    el.mistura.style.display = mistura ? '' : 'none';
    el.misturaBarra.style.width = `${s.uniformidade * 100}%`;

    // lista de ingredientes
    s.fontes.forEach((st, i) => {
      const li = itensLista[i];
      li.classList.toggle('atual', i === s.cursor && s.fase === 'carga');
      li.classList.toggle('feito', st.confirmado);
      li.classList.toggle('erro', st.foraDeOrdem || st.errado);
      const stEl = li.lastElementChild as HTMLElement;
      const txt = st.errado ? '✖ fora da dieta' : st.confirmado ? `✔ ${fmt(st.realKg, 0)}` : st.foraDeOrdem ? '⚠ ordem' : '';
      if (stEl.textContent !== txt) stEl.textContent = txt;
    });
    const d = dica();
    if (el.dica.textContent !== d) el.dica.textContent = d;
  }

  function tratarEventos(evs: Evento[]) {
    for (const ev of evs) {
      switch (ev.tipo) {
        case 'fora-de-ordem':
          audio.erro();
          vibrar(200);
          toast(`Fora de ordem! −${cfg.pontuacao.penalOrdem} pts`);
          break;
        case 'errado':
          audio.erro();
          vibrar([120, 60, 120]);
          toast(`Ingrediente errado! −${cfg.pontuacao.penalErrado} pts`);
          break;
        case 'despejo':
          audio.baque();
          break;
        case 'parou': {
          const st = sessao.fontes[ev.indice];
          const alvo = st.fonte.alvoKg;
          if (alvo) {
            const pct = Math.abs(((st.realKg - alvo) / alvo) * 100);
            const faixa = classificar(pct, cfg.faixas, nivel.fatorTolerancia);
            if (faixa === 'perfeito') {
              vibrar([30, 40, 30]);
              audio.bip(1320, 0.12);
            } else if (faixa === 'bom') vibrar(30);
          }
          break;
        }
        case 'confirmado':
          audio.bip(660, 0.07);
          break;
        case 'descartada':
          toast(`Carga descartada. −${cfg.pontuacao.penalDescarte} pts`);
          break;
        case 'mistura-fim':
          audio.bip(988, 0.15);
          break;
        default:
          break;
      }
    }
  }

  function abrirOverlay(conteudo: HTMLElement) {
    fecharOverlay();
    overlay = h('div', { class: 'overlay' }, conteudo);
    tela.appendChild(overlay);
    focoOverlay = new Foco(overlay);
    focoOverlay.iniciar();
  }
  function fecharOverlay() {
    overlay?.remove();
    overlay = null;
    focoOverlay = null;
  }

  function pausar() {
    if (pausado || transicao) return;
    pausado = true;
    audio.silenciar();
    const emMistura = sessao.fase !== 'carga';
    abrirOverlay(
      h(
        'div',
        { class: 'cartao centro' },
        h('h2', { text: 'Pausado' }),
        botao('▶ Continuar', () => {
          fecharOverlay();
          pausado = false;
        }, { classe: 'primario' }),
        botao(`🗑 Descartar carga (−${cfg.pontuacao.penalDescarte} pts)`, () => {
          sessao.descartar();
          tratarEventos(sessao.consumirEventos());
          fecharOverlay();
          pausado = false;
        }, { desabilitado: emMistura }),
        botao('⌂ Sair para o menu', () => ctx.cenas.ir('menu')),
      ),
    );
  }

  function fimDaCarga() {
    const r = sessao.resultado();
    resultados.push(r);
    audio.silenciar();
    if (idx + 1 < p.cargas.length) {
      transicao = true;
      abrirOverlay(
        h(
          'div',
          { class: 'cartao centro' },
          h('h2', { text: `Carga ${idx + 1}/${p.cargas.length} concluída` }),
          h('p', { class: 'grande', text: `${r.score} pts · desvio ${fmt(r.desvioTotalPct, 1)}%` }),
          botao('Próxima carga ▶', () => {
            idx++;
            fecharOverlay();
            transicao = false;
            novaSessao();
          }, { classe: 'primario' }),
        ),
      );
      return;
    }
    const ag = agregar(resultados, cfg);
    let posRanking = 0;
    let recorde = false;
    if (p.modo === 'desafio') {
      posRanking = ranking.adicionar({ jogador: prefs.ler().jogador, score: ag.score, estrelas: ag.estrelas, dieta: p.dieta.nome, desvioPct: ag.desvioTotalPct, data: new Date().toISOString() });
    } else {
      recorde = progresso.registrar(p.dieta.id, nivel.id, { score: ag.score, estrelas: ag.estrelas });
    }
    ctx.cenas.ir('relatorio', { ...p, resultados, agregado: ag, posRanking, recorde });
  }

  const cena: Cena = {
    montar(raiz) {
      tela = raiz;
      raiz.classList.add('jogo');
      canvas = h('canvas', { class: 'palco-canvas' });
      el.topo = h('span', { class: 'topo-info' });
      el.tempo = h('span', { class: 'topo-tempo' });
      el.toast = h('div', { class: 'toast' });
      el.pTotal = h('div', { class: 'lcd-valor' });
      el.pItem = h('div', { class: 'lcd-valor' });
      el.pAlvo = h('div', { class: 'lcd-valor alvo' });
      el.itemNome = h('div', { class: 'item-nome' });
      el.bandaBom = h('div', { class: 'banda bom' });
      el.bandaPerf = h('div', { class: 'banda perf' });
      el.barraNivel = h('div', { class: 'nivel' });
      el.marcaPrev = h('div', { class: 'prev' });
      el.guia = h('div', { class: 'guia' }, el.bandaBom, el.bandaPerf, el.barraNivel, el.marcaPrev, h('div', { class: 'alvo-linha' }));
      el.misturaBarra = h('div', { class: 'nivel' });
      el.mistura = h('div', { class: 'mistura-box' }, h('div', { class: 'mistura-rotulo', text: 'UNIFORMIDADE DA MISTURA' }), h('div', { class: 'guia' }, el.misturaBarra));
      el.dica = h('div', { class: 'dica' });
      el.lista = h('ol', { class: 'lista-ing' });
      const lcd = (rot: string, v: HTMLElement) => h('div', { class: 'lcd' }, h('div', { class: 'lcd-rot', text: rot }), v);
      const pausaBtn = h('div', { class: 'btn-icone', text: 'II', attrs: { role: 'button' } });
      pausaBtn.addEventListener('click', pausar);
      raiz.append(
        h('div', { class: 'jogo-topo' }, el.topo, el.tempo, pausaBtn),
        h('div', { class: 'jogo-palco' }, canvas),
        h('div', { class: 'jogo-painel' }, el.itemNome, h('div', { class: 'balanca' }, lcd('TOTAL kg', el.pTotal), lcd('INGREDIENTE kg', el.pItem), lcd('ALVO kg', el.pAlvo)), el.guia, el.mistura, el.dica, el.lista),
        el.toast,
      );
      vagao = new CenaVagao(canvas);
      onResize = () => vagao.redimensionar();
      window.addEventListener('resize', onResize);
      requestAnimationFrame(() => vagao.redimensionar());
      ctx.toque.lado = prefs.ler().lado;
      ctx.toque.mostrar(raiz, [
        { acao: 'ACAO', rotulo: 'AÇÃO', tamanho: 'grande' },
        { acao: 'AJUSTE_FINO', rotulo: 'FINO', tamanho: 'medio' },
        { acao: 'AVANCAR', rotulo: 'AVANÇAR', tamanho: 'medio' },
      ]);
      novaSessao();
      audio.destravar();
    },

    desmontar() {
      ctx.toque.ocultar();
      audio.silenciar();
      if (onResize) window.removeEventListener('resize', onResize);
    },

    quadro(dt) {
      if (el.toast && toastT > 0) {
        toastT -= dt;
        if (toastT <= 0) el.toast.className = 'toast';
      }
      if (pausado || transicao) {
        return;
      }
      relogio += dt;
      const inp = { acao: entrada.segurando('ACAO'), intensidade: entrada.intensidade(), fino: entrada.segurando('AJUSTE_FINO') };
      sessao.atualizar(dt, inp);
      tratarEventos(sessao.consumirEventos());

      const f = sessao.atual.fonte;
      if (sessao.fase === 'carga') {
        audio.rosca(f.modoCarga === 'rosca' ? sessao.fluxo / sessao.vazaoNominal(f) : 0);
        audio.concha(f.modoCarga === 'pa' && inp.acao && !sessao.despejando ? inp.intensidade : 0);
        audio.mistura(false);
        if (nivel.guia && f.alvoKg && sessao.ocupado) audio.proximidade((f.alvoKg - sessao.previsto()) / f.alvoKg, relogio);
      } else {
        audio.rosca(0);
        audio.concha(0);
        audio.mistura(sessao.fase === 'mistura' && inp.acao);
      }
      atualizarHUD();
      vagao.desenhar(sessao, dt);
      if (sessao.fase === 'fim') fimDaCarga();
    },

    aoAcao(a: Acao, tipo) {
      if (tipo !== 'press') return pausado || transicao ? undefined : true;
      if (pausado || transicao) {
        // menu de pausa / transição: navegação por foco do overlay
        const f = focoOverlay;
        if (!f) return true;
        if (a === 'NAVEGAR_CIMA') f.mover('cima');
        else if (a === 'NAVEGAR_BAIXO') f.mover('baixo');
        else if (a === 'NAVEGAR_ESQ') f.mover('esq');
        else if (a === 'NAVEGAR_DIR') f.mover('dir');
        else if (a === 'CONFIRMAR') f.ativar();
        else if ((a === 'PAUSA' || a === 'VOLTAR') && pausado) {
          fecharOverlay();
          pausado = false;
        }
        return true;
      }
      switch (a) {
        case 'AVANCAR':
          if (!sessao.avancar() && sessao.fase === 'carga') toast('Termine a carga em andamento antes de avançar.');
          break;
        case 'NAVEGAR_CIMA':
          sessao.mover(-1);
          break;
        case 'NAVEGAR_BAIXO':
          sessao.mover(1);
          break;
        case 'PAUSA':
        case 'VOLTAR':
          pausar();
          break;
        default:
          break;
      }
      return true;
    },
    voltar: pausar,
  };
  return cena;
}
