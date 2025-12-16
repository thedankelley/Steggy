/*
  Steggy Core Engine
  Version: 1.9
  Created by Dan

  Pure logic module.
  No DOM access.
  No UI assumptions.
  Offline only.
*/

const MAGIC = new TextEncoder().encode("STEG19");
const VERSION = 1;

const PAYLOAD_TYPE_PROTECTED = 1;
const PAYLOAD_TYPE_DECOY = 2;

const EMBED_LSB = 1;

const HEADER_LENGTH = 24;

/* ===========================
   Utility Functions
=========================== */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function concatBuffers(...buffers) {
  const total = buffers.reduce((s, b) => s + b.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const b of buffers) {
    out.set(b, offset);
    offset += b.length;
  }
  return out;
}

function bytesEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/* ===========================
   Capacity Calculation
=========================== */

export function calculateCapacity(imageData) {
  const usableBits = imageData.data.length;
  const usableBytes = Math.floor(usableBits / 8);
  return Math.max(0, usableBytes - HEADER_LENGTH);
}

/* ===========================
   AES-GCM Encryption
=========================== */

async function aesEncrypt(data, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 250000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      data
    )
  );

  return concatBuffers(salt, iv, ciphertext);
}

async function aesDecrypt(data, password) {
  const salt = data.slice(0, 16);
  const iv = data.slice(16, 28);
  const ciphertext = data.slice(28);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 250000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  return new Uint8Array(
    await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    )
  );
}

/* ===========================
   Header Construction
=========================== */

function buildHeader({
  payloadType,
  payloadLength,
  crc,
  fragmentIndex = 0,
  fragmentTotal = 1
}) {
  const header = new Uint8Array(HEADER_LENGTH);
  let o = 0;

  header.set(MAGIC, o); o += 6;
  header[o++] = VERSION;
  header[o++] = EMBED_LSB;
  header[o++] = payloadType;
  header[o++] = 0;

  header[o++] = fragmentIndex & 0xff;
  header[o++] = fragmentIndex >> 8;
  header[o++] = fragmentTotal & 0xff;
  header[o++] = fragmentTotal >> 8;

  header[o++] = payloadLength & 0xff;
  header[o++] = (payloadLength >> 8) & 0xff;
  header[o++] = (payloadLength >> 16) & 0xff;
  header[o++] = (payloadLength >> 24) & 0xff;

  header[o++] = crc & 0xff;
  header[o++] = (crc >> 8) & 0xff;
  header[o++] = (crc >> 16) & 0xff;
  header[o++] = (crc >> 24) & 0xff;

  header[o++] = 0;
  header[o++] = 0;

  return header;
}

/* ===========================
   LSB Embed and Extract
=========================== */

function lsbEmbed(imageData, payload) {
  const out = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );

  let bitIndex = 0;

  for (let i = 0; i < out.data.length && bitIndex < payload.length * 8; i++) {
    const byte = payload[Math.floor(bitIndex / 8)];
    const bit = (byte >> (7 - (bitIndex % 8))) & 1;
    out.data[i] = (out.data[i] & 0xfe) | bit;
    bitIndex++;
  }

  if (bitIndex < payload.length * 8) {
    throw new Error("Image capacity insufficient for payload");
  }

  return out;
}

function lsbExtract(imageData, length) {
  const out = new Uint8Array(length);
  let bitIndex = 0;

  for (let i = 0; i < imageData.data.length && bitIndex < length * 8; i++) {
    const bit = imageData.data[i] & 1;
    out[Math.floor(bitIndex / 8)] |= bit << (7 - (bitIndex % 8));
    bitIndex++;
  }

  return out;
}

/* ===========================
   Encrypt
=========================== */

export async function encrypt({
  imageData,
  payload,
  decoyPayload = null,
  options = {}
}) {
  let data = payload instanceof Uint8Array
    ? payload
    : new TextEncoder().encode(payload);

  if (options.aesPassword) {
    data = await aesEncrypt(data, options.aesPassword);
  }

  const crc = crc32(data);

  const header = buildHeader({
    payloadType: PAYLOAD_TYPE_PROTECTED,
    payloadLength: data.length,
    crc
  });

  const combined = concatBuffers(header, data);
  return lsbEmbed(imageData, combined);
}

/* ===========================
   Decrypt
=========================== */

export async function decrypt({
  imageData,
  options = {}
}) {
  const headerBytes = lsbExtract(imageData, HEADER_LENGTH);

  if (!bytesEqual(headerBytes.slice(0, 6), MAGIC)) {
    throw new Error("No Steggy container detected");
  }

  const payloadLength =
    headerBytes[14] |
    (headerBytes[15] << 8) |
    (headerBytes[16] << 16) |
    (headerBytes[17] << 24);

  const storedCrc =
    headerBytes[18] |
    (headerBytes[19] << 8) |
    (headerBytes[20] << 16) |
    (headerBytes[21] << 24);

  let payload = lsbExtract(
    imageData,
    HEADER_LENGTH + payloadLength
  ).slice(HEADER_LENGTH);

  if (crc32(payload) !== storedCrc) {
    throw new Error("Payload integrity check failed");
  }

  if (options.aesPassword) {
    payload = await aesDecrypt(payload, options.aesPassword);
  }

  return payload;
}

/* ===========================
   Validation
=========================== */

export function validateContainer(imageData) {
  try {
    const header = lsbExtract(imageData, HEADER_LENGTH);
    return bytesEqual(header.slice(0, 6), MAGIC);
  } catch {
    return false;
  }
}
