// modules/steggy-decoy.js
// Decoy payload support for Steggy
// Created by Dan

/**
 * Design goals:
 * - Decoy payload must be trivially extractable using common LSB techniques
 * - Real payload remains protected by keys / headers / fragmentation
 * - Decoy extraction never touches protected payload bits
 * - Works with or without fragmentation enabled
 */

/**
 * Encode a decoy payload into a pixel buffer
 * Uses simple LSB of RGB channels in scanline order
 *
 * @param {Uint8Array} pixelData RGBA pixel buffer
 * @param {string} decoyText UTF-8 text
 * @returns {Uint8Array} modified pixel buffer
 */
export function embedDecoy(pixelData, decoyText) {
  if (!(pixelData instanceof Uint8Array)) {
    throw new Error('embedDecoy expects Uint8Array');
  }

  if (!decoyText || typeof decoyText !== 'string') {
    throw new Error('Invalid decoy text');
  }

  const encoder = new TextEncoder();
  const payload = encoder.encode(decoyText);

  // Header: "DECOY" + length (32-bit)
  const header = new Uint8Array(9);
  header.set([68, 69, 67, 79, 89]); // "DECOY"
  new DataView(header.buffer).setUint32(5, payload.length, false);

  const fullPayload = new Uint8Array(header.length + payload.length);
  fullPayload.set(header, 0);
  fullPayload.set(payload, header.length);

  const totalBits = fullPayload.length * 8;
  const capacity = Math.floor((pixelData.length / 4) * 3);

  if (totalBits > capacity) {
    throw new Error('Decoy payload exceeds image capacity');
  }

  let bitIndex = 0;

  for (let i = 0; i < pixelData.length && bitIndex < totalBits; i += 4) {
    for (let c = 0; c < 3 && bitIndex < totalBits; c++) {
      const byteIndex = bitIndex >> 3;
      const bitOffset = 7 - (bitIndex & 7);
      const bit = (fullPayload[byteIndex] >> bitOffset) & 1;

      pixelData[i + c] = (pixelData[i + c] & 0xFE) | bit;
      bitIndex++;
    }
  }

  return pixelData;
}

/**
 * Extract a decoy payload from a pixel buffer
 * This function intentionally mirrors common steganalysis tools
 *
 * @param {Uint8Array} pixelData RGBA pixel buffer
 * @returns {string|null} decoy text or null if none found
 */
export function extractDecoy(pixelData) {
  if (!(pixelData instanceof Uint8Array)) {
    throw new Error('extractDecoy expects Uint8Array');
  }

  const bits = [];

  for (let i = 0; i < pixelData.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      bits.push(pixelData[i + c] & 1);
    }
  }

  function bitsToByte(start) {
    let val = 0;
    for (let i = 0; i < 8; i++) {
      val = (val << 1) | bits[start + i];
    }
    return val;
  }

  // Read header
  const headerBytes = new Uint8Array(9);
  for (let i = 0; i < 9; i++) {
    headerBytes[i] = bitsToByte(i * 8);
  }

  const headerText = String.fromCharCode(
    headerBytes[0],
    headerBytes[1],
    headerBytes[2],
    headerBytes[3],
    headerBytes[4]
  );

  if (headerText !== 'DECOY') {
    return null;
  }

  const length = new DataView(headerBytes.buffer).getUint32(5, false);
  if (length <= 0 || length > 10_000_000) {
    throw new Error('Invalid decoy length');
  }

  const payloadBitsStart = 9 * 8;
  const payloadBytes = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    payloadBytes[i] = bitsToByte(payloadBitsStart + i * 8);
  }

  const decoder = new TextDecoder();
  return decoder.decode(payloadBytes);
}
