export function encodeImageToSSTV(imageData) {
  // Placeholder waveform generator
  const sampleRate = 44100;
  const duration = 2;
  const samples = sampleRate * duration;
  const buffer = new Float32Array(samples);

  for (let i = 0; i < samples; i++) {
    buffer[i] = Math.sin(2 * Math.PI * 1000 * (i / sampleRate));
  }

  return buffer;
}
