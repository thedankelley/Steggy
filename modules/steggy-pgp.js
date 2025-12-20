// steggy-pgp.js
import * as openpgp from "https://cdn.jsdelivr.net/npm/openpgp@5.10.1/+esm";

export class SteggyPGP {
  static async generateKeypair(name, email, passphrase) {
    return openpgp.generateKey({
      type: "rsa",
      rsaBits: 4096,
      userIDs: [{ name, email }],
      passphrase
    });
  }

  static async encrypt(bytes, publicKeyArmored) {
    const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
    const message = await openpgp.createMessage({ binary: bytes });
    const encrypted = await openpgp.encrypt({
      message,
      encryptionKeys: publicKey
    });
    return new TextEncoder().encode(encrypted);
  }

  static async decrypt(bytes, privateKeyArmored, passphrase = "") {
    const privateKey = await openpgp.readPrivateKey({ armoredKey: privateKeyArmored });
    const key = passphrase
      ? await openpgp.decryptKey({ privateKey, passphrase })
      : privateKey;

    const message = await openpgp.readMessage({
      armoredMessage: new TextDecoder().decode(bytes)
    });

    const { data } = await openpgp.decrypt({
      message,
      decryptionKeys: key
    });

    return typeof data === "string"
      ? new TextEncoder().encode(data)
      : data;
  }
}
