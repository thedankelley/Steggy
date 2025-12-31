/*
  steggy-hash.js

  SHA-256 hashing for forensic verification.
*/

export async function sha256(data) {
  const enc = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', enc.encode(data));
  return [...new Uint8Array(buffer)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
