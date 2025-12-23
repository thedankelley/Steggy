// modules/steggy-pgp.js
// PGP cryptography module for Steggy
// Requires OpenPGP.js (https://openpgpjs.org)

/*
Design goals:
- Fully client-side
- Offline compatible
- No interference with AES or fragmentation layers
- Deterministic error handling
- Explicit user control of keys
*/

let openpgpRef = null;

/**
 * Initialize OpenPGP reference
 * Call once at app startup
 *
 * @param {object} openpgp
 */
export function initPGP(openpgp) {
  if (!openpgp) {
    throw new Error('OpenPGP library not provided');
  }
  openpgpRef = openpgp;
}

/**
 * Generate a PGP key pair
 *
 * @param {string} name
 * @param {string} email
 * @param {string} passphrase optional
 * @returns {Promise<object>}
 */
export async function generateKeyPair(name, email, passphrase = '') {
  if (!openpgpRef) {
    throw new Error('PGP module not initialized');
  }

  if (!name || !email) {
    throw new Error('Name and email are required');
  }

  const result = await openpgpRef.generateKey({
    type: 'rsa',
    rsaBits: 4096,
    userIDs: [{ name, email }],
    passphrase: passphrase || undefined
  });

  return {
    publicKey: result.publicKey,
    privateKey: result.privateKey
  };
}

/**
 * Encrypt data using a public key
 *
 * @param {Uint8Array} data
 * @param {string} publicKeyArmored
 * @returns {Promise<Uint8Array>}
 */
export async function encryptWithPublicKey(data, publicKeyArmored) {
  if (!openpgpRef) {
    throw new Error('PGP module not initialized');
  }

  if (!(data instanceof Uint8Array)) {
    throw new Error('Data must be Uint8Array');
  }

  const publicKey = await openpgpRef.readKey({
    armoredKey: publicKeyArmored
  });

  const message = await openpgpRef.createMessage({
    binary: data
  });

  const encrypted = await openpgpRef.encrypt({
    message,
    encryptionKeys: publicKey,
    format: 'binary'
  });

  return new Uint8Array(encrypted);
}

/**
 * Decrypt data using a private key
 *
 * @param {Uint8Array} encryptedData
 * @param {string} privateKeyArmored
 * @param {string} passphrase optional
 * @returns {Promise<Uint8Array>}
 */
export async function decryptWithPrivateKey(
  encryptedData,
  privateKeyArmored,
  passphrase = ''
) {
  if (!openpgpRef) {
    throw new Error('PGP module not initialized');
  }

  if (!(encryptedData instanceof Uint8Array)) {
    throw new Error('Encrypted data must be Uint8Array');
  }

  let privateKey = await openpgpRef.readPrivateKey({
    armoredKey: privateKeyArmored
  });

  if (passphrase) {
    privateKey = await openpgpRef.decryptKey({
      privateKey,
      passphrase
    });
  }

  const message = await openpgpRef.readMessage({
    binaryMessage: encryptedData
  });

  const { data } = await openpgpRef.decrypt({
    message,
    decryptionKeys: privateKey,
    format: 'binary'
  });

  return new Uint8Array(data);
}

/**
 * Validate an armored PGP key
 *
 * @param {string} armored
 * @returns {Promise<'public'|'private'>}
 */
export async function validateKey(armored) {
  if (!openpgpRef) {
    throw new Error('PGP module not initialized');
  }

  try {
    await openpgpRef.readKey({ armoredKey: armored });
    return 'public';
  } catch (_) {}

  try {
    await openpgpRef.readPrivateKey({ armoredKey: armored });
    return 'private';
  } catch (_) {}

  throw new Error('Invalid PGP key');
}
