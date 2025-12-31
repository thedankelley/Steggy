/*
  steggy-pgp.js

  OpenPGP helpers.
  If something breaks here, it's probably OpenPGP being OpenPGP.
*/

import * as openpgp from 'https://cdn.jsdelivr.net/npm/openpgp@5.10.1/+esm';

export async function encryptPGPPayload(payload, publicKeyArmored) {
  if (!publicKeyArmored) {
    throw new Error('Missing public PGP key');
  }

  const publicKey = await openpgp.readKey({
    armoredKey: publicKeyArmored
  });

  const message = await openpgp.createMessage({
    text: payload
  });

  return openpgp.encrypt({
    message,
    encryptionKeys: publicKey
  });
}
