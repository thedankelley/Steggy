// steggy-sstv.js
// SSTV image-to-audio encoder (offline-safe)

export class SteggySSTV {
  static MODES = {
    MARTIN_M1: {
      name: "Martin M1",
      width: 320,
      height: 256,
      lineTime: 0.146432
    },
    SCOTTIE_S1: {
      name: "Scottie S1",
      width: 320,
      height: 256,
      lineTime: 0.13824
    }
  };

  static encode(imageData, mode = "MARTIN_M1", sampleRate = 44100) {
    const cfg = SteggySSTV.MODES[mode];
    if (!cfg) throw new Error("Unsupported SSTV mode");

    const { width, height, data } = imageData;
    if (width !== cfg.width || height !== cfg.height) {
      throw new Error(
        `Image must be ${cfg.width}x${cfg.height} for ${cfg.name}`
      );
    }

    const samples = [];
    const VIS = 44; // Martin M1 VIS code

    // Helper
    const tone = (freq, ms) => {
      const count = Math.floor(sampleRate * (ms / 1000));
      for (let i = 0; i < count; i++) {
        samples.push(Math.sin(2 * Math.PI * freq * (i / sampleRate)));
      }
    };

    // VIS Header
    tone(1900, 300);
    tone(1200, 10);
    tone(1900, 300);
    tone(1200, 30);

    // VIS bits
    for (let i = 0; i < 7; i++) {
      const bit = (VIS >> i) & 1;
      tone(bit ? 1100 : 1300, 30);
    }
    tone(1200, 30);

    // Image lines
    for (let y = 0; y < height; y++) {
      tone(1200, 5); // sync
      for (let c = 0; c < 3; c++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4 + c;
          const v = data[idx] / 255;
          const freq = 1500 + v * 800;
          samples.push(Math.sin(2 * Math.PI * freq * (samples.length / sampleRate)));
        }
      }
    }

    return SteggySSTV._toWav(samples, sampleRate);
  }

  static _toWav(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeStr = (o, s) => [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));

    writeStr(0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, "data");
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;
    samples.forEach(s => {
      view.setInt16(offset, Math.max(-1, Math.min(1, s)) * 0x7fff, true);
      offset += 2;
    });

    return new Blob([buffer], { type: "audio/wav" });
  }
}
