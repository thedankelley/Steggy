// modules/steggy-pgp.js

import * as openpgp from "https://cdn.jsdelivr.net/npm/openpgp@5.10.1/+esm";

export async function generatePGPKeypair() {
  const { privateKey, publicKey } = await openpgp.generateKey({
    type: "rsa",
    rsaBits: 4096,
    userIDs: [{ name: "Steggy User" }],
    format: "armored"
  });

  return {
    publicKey,
    privateKey
  };
}

export async function encryptPGP(plaintext, publicKeyArmored) {
  if (!plaintext || !publicKeyArmored) {
    throw new Error("Missing plaintext or public key");
  }

  const publicKey = await openpgp.readKey({
    armoredKey: publicKeyArmored
  });

  const message = await openpgp.createMessage({
    text: plaintext
  });

  return await openpgp.encrypt({
    message,
    encryptionKeys: publicKey
  });
}

export async function decryptPGP(ciphertext, privateKeyArmored) {
  if (!ciphertext || !privateKeyArmored) {
    throw new Error("Missing ciphertext or private key");
  }

  const privateKey = await openpgp.readPrivateKey({
    armoredKey: privateKeyArmored
  });

  const message = await openpgp.readMessage({
    armoredMessage: ciphertext
  });

  const { data } = await openpgp.decrypt({
    message,
    decryptionKeys: privateKey
  });

  return data;
}
