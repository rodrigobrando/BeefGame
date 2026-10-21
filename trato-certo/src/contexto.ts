import dietasJson from './data/dietas.json';
import jogoJson from './data/jogo.json';
import niveisJson from './data/niveis.json';
import type { ConfigJogo, Dieta, Distrator, Nivel } from './core/tipos';
import { GerenciadorEntrada } from './input/GerenciadorEntrada';
import { GamepadAdapter } from './input/adapters/GamepadAdapter';
import { KeyboardAdapter } from './input/adapters/KeyboardAdapter';
import { MotionAdapter } from './input/adapters/MotionAdapter';
import { TouchAdapter } from './input/adapters/TouchAdapter';
import { dietasCustom, prefs } from './persist/dados';
import type { GerenciadorCenas } from './scenes/GerenciadorCenas';
import { Audio2 } from './ui/audio';

const entrada = new GerenciadorEntrada();
const teclado = new KeyboardAdapter();
const toque = new TouchAdapter();
const gamepad = new GamepadAdapter();
/** Sem sensor ainda: usa a fonte nula. Veja README → "Acelerômetro". */
const movimento = new MotionAdapter();

/** Singleton com tudo que as cenas compartilham. */
export const ctx = {
  cfg: jogoJson as unknown as ConfigJogo,
  niveis: niveisJson.niveis as unknown as Nivel[],
  distratores: dietasJson.distratores as Distrator[],
  entrada,
  teclado,
  toque,
  gamepad,
  movimento,
  audio: new Audio2(),
  cenas: null as unknown as GerenciadorCenas,

  dietas(): Dieta[] {
    return [...(dietasJson.dietas as Dieta[]), ...dietasCustom.listar()];
  },

  /** Modo de interface atual (TV ou celular), conforme preferência ou último dispositivo usado. */
  modoUI(): 'tv' | 'celular' {
    const p = prefs.ler().modoUI;
    if (p !== 'auto') return p;
    return entrada.ultimoTipo === 'gamepad' ? 'tv' : 'celular';
  },

  aplicarModoUI(): void {
    const tipo = entrada.ultimoTipo;
    const el = document.documentElement;
    el.classList.toggle('modo-tv', this.modoUI() === 'tv');
    document.body.className = `ent-${tipo}${tipo !== 'toque' ? ' usa-foco' : ''}`;
  },
};

export function iniciarEntrada(): void {
  entrada.ultimoTipo = matchMedia('(pointer: coarse)').matches ? 'toque' : 'teclado';
  entrada.registrar(teclado);
  entrada.registrar(toque);
  entrada.registrar(gamepad);
  entrada.registrar(movimento);
  toque.lado = prefs.ler().lado;
  entrada.aoTrocarTipo(() => ctx.aplicarModoUI());
  ctx.aplicarModoUI();
}
