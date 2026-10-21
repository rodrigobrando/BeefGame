import type { ConfigJogo, Dieta, Nivel } from './tipos';
import { criarRng, escolher, inteiroEntre } from './rng';
import type { ParamsOrdem } from './nutricao';

/** Ordem sorteada do modo desafio (dieta, lote, fração e curral). Mesma semente → mesmo desafio. */
export function sortearDesafio(
  dietas: Dieta[],
  nivel: Nivel,
  cfg: ConfigJogo,
  semente: number,
): { dieta: Dieta; params: ParamsOrdem; semente: number } {
  const rng = criarRng(semente);
  const s = nivel.sorteio ?? { cabecasMin: 200, cabecasMax: 900, fracoes: [nivel.fracaoTrato] };
  const dieta = escolher(dietas, rng);
  const cabecas = Math.round(inteiroEntre(rng, s.cabecasMin, s.cabecasMax) / 10) * 10;
  const fracaoTrato = escolher(s.fracoes, rng);
  const curral = escolher(cfg.currais, rng);
  return { dieta, params: { cabecas, fracaoTrato, curral }, semente };
}
