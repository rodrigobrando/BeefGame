import { Balanca } from './balanca';
import { ordemDeCarga } from './nutricao';
import { avaliar, type Resultado } from './pontuacao';
import { embaralhar, type Rng } from './rng';
import type { Carga, ConfigJogo, Distrator, ModoCarga, Nivel } from './tipos';

export type Fase = 'carga' | 'mistura' | 'fim';

export interface EntradaFrame {
  /** ACAO segurado. */
  acao: boolean;
  /** Eixo INTENSIDADE 0..1 (1 para botões digitais). */
  intensidade: number;
  fino: boolean;
}

export interface FonteCarga {
  id: string;
  nome: string;
  ms: number;
  modoCarga: ModoCarga;
  vazaoRosca?: number;
  cor: string;
  icone: string;
  /** Alvo em MO (kg); `null` para ingredientes que não são da dieta. */
  alvoKg: number | null;
  inclMS: number | null;
  /** Posição na sequência correta de carga (1..n); 0 se não é da dieta. */
  posicao: number;
}

export interface EstadoFonte {
  fonte: FonteCarga;
  realKg: number;
  iniciado: boolean;
  confirmado: boolean;
  foraDeOrdem: boolean;
  errado: boolean;
  /** Ordem em que começou a ser carregado (1ª, 2ª…); 0 se ainda não. */
  seqInicio: number;
}

export type Evento =
  | { tipo: 'inicio'; indice: number }
  | { tipo: 'parou'; indice: number }
  | { tipo: 'despejo'; indice: number }
  | { tipo: 'fora-de-ordem'; indice: number }
  | { tipo: 'errado'; indice: number }
  | { tipo: 'confirmado'; indice: number }
  | { tipo: 'descartada' }
  | { tipo: 'mistura-fim'; antecipada: boolean };

/**
 * Simulação pura de UMA carga do vagão: rosca com inércia, pá com concha, balança com lag,
 * ordem de carga, mistura e avaliação. Não depende de engine nem de DOM.
 */
export class SessaoCarga {
  fase: Fase = 'carga';
  readonly fontes: EstadoFonte[];
  cursor = 0;
  tempo = 0;
  totalKg = 0;
  /** kg/s saindo da rosca agora. */
  fluxo = 0;
  /** kg na concha da pá. */
  concha = 0;
  despejando = false;
  descartes = 0;
  misturaProg = 0;
  misturaAntecipada = false;

  readonly balTotal: Balanca;
  readonly balItem: Balanca;
  private eventos: Evento[] = [];
  private timerFino = 0;
  private ocupadoAntes = false;
  private iniciou = false;
  private contInicio = 0;
  private readonly sequencia: string[];

  constructor(
    readonly carga: Carga,
    readonly nivel: Nivel,
    readonly cfg: ConfigJogo,
    distratores: Distrator[],
    rng: Rng,
  ) {
    const dieta = carga.itens.map((i) => i.ingrediente);
    const seq = ordemDeCarga({ id: '', nome: '', consumoMSCabDia: 0, ingredientes: dieta });
    this.sequencia = seq.map((i) => i.id);
    const dosItens: FonteCarga[] = carga.itens.map((it) => ({
      id: it.ingrediente.id,
      nome: it.ingrediente.nome,
      ms: it.ingrediente.ms,
      modoCarga: it.ingrediente.modoCarga,
      vazaoRosca: it.ingrediente.vazaoRosca,
      cor: it.ingrediente.cor,
      icone: it.ingrediente.icone,
      alvoKg: it.moKg,
      inclMS: it.ingrediente.inclMS,
      posicao: this.sequencia.indexOf(it.ingrediente.id) + 1,
    }));
    let lista: FonteCarga[];
    if (nivel.listaOrdem === 'tabela') lista = dosItens;
    else if (nivel.listaOrdem === 'carga') lista = [...dosItens].sort((a, b) => a.posicao - b.posicao);
    else lista = embaralhar(dosItens, rng);
    const iscas: FonteCarga[] = embaralhar(distratores, rng)
      .slice(0, nivel.distratores)
      .map((d) => ({ id: d.id, nome: d.nome, ms: d.ms, modoCarga: d.modoCarga, vazaoRosca: d.vazaoRosca, cor: d.cor, icone: d.icone, alvoKg: null, inclMS: null, posicao: 0 }));
    for (const isca of iscas) lista.splice(Math.floor(rng() * (lista.length + 1)), 0, isca);
    this.fontes = lista.map((fonte) => ({ fonte, realKg: 0, iniciado: false, confirmado: false, foraDeOrdem: false, errado: false, seqInicio: 0 }));
    const res = cfg.balanca.resolucaoKg;
    this.balTotal = new Balanca(nivel.lagTau, nivel.ruido, res, rng);
    this.balItem = new Balanca(nivel.lagTau, nivel.ruido, res, rng);
    this.cursor = this.proximoEsperado();
  }

