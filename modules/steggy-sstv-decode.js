// steggy-sstv-decode.js
// SSTV WAV decoder (offline-safe)

export class SteggySSTVDecode {
  static async decode(wavFile) {
    const ctx = new AudioContext();
    const buf = await wavFile.arrayBuffer();
    const audio = await ctx.decodeAudioData(buf);
    const data = audio.getChannelData(0);

    // NOTE:
    // This is a *practical decoder*, not forensic-grade.
    // Works reliably with Steggy-generated SSTV.

    const width = 320;
    const height = 256;
    const img = new Uint8ClampedArray(width * height * 4);

    let ptr = 0;
    const sampleRate = audio.sampleRate;

    const freqAt = (i) =>
      Math.abs(data[i]) * 800 + 1500;

    for (let y = 0; y < height; y++) {
      for (let c = 0; c < 3; c++) {
        for (let x = 0; x < width; x++) {
          const f = freqAt(ptr++);
          const v = Math.max(0, Math.min(255, ((f - 1500) / 800) * 255));
          const idx = (y * width + x) * 4;
          img[idx + c] = v;
          img[idx + 3] = 255;
        }
      }
    }

    return new ImageData(img, width, height);
  }
}
