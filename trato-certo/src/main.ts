import './ui/estilos.css';
import { ctx, iniciarEntrada } from './contexto';
import { GerenciadorCenas } from './scenes/GerenciadorCenas';
import { criarConfigControles } from './scenes/ConfigControles';
import { criarConfiguracoes } from './scenes/Configuracoes';
import { criarEditor } from './scenes/Editor';
import { criarJogo } from './scenes/Jogo';
import { criarMenu } from './scenes/Menu';
import { criarOrdem } from './scenes/Ordem';
import { criarRanking } from './scenes/Ranking';
import { criarRelatorio } from './scenes/Relatorio';
import { criarSelecao } from './scenes/Selecao';

const raiz = document.getElementById('app')!;
iniciarEntrada();
const cenas = new GerenciadorCenas(raiz, ctx.entrada);
ctx.cenas = cenas;
cenas.registrar('menu', criarMenu);
cenas.registrar('selecao', criarSelecao);
cenas.registrar('ordem', criarOrdem);
cenas.registrar('jogo', criarJogo);
cenas.registrar('relatorio', criarRelatorio);
cenas.registrar('ranking', criarRanking);
cenas.registrar('controles', criarConfigControles);
cenas.registrar('config', criarConfiguracoes);
cenas.registrar('editor', criarEditor);
cenas.iniciar();
cenas.ir('menu');

// áudio só nasce após um gesto do usuário
window.addEventListener('pointerdown', () => ctx.audio.destravar(), { once: true });
window.addEventListener('keydown', () => ctx.audio.destravar(), { once: true });

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => undefined);
}