  // ---------- consulta ----------

  get atual(): EstadoFonte {
    return this.fontes[this.cursor];
  }

  /** Há material em movimento (rosca fluindo ou concha cheia/despejando). */
  get ocupado(): boolean {
    return this.fluxo > 0.5 || this.concha > 0.01 || this.despejando;
  }

  vazaoNominal(f: FonteCarga): number {
    return (f.vazaoRosca ?? this.cfg.rosca.vazaoNominal) * this.nivel.fatorVazao;
  }

  /** Peso que o ingrediente atual terá se o jogador soltar agora (usado pela barra-guia). */
  previsto(): number {
    const a = this.atual;
    if (a.fonte.modoCarga === 'rosca') return a.realKg + this.fluxo * (this.nivel.inercia / 3);
    return a.realKg + this.concha;
  }

  /** Índice do primeiro ingrediente da sequência correta ainda não confirmado (ou -1). */
  private proximoEsperado(): number {
    for (const id of this.sequencia) {
      const idx = this.fontes.findIndex((s) => s.fonte.id === id);
      if (!this.fontes[idx].confirmado) return idx;
    }
    return -1;
  }

  consumirEventos(): Evento[] {
    const e = this.eventos;
    this.eventos = [];
    return e;
  }

  // ---------- comandos ----------

  mover(delta: number): boolean {
    if (this.fase !== 'carga' || this.ocupado) return false;
    const n = this.fontes.length;
    this.cursor = (this.cursor + delta + n) % n;
    return true;
  }

  selecionar(indice: number): boolean {
    if (this.fase !== 'carga' || this.ocupado || indice < 0 || indice >= this.fontes.length) return false;
    this.cursor = indice;
    return true;
  }

  /** AVANÇAR: confirma o ingrediente atual. Ao confirmar o último da sequência, vai para a mistura. */
  avancar(): boolean {
    if (this.fase === 'carga') {
      if (this.ocupado) return false;
      this.atual.confirmado = true;
      this.eventos.push({ tipo: 'confirmado', indice: this.cursor });
      const prox = this.proximoEsperado();
      if (prox < 0) this.fase = 'mistura';
      else this.cursor = prox;
      return true;
    }
    if (this.fase === 'mistura') {
      this.misturaAntecipada = this.misturaProg < this.nivel.misturaSeg;
      this.fase = 'fim';
      this.eventos.push({ tipo: 'mistura-fim', antecipada: this.misturaAntecipada });
      return true;
    }
    return false;
  }

  /** Descarta a carga inteira (o material já no vagão é perdido) e recomeça com custo. */
  descartar(): void {
    if (this.fase !== 'carga') return;
    for (const s of this.fontes) {
      s.realKg = 0;
      s.iniciado = s.confirmado = s.foraDeOrdem = s.errado = false;
      s.seqInicio = 0;
    }
    this.contInicio = 0;
    this.totalKg = 0;
    this.fluxo = 0;
    this.concha = 0;
    this.despejando = false;
    this.descartes++;
    this.cursor = this.proximoEsperado();
    this.eventos.push({ tipo: 'descartada' });
  }

  // ---------- passo de simulação ----------

  atualizar(dt: number, inp: EntradaFrame): void {
    if (this.fase === 'fim') return;
    if (this.fase === 'carga') this.passoCarga(dt, inp);
    else this.passoMistura(dt, inp.acao);
    if (this.iniciou) this.tempo += dt;

    const f = this.atual.fonte;
    const fluxoNorm = f.modoCarga === 'rosca' ? this.fluxo / this.vazaoNominal(f) : this.despejando ? 1 : 0;
    this.balTotal.atualizar(this.totalKg, dt, fluxoNorm);
    this.balItem.atualizar(this.atual.realKg, dt, fluxoNorm);

    const ocupado = this.ocupado;
    if (this.ocupadoAntes && !ocupado) this.eventos.push({ tipo: 'parou', indice: this.cursor });
    this.ocupadoAntes = ocupado;
  }

