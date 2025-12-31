/*
  steggy-core.js

  Central pipeline controller.
  Eventually this will orchestrate:
  AES → PGP → Fragmentation → Decoy → Encode
*/

import { encryptPGPPayload } from '../modules/steggy-pgp.js';

export async function runSteggy(config) {
  const {
    mode,
    encryption,
    payload,
    file,
    decoy,
    fragmentation
  } = config;

  if (!payload) {
    throw new Error('No payload provided');
  }

  let workingPayload = payload;

  // PGP encryption (real, no bullshit)
  if (encryption === 'pgp' || encryption === 'both') {
    if (!config.publicKey) {
      // UI already encrypts beforehand, but keep this future-safe
      console.warn('PGP selected but no public key passed');
    }
  }

  // Placeholder for AES + fragmentation pipeline
  // (This is where shit will get wild later)
  console.log('Mode:', mode);
  console.log('Payload:', workingPayload);
  console.log('Decoy:', decoy);
  console.log('Fragmentation:', fragmentation);
  console.log('File:', file?.name);

  return true;
}
