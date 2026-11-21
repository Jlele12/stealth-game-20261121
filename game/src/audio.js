// Nightjar Vault — small synthesised sound effects with the Web Audio API (no asset files).
export class Audio {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  blip(freq, dur, type = 'sine', vol = 0.15, slide = 0) {
    if (this.muted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  }

  gem() { this.blip(880, 0.12, 'triangle', 0.18, 220); this.blip(1320, 0.09, 'sine', 0.1); }
  spotted() { this.blip(160, 0.4, 'sawtooth', 0.22, -60); this.blip(320, 0.25, 'square', 0.12); }
  caught() { this.blip(110, 0.7, 'sawtooth', 0.25, -60); }
  clear() { this.blip(523, 0.12, 'triangle', 0.15); setTimeout(() => this.blip(659, 0.12, 'triangle', 0.15), 120); setTimeout(() => this.blip(784, 0.2, 'triangle', 0.15), 240); }
  step() { this.blip(90, 0.05, 'sine', 0.05); }
}
