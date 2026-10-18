/**
 * Procedural Web Audio API sound synthesizer
 * Zero external MP3/WAV dependencies - 100% generated in real-time
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private ambientOsc: OscillatorNode | null = null;

  constructor() {
    // Initialized on first user interaction to comply with browser autoplay policies
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(muted ? 0 : 0.04, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Footstep on concrete sidewalk / asphalt
   */
  public playFootstep(isRunning: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isRunning ? 95 : 80, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, t);

    gain.gain.setValueAtTime(isRunning ? 0.12 : 0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  /**
   * Jump liftoff whoosh
   */
  public playJump() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.15);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  /**
   * Jump ground impact thump
   */
  public playLand() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.12);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  /**
   * Harmonic chime when discovering a collectible artifact
   */
  public playCollect(count: number = 1) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Ascending arpeggio notes (F# major pentatonic for bright African warmth)
    const baseFreqs = [369.99, 415.30, 466.16, 554.37, 622.25, 739.99]; // F#4, G#4, A#4, C#5, D#5, F#5
    const note1 = baseFreqs[count % baseFreqs.length];
    const note2 = baseFreqs[(count + 2) % baseFreqs.length];
    const note3 = baseFreqs[(count + 4) % baseFreqs.length];

    [note1, note2, note3].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0, t + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.25, t + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.85);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.9);
    });

    // Shimmer sparkle high frequency
    const shimmer = this.ctx.createOscillator();
    const sGain = this.ctx.createGain();
    shimmer.type = 'triangle';
    shimmer.frequency.setValueAtTime(1479.98, t + 0.15); // F#6
    shimmer.frequency.exponentialRampToValueAtTime(2217.46, t + 0.4);

    sGain.gain.setValueAtTime(0.08, t + 0.15);
    sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    shimmer.connect(sGain);
    sGain.connect(this.ctx.destination);
    shimmer.start(t + 0.15);
    shimmer.stop(t + 0.65);
  }

  /**
   * Triumphant fanfare when all 5 artifacts are collected
   */
  public playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const melody = [
      { f: 440.0, d: 0.2, offset: 0.0 },   // A4
      { f: 554.37, d: 0.2, offset: 0.2 },  // C#5
      { f: 659.25, d: 0.25, offset: 0.4 }, // E5
      { f: 880.0, d: 0.6, offset: 0.65 },  // A5
      { f: 739.99, d: 0.25, offset: 1.2 }, // F#5
      { f: 880.0, d: 1.2, offset: 1.45 }   // A5
    ];

    melody.forEach((note) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t + note.offset);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(note.f * 1.002, t + note.offset);

      gain.gain.setValueAtTime(0.001, t + note.offset);
      gain.gain.linearRampToValueAtTime(0.2, t + note.offset + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.offset + note.d);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + note.offset);
      osc2.start(t + note.offset);
      osc.stop(t + note.offset + note.d + 0.05);
      osc2.stop(t + note.offset + note.d + 0.05);
    });
  }

  /**
   * Start soft procedural ambient city breeze
   */
  public startAmbient() {
    if (this.ambientOsc) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.035, t);

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, t);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, t);

    osc.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);

    osc.start();
    this.ambientOsc = osc;
  }
}

export const sound = new SoundSystem();
