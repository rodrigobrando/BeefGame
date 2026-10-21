import { ACOES, type Acao, type AdaptadorEntrada, type PerfilMapeamento, type TipoDispositivo } from './acoes';
import { carregarPerfil, salvarPerfil } from './mapeamentos';

type Ouvinte = (acao: Acao, tipo: 'press' | 'release') => void;

const LIMIAR: Record<Acao, number> = {
  ACAO: 0.05, AJUSTE_FINO: 0.5, AVANCAR: 0.5, VOLTAR: 0.5, PAUSA: 0.5,
  NAVEGAR_CIMA: 0.45, NAVEGAR_BAIXO: 0.45, NAVEGAR_ESQ: 0.45, NAVEGAR_DIR: 0.45, CONFIRMAR: 0.5,
};

/**
 * Junta todos os adaptadores num único estado de ações. Chame `atualizar()` uma vez por quadro.
 * Cenas consultam `segurando()`, `intensidade()` ou assinam `aoAcao()`.
 */
export class GerenciadorEntrada {
  private adaptadores: AdaptadorEntrada[] = [];
  private chaves = new Map<AdaptadorEntrada, string>();
  private perfis = new Map<AdaptadorEntrada, PerfilMapeamento>();
  private valores = {} as Record<Acao, number>;
  private ouvintes = new Set<Ouvinte>();
  private ouvintesTipo = new Set<(t: TipoDispositivo) => void>();
  ultimoTipo: TipoDispositivo = 'toque';

  constructor() {
    for (const a of ACOES) this.valores[a] = 0;
  }

  registrar(a: AdaptadorEntrada): void {
    this.adaptadores.push(a);
    a.iniciar();
    this.recarregarPerfil(a);
  }

  adaptador<T extends AdaptadorEntrada>(tipo: TipoDispositivo): T | undefined {
    return this.adaptadores.find((a) => a.tipo === tipo) as T | undefined;
  }

  perfilDe(tipo: TipoDispositivo): PerfilMapeamento | undefined {
    const a = this.adaptador(tipo);
    return a && this.perfis.get(a);
  }

  /** Aplica e salva um perfil editado (tela "Configurar controles"). */
  definirPerfil(tipo: TipoDispositivo, perfil: PerfilMapeamento): void {
    const a = this.adaptador(tipo);
    if (!a) return;
    this.perfis.set(a, perfil);
    a.aplicarPerfil(perfil);
    salvarPerfil(tipo, a.chaveDispositivo(), perfil);
  }

  private recarregarPerfil(a: AdaptadorEntrada): void {
    const k = a.chaveDispositivo();
    this.chaves.set(a, k);
    const p = carregarPerfil(a.tipo, k);
    this.perfis.set(a, p);
    a.aplicarPerfil(p);
  }

  aoAcao(fn: Ouvinte): () => void {
    this.ouvintes.add(fn);
    return () => this.ouvintes.delete(fn);
  }
  aoTrocarTipo(fn: (t: TipoDispositivo) => void): () => void {
    this.ouvintesTipo.add(fn);
    return () => this.ouvintesTipo.delete(fn);
  }

  segurando(a: Acao): boolean {
    return this.valores[a] >= LIMIAR[a];
  }
  valor(a: Acao): number {
    return this.valores[a];
  }
  /** Eixo INTENSIDADE (0..1): valor analógico de ACAO (gatilho, inclinação) ou 1 se digital. */
  intensidade(): number {
    return this.valores.ACAO;
  }

  /** Captura o próximo botão do dispositivo e grava no perfil. Devolve o binding ou null. */
  async capturar(tipo: TipoDispositivo, timeoutMs = 8000): Promise<string | null> {
    const a = this.adaptador(tipo);
    return a?.capturarProximo ? a.capturarProximo(timeoutMs) : null;
  }

  atualizar(): void {
    for (const a of this.adaptadores) {
      if (a.chaveDispositivo() !== this.chaves.get(a)) this.recarregarPerfil(a);
    }
    const novo = {} as Record<Acao, number>;
    for (const ac of ACOES) novo[ac] = 0;
    for (const a of this.adaptadores) {
      const p = this.perfis.get(a)!;
      const l = a.ler();
      for (const ac of ACOES) {
        let v = l[ac] ?? 0;
        if (v <= 0) continue;
        v = v <= p.zonaMorta ? 0 : (v - p.zonaMorta) / (1 - p.zonaMorta);
        v = Math.min(1, v * p.sensibilidade);
        if (v > novo[ac]) novo[ac] = v;
      }
      if (a.consumirAtividade() && this.ultimoTipo !== a.tipo) {
        this.ultimoTipo = a.tipo;
        this.ouvintesTipo.forEach((f) => f(a.tipo));
      }
    }
    for (const ac of ACOES) {
      const antes = this.valores[ac] >= LIMIAR[ac];
      const depois = novo[ac] >= LIMIAR[ac];
      this.valores[ac] = novo[ac];
      if (depois !== antes) this.ouvintes.forEach((f) => f(ac, depois ? 'press' : 'release'));
    }
  }
}
