// core/steggy-core.js
// Steggy Core Engine
// Created by Dan

import { crc32 } from './steggy-crc.js';

const STEGGY_MAGIC = new TextEncoder().encode('STEGGY');
const VERSION = 1;

export class SteggyCore {
  static calculateCapacity(imageData) {
    const pixels = imageData.data.length / 4;
    // 1 bit per channel RGB = 3 bits per pixel
    return Math.floor((pixels * 3) / 8);
  }

  static embed(imageData, payloadBytes, options = {}) {
    const capacity = this.calculateCapacity(imageData);
    if (payloadBytes.length > capacity) {
      throw new Error('Payload exceeds image capacity');
    }

    const header = {
      version: VERSION,
      flags: options.flags || {},
      payloadType: options.payloadType || 0x01,
      timestamp: Date.now()
    };

    const headerBytes = new TextEncoder().encode(JSON.stringify(header));

    const container = this._buildContainer(headerBytes, payloadBytes);
    this._lsbWrite(imageData, container);

    return imageData;
  }

  static extract(imageData) {
    const bytes = this._lsbRead(imageData);

    if (!this._matchMagic(bytes)) {
      throw new Error('No Steggy payload detected');
    }

    let offset = STEGGY_MAGIC.length;
    const version = bytes[offset++];
    if (version !== VERSION) {
      throw new Error('Unsupported Steggy version');
    }

    const flags = bytes[offset++];
    const payloadType = bytes[offset++];

    const headerLen =
      (bytes[offset++] << 8) |
      bytes[offset++];

    const headerBytes = bytes.slice(offset, offset + headerLen);
    offset += headerLen;

    const header = JSON.parse(new TextDecoder().decode(headerBytes));

    const payloadEnd = bytes.length - 4;
    const payload = bytes.slice(offset, payloadEnd);

    const storedCrc =
      (bytes[payloadEnd] << 24) |
      (bytes[payloadEnd + 1] << 16) |
      (bytes[payloadEnd + 2] << 8) |
      bytes[payloadEnd + 3];

    const calcCrc = crc32(payload);
    if (storedCrc !== calcCrc) {
      throw new Error('Payload corrupted or tampered');
    }

    return {
      header,
      payload,
      payloadType
    };
  }

  static _buildContainer(headerBytes, payloadBytes) {
    const totalLen =
      STEGGY_MAGIC.length +
      1 + 1 + 1 + 2 +
      headerBytes.length +
      payloadBytes.length +
      4;

    const buffer = new Uint8Array(totalLen);
    let offset = 0;

    buffer.set(STEGGY_MAGIC, offset);
    offset += STEGGY_MAGIC.length;

    buffer[offset++] = VERSION;
    buffer[offset++] = 0;
    buffer[offset++] = 0x01;

    buffer[offset++] = (headerBytes.length >> 8) & 0xff;
    buffer[offset++] = headerBytes.length & 0xff;

    buffer.set(headerBytes, offset);
    offset += headerBytes.length;

    buffer.set(payloadBytes, offset);
    offset += payloadBytes.length;

    const crc = crc32(payloadBytes);
    buffer[offset++] = (crc >> 24) & 0xff;
    buffer[offset++] = (crc >> 16) & 0xff;
    buffer[offset++] = (crc >> 8) & 0xff;
    buffer[offset++] = crc & 0xff;

    return buffer;
  }

  static _lsbWrite(imageData, data) {
    const pixels = imageData.data;
    let bitIndex = 0;

    for (let i = 0; i < pixels.length && bitIndex < data.length * 8; i++) {
      if ((i + 1) % 4 === 0) continue;

      const byte = data[Math.floor(bitIndex / 8)];
      const bit = (byte >> (7 - (bitIndex % 8))) & 1;

      pixels[i] = (pixels[i] & 0xfe) | bit;
      bitIndex++;
    }
  }

  static _lsbRead(imageData) {
    const pixels = imageData.data;
    const bits = [];

    for (let i = 0; i < pixels.length; i++) {
      if ((i + 1) % 4 === 0) continue;
      bits.push(pixels[i] & 1);
    }

    const bytes = [];
    for (let i = 0; i < bits.length; i += 8) {
      let byte = 0;
      for (let j = 0; j < 8; j++) {
        byte = (byte << 1) | (bits[i + j] || 0);
      }
      bytes.push(byte);
    }

    return new Uint8Array(bytes);
  }

  static _matchMagic(bytes) {
    for (let i = 0; i < STEGGY_MAGIC.length; i++) {
      if (bytes[i] !== STEGGY_MAGIC[i]) return false;
    }
    return true;
  }
}
