/*
  steggy-sstv.js
  Steggy 2.0

  SSTV Emergency Transport Module
  Observable, not encrypted
*/

const MODES = {
  MARTIN_M1: {
    name: "Martin M1",
    width: 320,
    height: 256,
    scanlineTimeMs: 146.432,
    syncPulseMs: 4.862,
    porchMs: 0.572,
    minFreq: 1200,
    maxFreq: 2300
  },
  SCOTTIE_S1: {
    name: "Scottie S1",
    width: 320,
    height: 256,
    scanlineTimeMs: 138.24,
    syncPulseMs: 9,
    porchMs: 1.5,
    minFreq: 1200,
    maxFreq: 2300
  }
};

export function getAvailableSSTVModes() {
  return Object.keys(MODES).map(k => ({
    id: k,
    name: MODES[k].name
  }));
}

export function encodeImageToSSTV(imageData, modeId, options = {}) {
  const mode = MODES[modeId];
  if (!mode) {
    throw new Error("Unsupported SSTV mode");
  }

  const sampleRate = options.sampleRate || 44100;
  const samples = [];

  function tone(freq, durationMs) {
    const total = Math.floor(sampleRate * (durationMs / 1000));
    for (let i = 0; i < total; i++) {
      samples.push(Math.sin(2 * Math.PI * freq * i / sampleRate));
    }
  }

  // VIS header (simplified)
  tone(1900, 300);
  tone(1200, 10);
  tone(1900, 300);

  const { width, height } = mode;
  const data = imageData.data;

  for (let y = 0; y < height; y++) {
    // Sync
    tone(1200, mode.syncPulseMs);
    tone(1500, mode.porchMs);

    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const freq =
        mode.minFreq +
        (r / 255) * (mode.maxFreq - mode.minFreq);
      tone(freq, mode.scanlineTimeMs / width);
    }
  }

  return {
    samples: new Float32Array(samples),
    sampleRate
  };
}

export function samplesToWav(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const write = (o, s) => [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));

  write(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  samples.forEach(s => {
    view.setInt16(offset, s * 32767, true);
    offset += 2;
  });

  return new Blob([buffer], { type: "audio/wav" });
}
