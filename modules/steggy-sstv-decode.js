// SSTV decode module with selectable modes
// Baseline implementations for offline decoding

function decodeLine(line, width) {
  const pixels = new Uint8ClampedArray(width * 4);
  for (let x = 0; x < width; x++) {
    const idx = Math.floor((x / width) * line.length);
    const v = Math.max(-1, Math.min(1, line[idx]));
    const p = Math.floor((v + 1) * 127.5);
    pixels[x * 4] = p;
    pixels[x * 4 + 1] = p;
    pixels[x * 4 + 2] = p;
    pixels[x * 4 + 3] = 255;
  }
  return pixels;
}

export async function decodeSSTVFromSamples(samples, sampleRate, mode) {
  let width = 320;
  let height = 256;
  let lineTime = 0.146;

  if (mode === "scottie1") lineTime = 0.138;
  if (mode === "robot36") {
    width = 320;
    height = 240;
    lineTime = 0.088;
  }

  const samplesPerLine = Math.floor(sampleRate * lineTime);
  const image = new ImageData(width, height);

  let ptr = 0;
  for (let y = 0; y < height; y++) {
    const line = samples.slice(ptr, ptr + samplesPerLine);
    ptr += samplesPerLine;

    if (line.length < samplesPerLine) break;

    const row = decodeLine(line, width);
    image.data.set(row, y * width * 4);
  }

  return image;
}

export async function decodeSSTVFromAudio(file, mode) {
  const ctx = new AudioContext();
  const buf = await file.arrayBuffer();
  const audio = await ctx.decodeAudioData(buf);
  const samples = audio.getChannelData(0);

  return decodeSSTVFromSamples(samples, audio.sampleRate, mode);
}
