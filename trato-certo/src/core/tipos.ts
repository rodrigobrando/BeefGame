export type ModoCarga = 'pa' | 'rosca';
export type Faixa = 'perfeito' | 'bom' | 'aceitavel' | 'fora';

export interface Ingrediente {
  id: string;
  nome: string;
  /** Matéria seca do ingrediente (%). */
  ms: number;
  /** Inclusão na base seca (%). */
  inclMS: number;
  /** Inclusão na matéria original informada na tabela (%), usada só para validar. */
  inclMO?: number;
  ordemCarga: number;
  modoCarga: ModoCarga;
  /** kg/s da rosca (só modo rosca). */
  vazaoRosca?: number;
  cor: string;
  icone: string;
}

export interface Dieta {
  id: string;
  nome: string;
  consumoMSCabDia: number;
  ingredientes: Ingrediente[];
  personalizada?: boolean;
}

/** Ingrediente que NÃO pertence à dieta (isca para o jogador errar). */
export interface Distrator {
  id: string;
  nome: string;
  ms: number;
  modoCarga: ModoCarga;
  vazaoRosca?: number;
  cor: string;
  icone: string;
}

export interface ItemOrdem {
  ingrediente: Ingrediente;
  msKg: number;
  moKg: number;
}

export interface OrdemTrato {
  dieta: Dieta;
  curral: string;
  cabecas: number;
  consumoMSCabDia: number;
  fracaoTrato: number;
  msTotalKg: number;
  moTotalKg: number;
  msDietaPct: number;
  itens: ItemOrdem[];
}

export interface Carga {
  numero: number;
  total: number;
  itens: ItemOrdem[];
  msTotalKg: number;
  moTotalKg: number;
}

export interface Aviso {
  tipo: 'soma' | 'inclMO' | 'dado';
  mensagem: string;
  ingredienteId?: string;
}

// ---------- configuração (data/jogo.json e data/niveis.json) ----------

export interface ConfigJogo {
  vagao: { capacidadeKg: number; nome: string };
  currais: string[];
  faixas: { perfeito: number; bom: number; aceitavel: number };
  rosca: { vazaoNominal: number; aceleracao: number; inercia: number; fracaoFino: number };
  pa: { capacidadeKg: number; taxaEnchimento: number; taxaDespejo: number; passoFinoKg: number; cadenciaFino: number };
  balanca: { resolucaoKg: number };
  pontuacao: {
    base: number;
    pesoDesvioPct: number;
    tetoDesvioPct: number;
    pesoNutricionalPP: number;
    penalOrdem: number;
    penalErrado: number;
    penalDescarte: number;
    penalMisturaMax: number;
    bonusTempoMax: number;
    estrelas: { tres: number; duas: number };
  };
}

export type ListaOrdem = 'carga' | 'tabela' | 'embaralhada';

export interface Nivel {
  id: string;
  nome: string;
  descricao: string;
  cabecas: number;
  fracaoTrato: number;
  guia: boolean;
  /** Constante de tempo (s) do atraso de leitura da balança. */
  lagTau: number;
  /** Oscilação (kg) da leitura enquanto cai material. */
  ruido: number;
  /** Tempo (s) que a rosca continua caindo depois de soltar. */
  inercia: number;
  fatorVazao: number;
  fatorTolerancia: number;
  distratores: number;
  listaOrdem: ListaOrdem;
  misturaSeg: number;
  tempoAlvo: number;
  sorteio?: { cabecasMin: number; cabecasMax: number; fracoes: number[] };
}
