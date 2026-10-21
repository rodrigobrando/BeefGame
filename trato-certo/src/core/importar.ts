import type { Dieta, Ingrediente } from './tipos';

const CORES = ['#5f9b3c', '#9aa55b', '#e8892b', '#c98a3b', '#d9c24a', '#b7793f', '#4f8fba', '#a2527a', '#7c8c3a', '#cc6b49'];
const ICONES = ['🌽', '🎋', '🍊', '🌾', '🫘', '🥜', '🧂', '🌿', '🥣', '🌱'];

function numero(txt: string): number {
  let t = txt.trim().replace(/%/g, '').replace(/\s/g, '');
  if (t.includes(',') && t.includes('.')) t = t.replace(/\./g, '').replace(',', '.');
  else t = t.replace(',', '.');
  return Number(t);
}

export function slug(txt: string): string {
  return txt
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function celulas(linha: string): string[] | null {
  if (/^[\s|:-]+$/.test(linha)) return null; // separador de tabela markdown
  let t = linha.split(/\t|;|\|/).map((s) => s.trim()).filter((s) => s !== '');
  if (t.length < 3) {
    const m = linha.trim().match(/^(.*?)\s+(-?[\d.,]+)\s+(-?[\d.,]+)(?:\s+(-?[\d.,]+))?$/);
    if (!m) return null;
    t = [m[1], m[2], m[3], ...(m[4] ? [m[4]] : [])];
  }
  return t;
}

export interface ResultadoImportacao {
  ingredientes: Ingrediente[];
  ignoradas: string[];
}

/**
 * Interpreta uma tabela colada (Excel/Sheets/Markdown): Alimento | MS (%) | Incl. MS (%) | [Incl. MO (%)].
 * Aceita vírgula decimal. Linhas de cabeçalho ou inválidas são ignoradas e listadas em `ignoradas`.
 * Modo de carga e ordem padrão: MS < 60% → pá, senão rosca; mais úmidos primeiro.
 */
export function interpretarTabela(texto: string): ResultadoImportacao {
  const brutos: { nome: string; ms: number; inclMS: number; inclMO?: number }[] = [];
  const ignoradas: string[] = [];
  for (const linha of texto.split(/\r?\n/)) {
    if (!linha.trim()) continue;
    const c = celulas(linha);
    if (!c) {
      if (!/^[\s|:-]+$/.test(linha)) ignoradas.push(linha.trim());
      continue;
    }
    const [nome, a, b, d] = c;
    const ms = numero(a);
    const inclMS = numero(b);
    if (!Number.isFinite(ms) || !Number.isFinite(inclMS)) {
      ignoradas.push(linha.trim());
      continue;
    }
    const inclMO = d !== undefined && Number.isFinite(numero(d)) ? numero(d) : undefined;
    brutos.push({ nome, ms, inclMS, inclMO });
  }
  const porUmidade = brutos.map((_, i) => i).sort((i, j) => brutos[i].ms - brutos[j].ms || i - j);
  const ingredientes = brutos.map<Ingrediente>((b, i) => ({
    id: slug(b.nome) || `ing-${i + 1}`,
    nome: b.nome.toUpperCase(),
    ms: b.ms,
    inclMS: b.inclMS,
    inclMO: b.inclMO,
    ordemCarga: porUmidade.indexOf(i) + 1,
    modoCarga: b.ms < 60 ? 'pa' : 'rosca',
    ...(b.ms < 60 ? {} : { vazaoRosca: 40 }),
    cor: CORES[i % CORES.length],
    icone: ICONES[i % ICONES.length],
  }));
  return { ingredientes, ignoradas };
}

export function montarDieta(nome: string, consumoMSCabDia: number, ingredientes: Ingrediente[]): Dieta {
  return { id: `${slug(nome) || 'dieta'}-${Date.now().toString(36)}`, nome, consumoMSCabDia, ingredientes, personalizada: true };
}
