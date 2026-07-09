/**
 * AmbientAudio — a self-contained generative soundscape for the portfolio.
 *
 * Pure Web Audio: no files, no dependencies, no API key. It renders a warm,
 * "mystical + happy" ambient bed (a slow lydian-tinged major chord progression
 * over a soft drone) with occasional sparkling bell tones, all through a lush
 * reverb — plus tiny UI click/hover blips. Because it's generative it loops
 * forever with no seam and adds zero download weight.
 *
 * Audio only ever starts from a user gesture (the sound toggle), per browser
 * autoplay policy, and suspends when the tab is hidden.
 */

const midi = (m: number): number => 440 * Math.pow(2, (m - 69) / 12);

// Chord progression (MIDI): Cmaj9 → Amin9 → Fmaj7#11 → Gmaj9 — hopeful, warm,
// with a lydian #11 shimmer for the "mystical" colour.
const CHORDS: number[][] = [
  [48, 52, 55, 59, 62], // Cmaj9
  [45, 48, 52, 55, 59], // Amin9
  [41, 45, 48, 52, 59], // Fmaj7#11
  [43, 47, 50, 54, 57], // Gmaj9
];

// Sparkle notes — C major pentatonic up high, with an occasional F#/mystical note.
const BELLS = [72, 74, 76, 79, 81, 84, 86];
const BELL_MYSTIC = [78, 83]; // F#5, B5 — dreamy colour, used sparingly

type AC = AudioContext;

export class AmbientAudio {
  private ctx: AC | null = null;
  private master!: GainNode;
  private padBus!: GainNode;
  private bellBus!: GainNode;
  private reverbSend!: GainNode;

  private enabled = false;
  private chordIndex = 0;
  private chordTimer = 0;
  private bellTimer = 0;
  private lastSfx = 0;

  private readonly TARGET = 0.22; // master level when on

  get isEnabled(): boolean {
    return this.enabled;
  }

  get isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      !!(window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)
    );
  }

  /** Turn the ambient bed on (must be called from a user gesture). */
  async enable(): Promise<void> {
    this.build();
    const ctx = this.ctx;
    if (!ctx) return;
    this.enabled = true;
    if (ctx.state === 'suspended') await ctx.resume();
    const now = ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(this.TARGET, now + 1.6);
    this.scheduleChords();
    this.scheduleBells();
  }

  /** Fade the ambient bed out and stop scheduling (context is kept + suspended). */
  disable(): void {
    this.enabled = false;
    window.clearTimeout(this.chordTimer);
    window.clearTimeout(this.bellTimer);
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0, now + 1.1);
    window.setTimeout(() => {
      if (!this.enabled && ctx.state === 'running') ctx.suspend().catch(() => {});
    }, 1300);
  }

  /** Tiny UI blip. `hover` is throttled and quieter than `click`. */
  sfx(kind: 'hover' | 'click'): void {
    if (!this.enabled || !this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    if (kind === 'hover') {
      if (t - this.lastSfx < 0.07) return;
      this.lastSfx = t;
      this.blip(1760, t, 0.05, 0.05);
    } else {
      this.blip(660, t, 0.09, 0.07);
      this.blip(990, t + 0.05, 0.08, 0.07);
    }
  }

  /** Suspend/resume with tab visibility to be a good citizen. */
  handleVisibility = (): void => {
    const ctx = this.ctx;
    if (!ctx) return;
    if (document.hidden) {
      if (ctx.state === 'running') ctx.suspend().catch(() => {});
    } else if (this.enabled && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };

  // ---- internals -------------------------------------------------------

  private build(): void {
    if (this.ctx) return;
    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtor();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);

    const reverb = ctx.createConvolver();
    reverb.buffer = this.impulse(ctx, 3.6, 2.3);
    reverb.connect(this.master);
    this.reverbSend = ctx.createGain();
    this.reverbSend.gain.value = 0.85;
    this.reverbSend.connect(reverb);

    this.padBus = ctx.createGain();
    this.padBus.gain.value = 1;
    this.padBus.connect(this.master);

    this.bellBus = ctx.createGain();
    this.bellBus.gain.value = 1;
    this.bellBus.connect(this.master);

    // Warm sub-drone with a slow filter LFO for gentle movement.
    const drone = ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = midi(36); // C2
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 220;
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.06;
    drone.connect(droneFilter).connect(droneGain).connect(this.master);
    drone.start();

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 60;
    lfo.connect(lfoGain).connect(droneFilter.frequency);
    lfo.start();
  }

  private scheduleChords(): void {
    if (!this.enabled || !this.ctx) return;
    this.playChord(CHORDS[this.chordIndex % CHORDS.length] ?? CHORDS[0]!);
    this.chordIndex += 1;
    this.chordTimer = window.setTimeout(() => this.scheduleChords(), 13000);
  }

  private playChord(chord: number[]): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const attack = 5;
    const hold = 8;
    const release = 5;
    const perVoice = 0.05;

    chord.forEach((n, i) => {
      const f = midi(n);
      const o1 = ctx.createOscillator();
      o1.type = 'sine';
      o1.frequency.value = f;
      const o2 = ctx.createOscillator();
      o2.type = 'triangle';
      o2.frequency.value = f;
      o2.detune.value = i % 2 === 0 ? -6 : 6; // subtle chorus

      const filt = ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = 1500;
      filt.Q.value = 0.5;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(perVoice, t + attack);
      g.gain.setValueAtTime(perVoice, t + attack + hold);
      g.gain.linearRampToValueAtTime(0, t + attack + hold + release);

      o1.connect(filt);
      o2.connect(filt);
      filt.connect(g);
      g.connect(this.padBus);
      g.connect(this.reverbSend);

      const end = t + attack + hold + release + 0.1;
      o1.start(t);
      o2.start(t);
      o1.stop(end);
      o2.stop(end);
    });
  }

  private scheduleBells(): void {
    if (!this.enabled || !this.ctx) return;
    const roll = Math.floor(this.ctx.currentTime * 1000) % 100; // deterministic-ish jitter
    const useMystic = roll < 22;
    const pool = useMystic ? BELL_MYSTIC : BELLS;
    const n = pool[(roll * 7) % pool.length] ?? BELLS[0]!;
    this.playBell(midi(n));
    // occasional soft second note a fifth up for a "sparkle"
    if (roll > 74) this.playBell(midi(n + 7), 0.12);

    const next = 1700 + (roll / 100) * 2600; // ~1.7s–4.3s
    this.bellTimer = window.setTimeout(() => this.scheduleBells(), next);
  }

  private playBell(freq: number, delay = 0): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq;
    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = freq * 2.004; // shimmering octave partial
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.13, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    o.connect(g);
    o2.connect(g);
    g.connect(this.bellBus);
    g.connect(this.reverbSend);
    o.start(t);
    o2.start(t);
    o.stop(t + 2.7);
    o2.stop(t + 2.7);
  }

  private blip(freq: number, t: number, dur: number, level: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(level, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(this.master);
    g.connect(this.reverbSend);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  private impulse(ctx: AC, seconds: number, decay: number): AudioBuffer {
    const rate = ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }
}

/** App-wide singleton — one AudioContext for the whole page. */
export const ambient = new AmbientAudio();
