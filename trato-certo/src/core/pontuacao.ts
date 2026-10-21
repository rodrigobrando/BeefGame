import type { ConfigJogo, Faixa } from './tipos';

export interface EntradaItem {
  id: string;
  nome: string;
  ms: number;
  inclMS: number;
  alvoKg: number;
  realKg: number;
}

export interface EntradaContaminante {
  id: string;
  nome: string;
  ms: number;
  realKg: number;
}

export interface EntradaAvaliacao {
  itens: EntradaItem[];
  contaminantes: EntradaContaminante[];
  idsForaDeOrdem: string[];
  idsErrados: string[];
  descartes: number;
  /** 0..1 */
  uniformidade: number;
  tempo: number;
  tempoAlvo: number;
  fatorTolerancia: number;
}

export interface DesvioItem extends EntradaItem {
  desvioKg: number;
  desvioPct: number;
  faixa: Faixa;
  peso: number;
  /** Incl. MS real (%) do que foi carregado. */
  inclMSReal: number;
  desvioPP: number;
}

export interface Resultado {
  itens: DesvioItem[];
  contaminantes: (EntradaContaminante & { inclMSReal: number })[];
  desvioTotalKg: number;
  desvioTotalPct: number;
  /** Σ |Incl. MS real − prevista| em p.p. (inclui contaminantes). */
  desvioNutricionalPP: number;
  msDietaPrevista: number;
  msDietaReal: number;
  pontosDesvio: number;
  pontosNutricional: number;
  penalOrdem: number;
  penalErrado: number;
  penalDescarte: number;
  penalMistura: number;
  bonusTempo: number;
  uniformidade: number;
  tempo: number;
  score: number;
  estrelas: 1 | 2 | 3;
  faixaGeral: Faixa;
}

export function classificar(absPct: number, faixas: ConfigJogo['faixas'], fator = 1): Faixa {
  if (absPct <= faixas.perfeito * fator + 1e-9) return 'perfeito';
  if (absPct <= faixas.bom * fator + 1e-9) return 'bom';
  if (absPct <= faixas.aceitavel * fator + 1e-9) return 'aceitavel';
  return 'fora';
}

export function bonusDeTempo(tempo: number, tempoAlvo: number, max: number): number {
  const plena = tempoAlvo * 0.5;
  if (tempo <= plena) return max;
  if (tempo >= tempoAlvo) return 0;
  return max * (1 - (tempo - plena) / (tempoAlvo - plena));
}

export function estrelasPorScore(score: number, cfg: ConfigJogo): 1 | 2 | 3 {
  if (score >= cfg.pontuacao.estrelas.tres) return 3;
  if (score >= cfg.pontuacao.estrelas.duas) return 2;
  return 1;
}

/**
 * Score = base − Σ(peso_i × |desvio%_i|) − desvio nutricional − penalidades + bônus de tempo.
 * `peso_i` é proporcional à participação do ingrediente na dieta (média 1).
 */
