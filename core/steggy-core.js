import { crc32 } from "./steggy-crc.js";

import * as decoy from "../modules/steggy-decoy.js";
import * as fragment from "../modules/steggy-fragment.js";
import * as hash from "../modules/steggy-hash.js";
import * as pgp from "../modules/steggy-pgp.js";
import * as sstv from "../modules/steggy-sstv.js";

/*
 Flags
*/
const FLAG_AES = 0x01;
const FLAG_PGP = 0x02;
const FLAG_FRAGMENT = 0x04;
const FLAG_DECOY = 0x08;

const MAGIC = [0x53, 0x54, 0x45, 0x47]; // "STEG"
const VERSION = 1;

/*
 Public API
*/
export async function encrypt(options) {
  validateEncryptOptions(options);

  let protectedPayload = textToBytes(options.payload);
  let decoyPayload = options.decoy
    ? textToBytes(options.decoy)
    : new Uint8Array(0);

  let flags = 0;

  if (options.pgp) {
    protectedPayload = await pgp.encrypt(
      protectedPayload,
      options.pgp.publicKey
    );
    flags |= FLAG_PGP;
  }

  if (options.aes) {
    protectedPayload = await options.aes.encrypt(
      protectedPayload,
      options.aes.password
    );
    flags |= FLAG_AES;
  }

  if (options.fragment) {
    protectedPayload = fragment.fragment(protectedPayload);
    flags |= FLAG_FRAGMENT;
  }

  if (decoyPayload.length > 0) {
    flags |= FLAG_DECOY;
  }

  const container = buildContainer(
    flags,
    protectedPayload,
    decoyPayload
  );

  return container;
}

export async function decrypt(containerBytes, options) {
  const parsed = parseContainer(containerBytes);

  let payload = parsed.protectedPayload;

  if (parsed.flags & FLAG_FRAGMENT) {
    payload = fragment.reassemble(payload);
  }

  if (parsed.flags & FLAG_AES) {
    if (!options.aes) {
      throw new Error("AES password required");
    }
    payload = await options.aes.decrypt(
      payload,
      options.aes.password
    );
  }

  if (parsed.flags & FLAG_PGP) {
    if (!options.pgp) {
      throw new Error("PGP private key required");
    }
    payload = await pgp.decrypt(
      payload,
      options.pgp.privateKey
    );
  }

  return {
    protected: bytesToText(payload),
    decoy: parsed.decoyPayload.length
      ? bytesToText(parsed.decoyPayload)
      : null,
    flags: parsed.flags
  };
}

/*
 Container helpers
*/
function buildContainer(flags, protectedPayload, decoyPayload) {
  const headerSize = 4 + 1 + 1 + 4 + 4;
  const totalSize =
    headerSize +
    protectedPayload.length +
    decoyPayload.length +
    4;

  const buffer = new Uint8Array(totalSize);
  let offset = 0;

  buffer.set(MAGIC, offset);
  offset += 4;

  buffer[offset++] = VERSION;
  buffer[offset++] = flags;

  writeUint32(buffer, offset, protectedPayload.length);
  offset += 4;

  writeUint32(buffer, offset, decoyPayload.length);
  offset += 4;

  buffer.set(protectedPayload, offset);
  offset += protectedPayload.length;

  buffer.set(decoyPayload, offset);
  offset += decoyPayload.length;

  const crc = crc32(buffer.slice(0, offset));
  writeUint32(buffer, offset, crc);

  return buffer;
}

function parseContainer(bytes) {
  let offset = 0;

  for (let i = 0; i < 4; i++) {
    if (bytes[i] !== MAGIC[i]) {
      throw new Error("Invalid container magic");
    }
  }
  offset += 4;

  const version = bytes[offset++];
  if (version !== VERSION) {
    throw new Error("Unsupported container version");
  }

  const flags = bytes[offset++];

  const protectedLen = readUint32(bytes, offset);
  offset += 4;

  const decoyLen = readUint32(bytes, offset);
  offset += 4;

  const protectedPayload = bytes.slice(
    offset,
    offset + protectedLen
  );
  offset += protectedLen;

  const decoyPayload = bytes.slice(
    offset,
    offset + decoyLen
  );
  offset += decoyLen;

  const storedCrc = readUint32(bytes, offset);
  const calcCrc = crc32(bytes.slice(0, offset));

  if (storedCrc !== calcCrc) {
    throw new Error("CRC mismatch, data corrupted");
  }

  return {
    flags,
    protectedPayload,
    decoyPayload
  };
}

/*
 Utilities
*/
function writeUint32(buf, offset, value) {
  buf[offset] = (value >>> 24) & 0xff;
  buf[offset + 1] = (value >>> 16) & 0xff;
  buf[offset + 2] = (value >>> 8) & 0xff;
  buf[offset + 3] = value & 0xff;
}

function readUint32(buf, offset) {
  return (
    (buf[offset] << 24) |
    (buf[offset + 1] << 16) |
    (buf[offset + 2] << 8) |
    buf[offset + 3]
  ) >>> 0;
}

function textToBytes(text) {
  return new TextEncoder().encode(text);
}

function bytesToText(bytes) {
  return new TextDecoder().decode(bytes);
}

function validateEncryptOptions(options) {
  if (!options || !options.payload) {
    throw new Error("Payload required");
  }
}
