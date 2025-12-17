/*
  steggy-sstv-decode.js
  Steggy 2.0

  SSTV audio decoder
  Observable transport only
*/

const MODES = {
  MARTIN_M1: {
    width: 320,
    height: 256,
    scanlineTimeMs: 146.432,
    minFreq: 1200,
    maxFreq: 2300
  },
  SCOTTIE_S1: {
    width: 320,
    height: 256,
    scanlineTimeMs: 138.24,
    minFreq: 1200,
    maxFreq: 2300
  }
};

export async function decodeSSTVFromAudioFile(file, modeId) {
  const mode = MODES[modeId];
  if (!mode) {
    throw new Error("Unsupported SSTV mode");
  }

  const audioCtx = new AudioContext();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  const samples = audioBuffer.getChannelData(0);

  const { width, height, scanlineTimeMs, minFreq, maxFreq } = mode;
  const sampleRate = audioBuffer.sampleRate;

  const imageData = new ImageData(width, height);
  let sampleIndex = 0;

  const samplesPerLine =
    Math.floor(sampleRate * (scanlineTimeMs / 1000));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const windowSize = 64;
      let sum = 0;

      for (let i = 0; i < windowSize; i++) {
        sum += Math.abs(samples[sampleIndex + i] || 0);
      }

      const normalized = Math.min(sum / windowSize, 1);
      const value = Math.floor(normalized * 255);

      const idx = (y * width + x) * 4;
      imageData.data[idx] = value;
      imageData.data[idx + 1] = value;
      imageData.data[idx + 2] = value;
      imageData.data[idx + 3] = 255;

      sampleIndex += Math.floor(samplesPerLine / width);
    }
  }

  return imageData;
}
