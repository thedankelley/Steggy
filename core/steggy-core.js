import { fragmentPayload, defragmentPayload } from "./steggy-fragment.js";
import { aesEncrypt, aesDecrypt } from "./steggy-aes.js";
import { pgpEncrypt, pgpDecrypt } from "./steggy-pgp.js";

const HEADER = "STEG";

export async function encryptImageData(imageData, protectedMsg, decoyMsg, opts) {
  let payload = protectedMsg;

  if (opts.method === "aes" || opts.method === "both") {
    payload = await aesEncrypt(payload, opts.password);
  }

  if (opts.method === "pgp" || opts.method === "both") {
    payload = await pgpEncrypt(payload, opts.pgpPublicKey);
  }

  const fragments = fragmentPayload(payload);
  embedFragments(imageData.data, fragments);

  if (decoyMsg) {
    const decoyFragments = fragmentPayload(decoyMsg);
    embedFragments(imageData.data, decoyFragments, true);
  }

  return imageData;
}

export async function decryptImageData(imageData, opts) {
  const fragments = extractFragments(imageData.data);
  let payload = defragmentPayload(fragments);

  if (opts.pgpPrivateKey) {
    payload = await pgpDecrypt(payload, opts.pgpPrivateKey, opts.pgpPassphrase);
  }

  if (opts.password) {
    payload = await aesDecrypt(payload, opts.password);
  }

  return payload;
}

/* ================= LOW LEVEL ================= */

function embedFragments(data, fragments, decoy = false) {
  let offset = decoy ? 1 : 0;

  fragments.forEach(fragment => {
    const header = [
      ...HEADER.split("").map(c => c.charCodeAt(0)),
      fragment.index,
      fragment.total,
      fragment.payload.length
    ];

    const block = [...header, ...fragment.payload];

    for (let i = 0; i < block.length; i++) {
      const idx = (offset + i) * 4;
      if (idx >= data.length) throw new Error("Image too small");
      data[idx] = (data[idx] & 0xFE) | (block[i] & 1);
    }

    offset += block.length;
  });
}

function extractFragments(data) {
  const fragments = [];
  let i = 0;

  while (i < data.length) {
    const h = readBits(data, i, 4);
    if (h !== HEADER) break;

    const index = readByte(data, i + 4);
    const total = readByte(data, i + 5);
    const len   = readByte(data, i + 6);

    const payload = readBytes(data, i + 7, len);
    fragments.push({ index, total, payload });

    i += 7 + len;
  }

  if (!fragments.length) throw new Error("No fragments found");
  return fragments;
}

function readBits(data, offset, len) {
  let s = "";
  for (let i = 0; i < len; i++) {
    s += String.fromCharCode(data[(offset + i) * 4] & 1);
  }
  return s;
}

function readByte(data, offset) {
  return data[offset * 4] & 0xFF;
}

function readBytes(data, offset, len) {
  const out = [];
  for (let i = 0; i < len; i++) {
    out.push(data[(offset + i) * 4] & 0xFF);
  }
  return out;
}
