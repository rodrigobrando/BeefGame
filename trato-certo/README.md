# Trato Certo

Jogo educativo de carregamento do vagão misturador por dieta (confinamento bovino).
TypeScript + Vite + Canvas 2D (UI em DOM) · PWA · celular (touch), TV (gamepad/D-pad) e teclado.

```bash
npm install
npm run dev        # desenvolvimento (--host: acessível pelo celular/TV na rede)
npm test           # testes unitários do core (cálculos, pontuação, simulação)
npm run build      # typecheck + build em dist/
```

## Decisão de stack
Phaser/Pixi foram dispensados: o jogo é uma cena 2D simples, e Canvas 2D + DOM dá bundle de ~22 kB gzip
(bom para TV box), texto nítido e navegação por foco (D-pad) nativa. A regra de negócio está no `core/`,
então trocar o renderizador não afeta nada.

## Arquitetura
```
src/
  core/      regras 100% puras (sem DOM/engine) + testes em tests/
    nutricao.ts    MS total, MO por ingrediente, MS da dieta, validação, divisão em cargas
    simulacao.ts   SessaoCarga: rosca (inércia), pá (concha + ajuste fino), ordem, erros, mistura
    balanca.ts     leitura com lag + oscilação
    pontuacao.ts   desvio por item, desvio nutricional, faixas, penalidades, estrelas
    sorteio.ts     modo desafio (semente determinística) · importar.ts: tabela colada → dieta
  input/     ações abstratas (acoes.ts), GerenciadorEntrada, adapters/ (Keyboard, Touch, Gamepad, Motion)
             mapeamentos.json (padrões) + mapeamentos.ts (perfis salvos por dispositivo)
  persist/   repositorio.ts (interface + localStorage) e dados.ts (ranking, progresso, prefs, dietas)
  scenes/    Menu, Selecao, Ordem, Jogo, Relatorio, Ranking, ConfigControles, Configuracoes, Editor
  ui/        dom.ts, foco.ts (navegação D-pad), cenaVagao.ts (canvas), audio.ts (WebAudio), haptico.ts
  data/      dietas.json, niveis.json, jogo.json  ← toda configuração; nada fixo no código
```

### Mecânica
- **Rosca:** segurar AÇÃO acelera até a vazão da rosca; ao soltar continua caindo por inércia (`inercia` do nível). A barra-guia (nível 1) mostra onde vai parar.
- **Pá:** segurar enche a concha, soltar despeja. AJUSTE FINO adiciona passos pequenos.
- **Balança:** lag (`lagTau`) e oscilação (`ruido`) por nível. Peso passado não volta: vira desvio.
- **Erros:** ingrediente fora de ordem ou fora da dieta = penalidade; pausa → "Descartar carga" (custo).
- **Mistura:** segurar AÇÃO até encher; AVANÇAR antes penaliza a uniformidade.
- **Score** = base − Σ(peso·|desvio %|) − desvio nutricional − penalidades + bônus de tempo (pequeno). Parâmetros em `jogo.json`.

## Como adicionar uma dieta
1. **Sem código (celular/PC):** Menu → *Editor de dietas*, cole a tabela (Alimento, MS %, Incl. MS %, Incl. MO %), valide e salve (localStorage).
2. **No projeto:** edite `src/data/dietas.json`. Cada ingrediente: `ms`, `inclMS`, `inclMO` (opcional, só valida), `ordemCarga`, `modoCarga` (`"pa"`/`"rosca"`), `vazaoRosca` (kg/s), `cor`, `icone`.
   O jogo avisa se Σ Incl. MS ≠ 100 ou se a Incl. MO da tabela divergir do recálculo em mais de 0,01 p.p.

## Como mapear um controle
Menu → *Configurar controles*: escolha o dispositivo, selecione a ação e pressione o botão desejado
(captura o próximo botão/tecla/eixo, 8 s de espera). Zona morta e sensibilidade são por dispositivo; os perfis
são salvos por aparelho (`Gamepad.id`). Padrões em `src/input/mapeamentos.json`.
Gramática: `Key:Space`, `Pad:7` (o gatilho analógico vira INTENSIDADE), `PadAxis:1-`, `Tilt:y+`.
O gatilho RT (`Pad:7`) controla a vazão da rosca de forma analógica.

## Onde plugar o acelerômetro
`src/input/adapters/MotionAdapter.ts` define a interface `FonteMovimento` (`iniciar/parar/ler → {x,y,z}` em −1..1),
uma fonte nula e um mock. Para ligar um sensor real (DeviceMotion, WebHID ou bridge Android), implemente
`FonteMovimento` e em `src/contexto.ts` troque `new MotionAdapter()` por `new MotionAdapter(minhaFonte)`.
Depois mapeie `Tilt:y+` à AÇÃO no perfil "movimento" (`mapeamentos.json`). A leitura do sensor **não** está implementada.

## Trocar a persistência por API
Implemente `Repositorio` (`src/persist/repositorio.ts`) e chame `definirRepositorio(minhaApi)` no boot.

## Modo TV / celular
Detectado pelo último dispositivo usado (gamepad → TV: fontes maiores, overscan de 5%, foco visível); pode ser forçado em *Configurações*.
No celular os botões ficam na tela (≥ 56 px, AÇÃO no lado do polegar, retrato e paisagem) e há vibração ao cortar perto do alvo.

## Pós-MVP (não implementado)
Fase 2: dirigir pela linha de cochos e descarregar por curral.
