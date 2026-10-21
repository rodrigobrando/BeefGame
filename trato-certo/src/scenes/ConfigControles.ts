import { ctx } from '../contexto';
import { ACOES, ROTULO_ACAO, type Acao, type PerfilMapeamento, type TipoDispositivo } from '../input/acoes';
import { bindingsDe, nomeBinding, restaurarPerfil } from '../input/mapeamentos';
import { botao, fmt, h, seletor } from '../ui/dom';
import { Foco } from '../ui/foco';
import type { Cena } from './GerenciadorCenas';

const DISPOSITIVOS: { tipo: TipoDispositivo; nome: string }[] = [
  { tipo: 'teclado', nome: 'Teclado' },
  { tipo: 'gamepad', nome: 'Controle (gamepad)' },
  { tipo: 'movimento', nome: 'Movimento (em breve)' },
];

/** Tela "Configurar controles": captura o próximo botão por ação + zona morta e sensibilidade por dispositivo. */
export function criarConfigControles(): Cena {
  let di = ctx.entrada.ultimoTipo === 'gamepad' ? 1 : 0;
  let bloqueioAte = 0;
  let capturando = false;
  let linhas = new Map<Acao, HTMLElement>();
  let barra: HTMLElement;
  let raizRef: HTMLElement;

  const cena: Cena = {
    montar(raiz) {
      raizRef = raiz;
      desenhar();
    },
    quadro() {
      if (!barra) return;
      barra.style.width = `${ctx.entrada.valor('ACAO') * 100}%`;
      for (const [a, el] of linhas) el.classList.toggle('ativa', ctx.entrada.segurando(a));
    },
    aoAcao() {
      // durante a captura (e logo depois) nenhuma ação navega
      return capturando || performance.now() < bloqueioAte ? true : undefined;
    },
    voltar: () => ctx.cenas.ir('menu'),
  };

  function perfilAtual(): PerfilMapeamento | undefined {
    return ctx.entrada.perfilDe(DISPOSITIVOS[di].tipo);
  }

  function desenhar() {
    const { tipo, nome } = DISPOSITIVOS[di];
    const perfil = perfilAtual();
    raizRef.replaceChildren();
    linhas = new Map();
    const gp = ctx.gamepad.conectado();
    const estado =
      tipo === 'gamepad'
        ? gp ? `Controle detectado: ${ctx.gamepad.chaveDispositivo()}` : 'Nenhum controle detectado. Conecte e aperte um botão.'
        : tipo === 'movimento' ? 'Leitura de acelerômetro ainda não conectada (stub). Veja o README, seção "Acelerômetro".' : 'Teclado (desenvolvimento).';

    const sel = seletor('Dispositivo', () => nome, (d) => {
      di = (di + DISPOSITIVOS.length + d) % DISPOSITIVOS.length;
      desenhar();
    });
    sel.setAttribute('data-foco-inicial', '');

    const corpo: HTMLElement[] = [];
    if (perfil && tipo !== 'movimento') {
      for (const a of ACOES) {
        const bs = bindingsDe(perfil, a);
        const linha = botao(`${ROTULO_ACAO[a]}   →   ${bs.length ? bs.map(nomeBinding).join('  ·  ') : '(sem botão)'}`, () => capturar(a), { classe: 'linha-bind' });
        linhas.set(a, linha);
        corpo.push(linha);
      }
      corpo.push(
        seletor('Zona morta', () => fmt(perfil.zonaMorta, 2), (d) => {
          perfil.zonaMorta = Math.min(0.6, Math.max(0, +(perfil.zonaMorta + d * 0.05).toFixed(2)));
          ctx.entrada.definirPerfil(tipo, perfil);
        }),
        seletor('Sensibilidade', () => fmt(perfil.sensibilidade, 1), (d) => {
          perfil.sensibilidade = Math.min(2, Math.max(0.5, +(perfil.sensibilidade + d * 0.1).toFixed(1)));
          ctx.entrada.definirPerfil(tipo, perfil);
        }),
      );
    }
    barra = h('div', { class: 'nivel' });
    raizRef.append(
      h(
        'div',
        { class: 'cartao largo' },
        h('h2', { text: '🎮 Configurar controles' }),
        sel,
        h('p', { class: 'sub', text: estado }),
        ...(tipo !== 'movimento' ? [h('p', { class: 'sub', text: 'Escolha uma ação e pressione o novo botão. Teste ao vivo: a barra mostra o valor de AÇÃO (INTENSIDADE).' }), h('div', { class: 'guia pequena' }, barra)] : []),
        h('div', { class: 'lista-bind' }, ...corpo),
        h('div', { class: 'linha' },
          tipo !== 'movimento' ? botao('Restaurar padrão', () => { const a = ctx.entrada.adaptador(tipo)!; ctx.entrada.definirPerfil(tipo, restaurarPerfil(tipo, a.chaveDispositivo())); desenhar(); }) : null,
          botao('◀ Voltar', () => ctx.cenas.ir('menu'), { classe: 'primario' }),
        ),
      ),
    );
    cena.foco = new Foco(raizRef);
    cena.foco.iniciar();
  }

  async function capturar(a: Acao) {
    const { tipo } = DISPOSITIVOS[di];
    const perfil = perfilAtual();
    if (!perfil) return;
    capturando = true;
    const aviso = h('div', { class: 'overlay' }, h('div', { class: 'cartao centro' }, h('h2', { text: `Pressione o botão para ${a}…` }), h('p', { class: 'sub', text: 'Aguardando (8 s)…' })));
    raizRef.appendChild(aviso);
    const b = await ctx.entrada.capturar(tipo, 8000);
    aviso.remove();
    bloqueioAte = performance.now() + 400;
    capturando = false;
    if (b) {
      perfil.bindings[a] = [b];
      ctx.entrada.definirPerfil(tipo, perfil);
    }
    const posicao = [...ACOES].indexOf(a);
    desenhar();
    const itens = cena.foco!.itens();
    cena.foco!.definir(itens.find((e) => e === [...linhas.values()][posicao]) ?? itens[0]);
  }

  return cena;
}
