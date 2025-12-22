// core/steggy-crc.js
// CRC32 implementation for Steggy
// Created by Dan

// Standard CRC32 (IEEE 802.3 polynomial 0xEDB88320)
// Deterministic, fast, browser-safe

let CRC_TABLE = null;

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      if (c & 1) {
        c = 0xEDB88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    table[i] = c >>> 0;
  }
  return table;
}

/**
 * Compute CRC32 over a Uint8Array
 * @param {Uint8Array} data
 * @returns {number} unsigned 32-bit CRC
 */
export function crc32(data) {
  if (!CRC_TABLE) {
    CRC_TABLE = makeCrcTable();
  }

  let crc = 0xFFFFFFFF;

  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    crc = CRC_TABLE[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  }

  return (crc ^ 0xFFFFFFFF) >>> 0;
}
