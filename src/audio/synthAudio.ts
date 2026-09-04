/**
 * Web Audio API Synthwave Sound & Music Synthesizer
 * Zero external audio dependencies - 100% authentic synthesized retro arcade audio.
 */

class SynthAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicVolume: number = 0.35;
  private sfxVolume: number = 0.5;
  private isMusicPlaying: boolean = false;
  private musicTimer: number | null = null;
  private currentStep: number = 0;

  // Bass scale notes (frequencies in Hz: D minor synthwave scale)
  private bassNotes = [73.42, 73.42, 82.41, 87.31, 98.00, 110.00, 87.31, 73.42]; // D2, D2, E2, F2, G2, A2, F2, D2
  private leadNotes = [293.66, 349.23, 440.0, 523.25, 440.0, 392.0, 349.23, 329.63]; // D4, F4, A4, C5, A4, G4, F4, E4

  constructor() {
    // Lazy initialize on first interaction
  }

  public init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.musicTimer) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
      this.isMusicPlaying = false;
    } else if (!muted && !this.isMusicPlaying) {
      this.startMusic();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // --- MUSIC ENGINE (Synthwave 16-step sequencer) ---
  public startMusic() {
    if (this.isMuted || this.isMusicPlaying) return;
    this.init();
    this.isMusicPlaying = true;
    const tempo = 125; // 125 BPM synthwave
    const stepTime = (60 / tempo / 4) * 1000; // 16th notes

    this.musicTimer = window.setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      this.playStep(this.currentStep);
      this.currentStep = (this.currentStep + 1) % 16;
    }, stepTime);
  }

  public stopMusic() {
    if (this.musicTimer) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    this.isMusicPlaying = false;
  }

  private playStep(step: number) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Four-on-the-floor Kick drum on beats 0, 4, 8, 12
    if (step % 4 === 0) {
      this.playKick(now);
    }

    // Snare / clap on beats 4 and 12
    if (step === 4 || step === 12) {
      this.playSnare(now);
    }

    // Rolling 16th note synthwave bassline
    const noteIndex = Math.floor(step / 2) % this.bassNotes.length;
    const bassFreq = this.bassNotes[noteIndex];
    this.playBassNote(bassFreq, now, 0.1);

    // Arpeggiated lead synth every 2 steps
    if (step % 2 === 0) {
      const leadIndex = (step + 4) % this.leadNotes.length;
      this.playLeadNote(this.leadNotes[leadIndex], now, 0.12);
    }
  }

  private playKick(time: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.08);

    gain.gain.setValueAtTime(this.musicVolume * 0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  private playSnare(time: number) {
    if (!this.ctx) return;
    // White noise snare
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.musicVolume * 0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(time);
    noise.stop(time + 0.08);
  }

  private playBassNote(freq: number, time: number, duration: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, time);
    filter.frequency.exponentialRampToValueAtTime(180, time + duration);

    gain.gain.setValueAtTime(this.musicVolume * 0.45, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playLeadNote(freq: number, time: number, duration: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(this.musicVolume * 0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  // --- SOUND EFFECTS (SFX) ---

  public playLaser(weaponType: string = 'BLASTER') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const time = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (weaponType === 'RAILGUN') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, time);
      osc.frequency.exponentialRampToValueAtTime(100, time + 0.25);
      gain.gain.setValueAtTime(this.sfxVolume * 0.7, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.25);
      return;
    }

    if (weaponType === 'PLASMA') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, time);
      osc.frequency.exponentialRampToValueAtTime(90, time + 0.2);
      gain.gain.setValueAtTime(this.sfxVolume * 0.6, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.2);
      return;
    }

    // Default laser
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, time);
    osc.frequency.exponentialRampToValueAtTime(220, time + 0.1);

    gain.gain.setValueAtTime(this.sfxVolume * 0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  public playJump(isDouble: boolean = false) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const time = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = isDouble ? 350 : 220;
    const endFreq = isDouble ? 700 : 520;

    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.12);

    gain.gain.setValueAtTime(this.sfxVolume * 0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.12);
  }

  public playDash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const time = this.ctx.currentTime;

    // Swoosh noise
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, time);
    filter.frequency.linearRampToValueAtTime(400, time + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.sfxVolume * 0.6, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(time);
    noise.stop(time + 0.15);
  }

  public playExplosion(isBig: boolean = false) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const time = this.ctx.currentTime;

    const duration = isBig ? 0.35 : 0.2;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isBig ? 600 : 900, time);
    filter.frequency.exponentialRampToValueAtTime(40, time + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.sfxVolume * (isBig ? 0.7 : 0.45), time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(time);
    noise.stop(time + duration);
  }

  public playHit() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const time = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, time);
    osc.frequency.linearRampToValueAtTime(60, time + 0.1);

    gain.gain.setValueAtTime(this.sfxVolume * 0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  public playCombo(comboLevel: number) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const time = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Ascending arpeggio note based on combo level
    const pitch = 300 + Math.min(comboLevel * 60, 1000);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, time);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, time + 0.15);

    gain.gain.setValueAtTime(this.sfxVolume * 0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.15);
  }

  public playLevelComplete() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const time = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25]; // C major synth fanfare
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time + idx * 0.09);
      gain.gain.setValueAtTime(this.sfxVolume * 0.45, time + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.09 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(time + idx * 0.09);
      osc.stop(time + idx * 0.09 + 0.35);
    });
  }

  public playVictory() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const time = this.ctx.currentTime;
    const fanfare = [329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
    fanfare.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time + idx * 0.12);
      gain.gain.setValueAtTime(this.sfxVolume * 0.4, time + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.12 + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(time + idx * 0.12);
      osc.stop(time + idx * 0.12 + 0.5);
    });
  }
}

export const sound = new SynthAudio();
