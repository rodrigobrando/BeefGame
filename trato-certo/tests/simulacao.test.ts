import { describe, expect, it } from 'vitest';
import { calcularOrdem, dividirEmCargas } from '../src/core/nutricao';
import { criarRng } from '../src/core/rng';
import { SessaoCarga, type EntradaFrame } from '../src/core/simulacao';
import { sortearDesafio } from '../src/core/sorteio';
import { cfg, dieta, dietas, distratores, nivel } from './helpers';

const DT = 1 / 60;
const solto: EntradaFrame = { acao: false, intensidade: 1, fino: false };
const segurando: EntradaFrame = { acao: true, intensidade: 1, fino: false };

function nova(nivelId = 'n1', dietaId = 'adaptacao') {
  const ordem = calcularOrdem(dieta(dietaId), { cabecas: 100, fracaoTrato: 1, curral: 'X' });
  const [carga] = dividirEmCargas(ordem, cfg.vagao.capacidadeKg);
  return new SessaoCarga(carga, nivel(nivelId), cfg, distratores, criarRng(7));
}
const rodar = (s: SessaoCarga, seg: number, inp: EntradaFrame) => {
  for (let t = 0; t < seg; t += DT) s.atualizar(DT, inp);
};
/** Carrega o ingrediente atual até o alvo (cortando antecipado) e confirma. */
function carregarPerto(s: SessaoCarga) {
  const alvo = s.atual.fonte.alvoKg!;
  for (let i = 0; i < 20000 && s.previsto() < alvo - 0.5; i++) s.atualizar(DT, segurando);
  rodar(s, 3, solto);
  for (let i = 0; i < 400 && s.atual.realKg < alvo - 1; i++) s.atualizar(DT, { acao: false, intensidade: 1, fino: true });
  rodar(s, 1, solto);
}

describe('rosca', () => {
  it('continua caindo por inércia depois de soltar', () => {
    const s = nova();
    expect(s.atual.fonte.modoCarga).toBe('pa'); // silagem é a 1ª e usa pá
    while (s.atual.fonte.id !== 'pre-confinamento') {
      carregarPerto(s);
      s.avancar();
    }
    rodar(s, 1, segurando);
    const antes = s.atual.realKg;
    rodar(s, 0.05, solto);
    rodar(s, 2, solto);
    expect(s.atual.realKg - antes).toBeGreaterThan(2);
    expect(s.fluxo).toBe(0);
  });
  it('previsão (barra-guia) acerta o peso final dentro de 1 kg', () => {
    const s = nova();
    while (s.atual.fonte.modoCarga !== 'rosca') {
      carregarPerto(s);
      s.avancar();
    }
    rodar(s, 1.5, segurando);
    const previsto = s.previsto();
    rodar(s, 4, solto);
    expect(Math.abs(s.atual.realKg - previsto)).toBeLessThan(1);
  });
});

describe('pá', () => {
  it('soltar despeja a concha inteira no vagão', () => {
    const s = nova();
    rodar(s, 1, segurando);
    const concha = s.concha;
    expect(concha).toBeGreaterThan(100);
    rodar(s, 2, solto);
    expect(s.atual.realKg).toBeCloseTo(concha, 3);
    expect(s.totalKg).toBeCloseTo(concha, 3);
    expect(s.concha).toBe(0);
  });
  it('ajuste fino adiciona passos pequenos', () => {
    const s = nova();
    rodar(s, 1, { acao: false, intensidade: 1, fino: true });
    expect(s.atual.realKg).toBeGreaterThan(0);
    expect(s.atual.realKg).toBeLessThan(cfg.pa.passoFinoKg * cfg.pa.cadenciaFino * 1.2);
  });
});

describe('ordem, erros e fluxo completo', () => {
  it('fora de ordem é registrado uma vez e pontuado', () => {
    const s = nova();
    s.selecionar(s.fontes.findIndex((f) => f.fonte.id === 'pre-confinamento'));
    rodar(s, 0.5, segurando);
    rodar(s, 2, solto);
    expect(s.atual.foraDeOrdem).toBe(true);
    expect(s.resultado().penalOrdem).toBe(cfg.pontuacao.penalOrdem);
  });
  it('ingrediente fora da dieta é "errado" e contamina', () => {
    const s = nova('n3');
    const i = s.fontes.findIndex((f) => f.fonte.alvoKg === null);
    expect(i).toBeGreaterThanOrEqual(0);
    s.selecionar(i);
    rodar(s, 0.5, segurando);
    rodar(s, 2, solto);
    const r = s.resultado();
    expect(r.penalErrado).toBe(cfg.pontuacao.penalErrado);
    expect(r.contaminantes.length).toBe(1);
  });
  it('não troca de ingrediente com material em movimento', () => {
    const s = nova();
    rodar(s, 0.3, segurando);
    expect(s.mover(1)).toBe(false);
    expect(s.avancar()).toBe(false);
  });
  it('descartar zera a carga e cobra o custo', () => {
    const s = nova();
    rodar(s, 1, segurando);
    rodar(s, 2, solto);
    s.descartar();
    expect(s.totalKg).toBe(0);
    expect(s.resultado().penalDescarte).toBe(cfg.pontuacao.penalDescarte);
  });
  it('carga completa na ordem certa + mistura dá resultado alto', () => {
    const s = nova();
    let guard = 0;
    while (s.fase === 'carga' && guard++ < 20) {
      carregarPerto(s);
      expect(s.avancar()).toBe(true);
    }
    expect(s.fase).toBe('mistura');
    rodar(s, nivel('n1').misturaSeg + 1, segurando);
    expect(s.fase).toBe('fim');
    const r = s.resultado();
    expect(r.penalOrdem + r.penalErrado + r.penalMistura).toBe(0);
    expect(r.desvioTotalPct).toBeLessThan(3);
    expect(r.estrelas).toBeGreaterThanOrEqual(2);
  });
  it('mistura antecipada gera penalidade de uniformidade', () => {
    const s = nova();
    while (s.fase === 'carga') {
      carregarPerto(s);
      s.avancar();
    }
    rodar(s, 1, segurando);
    s.avancar();
    expect(s.fase).toBe('fim');
    expect(s.resultado().penalMistura).toBeGreaterThan(0);
  });
});

describe('balança', () => {
  it('lê com atraso: logo após cair material ainda marca menos que o real', () => {
    const s = nova('n3');
    rodar(s, 0.8, segurando);
    rodar(s, 0.3, solto);
    expect(s.balTotal.valor).toBeLessThan(s.totalKg - 1);
    rodar(s, 4, solto);
    expect(Math.abs(s.balTotal.valor - s.totalKg)).toBeLessThanOrEqual(1);
  });
});

describe('sorteio do desafio', () => {
  it('é determinístico por semente', () => {
    const a = sortearDesafio(dietas, nivel('desafio'), cfg, 42);
    const b = sortearDesafio(dietas, nivel('desafio'), cfg, 42);
    expect(a.dieta.id).toBe(b.dieta.id);
    expect(a.params).toEqual(b.params);
  });
});
