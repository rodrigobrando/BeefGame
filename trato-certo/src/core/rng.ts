export type Rng = () => number;

/** Gerador determinístico (mulberry32): mesma semente, mesma sequência. */
export function criarRng(semente: number): Rng {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function embaralhar<T>(lista: readonly T[], rng: Rng): T[] {
  const r = [...lista];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export function inteiroEntre(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function escolher<T>(lista: readonly T[], rng: Rng): T {
  return lista[Math.floor(rng() * lista.length)];
}
