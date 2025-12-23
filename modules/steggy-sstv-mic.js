// modules/steggy-sstv-mic.js
// Live microphone SSTV capture for Steggy
// Offline, client-side, emergency decoding support

import { decodeSSTV } from './steggy-sstv-decode.js';

const SAMPLE_RATE = 44100;

/**
 * Start listening to microphone and capture SSTV audio
 *
 * @param {Object} options
 * @param {string} options.modeName SSTV mode name
 * @param {number} options.durationSeconds how long to record
 * @param {function(ImageData):void} options.onImage callback when decoded
 * @param {function(string):void} options.onStatus status updates
 *
 * @returns {Promise<function>} stop function
 */
export async function listenForSSTV({
  modeName = 'MARTIN_M1',
  durationSeconds = 120,
  onImage,
  onStatus
}) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Microphone access not supported');
  }

  if (typeof onImage !== 'function') {
    throw new Error('onImage callback required');
  }

  onStatus?.('Requesting microphone access');

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioCtx = new AudioContext({ sampleRate: SAMPLE_RATE });
  const source = audioCtx.createMediaStreamSource(stream);

  const processor = audioCtx.createScriptProcessor(4096, 1, 1);
  const recorded = [];

  processor.onaudioprocess = event => {
    const input = event.inputBuffer.getChannelData(0);
    recorded.push(new Float32Array(input));
  };

  source.connect(processor);
  processor.connect(audioCtx.destination);

  onStatus?.('Listening for SSTV signal');

  const stop = async () => {
    onStatus?.('Stopping capture');

    processor.disconnect();
    source.disconnect();
    stream.getTracks().forEach(t => t.stop());
    audioCtx.close();

    const totalLength = recorded.reduce((s, a) => s + a.length, 0);
    const samples = new Float32Array(totalLength);
    let offset = 0;

    for (const chunk of recorded) {
      samples.set(chunk, offset);
      offset += chunk.length;
    }

    const wavBuffer = float32ToWav(samples);
    onStatus?.('Decoding SSTV');

    try {
      const image = await decodeSSTV(wavBuffer, modeName);
      onImage(image);
      onStatus?.('SSTV decode complete');
    } catch (err) {
      onStatus?.('Decode failed: ' + err.message);
      throw err;
    }
  };

  setTimeout(stop, durationSeconds * 1000);
  return stop;
}

/**
 * Convert Float32 samples to WAV ArrayBuffer
 *
 * @param {Float32Array} samples
 * @returns {ArrayBuffer}
 */
function float32ToWav(samples) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(offset, str) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s * 0x7fff, true);
    offset += 2;
  }

  return buffer;
}
