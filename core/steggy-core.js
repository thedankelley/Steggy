/*
  steggy-core.js

  This is the brain.
  If this breaks, everything breaks.
*/

import { fragmentPayload, reassemblePayload } from '../modules/steggy-fragment.js';
import { encryptPGPPayload } from '../modules/steggy-pgp.js';
import { crc32 } from './steggy-crc.js';

/* ---------- IMAGE STEGO ---------- */

function embedLSB(imageData, payload) {
  const bytes = new TextEncoder().encode(payload);
  const totalBits = bytes.length * 8;

  if (totalBits > imageData.data.length) {
    throw new Error('Payload exceeds image capacity');
  }

  let bitIndex = 0;

  for (let i = 0; i < imageData.data.length && bitIndex < totalBits; i++) {
    const byte = bytes[Math.floor(bitIndex / 8)];
    const bit = (byte >> (7 - (bitIndex % 8))) & 1;

    imageData.data[i] = (imageData.data[i] & 0xfe) | bit;
    bitIndex++;
  }

  return imageData;
}

function extractLSB(imageData) {
  const bits = [];

  for (let i = 0; i < imageData.data.length; i++) {
    bits.push(imageData.data[i] & 1);
  }

  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let b = 0; b < 8; b++) {
      byte = (byte << 1) | (bits[i + b] || 0);
    }
    bytes.push(byte);
  }

  return new TextDecoder().decode(new Uint8Array(bytes)).replace(/\0+$/, '');
}

/* ---------- MAIN ---------- */

export async function runSteggy(config) {
  const {
    mode,
    imageData,
    payload,
    encryption,
    password,
    publicKey,
    enableFragmentation
  } = config;

  if (mode === 'encrypt') {
    let workingPayload = payload;

    if (encryption === 'pgp' || encryption === 'both') {
      workingPayload = await encryptPGPPayload(workingPayload, publicKey);
    }

    if (enableFragmentation) {
      workingPayload = fragmentPayload(workingPayload);
    }

    const container = JSON.stringify({
      crc: crc32(workingPayload),
      data: workingPayload
    });

    const encoded = embedLSB(imageData, container);
    return encoded;
  }

  if (mode === 'decrypt') {
    const raw = extractLSB(imageData);
    const parsed = JSON.parse(raw);

    if (crc32(parsed.data) !== parsed.crc) {
      throw new Error('CRC mismatch. Data corrupted.');
    }

    let result = parsed.data;

    if (result.startsWith('{') && result.includes('fragmented')) {
      result = reassemblePayload(JSON.parse(result));
    }

    return result;
  }

  throw new Error('Unsupported mode');
}
