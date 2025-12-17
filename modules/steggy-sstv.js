/*
  Steggy SSTV Module
  Version: 2.0

  Purpose:
  - Convert image data into an SSTV audio signal
  - Emergency transport only
  - No confidentiality
*/

export function imageDataToSSTV(imageData, options = {}) {
  const sampleRate = options.sampleRate || 44100;
  const durationSeconds = options.duration || 30;

  const totalSamples = sampleRate * durationSeconds;
  const audio = new Float32Array(totalSamples);

  /*
    NOTE:
    This is a placeholder waveform generator that establishes
    correct structure and offline audio generation.

    A full SSTV mode (Scottie, Martin, etc.) can be dropped in
    here later without changing callers.
  */

  const baseFreq = 1200;
  for (let i = 0; i < totalSamples; i++) {
    audio[i] = Math.sin(2 * Math.PI * baseFreq * i / sampleRate);
  }

  return {
    audioBuffer: audio,
    sampleRate
  };
}

export function audioBufferToWav(audioBuffer, sampleRate) {
  const length = audioBuffer.length;
  const buffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(buffer);

  function writeString(offset, str) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, length * 2, true);

  let offset = 44;
  for (let i = 0; i < length; i++) {
    view.setInt16(offset, audioBuffer[i] * 32767, true);
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}
