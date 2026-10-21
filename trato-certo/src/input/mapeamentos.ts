import type { Acao, PerfilMapeamento, TipoDispositivo } from './acoes';
import padroes from './mapeamentos.json';
import { repo } from '../persist/repositorio';

type Salvos = Record<string, PerfilMapeamento>;

export function perfilPadrao(tipo: TipoDispositivo): PerfilMapeamento {
  const p = (padroes as Record<string, PerfilMapeamento>)[tipo === 'toque' ? 'teclado' : tipo];
  return structuredClone(p ?? { zonaMorta: 0, sensibilidade: 1, bindings: {} });
}

const chaveSalva = (tipo: TipoDispositivo, dispositivo: string) => `${tipo}|${dispositivo}`;

/** Perfil salvo para este aparelho; senão, o padrão de `mapeamentos.json`. */
export function carregarPerfil(tipo: TipoDispositivo, dispositivo: string): PerfilMapeamento {
  const salvo = repo().obter<Salvos>('perfis', {})[chaveSalva(tipo, dispositivo)];
  return salvo ? { ...perfilPadrao(tipo), ...salvo } : perfilPadrao(tipo);
}

export function salvarPerfil(tipo: TipoDispositivo, dispositivo: string, perfil: PerfilMapeamento): void {
  const t = repo().obter<Salvos>('perfis', {});
  t[chaveSalva(tipo, dispositivo)] = perfil;
  repo().salvar('perfis', t);
}

export function restaurarPerfil(tipo: TipoDispositivo, dispositivo: string): PerfilMapeamento {
  const t = repo().obter<Salvos>('perfis', {});
  delete t[chaveSalva(tipo, dispositivo)];
  repo().salvar('perfis', t);
  return perfilPadrao(tipo);
}

const NOMES_TECLA: Record<string, string> = {
  Space: 'Espaço', Enter: 'Enter', Escape: 'Esc', Backspace: 'Backspace', ShiftLeft: 'Shift', ShiftRight: 'Shift dir.',
  ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', ControlLeft: 'Ctrl', Tab: 'Tab',
};
const NOMES_PAD = ['A / ✕', 'B / ○', 'X / □', 'Y / △', 'LB / L1', 'RB / R1', 'LT / L2', 'RT / R2', 'Select', 'Start', 'L3', 'R3', 'D-pad ↑', 'D-pad ↓', 'D-pad ←', 'D-pad →', 'Home'];

/** Nome legível de um binding, para a tela de configuração. */
export function nomeBinding(b: string): string {
  const [tipo, v] = b.split(':');
  if (tipo === 'Key') return NOMES_TECLA[v] ?? v.replace(/^Key|^Digit/, '');
  if (tipo === 'Pad') return `Botão ${v} (${NOMES_PAD[+v] ?? '?'})`;
  if (tipo === 'PadAxis') return `Eixo ${v.slice(0, -1)} ${v.endsWith('-') ? '−' : '+'}`;
  if (tipo === 'Tilt') return `Inclinar ${v.slice(0, -1).toUpperCase()} ${v.endsWith('-') ? '−' : '+'}`;
  return b;
}

export function bindingsDe(p: PerfilMapeamento, a: Acao): string[] {
  return p.bindings[a] ?? [];
}
