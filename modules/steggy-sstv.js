// modules/steggy-sstv.js
// SSTV image to audio encoder for Steggy
// Offline, client-side, emergency transmission module

/*
Design intent:
- Encode images into SSTV audio signals
- No encryption implied
- Deterministic output
- Suitable for radio, phone, or acoustic relay
- Integrates AFTER steganography if desired
*/

const SAMPLE_RATE = 44100;
const TWO_PI = Math.PI * 2;

/**
 * Supported SSTV modes
 * Durations are approximate and conservative
 */
export const SSTV_MODES = {
  MARTIN_M1: {
    name: 'Martin M1',
    width: 320,
    height: 256,
    syncPulse: 1200,
    black: 1500,
    white: 2300,
    lineTime: 0.446
  },
  SCOTTIE_S1: {
    name: 'Scottie S1',
    width: 320,
    height: 256,
    syncPulse: 1200,
    black: 1500,
    white: 2300,
    lineTime: 0.432
  }
};

/**
 * Encode ImageData into SSTV audio samples
 *
 * @param {ImageData} imageData
 * @param {string} modeName
 * @returns {Float32Array} PCM samples
 */
export function encodeSSTV(imageData, modeName = 'MARTIN_M1') {
  const mode = SSTV_MODES[modeName];
  if (!mode) {
    throw new Error('Unsupported SSTV mode');
  }

  const { width, height, data } = imageData;
  if (width !== mode.width || height !== mode.height) {
    throw new Error(
      `Image must be ${mode.width}x${mode.height} for ${mode.name}`
    );
  }

  const samples = [];
  let phase = 0;

  function tone(freq, duration) {
    const count = Math.floor(duration * SAMPLE_RATE);
    for (let i = 0; i < count; i++) {
      samples.push(Math.sin(phase));
      phase += (TWO_PI * freq) / SAMPLE_RATE;
    }
  }

  function mapColor(value) {
    return (
      mode.black +
      (value / 255) * (mode.white - mode.black)
    );
  }

  // VIS header (simplified)
  tone(1900, 0.3);
  tone(1200, 0.01);
  tone(1900, 0.3);

  for (let y = 0; y < height; y++) {
    // Sync pulse
    tone(mode.syncPulse, 0.004);

    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Martin order: G, B, R
      tone(mapColor(g), mode.lineTime / (width * 3));
      tone(mapColor(b), mode.lineTime / (width * 3));
      tone(mapColor(r), mode.lineTime / (width * 3));
    }
  }

  return new Float32Array(samples);
}

/**
 * Convert PCM samples to WAV Blob
 *
 * @param {Float32Array} samples
 * @returns {Blob}
 */
export function pcmToWav(samples) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(offset, str) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}
