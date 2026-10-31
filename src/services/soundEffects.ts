/**
 * Windows 11 Procedural Web Audio Sound Synthesizer
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public setSoundEnabled(val: boolean) {
    this.enabled = val;
  }

  // Windows 11 Startup Chime (Four harmonic bells: Eb4, Bb4, Eb5, G5 with lush decay)
  public playStartup() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 311.13, delay: 0.0, dur: 2.5, gain: 0.2 }, // Eb4
      { freq: 466.16, delay: 0.18, dur: 2.2, gain: 0.2 }, // Bb4
      { freq: 622.25, delay: 0.36, dur: 2.8, gain: 0.25 }, // Eb5
      { freq: 783.99, delay: 0.54, dur: 3.2, gain: 0.22 }, // G5
      { freq: 1244.5, delay: 0.72, dur: 2.8, gain: 0.12 }, // Eb6 harmonic shimmer
    ];

    notes.forEach(({ freq, delay, dur, gain }) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      noteGain.gain.setValueAtTime(0.0001, now + delay);
      noteGain.gain.exponentialRampToValueAtTime(gain, now + delay + 0.06);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

      osc.connect(noteGain);
      noteGain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + dur);
    });
  }

  // Windows 11 Notification Sound (Crisp warm double ding)
  public playNotification() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 880, delay: 0.0, dur: 0.3, gain: 0.15 },
      { freq: 1174.66, delay: 0.1, dur: 0.6, gain: 0.18 },
    ];

    notes.forEach(({ freq, delay, dur, gain }) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      noteGain.gain.setValueAtTime(0.0001, now + delay);
      noteGain.gain.exponentialRampToValueAtTime(gain, now + delay + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

      osc.connect(noteGain);
      noteGain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + dur);
    });
  }

  // Windows 11 Tactile Click
  public playClick() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Hardware connected / disconnected sound
  public playHardwareConnect(connect = true) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const f1 = connect ? 440 : 587;
    const f2 = connect ? 587 : 440;

    [
      { freq: f1, time: 0 },
      { freq: f2, time: 0.12 },
    ].forEach(({ freq, time }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);
      gain.gain.setValueAtTime(0.12, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + 0.2);
    });
  }

  // Recycle Bin Empty Crumple Sound
  public playTrash() {
    const ctx = this.getContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.25;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  }

  // Camera / Snipping Tool Shutter Sound
  public playShutter() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Windows Crash / BSOD Glitch Sound
  public playCrash() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.35);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }
}

export const soundManager = new SoundEngine();
