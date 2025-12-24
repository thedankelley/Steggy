import { encryptWithPGP, decryptWithPGP } from "../modules/steggy-pgp.js";

/*
  steggy-core.js
  Core orchestration for encryption and decryption
*/

export async function encryptPayload({
  payload,
  cryptoMode,
  aesPassword = "",
  pgpPublicKey = ""
}) {
  let data = payload;

  // AES first
  if (cryptoMode === "aes" || cryptoMode === "aes+pgp") {
    if (!aesPassword) {
      throw new Error("AES password required");
    }
    data = await aesEncrypt(data, aesPassword);
  }

  // PGP second
  if (cryptoMode === "pgp" || cryptoMode === "aes+pgp") {
    if (!pgpPublicKey) {
      throw new Error("PGP public key required");
    }
    data = await encryptWithPGP(data, pgpPublicKey);
  }

  return data;
}

export async function decryptPayload({
  encryptedPayload,
  cryptoMode,
  aesPassword = "",
  pgpPrivateKey = ""
}) {
  let data = encryptedPayload;

  // Reverse order on decrypt

  if (cryptoMode === "pgp" || cryptoMode === "aes+pgp") {
    if (!pgpPrivateKey) {
      throw new Error("PGP private key required");
    }
    data = await decryptWithPGP(data, pgpPrivateKey);
  }

  if (cryptoMode === "aes" || cryptoMode === "aes+pgp") {
    if (!aesPassword) {
      throw new Error("AES password required");
    }
    data = await aesDecrypt(data, aesPassword);
  }

  return data;
}

// --------------------
// AES-GCM helpers
// --------------------

async function aesEncrypt(plaintext, password) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(password, salt);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );

  return btoa(
    JSON.stringify({
      salt: arrayToBase64(salt),
      iv: arrayToBase64(iv),
      data: arrayToBase64(new Uint8Array(ciphertext))
    })
  );
}

async function aesDecrypt(encoded, password) {
  const dec = new TextDecoder();
  const parsed = JSON.parse(atob(encoded));

  const salt = base64ToArray(parsed.salt);
  const iv = base64ToArray(parsed.iv);
  const data = base64ToArray(parsed.data);

  const key = await deriveKey(password, salt);

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  return dec.decode(plaintext);
}

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
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
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// --------------------
// Utilities
// --------------------

function arrayToBase64(arr) {
  return btoa(String.fromCharCode(...arr));
}

function base64ToArray(b64) {
  return new Uint8Array(
    atob(b64).split("").map(c => c.charCodeAt(0))
  );
}
