// modules/steggy-hash.js
// Hash utilities for Steggy
// Created by Dan

/**
 * Convert ArrayBuffer to hex string
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Hash raw bytes using Web Crypto
 * @param {Uint8Array} data
 * @param {'SHA-256'|'SHA-384'|'SHA-512'} algorithm
 * @returns {Promise<string>} hex digest
 */
export async function hashBytes(data, algorithm = 'SHA-256') {
  if (!(data instanceof Uint8Array)) {
    throw new Error('hashBytes expects Uint8Array');
  }

  const digest = await crypto.subtle.digest(
    algorithm,
    data.buffer
  );

  return bufferToHex(digest);
}

/**
 * Hash ImageData (pixel content only)
 * Alpha channel included intentionally
 * @param {ImageData} imageData
 * @param {'SHA-256'|'SHA-384'|'SHA-512'} algorithm
 * @returns {Promise<string>}
 */
export async function hashImageData(imageData, algorithm = 'SHA-256') {
  if (!imageData || !imageData.data) {
    throw new Error('Invalid ImageData');
  }

  return hashBytes(
    new Uint8Array(imageData.data.buffer),
    algorithm
  );
}

/**
 * Hash text string (UTF-8)
 * @param {string} text
 * @param {'SHA-256'|'SHA-384'|'SHA-512'} algorithm
 * @returns {Promise<string>}
 */
export async function hashText(text, algorithm = 'SHA-256') {
  const encoder = new TextEncoder();
  return hashBytes(encoder.encode(text), algorithm);
}

/**
 * Hash file contents
 * @param {File} file
 * @param {'SHA-256'|'SHA-384'|'SHA-512'} algorithm
 * @returns {Promise<string>}
 */
export async function hashFile(file, algorithm = 'SHA-256') {
  if (!(file instanceof File)) {
    throw new Error('hashFile expects File');
  }

  const buffer = await file.arrayBuffer();
  return hashBytes(new Uint8Array(buffer), algorithm);
}
