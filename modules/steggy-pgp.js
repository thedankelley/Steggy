import * as openpgp from "https://cdn.jsdelivr.net/npm/openpgp@5.10.0/+esm";

export async function generatePGPKeyPair() {
  return openpgp.generateKey({
    type:"rsa",
    rsaBits:4096,
    userIDs:[{name:"Steggy User"}],
    passphrase:""
  });
}

export async function pgpEncrypt(text, publicKeyArmored) {
  const publicKey = await openpgp.readKey({armoredKey:publicKeyArmored});
  const message = await openpgp.createMessage({text});
  return openpgp.encrypt({message,encryptionKeys:publicKey});
}

export async function pgpDecrypt(cipher, privateKeyArmored, passphrase) {
  const privateKey = await openpgp.decryptKey({
    privateKey:await openpgp.readPrivateKey({armoredKey:privateKeyArmored}),
    passphrase
  });
  const message = await openpgp.readMessage({armoredMessage:cipher});
  const { data } = await openpgp.decrypt({
    message,
    decryptionKeys:privateKey
  });
  return data;
}
