import * as openpgp from "https://cdn.jsdelivr.net/npm/openpgp@5.11.0/+esm";

/* ---------- Key Generation ---------- */

export async function generatePGPKeypair() {
  const { privateKey, publicKey } = await openpgp.generateKey({
    type: "rsa",
    rsaBits: 4096,
    userIDs: [{ name: "Steggy User", email: "user@steggy.local" }],
    format: "armored"
  });

  return {
    publicKey,
    privateKey
  };
}

/* ---------- Encryption ---------- */

export async function pgpEncrypt(message, publicKeyArmored) {
  if (!publicKeyArmored) {
    throw new Error("PGP public key is required");
  }

  const publicKey = await openpgp.readKey({
    armoredKey: publicKeyArmored
  });

  const encrypted = await openpgp.encrypt({
    message: await openpgp.createMessage({ text: message }),
    encryptionKeys: publicKey
  });

  return encrypted;
}

/* ---------- Decryption ---------- */

export async function pgpDecrypt(
  encryptedMessage,
  privateKeyArmored,
  passphrase = ""
) {
  if (!privateKeyArmored) {
    throw new Error("PGP private key is required");
  }

  const privateKey = await openpgp.decryptKey({
    privateKey: await openpgp.readPrivateKey({
      armoredKey: privateKeyArmored
    }),
    passphrase
  });

  const message = await openpgp.readMessage({
    armoredMessage: encryptedMessage
  });

  const { data } = await openpgp.decrypt({
    message,
    decryptionKeys: privateKey
  });

  return data;
}
