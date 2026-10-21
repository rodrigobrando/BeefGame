import * as THREE from 'three';
import type { SessaoCarga } from '../core/simulacao';

const ALT_PAREDE = 2.3; // altura útil do vagão
const BASE_Y = 0.95; // base do corpo
const MEIO_TOPO = 2.1; // meia-largura no topo
const MEIO_BASE = 1.55; // meia-largura no fundo
const ESC_X = 1.3; // vagão mais comprido em X
const MAX_PART = 220;

interface Part {
  vivo: boolean;
  p: THREE.Vector3;
  v: THREE.Vector3;
  vida: number;
}

const mat = (cor: string | number, rug = 0.85, extra: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color: cor, roughness: rug, flatShading: true, ...extra });

function caixa(w: number, h: number, d: number, m: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  me.position.set(x, y, z);
  me.castShadow = me.receiveShadow = true;
  return me;
}

/** Cena 3D (Three.js, estilo low-poly): vagão, silo/rosca, carregadeira/pá e partículas. */
export class CenaVagao {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(40, 1.7, 0.1, 160);
  private t = 0;
  private subida = 0;
  private aspecto = 1.7;

  private camadasGrupo = new THREE.Group();
  private camadas: { mesh: THREE.Mesh; kg: number; y0: number; y1: number }[] = [];
  private sessaoAtual: SessaoCarga | null = null;
  private rosca = new THREE.Group();
  private helice = new THREE.Group();
  private loader = new THREE.Group();
  private braco = new THREE.Group();
  private conchaG = new THREE.Group();
  private conchaFill!: THREE.Mesh;
  private pilha!: THREE.Mesh;
  private luzRosca!: THREE.Mesh;
  private roda: THREE.Mesh[] = [];
  private inst!: THREE.InstancedMesh;
  private parts: Part[] = Array.from({ length: MAX_PART }, () => ({ vivo: false, p: new THREE.Vector3(), v: new THREE.Vector3(), vida: 0 }));
  private tmp = new THREE.Object3D();
  private cor = new THREE.Color();
  private topoY = BASE_Y;

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.scene.background = new THREE.Color('#a8d3ee');
    this.scene.fog = new THREE.Fog('#a8d3ee', 28, 70);
    this.montarCenario();
    this.montarVagao();
    this.montarSilo();
    this.montarCarregadeira();
    this.montarParticulas();
  }

  // ---------- montagem ----------

  private montarCenario(): void {
    const s = this.scene;
    s.add(new THREE.HemisphereLight('#dbeeff', '#5d8a3e', 1.25));
    const sol = new THREE.DirectionalLight('#fff1d6', 2.4);
    sol.position.set(9, 16, 10);
    sol.castShadow = true;
    sol.shadow.mapSize.set(2048, 2048);
    const c = sol.shadow.camera;
    c.left = -20; c.right = 20; c.top = 14; c.bottom = -14; c.near = 1; c.far = 60;
    sol.shadow.bias = -0.0004;
    sol.shadow.normalBias = 0.04;
    s.add(sol);

    const chao = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), mat('#79b24d', 1));
    chao.rotation.x = -Math.PI / 2;
    chao.receiveShadow = true;
    s.add(chao);
    // estradinha de terra
    const estrada = new THREE.Mesh(new THREE.PlaneGeometry(60, 6), mat('#d2b98a', 1));
    estrada.rotation.x = -Math.PI / 2;
    estrada.position.set(-2, 0.02, 3.2);
    estrada.receiveShadow = true;
    s.add(estrada);
    for (let i = 0; i < 9; i++) {
      const mancha = new THREE.Mesh(new THREE.CircleGeometry(0.5 + (i % 3) * 0.3, 7), mat('#c4a977', 1));
      mancha.rotation.x = -Math.PI / 2;
      mancha.position.set(-14 + i * 3.4, 0.03, 2 + (i % 4) * 1.2);
      s.add(mancha);
    }

    // cerca ao fundo
    const madeira = mat('#8a5a2b');
    for (let x = -26; x <= 26; x += 2.2) s.add(caixa(0.22, 1.5, 0.22, madeira, x, 0.75, -10));
    for (const y of [0.55, 1.15]) s.add(caixa(54, 0.14, 0.12, madeira, 0, y, -10));
    // cocho à frente
    const cocho = new THREE.Group();
    cocho.add(caixa(14, 0.7, 1.6, mat('#9c9c92'), 0, 0.35, 0), caixa(13.2, 0.15, 1.0, mat('#6e8a3a'), 0, 0.72, 0));
    cocho.position.set(-2, 0, 6.8);
    s.add(cocho);

    // árvores low-poly
    const folha = [mat('#3f9e3a'), mat('#4cb043'), mat('#357f31')];
    const tronco = mat('#6b4420');
    const pos: [number, number, number][] = [[-18, -14, 1.3], [-11, -15, 1.1], [-3, -16, 1.4], [6, -14.5, 1.2], [14, -15, 1.5], [21, -13, 1.2], [-24, -6, 1.4], [25, -4, 1.3], [-22, 6, 1.2], [18, 9, 1.1]];
    pos.forEach(([x, z, e], i) => {
      const a = new THREE.Group();
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.8, 6), tronco);
      tr.position.y = 0.9;
      tr.castShadow = true;
      a.add(tr);
      for (let k = 0; k < 3; k++) {
        const b = new THREE.Mesh(new THREE.IcosahedronGeometry(1.35 - k * 0.25, 0), folha[(i + k) % 3]);
        b.position.set(Math.sin(k * 2.1) * 0.5, 2.4 + k * 0.75, Math.cos(k * 2.1) * 0.5);
        b.castShadow = true;
        a.add(b);
      }
      a.position.set(x, 0, z);
      a.scale.setScalar(e);
      s.add(a);
    });
    // colinas
    for (let i = 0; i < 6; i++) {
      const h = new THREE.Mesh(new THREE.SphereGeometry(10 + i * 2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(i % 2 ? '#8cc060' : '#7fb556', 1));
      h.position.set(-50 + i * 20, -1, -42 - (i % 2) * 8);
      h.scale.y = 0.45;
      s.add(h);
    }
  }

  private montarVagao(): void {
    const g = new THREE.Group();
    const wRef = mat('#d33f2a', 0.6);
    const parede = (o: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color: '#d33f2a', roughness: 0.6, flatShading: true, side: THREE.DoubleSide, ...o });
    // corpo: tronco de pirâmide de base quadrada, aberto em cima
    const geo = new THREE.CylinderGeometry(MEIO_TOPO * Math.SQRT2, MEIO_BASE * Math.SQRT2, ALT_PAREDE, 4, 1, true);
    geo.rotateY(Math.PI / 4);
    const corpo = new THREE.Mesh(geo, parede());
    corpo.position.y = BASE_Y + ALT_PAREDE / 2;
    corpo.castShadow = corpo.receiveShadow = true;
    g.add(corpo);
    // fundo
    const fundo = new THREE.Mesh(new THREE.PlaneGeometry(MEIO_BASE * 2, MEIO_BASE * 2), mat('#3b2a1c'));
    fundo.rotation.x = -Math.PI / 2;
    fundo.position.y = BASE_Y + 0.02;
    g.add(fundo);
    // aro superior
    const aro = new THREE.Mesh(new THREE.BoxGeometry(MEIO_TOPO * 2 + 0.25, 0.16, 0.16), mat('#9a2b1a'));
    for (const [x, z, ry] of [[0, MEIO_TOPO, 0], [0, -MEIO_TOPO, 0], [MEIO_TOPO, 0, Math.PI / 2], [-MEIO_TOPO, 0, Math.PI / 2]] as const) {
      const a = aro.clone();
      a.position.set(x, BASE_Y + ALT_PAREDE, z);
      a.rotation.y = ry;
      a.castShadow = true;
      g.add(a);
    }
    // faixa e chassi
    g.add(caixa(MEIO_BASE * 2 + 0.6, 0.22, MEIO_BASE * 2 - 0.6, mat('#3a3a3a'), 0, BASE_Y - 0.15, 0));
    // rodas
    const pneu = mat('#1b1b1b', 0.9);
    const cubo = mat('#b8b8b8', 0.5);
    for (const z of [-1.95, 1.95]) {
      for (const x of [-0.5, 0.9]) {
        const r = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.5, 14), pneu);
        r.rotation.x = Math.PI / 2;
        r.position.set(x * ESC_X, 0.72, z);
        r.castShadow = true;
        const c = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.54, 8), cubo);
        r.add(c);
        c.rotation.set(0, 0, 0);
        this.roda.push(r);
        g.add(r);
      }
    }
    // cabeçalho (engate)
    g.add(caixa(3.2, 0.18, 0.35, mat('#444'), 3.7, 0.9, 0));
    g.add(caixa(0.35, 0.35, 0.35, mat('#777'), 5.3, 0.9, 0));
    // bocal de descarga lateral
    g.add(caixa(0.9, 0.8, 0.9, mat('#7d1f12'), MEIO_BASE * ESC_X + 0.55, BASE_Y + 0.6, 0));
    // faixa decorativa com cor da marca
    g.add(caixa(MEIO_TOPO * 2.1, 0.18, 0.05, mat('#f2b134'), 0, BASE_Y + ALT_PAREDE * 0.5, MEIO_TOPO * 0.78 + 0.02));
    // rosca vertical (hélice)
    this.helice.position.y = BASE_Y;
    const eixo = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, ALT_PAREDE + 0.5, 8), mat('#cfcfcf', 0.4));
    eixo.position.y = (ALT_PAREDE + 0.5) / 2;
    eixo.castShadow = true;
    this.helice.add(eixo);
    for (let i = 0; i < 7; i++) {
      const aba = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.07, 0.34), mat('#e6e6e6', 0.4));
      aba.position.y = 0.3 + i * 0.37;
      aba.rotation.y = i * 0.9;
      aba.castShadow = true;
      this.helice.add(aba);
    }
    g.add(this.helice);
    g.scale.set(ESC_X, 1, 1);
    g.position.set(0, 0, 0);
    // rodas não devem esticar
    this.roda.forEach((r) => r.scale.set(1 / ESC_X, 1, 1));
    void wRef;

    this.camadasGrupo.scale.set(1, 1, 1);
    g.add(this.camadasGrupo);
    this.scene.add(g);
  }

  private montarSilo(): void {
    const g = this.rosca;
    const aco = mat('#c4ccd2', 0.45);
    const torre = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 4.2, 14), aco);
    torre.position.y = 5.6;
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 0.35, 1.2, 14), aco);
    cone.position.y = 2.9;
    const topo = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.9, 14), mat('#8a949b', 0.5));
    topo.position.y = 8.2;
    const faixa = new THREE.Mesh(new THREE.CylinderGeometry(1.52, 1.52, 0.6, 14), mat('#5f9b3c'));
    faixa.position.y = 6.6;
    for (const m of [torre, cone, topo]) m.castShadow = true;
    g.add(torre, cone, topo, faixa);
    // pernas
    for (const a of [0.8, 2.4, 4.0, 5.6]) {
      const p = caixa(0.18, 3.0, 0.18, mat('#6d7880'), Math.cos(a) * 1.2, 1.5, Math.sin(a) * 1.2);
      g.add(p);
    }
    // calha inclinada até o centro do vagão
    const calha = caixa(0.55, 0.55, 4.0, mat('#8a949b', 0.5));
    calha.position.set(0, 3.85, 1.85);
    calha.rotation.x = -0.28;
    g.add(calha);
    // lâmpada de status
    this.luzRosca = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), new THREE.MeshStandardMaterial({ color: '#a33', emissive: '#a33' }));
    this.luzRosca.position.set(1.2, 7.4, 1.0);
    g.add(this.luzRosca);
    g.position.set(0, 0, -4.2);
    this.scene.add(g);
  }

  private montarCarregadeira(): void {
    const L = this.loader;
    const amarelo = mat('#f2b134', 0.55);
    L.add(caixa(3.0, 0.9, 1.7, amarelo, 0, 1.15, 0));
    L.add(caixa(1.2, 0.9, 1.5, mat('#3a3a3a'), -0.9, 1.9, 0));
    L.add(caixa(1.1, 0.8, 1.4, mat('#bfe3f5', 0.2, { transparent: true, opacity: 0.8 }), -0.9, 1.95, 0));
    L.add(caixa(1.5, 0.15, 1.8, mat('#d99a1c'), -0.9, 2.45, 0));
    for (const x of [-1.0, 1.0]) {
      for (const z of [-0.95, 0.95]) {
        const r = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.45, 12), mat('#1b1b1b', 0.9));
        r.rotation.x = Math.PI / 2;
        r.position.set(x, 0.62, z);
        r.castShadow = true;
        L.add(r);
      }
    }
    // braço + concha
    this.braco.position.set(1.2, 1.5, 0);
    const bracoMalha = caixa(3.6, 0.28, 1.5, mat('#d99a1c', 0.5), 1.8, 0, 0);
    this.braco.add(bracoMalha);
    this.conchaG.position.set(3.6, 0, 0);
    const ferro = mat('#8c8c8c', 0.5);
    this.conchaG.add(caixa(0.12, 0.9, 1.9, ferro, 0, 0.1, 0), caixa(1.0, 0.12, 1.9, ferro, 0.5, -0.35, 0), caixa(1.0, 0.1, 0.12, ferro, 0.5, 0.05, 0.95), caixa(1.0, 0.1, 0.12, ferro, 0.5, 0.05, -0.95));
    this.conchaFill = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1, 1.7), mat('#5f9b3c'));
    this.conchaFill.position.set(0.5, -0.3, 0);
    this.conchaG.add(this.conchaFill);
    this.braco.add(this.conchaG);
    L.add(this.braco);
    L.scale.setScalar(1.2);
    L.position.set(-8, 0, 0);
    this.scene.add(L);

    this.pilha = new THREE.Mesh(new THREE.ConeGeometry(2.6, 2.0, 9), mat('#5f9b3c', 1));
    this.pilha.position.set(-13.5, 1.0, 0);
    this.pilha.castShadow = true;
    this.scene.add(this.pilha);
  }

  private montarParticulas(): void {
    this.inst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true }), MAX_PART);
    this.inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.inst.frustumCulled = false;
    this.inst.castShadow = true;
    this.inst.setColorAt(0, new THREE.Color('#fff'));
    this.scene.add(this.inst);
    this.tmp.scale.setScalar(0);
    this.tmp.updateMatrix();
    for (let i = 0; i < MAX_PART; i++) {
      this.inst.setMatrixAt(i, this.tmp.matrix);
      this.inst.setColorAt(i, this.cor.set('#fff'));
    }
  }

  // ---------- ciclo ----------

  redimensionar(): void {
    const r = this.canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width));
    const h = Math.max(1, Math.round(r.height));
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.setSize(w, h, false);
    this.aspecto = w / h;
    this.camera.aspect = this.aspecto;
    this.camera.updateProjectionMatrix();
  }

  private reconstruirCamadas(s: SessaoCarga): void {
    for (const c of this.camadas) {
      this.camadasGrupo.remove(c.mesh);
      c.mesh.geometry.dispose();
      (c.mesh.material as THREE.Material).dispose();
    }
    this.camadas = s.fontes.map(() => {
      const mesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true }));
      mesh.visible = false;
      mesh.receiveShadow = true;
      this.camadasGrupo.add(mesh);
      return { mesh, kg: -1, y0: 0, y1: 0 };
    });
    this.sessaoAtual = s;
  }

  private meia(y: number): number {
    return MEIO_BASE + (MEIO_TOPO - MEIO_BASE) * (y / ALT_PAREDE);
  }

  private atualizarCamadas(s: SessaoCarga): void {
    if (s !== this.sessaoAtual) this.reconstruirCamadas(s);
    const visualMax = Math.max(1, s.carga.moTotalKg * 0.95);
    const ordem = s.fontes.map((f, i) => ({ f, i })).filter((x) => x.f.realKg > 0).sort((a, b) => a.f.seqInicio - b.f.seqInicio);
    const uniforme = s.fase === 'carga' ? 0 : s.uniformidade;
    let media = new THREE.Color(0, 0, 0);
    let soma = 0;
    for (const { f } of ordem) {
      media.add(this.cor.set(f.fonte.cor).multiplyScalar(f.realKg));
      soma += f.realKg;
    }
    if (soma > 0) media = media.multiplyScalar(1 / soma);
    this.topoY = 0;
    let y = 0.04;
    for (const c of this.camadas) c.mesh.visible = false;
    for (const { f, i } of ordem) {
      const c = this.camadas[i];
      const h = (f.realKg / visualMax) * (ALT_PAREDE - 0.35);
      const y0 = y;
      const y1 = y + h;
      y = y1;
      if (Math.abs(f.realKg - c.kg) > 0.3 || c.y0 !== y0) {
        const g = new THREE.CylinderGeometry(this.meia(y1) * Math.SQRT2 * 0.985, this.meia(y0) * Math.SQRT2 * 0.985, Math.max(0.01, h), 4, 1, false);
        g.rotateY(Math.PI / 4);
        c.mesh.geometry.dispose();
        c.mesh.geometry = g;
        c.kg = f.realKg;
        c.y0 = y0;
        c.y1 = y1;
      }
      c.mesh.position.y = BASE_Y + (y0 + y1) / 2;
      c.mesh.visible = true;
      (c.mesh.material as THREE.MeshStandardMaterial).color.set(f.fonte.cor).lerp(media, uniforme * 0.85);
    }
    this.topoY = BASE_Y + y;
  }

  private emitir(x: number, y: number, z: number, vx: number, vy: number, vz: number, cor: string): void {
    const p = this.parts.find((q) => !q.vivo);
    if (!p) return;
    p.vivo = true;
    p.vida = 1.6;
    p.p.set(x, y, z);
    p.v.set(vx, vy, vz);
    const i = this.parts.indexOf(p);
    this.inst.setColorAt(i, this.cor.set(cor));
    if (this.inst.instanceColor) this.inst.instanceColor.needsUpdate = true;
  }

  desenhar(s: SessaoCarga, dt: number): void {
    this.t += dt;
    const f = s.atual.fonte;
    this.atualizarCamadas(s);

    // câmera (afasta em telas estreitas) com leve balanço
    const k = Math.min(2.3, Math.max(1, 1.75 / this.aspecto)) * 1.12;
    this.camera.position.set(3.5 * k + Math.sin(this.t * 0.25) * 0.5, 11 * k, 14 * k);
    this.camera.lookAt(-2.4, 2.4, 0);

    // silo: lâmpada e vazão
    const aberta = f.modoCarga === 'rosca' && s.fluxo > 0.5;
    (this.luzRosca.material as THREE.MeshStandardMaterial).color.set(aberta ? '#4aa84a' : '#a33');
    (this.luzRosca.material as THREE.MeshStandardMaterial).emissive.set(aberta ? '#2c8c2c' : '#a33');

    // hélice
    this.helice.rotation.y += dt * (s.fase === 'mistura' ? 7 : 0.6 + s.fluxo * 0.02);

    // carregadeira
    this.subida += ((s.despejando ? 1 : 0) - this.subida) * Math.min(1, dt * 8);
    const u = this.subida;
    const ativa = f.modoCarga === 'pa';
    this.loader.position.x = -9.6 + u * 3.4;
    this.braco.rotation.z = -0.12 + u * 0.88;
    this.conchaG.rotation.z = 0.1 - u * 1.25 + (ativa && s.concha > 0 && !s.despejando ? Math.sin(this.t * 40) * 0.01 : 0);
    const frac = Math.min(1, s.concha / s.cfg.pa.capacidadeKg);
    this.conchaFill.visible = frac > 0.01;
    this.conchaFill.scale.y = Math.max(0.01, frac * 0.7);
    this.conchaFill.position.y = -0.35 + this.conchaFill.scale.y / 2;
    (this.conchaFill.material as THREE.MeshStandardMaterial).color.set(f.cor);
    if (ativa) (this.pilha.material as THREE.MeshStandardMaterial).color.set(f.cor);

    // partículas
    const surf = Math.max(this.topoY, BASE_Y + 0.1);
    if (s.fase === 'carga') {
      if (f.modoCarga === 'rosca' && s.fluxo > 1) {
        const n = Math.min(5, Math.ceil((s.fluxo / 25) * dt * 60 * 0.6));
        for (let i = 0; i < n; i++) this.emitir((Math.random() - 0.5) * 0.4, 3.4, -4.2 + 3.7 + (Math.random() - 0.5) * 0.4, 0, -1, 0, f.cor);
      } else if (f.modoCarga === 'pa' && s.despejando) {
        this.loader.updateMatrixWorld(true);
        const wp = new THREE.Vector3();
        this.conchaG.getWorldPosition(wp);
        for (let i = 0; i < 6; i++) this.emitir(wp.x + 0.5 + Math.random() * 0.6, wp.y - 0.2, (Math.random() - 0.5) * 1.5, 1.2 + Math.random(), 0, 0, f.cor);
      }
    }
    for (let i = 0; i < MAX_PART; i++) {
      const p = this.parts[i];
      if (p.vivo) {
        p.vida -= dt;
        p.v.y -= 16 * dt;
        p.p.addScaledVector(p.v, dt);
        if (p.vida <= 0 || (p.p.y < surf && Math.abs(p.p.x) < 2.6 && Math.abs(p.p.z) < 2.0) || p.p.y < 0) p.vivo = false;
      }
      this.tmp.position.copy(p.p);
      this.tmp.scale.setScalar(p.vivo ? 1 : 0);
      this.tmp.rotation.set(p.p.x * 3, p.p.y * 4, 0);
      this.tmp.updateMatrix();
      this.inst.setMatrixAt(i, this.tmp.matrix);
    }
    this.inst.instanceMatrix.needsUpdate = true;

    this.renderer.render(this.scene, this.camera);
  }
}
