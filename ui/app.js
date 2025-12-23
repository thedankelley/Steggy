import * as openpgp from '../vendor/openpgp.min.js';

import { initPGP, generateKeyPair, encryptWithPublicKey, decryptWithPrivateKey } from '../modules/steggy-pgp.js';
import { encodeSSTV, pcmToWav } from '../modules/steggy-sstv.js';
import { decodeSSTV } from '../modules/steggy-sstv-decode.js';

initPGP(openpgp);

// UI elements
const modeSelect = document.getElementById('modeSelect');
const stegSection = document.getElementById('stegSection');
const sstvEncodeSection = document.getElementById('sstvEncodeSection');
const sstvDecodeSection = document.getElementById('sstvDecodeSection');

const advancedToggle = document.getElementById('advancedToggle');
const advancedPanel = document.getElementById('advancedPanel');
const cryptoMode = document.getElementById('cryptoMode');
const pgpPanel = document.getElementById('pgpPanel');

const pgpGenerate = document.getElementById('pgpGenerate');
const pgpEncrypt = document.getElementById('pgpEncrypt');
const pgpDecrypt = document.getElementById('pgpDecrypt');

const pgpPublic = document.getElementById('pgpPublic');
const pgpPrivate = document.getElementById('pgpPrivate');

modeSelect.onchange = () => {
  stegSection.hidden = true;
  sstvEncodeSection.hidden = true;
  sstvDecodeSection.hidden = true;

  if (modeSelect.value === 'encrypt' || modeSelect.value === 'decrypt') {
    stegSection.hidden = false;
  }
  if (modeSelect.value === 'sstv-encode') {
    sstvEncodeSection.hidden = false;
  }
  if (modeSelect.value === 'sstv-decode') {
    sstvDecodeSection.hidden = false;
  }
};

advancedToggle.onclick = () => {
  advancedPanel.hidden = !advancedPanel.hidden;
};

cryptoMode.onchange = () => {
  pgpPanel.hidden = cryptoMode.value === 'aes';
};

pgpGenerate.onclick = async () => {
  const name = document.getElementById('pgpName').value;
  const email = document.getElementById('pgpEmail').value;
  const pass = document.getElementById('pgpPass').value;

  const keys = await generateKeyPair(name, email, pass);
  pgpPublic.value = keys.publicKey;
  pgpPrivate.value = keys.privateKey;
};

pgpEncrypt.onclick = async () => {
  const data = new TextEncoder().encode(document.getElementById('payloadInput').value);
  const encrypted = await encryptWithPublicKey(data, pgpPublic.value);
  document.getElementById('payloadInput').value = btoa(String.fromCharCode(...encrypted));
};

pgpDecrypt.onclick = async () => {
  const encrypted = Uint8Array.from(atob(document.getElementById('payloadInput').value), c => c.charCodeAt(0));
  const decrypted = await decryptWithPrivateKey(encrypted, pgpPrivate.value);
  document.getElementById('payloadInput').value = new TextDecoder().decode(decrypted);
};

// SSTV Encode
document.getElementById('runSSTVEncode').onclick = async () => {
  const file = document.getElementById('sstvImageInput').files[0];
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();

  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, 320, 256);

  const samples = encodeSSTV(ctx.getImageData(0, 0, 320, 256),
    document.getElementById('sstvMode').value);
  const wav = pcmToWav(samples);

  const audio = document.getElementById('sstvAudio');
  audio.src = URL.createObjectURL(wav);
};

// SSTV Decode
document.getElementById('runSSTVDecode').onclick = async () => {
  const file = document.getElementById('sstvWavInput').files[0];
  const buf = await file.arrayBuffer();
  const image = await decodeSSTV(buf, document.getElementById('sstvDecodeMode').value);

  const canvas = document.getElementById('sstvCanvas');
  canvas.width = image.width;
  canvas.height = image.height;
  canvas.getContext('2d').putImageData(image, 0, 0);
};
