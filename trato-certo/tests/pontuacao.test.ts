import { describe, expect, it } from 'vitest';
import { calcularOrdem } from '../src/core/nutricao';
import { agregar, avaliar, bonusDeTempo, classificar, type EntradaAvaliacao } from '../src/core/pontuacao';
import { cfg, dieta } from './helpers';

const ordem = calcularOrdem(dieta('adaptacao'), { cabecas: 100, fracaoTrato: 1, curral: 'X' });
const base = (fator = 1, tempo = 60): EntradaAvaliacao => ({
  itens: ordem.itens.map((i) => ({ id: i.ingrediente.id, nome: i.ingrediente.nome, ms: i.ingrediente.ms, inclMS: i.ingrediente.inclMS, alvoKg: i.moKg, realKg: i.moKg })),
  contaminantes: [],
  idsForaDeOrdem: [],
  idsErrados: [],
  descartes: 0,
  uniformidade: 1,
  tempo,
  tempoAlvo: 100,
  fatorTolerancia: fator,
});

describe('faixas', () => {
  it('classifica por |%| com as faixas configuradas', () => {
    expect(classificar(0.9, cfg.faixas)).toBe('perfeito');
    expect(classificar(2.9, cfg.faixas)).toBe('bom');
    expect(classificar(5, cfg.faixas)).toBe('aceitavel');
    expect(classificar(5.1, cfg.faixas)).toBe('fora');
  });
  it('fator de tolerância alarga as faixas', () => {
    expect(classificar(1.4, cfg.faixas, 1.5)).toBe('perfeito');
  });
});

describe('score', () => {
  it('carga exata, boa mistura e rápida = base + bônus, 3 estrelas', () => {
    const r = avaliar(base(1, 40), cfg);
    expect(r.desvioTotalKg).toBeCloseTo(0, 9);
    expect(r.desvioNutricionalPP).toBeCloseTo(0, 9);
    expect(r.msDietaReal).toBeCloseTo(r.msDietaPrevista, 6);
    expect(r.score).toBe(cfg.pontuacao.base + cfg.pontuacao.bonusTempoMax);
    expect(r.estrelas).toBe(3);
  });
  it('desvio reduz o score e é reportado em kg e %', () => {
    const e = base();
    e.itens[0].realKg *= 1.05;
    const r = avaliar(e, cfg);
    expect(r.itens[0].desvioPct).toBeCloseTo(5, 6);
    expect(r.itens[0].faixa).toBe('aceitavel');
    expect(r.score).toBeLessThan(avaliar(base(), cfg).score);
    expect(r.desvioNutricionalPP).toBeGreaterThan(0);
  });
  it('precisão pesa mais que velocidade', () => {
    const lento = avaliar(base(1, 500), cfg);
    const impreciso = base();
    impreciso.itens.forEach((i) => (i.realKg *= 1.08));
    expect(avaliar(impreciso, cfg).score).toBeLessThan(lento.score);
  });
  it('penalidades de ordem, ingrediente errado, descarte e mistura', () => {
    const e = base();
    e.idsForaDeOrdem = ['a'];
    e.idsErrados = ['x'];
    e.descartes = 1;
    e.uniformidade = 0.5;
    const r = avaliar(e, cfg);
    const P = cfg.pontuacao;
    expect(r.penalOrdem).toBe(P.penalOrdem);
    expect(r.penalErrado).toBe(P.penalErrado);
    expect(r.penalDescarte).toBe(P.penalDescarte);
    expect(r.penalMistura).toBeCloseTo(P.penalMisturaMax / 2, 6);
  });
  it('contaminante entra no desvio nutricional', () => {
    const e = base();
    e.contaminantes = [{ id: 'x', nome: 'X', ms: 88, realKg: 100 }];
    const r = avaliar(e, cfg);
    expect(r.desvioNutricionalPP).toBeGreaterThan(5);
    expect(r.msDietaReal).not.toBeCloseTo(r.msDietaPrevista, 1);
  });
  it('score nunca fica negativo', () => {
    const e = base();
    e.itens.forEach((i) => (i.realKg = 0));
    e.idsErrados = ['a', 'b', 'c', 'd'];
    expect(avaliar(e, cfg).score).toBe(0);
  });
});

describe('tempo e agregação', () => {
  it('bônus: cheio até 50% do alvo, zero no alvo', () => {
    expect(bonusDeTempo(40, 100, 60)).toBe(60);
    expect(bonusDeTempo(100, 100, 60)).toBe(0);
    expect(bonusDeTempo(75, 100, 60)).toBeCloseTo(30, 6);
  });
  it('agrega cargas', () => {
    const a = avaliar(base(), cfg);
    const e = base();
    e.itens.forEach((i) => (i.realKg *= 1.1));
    const b = avaliar(e, cfg);
    const g = agregar([a, b], cfg);
    expect(g.score).toBe(Math.round((a.score + b.score) / 2));
  });
});