export function avaliar(e: EntradaAvaliacao, cfg: ConfigJogo): Resultado {
  const P = cfg.pontuacao;
  const n = e.itens.length;
  const msKgItem = e.itens.map((i) => (i.realKg * i.ms) / 100);
  const msKgContam = e.contaminantes.map((c) => (c.realKg * c.ms) / 100);
  const msRealTotal = msKgItem.reduce((s, x) => s + x, 0) + msKgContam.reduce((s, x) => s + x, 0);
  const moRealTotal = e.itens.reduce((s, i) => s + i.realKg, 0) + e.contaminantes.reduce((s, c) => s + c.realKg, 0);
  const somaIncl = e.itens.reduce((s, i) => s + i.inclMS, 0) || 100;

  let pontosDesvio = 0;
  let desvioAbsKg = 0;
  let somaPP = 0;
  const itens: DesvioItem[] = e.itens.map((i, idx) => {
    const desvioKg = i.realKg - i.alvoKg;
    const desvioPct = i.alvoKg > 0 ? (desvioKg / i.alvoKg) * 100 : 0;
    const peso = (P.pesoDesvioPct * n * i.inclMS) / somaIncl;
    pontosDesvio += peso * Math.min(Math.abs(desvioPct), P.tetoDesvioPct);
    desvioAbsKg += Math.abs(desvioKg);
    const inclMSReal = msRealTotal > 0 ? (msKgItem[idx] / msRealTotal) * 100 : 0;
    const desvioPP = inclMSReal - i.inclMS;
    somaPP += Math.abs(desvioPP);
    return { ...i, desvioKg, desvioPct, faixa: classificar(Math.abs(desvioPct), cfg.faixas, e.fatorTolerancia), peso, inclMSReal, desvioPP };
  });
  const contaminantes = e.contaminantes.map((c, idx) => {
    const inclMSReal = msRealTotal > 0 ? (msKgContam[idx] / msRealTotal) * 100 : 0;
    somaPP += inclMSReal;
    desvioAbsKg += c.realKg;
    return { ...c, inclMSReal };
  });

  const alvoTotal = e.itens.reduce((s, i) => s + i.alvoKg, 0);
  const msPrevista = (() => {
    const mo = e.itens.reduce((s, i) => s + i.alvoKg, 0);
    const ms = e.itens.reduce((s, i) => s + (i.alvoKg * i.ms) / 100, 0);
    return mo > 0 ? (ms / mo) * 100 : 0;
  })();

  const pontosNutricional = P.pesoNutricionalPP * somaPP;
  const penalOrdem = P.penalOrdem * e.idsForaDeOrdem.length;
  const penalErrado = P.penalErrado * e.idsErrados.length;
  const penalDescarte = P.penalDescarte * e.descartes;
  const penalMistura = P.penalMisturaMax * (1 - Math.max(0, Math.min(1, e.uniformidade)));
  const bonusTempo = bonusDeTempo(e.tempo, e.tempoAlvo, P.bonusTempoMax);

  const bruto = P.base - pontosDesvio - pontosNutricional - penalOrdem - penalErrado - penalDescarte - penalMistura + bonusTempo;
  const score = Math.max(0, Math.round(bruto));
  const desvioTotalPct = alvoTotal > 0 ? (desvioAbsKg / alvoTotal) * 100 : 0;

  return {
    itens,
    contaminantes,
    desvioTotalKg: desvioAbsKg,
    desvioTotalPct,
    desvioNutricionalPP: somaPP,
    msDietaPrevista: msPrevista,
    msDietaReal: moRealTotal > 0 ? (msRealTotal / moRealTotal) * 100 : 0,
    pontosDesvio,
    pontosNutricional,
    penalOrdem,
    penalErrado,
    penalDescarte,
    penalMistura,
    bonusTempo,
    uniformidade: e.uniformidade,
    tempo: e.tempo,
    score,
    estrelas: estrelasPorScore(score, cfg),
    faixaGeral: classificar(desvioTotalPct, cfg.faixas, e.fatorTolerancia),
  };
}

/** Consolida várias cargas de uma mesma ordem: média dos scores ponderada pelo alvo. */
export function agregar(resultados: Resultado[], cfg: ConfigJogo): { score: number; estrelas: 1 | 2 | 3; desvioTotalPct: number } {
  const pesos = resultados.map((r) => r.itens.reduce((s, i) => s + i.alvoKg, 0) || 1);
  const pt = pesos.reduce((s, x) => s + x, 0);
  const score = Math.round(resultados.reduce((s, r, i) => s + r.score * pesos[i], 0) / pt);
  const desvioTotalPct = resultados.reduce((s, r, i) => s + r.desvioTotalPct * pesos[i], 0) / pt;
  return { score, estrelas: estrelasPorScore(score, cfg), desvioTotalPct };
}
