import { pgpEncrypt, pgpDecrypt } from "./steggy-pgp.js";

/* ---------- Utilities ---------- */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function encode(str) {
  return encoder.encode(str);
}

function decode(buf) {
  return decoder.decode(buf);
}

/* ---------- CRC32 ---------- */

function crc32(buf) {
  let crc = ~0;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
    }
  }
  return (~crc >>> 0).toString(16);
}

/* ---------- AES-GCM ---------- */

async function deriveAESKey(password, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function aesEncrypt(text, password) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveAESKey(password, salt);

  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encode(text)
  );

  return {
    iv: Array.from(iv),
    salt: Array.from(salt),
    data: Array.from(new Uint8Array(cipher))
  };
}

async function aesDecrypt(payload, password) {
  const key = await deriveAESKey(
    password,
    new Uint8Array(payload.salt)
  );

  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(payload.iv) },
    key,
    new Uint8Array(payload.data)
  );

  return decode(new Uint8Array(plain));
}

/* ---------- Capacity ---------- */

function calculateCapacity(imageData) {
  return Math.floor(imageData.data.length / 4); // 1 bit per pixel
}

/* ---------- Core API ---------- */

export async function encryptImageData(
  imageData,
  protectedMsg,
  decoyMsg,
  options
) {
  let protectedPayload = protectedMsg;

  if (options.method === "pgp") {
    protectedPayload = await pgpEncrypt(
      protectedMsg,
      options.pgpPublicKey
    );
  }

  if (options.method === "aes") {
    if (!options.password) {
      throw new Error("AES encryption requires a password");
    }
    protectedPayload = await aesEncrypt(
      protectedMsg,
      options.password
    );
  }

  const container = {
    magic: "STEGGY",
    version: "2.0",
    method: options.method,
    protected: protectedPayload,
    decoy: decoyMsg
  };

  const serialized = encode(JSON.stringify(container));
  const checksum = crc32(serialized);

  container.crc32 = checksum;
  const finalPayload = encode(JSON.stringify(container));

  const capacity = calculateCapacity(imageData);
  if (finalPayload.length > capacity) {
    throw new Error(
      `Payload too large. Capacity: ${capacity} bytes, Payload: ${finalPayload.length} bytes`
    );
  }

  const out = new Uint8ClampedArray(imageData.data);

  for (let i = 0; i < finalPayload.length; i++) {
    out[i * 4] = (out[i * 4] & 0xFE) | (finalPayload[i] & 1);
  }

  return new ImageData(out, imageData.width, imageData.height);
}

export async function decryptImageData(imageData, options) {
  const bits = [];

  for (let i = 0; i < imageData.data.length; i += 4) {
    bits.push(imageData.data[i] & 1);
  }

  let container;
  try {
    container = JSON.parse(decode(new Uint8Array(bits)));
  } catch {
    throw new Error("Invalid or corrupted payload");
  }

  if (container.magic !== "STEGGY") {
    throw new Error("Not a Steggy container");
  }

  const { crc32: storedCRC, ...withoutCRC } = container;
  const recalculated = crc32(
    encode(JSON.stringify(withoutCRC))
  );

  if (storedCRC !== recalculated) {
    throw new Error("Payload integrity check failed (CRC mismatch)");
  }

  if (container.method === "pgp") {
    return pgpDecrypt(
      container.protected,
      options.pgpPrivateKey,
      options.pgpPassphrase
    );
  }

  if (container.method === "aes") {
    if (!options.password) {
      throw new Error("AES decryption requires a password");
    }
    return aesDecrypt(container.protected, options.password);
  }

  return container.protected;
}
