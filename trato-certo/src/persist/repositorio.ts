/**
 * Camada de persistência isolada. O jogo só conhece `Repositorio`;
 * para ligar a uma API, implemente a interface e chame `definirRepositorio(...)` no boot.
 */
export interface Repositorio {
  obter<T>(chave: string, padrao: T): T;
  salvar<T>(chave: string, valor: T): void;
  remover(chave: string): void;
}

export class RepositorioLocalStorage implements Repositorio {
  constructor(private prefixo = 'trato-certo:') {}

  obter<T>(chave: string, padrao: T): T {
    try {
      const bruto = localStorage.getItem(this.prefixo + chave);
      return bruto === null ? padrao : (JSON.parse(bruto) as T);
    } catch {
      return padrao;
    }
  }

  salvar<T>(chave: string, valor: T): void {
    try {
      localStorage.setItem(this.prefixo + chave, JSON.stringify(valor));
    } catch {
      /* cota cheia ou modo privado: segue sem persistir */
    }
  }

  remover(chave: string): void {
    try {
      localStorage.removeItem(this.prefixo + chave);
    } catch {
      /* ignora */
    }
  }
}

export class RepositorioMemoria implements Repositorio {
  private m = new Map<string, string>();
  obter<T>(chave: string, padrao: T): T {
    const v = this.m.get(chave);
    return v === undefined ? padrao : (JSON.parse(v) as T);
  }
  salvar<T>(chave: string, valor: T): void {
    this.m.set(chave, JSON.stringify(valor));
  }
  remover(chave: string): void {
    this.m.delete(chave);
  }
}

let atual: Repositorio = new RepositorioLocalStorage();
export const repo = (): Repositorio => atual;
export function definirRepositorio(r: Repositorio): void {
  atual = r;
}
