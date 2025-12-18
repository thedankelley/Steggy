import * as openpgp from "https://cdn.jsdelivr.net/npm/openpgp@5.10.1/+esm";

export async function generatePGPKeyPair(passphrase) {
  const { privateKey, publicKey } = await openpgp.generateKey({
    type: "rsa",
    rsaBits: 4096,
    userIDs: [{ name: "Steggy User" }],
    passphrase
  });

  return { publicKey, privateKey };
}

export async function pgpEncrypt(text, publicKeyArmored) {
  const key = await openpgp.readKey({ armoredKey: publicKeyArmored });
  return openpgp.encrypt({
    message: await openpgp.createMessage({ text }),
    encryptionKeys: key
  });
}

export async function pgpDecrypt(cipher, privateKeyArmored, passphrase) {
  const key = await openpgp.readPrivateKey({ armoredKey: privateKeyArmored });
  const unlocked = await openpgp.decryptKey({ privateKey: key, passphrase });
  const msg = await openpgp.readMessage({ armoredMessage: cipher });
  const { data } = await openpgp.decrypt({
    message: msg,
    decryptionKeys: unlocked
  });
  return data;
}
