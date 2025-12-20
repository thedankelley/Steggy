import * as openpgp from "https://cdn.jsdelivr.net/npm/openpgp@5.11.0/+esm";

export async function generateKeyPair() {
  const { privateKey, publicKey } = await openpgp.generateKey({
    type: "rsa",
    rsaBits: 2048,
    userIDs: [{ name: "Steggy User" }]
  });

  return {
    publicKey,
    privateKey
  };
}

export async function encrypt(bytes, publicKeyArmored) {
  const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
  const message = await openpgp.createMessage({ binary: bytes });

  const encrypted = await openpgp.encrypt({
    message,
    encryptionKeys: publicKey
  });

  return new TextEncoder().encode(encrypted);
}

export async function decrypt(bytes, privateKeyArmored) {
  const privateKey = await openpgp.readPrivateKey({
    armoredKey: privateKeyArmored
  });

  const message = await openpgp.readMessage({
    armoredMessage: new TextDecoder().decode(bytes)
  });

  const { data } = await openpgp.decrypt({
    message,
    decryptionKeys: privateKey
  });

  return new TextEncoder().encode(data);
}
