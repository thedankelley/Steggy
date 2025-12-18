import { pgpEncrypt, pgpDecrypt } from "./steggy-pgp.js";

function encode(str){ return new TextEncoder().encode(str); }
function decode(buf){ return new TextDecoder().decode(buf); }

export async function encryptImageData(imageData, protectedMsg, decoyMsg, options) {

  let protectedPayload = protectedMsg;

  if (options.method === "pgp") {
    protectedPayload = await pgpEncrypt(
      protectedMsg,
      options.pgpPublicKey
    );
  }

  const payload = JSON.stringify({
    protected: protectedPayload,
    decoy: decoyMsg,
    method: options.method
  });

  const bytes = encode(payload);
  const out = new Uint8ClampedArray(imageData.data);

  for (let i=0;i<bytes.length;i++) {
    out[i*4] = (out[i*4] & 0xFE) | (bytes[i] & 1);
  }

  return new ImageData(out,imageData.width,imageData.height);
}

export async function decryptImageData(imageData, options) {

  const bits=[];
  for (let i=0;i<imageData.data.length;i+=4) {
    bits.push(imageData.data[i]&1);
  }

  const payload = JSON.parse(decode(new Uint8Array(bits)));

  if (payload.method === "pgp") {
    return pgpDecrypt(
      payload.protected,
      options.pgpPrivateKey,
      options.pgpPassphrase
    );
  }

  return payload.protected;
}
