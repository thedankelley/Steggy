// modules/steggy-sstv-decode.js
// SSTV audio to image decoder for Steggy
// Offline, client-side, deterministic decoding

import { SSTV_MODES } from './steggy-sstv.js';

const SAMPLE_RATE = 44100;

/**
 * Decode a WAV ArrayBuffer into ImageData
 *
 * @param {ArrayBuffer} wavBuffer
 * @param {string} modeName
 * @returns {ImageData}
 */
export async function decodeSSTV(wavBuffer, modeName = 'MARTIN_M1') {
  const mode = SSTV_MODES[modeName];
  if (!mode) {
    throw new Error('Unsupported SSTV mode');
  }

  const audioCtx = new AudioContext({ sampleRate: SAMPLE_RATE });
  const audioBuffer = await audioCtx.decodeAudioData(wavBuffer);

  const samples = audioBuffer.getChannelData(0);
  const width = mode.width;
  const height = mode.height;

  const imageData = new ImageData(width, height);
  const data = imageData.data;

  // Basic frequency detector via zero-crossing estimation
  function estimateFrequency(start, length) {
    let crossings = 0;
    for (let i = start + 1; i < start + length; i++) {
      if (samples[i - 1] <= 0 && samples[i] > 0) {
        crossings++;
      }
    }
    return (crossings / length) * SAMPLE_RATE;
  }

  function freqToColor(freq) {
    const clamped = Math.max(mode.black, Math.min(mode.white, freq));
    return Math.round(
      ((clamped - mode.black) / (mode.white - mode.black)) * 255
    );
  }

  let pointer = Math.floor(0.7 * SAMPLE_RATE); // Skip VIS header conservatively
  const samplesPerPixel = Math.floor(
    (mode.lineTime / (width * 3)) * SAMPLE_RATE
  );
  const syncLength = Math.floor(0.004 * SAMPLE_RATE);

  for (let y = 0; y < height; y++) {
    pointer += syncLength;

    for (let x = 0; x < width; x++) {
      const gFreq = estimateFrequency(pointer, samplesPerPixel);
      pointer += samplesPerPixel;

      const bFreq = estimateFrequency(pointer, samplesPerPixel);
      pointer += samplesPerPixel;

      const rFreq = estimateFrequency(pointer, samplesPerPixel);
      pointer += samplesPerPixel;

      const idx = (y * width + x) * 4;
      data[idx] = freqToColor(rFreq);
      data[idx + 1] = freqToColor(gFreq);
      data[idx + 2] = freqToColor(bFreq);
      data[idx + 3] = 255;
    }
  }

  audioCtx.close();
  return imageData;
}
