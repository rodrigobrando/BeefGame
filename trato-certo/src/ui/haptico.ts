import { prefs } from '../persist/dados';

export function vibrar(padrao: number | number[]): void {
  if (!prefs.ler().vibracao) return;
  try {
    navigator.vibrate?.(padrao);
  } catch {
    /* sem suporte */
  }
}
