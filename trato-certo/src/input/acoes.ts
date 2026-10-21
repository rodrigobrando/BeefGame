/**
 * Ações abstratas do jogo. Nenhuma cena conhece teclas ou botões: só estas ações.
 * `INTENSIDADE` não é uma ação à parte: é o valor analógico (0..1) de `ACAO`.
 */
export const ACOES = [
  'ACAO',
  'AJUSTE_FINO',
  'AVANCAR',
  'VOLTAR',
  'PAUSA',
  'NAVEGAR_CIMA',
  'NAVEGAR_BAIXO',
  'NAVEGAR_ESQ',
  'NAVEGAR_DIR',
  'CONFIRMAR',
] as const;
export type Acao = (typeof ACOES)[number];

export const ROTULO_ACAO: Record<Acao, string> = {
  ACAO: 'AÇÃO (segurar: abre rosca / enche concha)',
  AJUSTE_FINO: 'AJUSTE FINO',
  AVANCAR: 'AVANÇAR (confirma ingrediente)',
  VOLTAR: 'VOLTAR',
  PAUSA: 'PAUSA',
  NAVEGAR_CIMA: 'Navegar ↑',
  NAVEGAR_BAIXO: 'Navegar ↓',
  NAVEGAR_ESQ: 'Navegar ←',
  NAVEGAR_DIR: 'Navegar →',
  CONFIRMAR: 'CONFIRMAR',
};

export type TipoDispositivo = 'teclado' | 'toque' | 'gamepad' | 'movimento';

/** Valores 0..1 por ação neste instante. */
export type Leitura = Partial<Record<Acao, number>>;

export interface PerfilMapeamento {
  /** 0..0.9: abaixo disso o valor é 0. */
  zonaMorta: number;
  /** multiplicador do valor (0.5..2). */
  sensibilidade: number;
  /** ação → lista de bindings ("Key:Space", "Pad:7", "PadAxis:1-", "Tilt:x+"). */
  bindings: Partial<Record<Acao, string[]>>;
}

export interface AdaptadorEntrada {
  readonly tipo: TipoDispositivo;
  iniciar(): void;
  parar(): void;
  ler(): Leitura;
  /** Houve interação do usuário neste dispositivo desde a última chamada? */
  consumirAtividade(): boolean;
  aplicarPerfil(p: PerfilMapeamento): void;
  /** Identifica o aparelho físico (para perfis por dispositivo). */
  chaveDispositivo(): string;
  /** Captura o próximo botão/tecla/eixo acionado. `null` = tempo esgotado. */
  capturarProximo?(timeoutMs: number): Promise<string | null>;
}
