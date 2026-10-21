type Filho = Node | string | null | undefined | false;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: { class?: string; text?: string; attrs?: Record<string, string>; style?: string } = {},
  ...filhos: Filho[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (props.class) el.className = props.class;
  if (props.text !== undefined) el.textContent = props.text;
  if (props.style) el.setAttribute('style', props.style);
  for (const [k, v] of Object.entries(props.attrs ?? {})) el.setAttribute(k, v);
  for (const f of filhos) if (f) el.append(f);
  return el;
}

export interface OpcoesBotao {
  classe?: string;
  desabilitado?: boolean;
}

/** Botão focável por D-pad. É um <div> (não <button>) para a ativação por CONFIRMAR não duplicar com o Enter nativo. */
export function botao(texto: string, aoClicar: () => void, o: OpcoesBotao = {}): HTMLElement {
  const el = h('div', { class: `btn ${o.classe ?? ''}`, text: texto, attrs: { role: 'button', 'data-foco': '' } });
  if (o.desabilitado) el.setAttribute('data-desab', '');
  el.addEventListener('click', () => {
    if (!el.hasAttribute('data-desab')) aoClicar();
  });
  return el;
}

export type ElementoAjustavel = HTMLElement & { ajustar?: (delta: number) => void };

/** Controle "◀ valor ▶": D-pad ESQ/DIR (ou toque nas metades) ajusta. */
export function seletor(rotulo: string, texto: () => string, mudar: (delta: number) => void): ElementoAjustavel {
  const valor = h('span', { class: 'sel-valor', text: texto() });
  const el = h('div', { class: 'seletor', attrs: { role: 'spinbutton', 'data-foco': '' } }, h('span', { class: 'sel-rotulo', text: rotulo }), h('span', { class: 'sel-seta', text: '◀' }), valor, h('span', { class: 'sel-seta', text: '▶' })) as ElementoAjustavel;
  el.ajustar = (d) => {
    mudar(d);
    valor.textContent = texto();
  };
  el.addEventListener('click', (e) => {
    const r = el.getBoundingClientRect();
    el.ajustar!(e.clientX < r.left + r.width / 2 ? -1 : 1);
  });
  return el;
}

export function fmt(n: number, casas = 1): string {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
}
export function fmtKg(n: number, casas = 0): string {
  return `${fmt(n, casas)} kg`;
}
export function fmtTempo(s: number): string {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
}
export const estrelasTxt = (n: number) => '★'.repeat(n) + '☆'.repeat(3 - n);
