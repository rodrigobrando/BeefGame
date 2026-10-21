import type { Dieta } from '../core/tipos';
import { repo } from './repositorio';

// ---------- configurações do usuário ----------
export interface Preferencias {
  modoUI: 'auto' | 'tv' | 'celular';
  som: boolean;
  vibracao: boolean;
  jogador: string;
  lado: 'direita' | 'esquerda';
}
export const PREFS_PADRAO: Preferencias = { modoUI: 'auto', som: true, vibracao: true, jogador: 'Tratador', lado: 'direita' };

export const prefs = {
  ler: (): Preferencias => ({ ...PREFS_PADRAO, ...repo().obter<Partial<Preferencias>>('prefs', {}) }),
  salvar: (p: Preferencias) => repo().salvar('prefs', p),
};

// ---------- progresso (melhor resultado por dieta+nível) ----------
export interface Melhor {
  score: number;
  estrelas: number;
}
type MapaProgresso = Record<string, Melhor>;

export const progresso = {
  chave: (dietaId: string, nivelId: string) => `${dietaId}|${nivelId}`,
  tudo: (): MapaProgresso => repo().obter<MapaProgresso>('progresso', {}),
  melhor(dietaId: string, nivelId: string): Melhor | undefined {
    return this.tudo()[this.chave(dietaId, nivelId)];
  },
  registrar(dietaId: string, nivelId: string, m: Melhor): boolean {
    const t = this.tudo();
    const k = this.chave(dietaId, nivelId);
    const ant = t[k];
    if (ant && ant.score >= m.score) return false;
    t[k] = m;
    repo().salvar('progresso', t);
    return true;
  },
  limpar: () => repo().remover('progresso'),
};

// ---------- ranking local (modo desafio) ----------
export interface EntradaRanking {
  jogador: string;
  score: number;
  estrelas: number;
  dieta: string;
  desvioPct: number;
  data: string;
}

export const ranking = {
  listar: (): EntradaRanking[] => repo().obter<EntradaRanking[]>('ranking', []),
  adicionar(e: EntradaRanking): number {
    const l = [...this.listar(), e].sort((a, b) => b.score - a.score).slice(0, 20);
    repo().salvar('ranking', l);
    return l.indexOf(e) + 1;
  },
  limpar: () => repo().remover('ranking'),
};

// ---------- dietas do editor ----------
export const dietasCustom = {
  listar: (): Dieta[] => repo().obter<Dieta[]>('dietas-custom', []),
  salvar(d: Dieta): void {
    const l = this.listar().filter((x) => x.id !== d.id);
    l.push({ ...d, personalizada: true });
    repo().salvar('dietas-custom', l);
  },
  remover(id: string): void {
    repo().salvar('dietas-custom', this.listar().filter((x) => x.id !== id));
  },
};
