export async function pgpEncrypt(bytes, publicKey) {
  const key = await openpgp.readKey({ armoredKey: publicKey });
  const msg = await openpgp.createMessage({ binary: bytes });
  const enc = await openpgp.encrypt({ message: msg, encryptionKeys: key });
  return new TextEncoder().encode(enc);
}

export async function pgpDecrypt(bytes, privateKey, passphrase="") {
  const key = await openpgp.decryptKey({
    privateKey: await openpgp.readPrivateKey({ armoredKey: privateKey }),
    passphrase
  });
  const msg = await openpgp.readMessage({
    armoredMessage: new TextDecoder().decode(bytes)
  });
  const res = await openpgp.decrypt({ message: msg, decryptionKeys: key });
  return new TextEncoder().encode(res.data);
}
