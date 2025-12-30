// steggy-pgp.js
// PGP-ish key generation using WebCrypto
// Not pretending to be GnuPG, but strong enough for client-side stego

export async function generatePGPKeyPair() {
  try {
    // Generate RSA keypair
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );

    // Export keys
    const publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    // Base64 encode
    const pubB64 = btoa(String.fromCharCode(...new Uint8Array(publicKey)));
    const privB64 = btoa(String.fromCharCode(...new Uint8Array(privateKey)));

    // Fake-but-clear armor (clarity > purity)
    return {
      publicKey:
`-----BEGIN STEGGY PUBLIC KEY-----
${pubB64}
-----END STEGGY PUBLIC KEY-----`,

      privateKey:
`-----BEGIN STEGGY PRIVATE KEY-----
${privB64}
-----END STEGGY PRIVATE KEY-----`
    };

  } catch (err) {
    console.error("PGP keygen failed:", err);
    throw new Error("PGP key generation failed");
  }
}
