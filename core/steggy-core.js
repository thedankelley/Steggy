import { fragmentPayload, defragmentPayload } from "./steggy-fragment.js";
import { aesEncrypt, aesDecrypt } from "./steggy-aes.js";
import { pgpEncrypt, pgpDecrypt } from "./steggy-pgp.js";

const MAGIC = "STEG";
const VERSION = 1;

export async function encryptImageData(imageData, protectedMsg, decoyMsg, opts) {
  let payload = protectedMsg;

  if (opts.method === "aes" || opts.method === "both") {
    payload = await aesEncrypt(payload, opts.password);
  }

  if (opts.method === "pgp" || opts.method === "both") {
    payload = await pgpEncrypt(payload, opts.pgpPublicKey);
  }

  const fragments = fragmentPayload(payload);
  embedFragments(imageData.data, fragments, false);

  if (decoyMsg) {
    const decoyFragments = fragmentPayload(decoyMsg);
    embedFragments(imageData.data, decoyFragments, true);
  }

  return imageData;
}

export async function decryptImageData(imageData, opts) {
  const fragments = extractFragments(imageData.data, false);
  let payload = defragmentPayload(fragments);

  if (opts.method === "pgp" || opts.method === "both") {
    payload = await pgpDecrypt(payload, opts.pgpPrivateKey, opts.pgpPassphrase);
  }

  if (opts.method === "aes" || opts.method === "both") {
    payload = await aesDecrypt(payload, opts.password);
  }

  return payload;
}

/* ================= EMBEDDING ================= */

function embedFragments(data, fragments, decoy) {
  let offset = decoy ? 1 : 0;

  for (const f of fragments) {
    const header = [
      ...MAGIC.split("").map(c => c.charCodeAt(0)),
      VERSION,
      decoy ? 1 : 0,
      f.index,
      f.total,
      f.payload.length,
      ...toBytes(f.checksum)
    ];

    const block = [...header, ...f.payload];

    for (let i = 0; i < block.length; i++) {
      const idx = (offset + i) * 4;
      if (idx >= data.length) throw new Error("Image too small");
      data[idx] = (data[idx] & 0xfe) | (block[i] & 1);
    }

    offset += block.length;
  }
}

function extractFragments(data, decoy) {
  const fragments = [];
  let i = 0;

  while (i < data.length) {
    const magic = readString(data, i, 4);
    if (magic !== MAGIC) break;

    const version = readByte(data, i + 4);
    if (version !== VERSION) {
      throw new Error("Unsupported container version");
    }

    const flags = readByte(data, i + 5);
    const isDecoy = flags === 1;
    if (isDecoy !== decoy) {
      i += 1;
      continue;
    }

    const index = readByte(data, i + 6);
    const total = readByte(data, i + 7);
    const len = readByte(data, i + 8);
    const checksum = readUint32(data, i + 9);

    const payload = readBytes(data, i + 13, len);
    fragments.push({ index, total, payload, checksum });

    i += 13 + len;
  }

  if (!fragments.length) throw new Error("No payload found");
  return fragments;
}

/* ================= READERS ================= */

function readByte(data, offset) {
  return data[offset * 4] & 0xff;
}

function readBytes(data, offset, len) {
  const out = [];
  for (let i = 0; i < len; i++) {
    out.push(data[(offset + i) * 4] & 0xff);
  }
  return out;
}

function readUint32(data, offset) {
  const bytes = readBytes(data, offset, 4);
  return new DataView(Uint8Array.from(bytes).buffer).getUint32(0);
}

function readString(data, offset, len) {
  return String.fromCharCode(...readBytes(data, offset, len));
}

function toBytes(num) {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, num);
  return [...b];
}
