import { pgpEncrypt, pgpDecrypt } from "../modules/steggy-pgp.js";

const enc = new TextEncoder();
const dec = new TextDecoder();

function crc32(buf) {
  let crc = ~0;
  for (let b of buf) {
    crc ^= b;
    for (let i = 0; i < 8; i++) {
      crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
    }
  }
  return (~crc >>> 0).toString(16);
}

async function aesKey(password, salt) {
  const base = await crypto.subtle.importKey(
    "raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function aesEncrypt(text, password) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await aesKey(password, salt);
  const data = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(text)
  );
  return { iv: [...iv], salt: [...salt], data: [...new Uint8Array(data)] };
}

async function aesDecrypt(obj, password) {
  const key = await aesKey(password, new Uint8Array(obj.salt));
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(obj.iv) },
    key,
    new Uint8Array(obj.data)
  );
  return dec.decode(plain);
}

function capacity(imageData) {
  return Math.floor(imageData.data.length / 4);
}

function fragment(buf, max) {
  const parts = [];
  for (let i = 0; i < buf.length; i += max) {
    parts.push(buf.slice(i, i + max));
  }
  return parts;
}

export async function encryptImageData(imageData, protectedMsg, decoyMsg, options) {
  let protectedPayload = protectedMsg;

  if (options.method === "pgp") {
    protectedPayload = await pgpEncrypt(protectedMsg, options.pgpPublicKey);
  }

  if (options.method === "aes") {
    protectedPayload = await aesEncrypt(protectedMsg, options.password);
  }

  const container = {
    magic: "STEGGY",
    version: "2.0",
    method: options.method,
    protected: protectedPayload,
    decoy: decoyMsg
  };

  let raw = enc.encode(JSON.stringify(container));
  container.crc32 = crc32(raw);
  raw = enc.encode(JSON.stringify(container));

  const cap = capacity(imageData);
  if (raw.length > cap) {
    throw new Error("Payload exceeds image capacity");
  }

  const fragments = fragment(raw, cap);
  const out = new Uint8ClampedArray(imageData.data);

  let offset = 0;
  for (let frag of fragments) {
    for (let i = 0; i < frag.length; i++) {
      out[(offset + i) * 4] =
        (out[(offset + i) * 4] & 0xFE) | (frag[i] & 1);
    }
    offset += frag.length;
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
    container = JSON.parse(dec.decode(new Uint8Array(bits)));
  } catch {
    throw new Error("Invalid payload");
  }

  const { crc32: crc, ...rest } = container;
  const check = crc32(enc.encode(JSON.stringify(rest)));
  if (crc !== check) throw new Error("CRC mismatch");

  if (container.method === "pgp") {
    return pgpDecrypt(
      container.protected,
      options.pgpPrivateKey,
      options.pgpPassphrase
    );
  }

  if (container.method === "aes") {
    return aesDecrypt(container.protected, options.password);
  }

  return container.protected;
}
