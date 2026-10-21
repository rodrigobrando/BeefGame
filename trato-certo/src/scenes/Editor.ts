import { ctx } from '../contexto';
import { interpretarTabela, montarDieta } from '../core/importar';
import { inclMORecalculada, msDietaDaFormula, validarDieta } from '../core/nutricao';
import type { Ingrediente } from '../core/tipos';
import { dietasCustom } from '../persist/dados';
import { botao, fmt, h, seletor } from '../ui/dom';
import { Foco } from '../ui/foco';
import type { Cena } from './GerenciadorCenas';

const EXEMPLO = `Alimento\tMS (%)\tIncl. MS (%)\tIncl. MO (%)
SILAGEM DE MILHO\t30\t40\t
BAGAÇO CANA\t50\t10\t
POLPA CITRICA\t19\t10\t
SOJA GORDA\t92\t10\t
PRE CONFINAMENTO\t87,59\t30\t`;

/** Editor simples: cola uma tabela, valida os cálculos e salva a dieta (localStorage). */
export function criarEditor(): Cena {
  let ingredientes: Ingrediente[] = [];
  let raizRef: HTMLElement;
  const cena: Cena = {
    montar(raiz) {
      raizRef = raiz;
      desenhar();
    },
    voltar: () => ctx.cenas.ir('menu'),
  };

  const nome = h('input', { class: 'campo', attrs: { type: 'text', placeholder: 'Nome da dieta', maxlength: '30', 'data-foco': '' } });
  const consumo = h('input', { class: 'campo curto', attrs: { type: 'number', step: '0.1', min: '1', max: '20', value: '8', 'data-foco': '' } });
  const area = h('textarea', { class: 'campo area', attrs: { rows: '6', placeholder: 'Cole aqui a tabela (Alimento, MS %, Incl. MS %, Incl. MO %)…', 'data-foco': '' } });
  const saida = h('div', { class: 'saida-editor' });

  function interpretar() {
    const r = interpretarTabela(area.value);
    ingredientes = r.ingredientes;
    renderSaida(r.ignoradas);
  }

  function renderSaida(ignoradas: string[] = []) {
    saida.replaceChildren();
    if (!ingredientes.length) {
      saida.append(h('p', { class: 'sub', text: 'Nenhum ingrediente interpretado ainda.' }));
      return;
    }
    const dieta = { id: 'tmp', nome: nome.value, consumoMSCabDia: Number(consumo.value) || 8, ingredientes };
    const avisos = validarDieta(dieta);
    const rec = avisos.some((a) => a.tipo === 'dado') ? [] : inclMORecalculada(dieta);
    const linhas = ingredientes.map((ing, i) => {
      const modo = seletor('', () => (ing.modoCarga === 'pa' ? 'Pá' : 'Rosca'), () => {
        ing.modoCarga = ing.modoCarga === 'pa' ? 'rosca' : 'pa';
        if (ing.modoCarga === 'rosca') ing.vazaoRosca = ing.vazaoRosca ?? 40;
      });
      const ordem = seletor('', () => `${ing.ordemCarga}º`, (d) => {
        ing.ordemCarga = Math.min(ingredientes.length, Math.max(1, ing.ordemCarga + d));
      });
      return h('tr', {}, h('td', { text: `${ing.icone} ${ing.nome}` }), h('td', { class: 'num', text: fmt(ing.ms, 2) }), h('td', { class: 'num', text: fmt(ing.inclMS, 2) }), h('td', { class: 'num', text: ing.inclMO !== undefined ? fmt(ing.inclMO, 4) : '—' }), h('td', { class: 'num', text: rec[i] !== undefined ? fmt(rec[i], 4) : '—' }), h('td', {}, modo), h('td', {}, ordem));
    });
    saida.append(
      h('table', { class: 'tabela' }, h('thead', {}, h('tr', {}, ...['Alimento', 'MS %', 'Incl. MS %', 'Incl. MO tabela', 'Incl. MO recalc.', 'Carga', 'Ordem'].map((t) => h('th', { text: t })))), h('tbody', {}, ...linhas)),
      h('p', { text: `Σ Incl. MS = ${fmt(ingredientes.reduce((s, i) => s + i.inclMS, 0), 2)}%  ·  MS da dieta = ${fmt(rec.length ? msDietaDaFormula(dieta) : 0, 2)}%` }),
      ...(avisos.length ? avisos.map((a) => h('p', { class: 'aviso', text: `⚠ ${a.mensagem}` })) : [h('p', { class: 'ok', text: '✔ Cálculos conferem: soma 100% e Incl. MO bate com o recálculo.' })]),
      ...(ignoradas.length ? [h('p', { class: 'sub', text: `${ignoradas.length} linha(s) ignorada(s) (cabeçalho ou formato inválido).` })] : []),
    );
  }

  function desenhar() {
    raizRef.replaceChildren();
    const salvas = dietasCustom.listar();
    const salvar = botao('💾 Salvar dieta', () => {
      interpretar();
      const dieta = montarDieta(nome.value.trim() || 'Dieta personalizada', Number(consumo.value) || 8, ingredientes);
      const av = validarDieta(dieta).filter((a) => a.tipo === 'dado' || a.tipo === 'soma');
      if (!ingredientes.length || av.length) {
        saida.append(h('p', { class: 'aviso', text: '⚠ Não salvo: corrija os avisos acima (a soma da Incl. MS precisa ser 100%).' }));
        return;
      }
      dietasCustom.salvar(dieta);
      desenhar();
    }, { classe: 'primario' });
    raizRef.append(
      h(
        'div',
        { class: 'cartao largo' },
        h('h2', { text: '📋 Editor de dietas' }),
        h('div', { class: 'linha-campos' }, h('label', { class: 'campo-rot' }, 'Nome', nome), h('label', { class: 'campo-rot' }, 'MS/cab/dia (kg)', consumo)),
        area,
        h('div', { class: 'linha' }, botao('Interpretar e validar', interpretar), botao('Carregar exemplo', () => { area.value = EXEMPLO; nome.value ||= 'Minha dieta'; interpretar(); }), salvar),
        saida,
        salvas.length ? h('h3', { text: 'Dietas salvas' }) : null,
        ...salvas.map((d) => h('div', { class: 'linha' }, h('span', { text: `${d.nome} (${d.ingredientes.length} ingr.)` }), botao('Excluir', () => { dietasCustom.remover(d.id); desenhar(); }))),
        h('div', { class: 'linha' }, botao('◀ Voltar', () => ctx.cenas.ir('menu'))),
      ),
    );
    renderSaida();
    cena.foco = new Foco(raizRef);
    cena.foco.iniciar();
  }

  return cena;
}
