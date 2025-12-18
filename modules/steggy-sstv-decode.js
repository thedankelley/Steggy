// Basic SSTV decoder (Martin M1 style grayscale)
// Inspired by offline DSP approaches used in Web-SSTV

export async function decodeSSTVFromAudio(file) {
  const ctx = new AudioContext();
  const arrayBuf = await file.arrayBuffer();
  const audioBuf = await ctx.decodeAudioData(arrayBuf);

  const data = audioBuf.getChannelData(0);
  const sampleRate = audioBuf.sampleRate;

  // Martin M1 parameters (simplified)
  const width = 320;
  const height = 256;
  const lineTime = 0.146; // seconds per line
  const samplesPerLine = Math.floor(sampleRate * lineTime);

  const image = new ImageData(width, height);

  let ptr = 0;
  for (let y = 0; y < height; y++) {
    const line = data.slice(ptr, ptr + samplesPerLine);
    ptr += samplesPerLine;

    for (let x = 0; x < width; x++) {
      const idx = Math.floor((x / width) * line.length);
      const v = Math.max(-1, Math.min(1, line[idx]));
      const pixel = Math.floor((v + 1) * 127.5);

      const off = (y * width + x) * 4;
      image.data[off] = pixel;
      image.data[off + 1] = pixel;
      image.data[off + 2] = pixel;
      image.data[off + 3] = 255;
    }
  }

  return image;
}
