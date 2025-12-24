import * as SteggyCore from '../core/steggy-core.js';
import * as CRC from '../core/steggy-crc.js';
import * as Hash from '../modules/steggy-hash.js';
import * as Decoy from '../modules/steggy-decoy.js';
import * as Fragment from '../modules/steggy-fragment.js';
import * as PGP from '../modules/steggy-pgp.js';
import * as SSTV from '../modules/steggy-sstv.js';
import * as SSTVDecode from '../modules/steggy-sstv-decode.js';
import * as SSTVMic from '../modules/steggy-sstv-mic.js';

document.addEventListener('DOMContentLoaded', () => {
  const guideBtn = document.getElementById('guide-btn');
  const guideModal = document.getElementById('guide-modal');
  const closeGuide = document.getElementById('close-guide');

  guideBtn.addEventListener('click', () => guideModal.classList.remove('hidden'));
  closeGuide.addEventListener('click', () => guideModal.classList.add('hidden'));

  const advToggle = document.getElementById('advanced-toggle');
  const advContent = document.getElementById('advanced-content');
  advToggle.addEventListener('click', () => {
    advContent.parentElement.classList.toggle('collapsed');
  });

  const encryptionMode = document.getElementById('encryption-mode');
  const pgpOptions = document.getElementById('pgp-options');
  encryptionMode.addEventListener('change', () => {
    const val = encryptionMode.value;
    pgpOptions.style.display = (val === 'pgp' || val === 'both') ? 'block' : 'none';
  });

  // Placeholders for PGP buttons
  document.getElementById('generate-pgp').addEventListener('click', () => {
    console.log('Generate PGP clicked');
  });
  document.getElementById('download-pgp-public').addEventListener('click', () => {
    console.log('Download Public Key');
  });
  document.getElementById('download-pgp-private').addEventListener('click', () => {
    console.log('Download Private Key');
  });
  document.getElementById('encrypt-pgp-payload').addEventListener('click', () => {
    console.log('Encrypt Payload with PGP');
  });

  // Run button placeholder
  document.getElementById('run-btn').addEventListener('click', () => {
    console.log('Run clicked');
  });
});
