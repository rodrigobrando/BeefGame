import { prefs } from '../persist/dados';

/**
 * Sons sintetizados (WebAudio), sem arquivos: rosca (ruído filtrado), concha (rumor + baque),
 * bip da balança e ronco da mistura. O contexto só nasce após o primeiro gesto do usuário.
 */
export class Audio2 {
  private ctx: AudioContext | null = null;
  private ruido: AudioBufferSourceNode | null = null;
  private gRosca!: GainNode;
  private fRosca!: BiquadFilterNode;
  private gConcha!: GainNode;
  private gMistura!: GainNode;
  private oMistura!: OscillatorNode;
  private proxBip = 0;

  private garantir(): AudioContext | null {
    if (!prefs.ler().som) return null;
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      const c = this.ctx;
      const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.ruido = c.createBufferSource();
      this.ruido.buffer = buf;
      this.ruido.loop = true;

      this.fRosca = c.createBiquadFilter();
      this.fRosca.type = 'bandpass';
      this.fRosca.Q.value = 0.9;
      this.gRosca = c.createGain();
      this.gRosca.gain.value = 0;
      this.ruido.connect(this.fRosca).connect(this.gRosca).connect(c.destination);

      const fc = c.createBiquadFilter();
      fc.type = 'lowpass';
      fc.frequency.value = 500;
      this.gConcha = c.createGain();
      this.gConcha.gain.value = 0;
      this.ruido.connect(fc).connect(this.gConcha).connect(c.destination);

      this.oMistura = c.createOscillator();
      this.oMistura.type = 'sawtooth';
      this.oMistura.frequency.value = 55;
      this.gMistura = c.createGain();
      this.gMistura.gain.value = 0;
      this.oMistura.connect(this.gMistura).connect(c.destination);
      this.ruido.start();
      this.oMistura.start();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  /** Chamar em um gesto do usuário para liberar o áudio. */
  destravar(): void {
    this.garantir();
  }

  private suave(p: AudioParam, v: number): void {
    const c = this.ctx!;
    p.setTargetAtTime(v, c.currentTime, 0.04);
  }

  /** Rosca: `norm` = 0..1 da vazão nominal. */
  rosca(norm: number): void {
    const c = this.garantir();
    if (!c) return;
    this.suave(this.gRosca.gain, Math.min(1, norm) * 0.22);
    this.suave(this.fRosca.frequency, 250 + norm * 900);
  }
  /** Concha enchendo: `norm` = taxa de enchimento 0..1. */
  concha(norm: number): void {
    const c = this.garantir();
    if (!c) return;
    this.suave(this.gConcha.gain, norm * 0.28);
  }
  mistura(ligada: boolean): void {
    const c = this.garantir();
    if (!c) return;
    this.suave(this.gMistura.gain, ligada ? 0.07 : 0);
  }
  silenciar(): void {
    if (!this.ctx) return;
    this.rosca(0);
    this.concha(0);
    this.mistura(false);
  }

  bip(freq = 880, dur = 0.08, vol = 0.18): void {
    const c = this.garantir();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'square';
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur + 0.02);
  }

  /** Baque do despejo da concha. */
  baque(): void {
    const c = this.garantir();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(120, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(40, c.currentTime + 0.25);
    g.gain.setValueAtTime(0.4, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.3);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.32);
  }

  erro(): void {
    this.bip(160, 0.28, 0.25);
  }

  /** Bip de proximidade do alvo (só na barra-guia): fica mais rápido perto do alvo. */
  proximidade(faltaPct: number, agora: number): void {
    if (faltaPct > 0.25) return;
    faltaPct = Math.max(0, faltaPct);
    const intervalo = 0.08 + faltaPct * 2.4;
    if (agora >= this.proxBip) {
      this.bip(1200 - faltaPct * 1500, 0.04, 0.08);
      this.proxBip = agora + intervalo;
    }
  }
}
