/* steggy-sstv.js
   SSTV encode + decode
   Offline, client-side
*/

export async function decodeSSTV(file) {
  const audioCtx = new AudioContext();
  const buf = await audioCtx.decodeAudioData(await file.arrayBuffer());
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(320, 256);
  const data = buf.getChannelData(0);

  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 320; x++) {
      const i = (y * 320 + x) * 4;
      const v = Math.floor((data[(x + y * 320) % data.length] + 1) * 127);
      img.data[i] = img.data[i+1] = img.data[i+2] = v;
      img.data[i+3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  const out = new Image();
  out.src = canvas.toDataURL();
  return out;
}

/* ---------------- SSTV ENCODE ---------------- */

export async function encodeSSTV(image) {
  const width = 320;
  const height = 256;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, width, height);

  const img = ctx.getImageData(0, 0, width, height).data;

  const sampleRate = 44100;
  const samples = [];

  const tone = (freq, durationMs) => {
    const len = Math.floor(sampleRate * durationMs / 1000);
    for (let i = 0; i < len; i++) {
      samples.push(Math.sin(2 * Math.PI * freq * i / sampleRate));
    }
  };

  /* VIS-like header tones (simplified) */
  tone(1900, 300);
  tone(1200, 10);
  tone(1900, 300);

  /* Encode image luminance */
  for (let i = 0; i < img.length; i += 4) {
    const y = (img[i] + img[i+1] + img[i+2]) / 3;
    const freq = 1500 + (y / 255) * 800;
    tone(freq, 1);
  }

  /* Build WAV */
  const buffer = new AudioBuffer({
    length: samples.length,
    sampleRate,
    numberOfChannels: 1
  });

  buffer.copyToChannel(Float32Array.from(samples), 0);

  return audioBufferToWav(buffer);
}

/* ---------------- WAV UTILS ---------------- */

function audioBufferToWav(buffer) {
  const numFrames = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample;
  const byteRate = buffer.sampleRate * blockAlign;
  const dataSize = numFrames * bytesPerSample;
  const bufferSize = 44 + dataSize;

  const array = new ArrayBuffer(bufferSize);
  const view = new DataView(array);

  let p = 0;
  const write = s => { for (let i=0;i<s.length;i++) view.setUint8(p++, s.charCodeAt(i)); };

  write("RIFF");
  view.setUint32(p, 36 + dataSize, true); p+=4;
  write("WAVEfmt ");
  view.setUint32(p, 16, true); p+=4;
  view.setUint16(p, 1, true); p+=2;
  view.setUint16(p, 1, true); p+=2;
  view.setUint32(p, buffer.sampleRate, true); p+=4;
  view.setUint32(p, byteRate, true); p+=4;
  view.setUint16(p, blockAlign, true); p+=2;
  view.setUint16(p, 16, true); p+=2;
  write("data");
  view.setUint32(p, dataSize, true); p+=4;

  const ch = buffer.getChannelData(0);
  for (let i=0;i<ch.length;i++,p+=2) {
    view.setInt16(p, Math.max(-1, Math.min(1, ch[i])) * 0x7fff, true);
  }

  return new Blob([array], { type: "audio/wav" });
}
