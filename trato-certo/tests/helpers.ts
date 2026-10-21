import dietasJson from '../src/data/dietas.json';
import jogoJson from '../src/data/jogo.json';
import niveisJson from '../src/data/niveis.json';
import type { ConfigJogo, Dieta, Distrator, Nivel } from '../src/core/tipos';

export const dietas = dietasJson.dietas as Dieta[];
export const distratores = dietasJson.distratores as Distrator[];
export const cfg = jogoJson as unknown as ConfigJogo;
export const niveis = niveisJson.niveis as unknown as Nivel[];
export const dieta = (id: string) => dietas.find((d) => d.id === id)!;
export const nivel = (id: string) => niveis.find((n) => n.id === id)!;