  private passoCarga(dt: number, inp: EntradaFrame): void {
    const est = this.atual;
    const f = est.fonte;
    const intens = inp.acao ? Math.max(0, Math.min(1, inp.intensidade)) : 0;
    if (f.modoCarga === 'rosca') {
      let alvo = this.vazaoNominal(f) * intens;
      if (!inp.acao && inp.fino) alvo = this.vazaoNominal(f) * this.cfg.rosca.fracaoFino;
      if (alvo > this.fluxo) {
        this.fluxo = Math.min(alvo, this.fluxo + this.cfg.rosca.aceleracao * this.nivel.fatorVazao * dt);
      } else {
        // queda por inércia: exponencial, ~95% extinta em `inercia` segundos
        const tau = Math.max(this.nivel.inercia / 3, 1e-3);
        this.fluxo = alvo + (this.fluxo - alvo) * Math.exp(-dt / tau);
        if (this.fluxo < 0.05 && alvo === 0) this.fluxo = 0;
      }
      if (this.fluxo > 0) this.adicionar(this.fluxo * dt);
    } else {
      const pa = this.cfg.pa;
      this.fluxo = 0;
      if (this.despejando) {
        const q = Math.min(this.concha, pa.taxaDespejo * dt);
        this.concha -= q;
        this.adicionar(q);
        if (this.concha <= 0.01) {
          this.concha = 0;
          this.despejando = false;
        }
      } else if (inp.acao && intens > 0) {
        this.concha = Math.min(pa.capacidadeKg, this.concha + pa.taxaEnchimento * intens * dt);
      } else if (this.concha > 0) {
        this.despejando = true;
        this.eventos.push({ tipo: 'despejo', indice: this.cursor });
      } else if (inp.fino) {
        this.timerFino += dt;
        const periodo = 1 / pa.cadenciaFino;
        while (this.timerFino >= periodo) {
          this.timerFino -= periodo;
          this.adicionar(pa.passoFinoKg);
        }
      } else {
        this.timerFino = 0;
      }
    }
  }

  private adicionar(kg: number): void {
    if (kg <= 0) return;
    const est = this.atual;
    if (!est.iniciado) {
      const esperado = this.sequencia.find((id) => !this.fontes.find((s) => s.fonte.id === id)!.iniciado);
      est.iniciado = true;
      est.seqInicio = ++this.contInicio;
      this.iniciou = true;
      this.eventos.push({ tipo: 'inicio', indice: this.cursor });
      if (est.fonte.posicao === 0) {
        est.errado = true;
        this.eventos.push({ tipo: 'errado', indice: this.cursor });
      } else {
        if (esperado !== est.fonte.id) {
          est.foraDeOrdem = true;
          this.eventos.push({ tipo: 'fora-de-ordem', indice: this.cursor });
        }
      }
    }
    est.realKg += kg;
    this.totalKg += kg;
  }

  private passoMistura(dt: number, segurando: boolean): void {
    if (segurando) this.misturaProg = Math.min(this.nivel.misturaSeg, this.misturaProg + dt);
    if (this.misturaProg >= this.nivel.misturaSeg) {
      this.fase = 'fim';
      this.eventos.push({ tipo: 'mistura-fim', antecipada: false });
    }
  }

  // ---------- resultado ----------

  get uniformidade(): number {
    return Math.min(1, this.misturaProg / this.nivel.misturaSeg);
  }

  resultado(): Resultado {
    const daDieta = this.fontes.filter((s) => s.fonte.alvoKg !== null);
    const iscas = this.fontes.filter((s) => s.fonte.alvoKg === null && s.realKg > 0);
    return avaliar(
      {
        itens: daDieta.map((s) => ({ id: s.fonte.id, nome: s.fonte.nome, ms: s.fonte.ms, inclMS: s.fonte.inclMS!, alvoKg: s.fonte.alvoKg!, realKg: s.realKg })),
        contaminantes: iscas.map((s) => ({ id: s.fonte.id, nome: s.fonte.nome, ms: s.fonte.ms, realKg: s.realKg })),
        idsForaDeOrdem: daDieta.filter((s) => s.foraDeOrdem).map((s) => s.fonte.id),
        idsErrados: iscas.filter((s) => s.errado).map((s) => s.fonte.id),
        descartes: this.descartes,
        uniformidade: this.uniformidade,
        tempo: this.tempo,
        tempoAlvo: this.nivel.tempoAlvo,
        fatorTolerancia: this.nivel.fatorTolerancia,
      },
      this.cfg,
    );
  }
}
