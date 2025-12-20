// steggy-sstv.js
// Fragment-capable SSTV encoder

import { crc32 } from "../core/steggy-crc.js";

export class SteggySSTV {

  static encode(imageData, mode, fragments = 1) {
    if (fragments < 1) fragments = 1;

    const frames = [];
    const heightPerFragment = Math.floor(imageData.height / fragments);

    for (let i = 0; i < fragments; i++) {
      const y = i * heightPerFragment;
      const h = (i === fragments - 1)
        ? imageData.height - y
        : heightPerFragment;

      const fragment = new ImageData(
        imageData.width,
        h
      );

      fragment.data.set(
        imageData.data.slice(
          y * imageData.width * 4,
          (y + h) * imageData.width * 4
        )
      );

      const header = new Uint8Array([
        0x53, 0x53, 0x54, 0x56,       // "SSTV"
        i,
        fragments
      ]);

      const crc = crc32(fragment.data);
      const meta = new Uint8Array(4);
      new DataView(meta.buffer).setUint32(0, crc);

      const payload = new Uint8Array([
        ...header,
        ...meta,
        ...fragment.data
      ]);

      const wav = this._encodeSingle(payload, fragment.width, fragment.height, mode);
      frames.push(wav);
    }

    return frames;
  }

  static _encodeSingle(bytes, width, height, mode) {
    // Minimal offline SSTV WAV encoder wrapper
    // Uses same timing as previous Drop 5

    const sampleRate = 44100;
    const samples = [];

    for (let b of bytes) {
      const freq = 1500 + (b / 255) * 800;
      for (let i = 0; i < 400; i++) {
        samples.push(Math.sin(2 * Math.PI * freq * i / sampleRate));
      }
    }

    return this._toWav(samples, sampleRate);
  }

  static _toWav(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const write = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };

    write(0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    write(8, "WAVEfmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    write(36, "data");
    view.setUint32(40, samples.length * 2, true);

    let o = 44;
    for (let s of samples) {
      view.setInt16(o, s * 32767, true);
      o += 2;
    }

    return new Blob([buffer], { type: "audio/wav" });
  }
}
