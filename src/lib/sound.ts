// Web Audio API Synthesizer - 100% Offline, Zero-Asset, Pure Mathematical Audio Synthesis
// Genera feedback sonori futuristici (chimes, clicks, drone ambientali) senza scaricare alcun file audio esterno

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Suono morbido stile Apple VisionOS per clic e selezioni
export function playSoftClick(frequency = 800) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.5, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // Silently continue if audio blocked by browser policy
  }
}

// Chime armonico futuristico per completamento generazione / bookmark salvato
export function playCyberChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // Accordo di Do Maggiore (C5, E5, G5, C6)
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);

      gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.05 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.05);
      osc.stop(ctx.currentTime + idx * 0.05 + 0.4);
    });
  } catch {
    // Silently continue
  }
}

// Suono futuristico di attivazione radar AI
export function playRadarScan() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

// Sintetizzatore di frequenza 432Hz "Deep Space Ambient Drone" per lettura e focus zen
let droneOsc: OscillatorNode | null = null;
let droneGain: GainNode | null = null;
let isDroneActive = false;

export function toggleDeepSpaceAmbient(enable?: boolean): boolean {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    const shouldEnable = enable !== undefined ? enable : !isDroneActive;

    if (shouldEnable) {
      if (droneOsc) {
        try {
          droneOsc.stop();
          droneOsc.disconnect();
        } catch {}
      }

      // Generatore bimodale a 432Hz con modulazione armonica sub-bassa a 108Hz
      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, ctx.currentTime);

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(108, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, ctx.currentTime);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 2.0); // Fade in morbido di 2 secondi

      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      subOsc.start();

      droneOsc = osc;
      droneGain = gain;
      isDroneActive = true;
      return true;
    } else {
      if (droneGain && ctx) {
        droneGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.0); // Fade out morbido
        setTimeout(() => {
          try {
            droneOsc?.stop();
            droneOsc?.disconnect();
          } catch {}
          droneOsc = null;
          droneGain = null;
          isDroneActive = false;
        }, 1000);
      } else {
        isDroneActive = false;
      }
      return false;
    }
  } catch {
    isDroneActive = false;
    return false;
  }
}

export function isAmbientSoundPlaying(): boolean {
  return isDroneActive;
}
