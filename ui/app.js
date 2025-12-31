import * as openpgp from 'https://cdn.jsdelivr.net/npm/openpgp@5.10.1/+esm';
import { runSteggy } from '../core/steggy-core.js';

/*
  app.js
  If this file breaks again, we burn the repo and move to a cabin.
*/

// ---------- DOM ----------
const modeSelect = document.getElementById('mode');
const encryptionSelect = document.getElementById('encryption');
const fileInput = document.getElementById('fileInput');
const fileLabel = document.getElementById('fileLabel');
const payloadInput = document.getElementById('payload');

const pgpSection = document.getElementById('pgpSection');
const pgpPublicKey = document.getElementById('pgpPublicKey');
const pgpPrivateKey = document.getElementById('pgpPrivateKey');

const generatePGPBtn = document.getElementById('generatePGP');
const encryptPGPBtn = document.getElementById('encryptPGP');
const downloadPublicBtn = document.getElementById('downloadPublicPGP');
const downloadPrivateBtn = document.getElementById('downloadPrivatePGP');

const runBtn = document.getElementById('runBtn');

const guideBtn = document.getElementById('guideBtn');
const guidePanel = document.getElementById('guidePanel');
const closeGuideBtn = document.getElementById('closeGuideBtn');

const enableDecoy = document.getElementById('enableDecoy');
const decoyPayload = document.getElementById('decoyPayload');

const enableFragmentation = document.getElementById('enableFragmentation');
const fragmentOptions = document.getElementById('fragmentOptions');

// ---------- STATE ----------
let encryptedPayloadCache = null;

// ---------- UI HELPERS ----------

function updateEncryptionUI() {
  const val = encryptionSelect.value;
  pgpSection.classList.toggle(
    'hidden',
    !(val === 'pgp' || val === 'both')
  );
}

function updateModeUI() {
  fileLabel.textContent =
    modeSelect.value === 'sstv-decrypt'
      ? 'Select WAV'
      : 'Select Image';
}

// ---------- GUIDE ----------

guideBtn.onclick = () => guidePanel.classList.remove('hidden');
closeGuideBtn.onclick = () => guidePanel.classList.add('hidden');

// ---------- ADVANCED ----------

enableDecoy.onchange = () =>
  decoyPayload.classList.toggle('hidden', !enableDecoy.checked);

enableFragmentation.onchange = () =>
  fragmentOptions.classList.toggle('hidden', !enableFragmentation.checked);

// ---------- PGP ----------

generatePGPBtn.onclick = async () => {
  try {
    const keys = await openpgp.generateKey({
      type: 'rsa',
      rsaBits: 2048,
      userIDs: [{ name: 'Steggy User' }]
    });

    pgpPublicKey.value = keys.publicKey;
    pgpPrivateKey.value = keys.privateKey;
  } catch (e) {
    console.error(e);
    alert('PGP key generation failed');
  }
};

encryptPGPBtn.onclick = async () => {
  try {
    const message = await openpgp.createMessage({
      text: payloadInput.value
    });

    const publicKey = await openpgp.readKey({
      armoredKey: pgpPublicKey.value
    });

    encryptedPayloadCache = await openpgp.encrypt({
      message,
      encryptionKeys: publicKey
    });

    alert('Payload encrypted with PGP');
  } catch (e) {
    console.error(e);
    alert('PGP encryption failed');
  }
};

function downloadKey(text, filename) {
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

downloadPublicBtn.onclick = () =>
  downloadKey(pgpPublicKey.value, 'steggy-public-key.asc');

downloadPrivateBtn.onclick = () =>
  downloadKey(pgpPrivateKey.value, 'steggy-private-key.asc');

// ---------- RUN ----------

runBtn.onclick = async () => {
  try {
    const payload =
      encryptedPayloadCache ??
      payloadInput.value;

    const file = fileInput.files[0];
    if (!file) throw new Error('No file selected');

    await runSteggy({
      mode: modeSelect.value,
      encryption: encryptionSelect.value,
      payload,
      file,
      decoy: enableDecoy.checked ? decoyPayload.value : null,
      fragmentation: enableFragmentation.checked
    });

    alert('Steggy completed successfully');
  } catch (e) {
    console.error(e);
    alert('An error occurred while running Steggy');
  }
};

// ---------- INIT ----------
encryptionSelect.onchange = updateEncryptionUI;
modeSelect.onchange = updateModeUI;

updateEncryptionUI();
updateModeUI();
