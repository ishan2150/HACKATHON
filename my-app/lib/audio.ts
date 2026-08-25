/**
 * Web Audio API Sound Generator for Ambient Focus Sounds & Study Bell
 * 100% Self-Contained, zero external audio asset dependencies
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private currentSourceNodes: { [key: string]: AudioNode[] } = {};
  private masterGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  /**
   * Play crystal study completion chime
   */
  public playCompletionChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Major Chord)
    notes.forEach((freq, index) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.12);

      gain.gain.setValueAtTime(0, this.ctx.currentTime + index * 0.12);
      gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + index * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + index * 0.12 + 1.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.ctx.currentTime + index * 0.12);
      osc.stop(this.ctx.currentTime + index * 0.12 + 1.7);
    });
  }

  /**
   * Generate gentle pink/brown noise for rain soundscape
   */
  public startRain() {
    this.stopAmbient();
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Lowpass filter to simulate muffled rain drops
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start();
    this.currentSourceNodes['rain'] = [whiteNoise, filter, gain];
  }

  /**
   * Generate gentle Lo-Fi Binaural Synth Ambient Pad
   */
  public startLofiPad() {
    this.stopAmbient();
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const chords = [130.81, 164.81, 196.00, 246.94]; // C3, E3, G3, B3 (Cmaj7)
    const nodes: AudioNode[] = [];

    chords.forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Subtle pitch vibrato
      lfo.frequency.setValueAtTime(0.2 + Math.random() * 0.3, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(1.5, this.ctx.currentTime);
      lfo.connect(osc.detune);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      lfo.start();
      nodes.push(osc, lfo, lfoGain, filter, gain);
    });

    this.currentSourceNodes['lofi'] = nodes;
  }

  /**
   * Generate crisp white noise
   */
  public startWhiteNoise() {
    this.stopAmbient();
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    noise.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    this.currentSourceNodes['white'] = [noise, gain];
  }

  public stopAmbient() {
    Object.values(this.currentSourceNodes).forEach((nodes) => {
      nodes.forEach((node) => {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          try {
            (node as AudioScheduledSourceNode).stop();
          } catch {
            // Already stopped
          }
        }
        try {
          node.disconnect();
        } catch {
          // Already disconnected
        }
      });
    });
    this.currentSourceNodes = {};
  }
}

export const soundEngine = typeof window !== 'undefined' ? new SoundEngine() : null;
