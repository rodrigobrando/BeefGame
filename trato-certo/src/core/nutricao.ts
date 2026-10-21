import type { Aviso, Carga, Dieta, Ingrediente, OrdemTrato } from './tipos';

export interface ParamsOrdem {
  cabecas: number;
  fracaoTrato: number;
  curral: string;
  /** Se omitido usa o consumo da dieta. */
  consumoMSCabDia?: number;
}

/** Ingredientes na sequência de carregamento. */
export function ordemDeCarga(dieta: Dieta): Ingrediente[] {
  return [...dieta.ingredientes].sort((a, b) => a.ordemCarga - b.ordemCarga);
}

/**
 * 1. MS total = cabeças × consumo MS/cab/dia × fração do trato
 * 2. MO_i = MS_total × InclMS_i / MS_i
 * 3. MS da dieta (%) = MS_total / MO_total
 */
export function calcularOrdem(dieta: Dieta, p: ParamsOrdem): OrdemTrato {
  const consumo = p.consumoMSCabDia ?? dieta.consumoMSCabDia;
  const msTotalKg = p.cabecas * consumo * p.fracaoTrato;
  const itens = dieta.ingredientes.map((ingrediente) => ({
    ingrediente,
    msKg: (msTotalKg * ingrediente.inclMS) / 100,
    moKg: (msTotalKg * ingrediente.inclMS) / ingrediente.ms,
  }));
  const moTotalKg = itens.reduce((s, i) => s + i.moKg, 0);
  return {
    dieta,
    curral: p.curral,
    cabecas: p.cabecas,
    consumoMSCabDia: consumo,
    fracaoTrato: p.fracaoTrato,
    msTotalKg,
    moTotalKg,
    msDietaPct: moTotalKg > 0 ? (msTotalKg / moTotalKg) * 100 : 0,
    itens,
  };
}

/** Incl. MO (%) recalculada a partir de MS e Incl. MS, na ordem de `dieta.ingredientes`. */
export function inclMORecalculada(dieta: Dieta): number[] {
  const partes = dieta.ingredientes.map((i) => i.inclMS / i.ms);
  const soma = partes.reduce((s, x) => s + x, 0);
  return partes.map((x) => (soma > 0 ? (x / soma) * 100 : 0));
}

/** MS da dieta (%) a partir da fórmula (independe do tamanho da ordem). */
export function msDietaDaFormula(dieta: Dieta): number {
  const soma = dieta.ingredientes.reduce((s, i) => s + i.inclMS / i.ms, 0);
  const inclTotal = dieta.ingredientes.reduce((s, i) => s + i.inclMS, 0);
  return soma > 0 ? inclTotal / soma : 0;
}

const f2 = (n: number) => n.toFixed(2).replace('.', ',');

/** Avisa se Σ Incl. MS ≠ 100 ou se a Incl. MO da tabela diverge do recálculo (> tolPP p.p.). */
export function validarDieta(dieta: Dieta, tolPP = 0.01): Aviso[] {
  const avisos: Aviso[] = [];
  for (const i of dieta.ingredientes) {
    if (!(i.ms > 0 && i.ms <= 100)) avisos.push({ tipo: 'dado', ingredienteId: i.id, mensagem: `${i.nome}: MS (%) inválida (${i.ms}).` });
    if (!(i.inclMS >= 0)) avisos.push({ tipo: 'dado', ingredienteId: i.id, mensagem: `${i.nome}: Incl. MS (%) inválida (${i.inclMS}).` });
  }
  if (avisos.length) return avisos;
  const soma = dieta.ingredientes.reduce((s, i) => s + i.inclMS, 0);
  if (Math.abs(soma - 100) > 1e-6) {
    avisos.push({ tipo: 'soma', mensagem: `A soma da Incl. MS é ${f2(soma)}%, deveria ser 100%.` });
  }
  const rec = inclMORecalculada(dieta);
  dieta.ingredientes.forEach((i, idx) => {
    if (i.inclMO === undefined) return;
    const dif = Math.abs(rec[idx] - i.inclMO);
    if (dif > tolPP) {
      avisos.push({
        tipo: 'inclMO',
        ingredienteId: i.id,
        mensagem: `${i.nome}: Incl. MO da tabela ${f2(i.inclMO)}% ≠ recalculada ${f2(rec[idx])}% (dif. ${dif.toFixed(3).replace('.', ',')} p.p.).`,
      });
    }
  });
  return avisos;
}

/** Divide a ordem em cargas iguais se a MO total não couber no vagão. */
export function dividirEmCargas(ordem: OrdemTrato, capacidadeKg: number): Carga[] {
  const n = Math.max(1, Math.ceil(ordem.moTotalKg / capacidadeKg - 1e-9));
  return Array.from({ length: n }, (_, k) => ({
    numero: k + 1,
    total: n,
    itens: ordem.itens.map((i) => ({ ingrediente: i.ingrediente, msKg: i.msKg / n, moKg: i.moKg / n })),
    msTotalKg: ordem.msTotalKg / n,
    moTotalKg: ordem.moTotalKg / n,
  }));
}
