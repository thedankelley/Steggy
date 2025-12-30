/*
  steggy-core.js

  This is the brain.
  UI talks to this file.
  This file talks to crypto.
  Everyone else shuts the fuck up.

  All modes, encryption layers, and validation live here.
*/

import { crc32 } from "./steggy-crc.js";
import * as pgp from "../modules/steggy-pgp.js";

/* =======================
   AES-GCM helpers
   ======================= */

// Derive a key from a password.
// Yes PBKDF2 is slow.
// That is the point.
async function deriveAESKey(password, salt) {
  const enc = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
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

async function aesEncrypt(plaintext, password) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const key = await deriveAESKey(password, salt);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );

  return {
    iv: Array.from(iv),
    salt: Array.from(salt),
    data: Array.from(new Uint8Array(ciphertext))
  };
}

async function aesDecrypt(payload, password) {
  const enc = new TextDecoder();

  const key = await deriveAESKey(
    password,
    new Uint8Array(payload.salt)
  );

  const plaintext = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(payload.iv)
    },
    key,
    new Uint8Array(payload.data)
  );

  return enc.decode(plaintext);
}

/* =======================
   Payload packaging
   ======================= */

// Wrap payload with headers so future-you knows what the fuck this is
function wrapPayload(obj) {
  const json = JSON.stringify(obj);
  const checksum = crc32(json);

  return JSON.stringify({
    steggy: 1,
    crc: checksum,
    payload: obj
  });
}

function unwrapPayload(str) {
  const parsed = JSON.parse(str);

  if (!parsed.steggy) {
    throw new Error("Not a Steggy payload");
  }

  const check = crc32(JSON.stringify(parsed.payload));
  if (check !== parsed.crc) {
    throw new Error("Payload corrupted");
  }

  return parsed.payload;
}

/* =======================
   Core entry point
   ======================= */

export async function runSteggy(file, options) {
  const { mode, payload, encryption, pgp: pgpOpts } = options;

  if (!mode) throw new Error("Mode not specified");

  // Right now only image encrypt/decrypt is wired
  if (mode !== "encrypt-image" && mode !== "decrypt-image") {
    throw new Error("Unsupported mode");
  }

  if (mode === "encrypt-image") {
    if (!payload) throw new Error("No payload provided");

    let workingPayload = payload;

    /* ---------- ENCRYPTION LAYERS ---------- */

    if (encryption === "aes" || encryption === "both") {
      if (!pgpOpts?.privateKey && encryption === "aes") {
        // Using privateKey field as password input for now.
        // We will rename this later. Yes this is ugly.
      }

      workingPayload = await aesEncrypt(
        workingPayload,
        pgpOpts?.privateKey || "default-password"
      );
    }

    if (encryption === "pgp" || encryption === "both") {
      if (!pgpOpts?.publicKey) {
        throw new Error("PGP public key required");
      }

      workingPayload = await pgp.encryptMessage(
        JSON.stringify(workingPayload),
        pgpOpts.publicKey
      );
    }

    const wrapped = wrapPayload({
      encryption,
      data: workingPayload
    });

    /*
      At this point, wrapped is the final string to embed.

      Image LSB embedding happens later.
      Right now we just return it for testing.
    */

    return {
      type: "text",
      wrapped
    };
  }

  if (mode === "decrypt-image") {
    let extracted = payload; // placeholder for extracted data

    const unwrapped = unwrapPayload(extracted);

    let workingData = unwrapped.data;

    if (unwrapped.encryption === "pgp" || unwrapped.encryption === "both") {
      if (!pgpOpts?.privateKey) {
        throw new Error("PGP private key required");
      }

      workingData = await pgp.decryptMessage(
        workingData,
        pgpOpts.privateKey
      );
    }

    if (unwrapped.encryption === "aes" || unwrapped.encryption === "both") {
      workingData = await aesDecrypt(
        JSON.parse(workingData),
        pgpOpts?.privateKey || "default-password"
      );
    }

    return {
      type: "text",
      plaintext: workingData
    };
  }
}
