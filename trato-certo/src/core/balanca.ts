import type { Rng } from './rng';

/**
 * Balança do vagão: lê o peso real com atraso (filtro de 1ª ordem, constante `tau`)
 * e oscilação leve enquanto o material cai. Resolução arredondada em `resolucaoKg`.
 */
export class Balanca {
  private leitura = 0;
  private ruidoAtual = 0;
  private relogioRuido = 0;

  constructor(
    private tau: number,
    private ruido: number,
    private resolucaoKg: number,
    private rng: Rng,
  ) {}

  /** `fluxoNorm` 0..1: quão forte está caindo material agora (escala o ruído). */
  atualizar(pesoReal: number, dt: number, fluxoNorm: number): void {
    const alfa = this.tau <= 1e-3 ? 1 : 1 - Math.exp(-dt / this.tau);
    this.leitura += (pesoReal - this.leitura) * alfa;
    this.relogioRuido += dt;
    if (this.relogioRuido >= 0.08) {
      this.relogioRuido = 0;
      this.ruidoAtual = (this.rng() * 2 - 1) * this.ruido * Math.min(1, fluxoNorm);
    }
  }

  get valor(): number {
    const v = Math.max(0, this.leitura + this.ruidoAtual);
    return Math.round(v / this.resolucaoKg) * this.resolucaoKg;
  }

  zerar(): void {
    this.leitura = 0;
    this.ruidoAtual = 0;
  }
}
