import { describe, expect, it } from 'vitest';
import { calcularOrdem, dividirEmCargas, inclMORecalculada, validarDieta } from '../src/core/nutricao';
import { cfg, dieta, dietas } from './helpers';

const alvo = (o: ReturnType<typeof calcularOrdem>, id: string) => o.itens.find((i) => i.ingrediente.id === id)!.moKg;

describe('aceitação — Adaptação (100 cab × 8 kg MS, trato único)', () => {
  const o = calcularOrdem(dieta('adaptacao'), { cabecas: 100, fracaoTrato: 1, curral: 'X' });
  it('MS total = 800 kg', () => expect(o.msTotalKg).toBeCloseTo(800, 6));
  it('MO total ≈ 1.705,0 kg', () => expect(o.moTotalKg).toBeCloseTo(1705.0, 0));
  it('MS da dieta ≈ 46,92%', () => expect(o.msDietaPct).toBeCloseTo(46.92, 2));
  it('alvos por ingrediente', () => {
    expect(alvo(o, 'pre-confinamento')).toBeCloseTo(347.1, 1);
    expect(alvo(o, 'soja-gorda')).toBeCloseTo(130.4, 1);
    expect(alvo(o, 'polpa-citrica')).toBeCloseTo(336.8, 1);
    expect(alvo(o, 'bagaco-cana')).toBeCloseTo(224.0, 1);
    expect(alvo(o, 'silagem-milho')).toBeCloseTo(666.7, 1);
  });
});

describe('aceitação — Terminação', () => {
  const d = dieta('terminacao');
  it('MS da dieta ≈ 52,70%', () => {
    const o = calcularOrdem(d, { cabecas: 100, fracaoTrato: 1, curral: 'X' });
    expect(o.msDietaPct).toBeCloseTo(52.7, 2);
  });
  it('Incl. MO recalculada bate com a tabela (±0,01)', () => {
    const rec = inclMORecalculada(d);
    d.ingredientes.forEach((i, k) => expect(Math.abs(rec[k] - i.inclMO!)).toBeLessThanOrEqual(0.01));
  });
});

describe('validação das dietas', () => {
  it.each(dietas.map((d) => [d.id, d] as const))('dieta %s sem avisos', (_id, d) => {
    expect(validarDieta(d)).toEqual([]);
  });
  it('avisa quando a soma da Incl. MS ≠ 100', () => {
    const d = structuredClone(dieta('adaptacao'));
    d.ingredientes[0].inclMS = 40;
    expect(validarDieta(d).some((a) => a.tipo === 'soma')).toBe(true);
  });
  it('avisa quando Incl. MO diverge > 0,01 p.p.', () => {
    const d = structuredClone(dieta('terminacao'));
    d.ingredientes[0].inclMO = 5.75;
    const av = validarDieta(d);
    expect(av.some((a) => a.tipo === 'inclMO' && a.ingredienteId === d.ingredientes[0].id)).toBe(true);
  });
});

describe('capacidade do vagão', () => {
  it('cabe em uma carga', () => {
    const o = calcularOrdem(dieta('adaptacao'), { cabecas: 100, fracaoTrato: 1, curral: 'X' });
    expect(dividirEmCargas(o, cfg.vagao.capacidadeKg)).toHaveLength(1);
  });
  it('divide em cargas quando não cabe, preservando o total', () => {
    const o = calcularOrdem(dieta('adaptacao'), { cabecas: 1500, fracaoTrato: 1, curral: 'X' });
    const cargas = dividirEmCargas(o, 10000);
    expect(cargas.length).toBe(Math.ceil(o.moTotalKg / 10000));
    expect(cargas.reduce((s, c) => s + c.moTotalKg, 0)).toBeCloseTo(o.moTotalKg, 6);
    cargas.forEach((c) => expect(c.moTotalKg).toBeLessThanOrEqual(10000));
  });
});
