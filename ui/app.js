import * as openpgp from 'https://cdn.jsdelivr.net/npm/openpgp@5.10.1/+esm';

/*
  If this file breaks again, we riot.
*/

const modeSelect = document.getElementById('mode');
const encryptionSelect = document.getElementById('encryption');
const fileInput = document.getElementById('fileInput');
const fileLabel = document.getElementById('fileLabel');

const payloadInput = document.getElementById('payload');

const pgpSection = document.getElementById('pgpSection');
const pgpPublicKey = document.getElementById('pgpPublicKey');
const pgpPrivateKey = document.getElementById('pgpPrivateKey');
const generatePGPBtn = document.getElementById('generatePGP');
const downloadPGPBtn = document.getElementById('downloadPGP');

const runBtn = document.getElementById('runBtn');

const guideBtn = document.getElementById('guideBtn');
const guidePanel = document.getElementById('guidePanel');
const closeGuideBtn = document.getElementById('closeGuideBtn');

const enableDecoy = document.getElementById('enableDecoy');
const decoyPayload = document.getElementById('decoyPayload');

const enableFragmentation = document.getElementById('enableFragmentation');
const fragmentOptions = document.getElementById('fragmentOptions');

/* ---------- UI STATE ---------- */

function updateEncryptionUI() {
  const val = encryptionSelect.value;

  // Show PGP UI only when needed
  if (val === 'pgp' || val === 'both') {
    pgpSection.classList.remove('hidden');
  } else {
    pgpSection.classList.add('hidden');
  }
}

function updateModeUI() {
  const mode = modeSelect.value;

  if (mode === 'sstv-decrypt') {
    fileLabel.textContent = 'Select WAV';
  } else {
    fileLabel.textContent = 'Select Image';
  }
}

/* ---------- GUIDE ---------- */

guideBtn.addEventListener('click', () => {
  guidePanel.classList.remove('hidden');
});

closeGuideBtn.addEventListener('click', () => {
  guidePanel.classList.add('hidden');
});

/* ---------- ADVANCED ---------- */

enableDecoy.addEventListener('change', () => {
  decoyPayload.classList.toggle('hidden', !enableDecoy.checked);
});

enableFragmentation.addEventListener('change', () => {
  fragmentOptions.classList.toggle('hidden', !enableFragmentation.checked);
});

/* ---------- PGP ---------- */

generatePGPBtn.addEventListener('click', async () => {
  try {
    const keys = await openpgp.generateKey({
      type: 'rsa',
      rsaBits: 2048,
      userIDs: [{ name: 'Steggy User' }]
    });

    pgpPublicKey.value = keys.publicKey;
    pgpPrivateKey.value = keys.privateKey;
  } catch (err) {
    console.error(err);
    alert('PGP key generation failed');
  }
});

downloadPGPBtn.addEventListener('click', () => {
  const blob = new Blob(
    [
      'PUBLIC KEY\n\n',
      pgpPublicKey.value,
      '\n\nPRIVATE KEY\n\n',
      pgpPrivateKey.value
    ],
    { type: 'text/plain' }
  );

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'steggy-pgp-keys.txt';
  a.click();
});

/* ---------- RUN ---------- */

runBtn.addEventListener('click', () => {
  try {
    alert('Phase 4 stub: core wiring next');
  } catch {
    alert('An error occurred while running Steggy');
  }
});

/* ---------- INIT ---------- */

encryptionSelect.addEventListener('change', updateEncryptionUI);
modeSelect.addEventListener('change', updateModeUI);

updateEncryptionUI();
updateModeUI();
