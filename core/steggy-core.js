/*
  steggy-core.js

  Central execution pipeline.
  This is where all features finally meet and either work or explode.
*/

import { fragmentPayload } from '../modules/steggy-fragment.js';
import { encryptPGPPayload } from '../modules/steggy-pgp.js';

/* ---------- AES-GCM HELPERS ---------- */

async function aesEncrypt(plaintext, password) {
  const enc = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext)
  );

  return {
    type: 'aes-gcm',
    salt: btoa(String.fromCharCode(...salt)),
    iv: btoa(String.fromCharCode(...iv)),
    data: btoa(String.fromCharCode(...new Uint8Array(encrypted)))
  };
}

/* ---------- MAIN ENTRY ---------- */

export async function runSteggy(config) {
  const {
    mode,
    encryption,
    payload,
    password,
    publicKey,
    enableFragmentation
  } = config;

  if (!payload) throw new Error('Missing payload');

  let workingPayload = payload;

  /* ---- PGP LAYER ---- */
  if (encryption === 'pgp' || encryption === 'both') {
    if (!publicKey) throw new Error('PGP selected but no public key');

    workingPayload = await encryptPGPPayload(
      workingPayload,
      publicKey
    );
  }

  /* ---- AES LAYER ---- */
  if (encryption === 'aes' || encryption === 'both') {
    if (!password) throw new Error('AES selected but no password');

    const aesResult = await aesEncrypt(
      workingPayload,
      password
    );

    workingPayload = JSON.stringify(aesResult);
  }

  /* ---- FRAGMENTATION ---- */
  if (enableFragmentation) {
    workingPayload = fragmentPayload(workingPayload);
  }

  /*
    At this point:
    - Payload is encrypted
    - Fragmented if requested
    - Ready for stego or SSTV
  */

  console.log('Final payload:', workingPayload);

  return workingPayload;
}
