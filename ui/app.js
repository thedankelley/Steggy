/*
  app.js
  UI controller only.
  No crypto. No stego. Just state and buttons.
*/

document.addEventListener('DOMContentLoaded', () => {

  // Elements
  const guideBtn = document.getElementById('guideBtn');
  const closeGuideBtn = document.getElementById('closeGuideBtn');
  const guidePanel = document.getElementById('guidePanel');

  const encryptionSelect = document.getElementById('encryption');
  const pgpSection = document.getElementById('pgpSection');

  const advancedToggleBtn = document.getElementById('advancedToggleBtn');
  const advancedOptions = document.getElementById('advancedOptions');

  const enableDecoy = document.getElementById('enableDecoy');
  const decoyLabel = document.getElementById('decoyLabel');

  const modeSelect = document.getElementById('mode');
  const fileLabel = document.getElementById('fileLabel');
  const fileInput = document.getElementById('fileInput');

  /* ---------------- Guide ---------------- */

  guideBtn.addEventListener('click', () => {
    guidePanel.classList.toggle('hidden');
  });

  closeGuideBtn.addEventListener('click', () => {
    guidePanel.classList.add('hidden');
  });

  /* ---------------- Encryption UI ---------------- */

  function updateEncryptionUI() {
    const value = encryptionSelect.value;
    if (value === 'pgp' || value === 'both') {
      pgpSection.classList.remove('hidden');
    } else {
      pgpSection.classList.add('hidden');
    }
  }

  encryptionSelect.addEventListener('change', updateEncryptionUI);
  updateEncryptionUI();

  /* ---------------- Advanced Options ---------------- */

  advancedToggleBtn.addEventListener('click', () => {
    advancedOptions.classList.toggle('hidden');
  });

  enableDecoy.addEventListener('change', () => {
    if (enableDecoy.checked) {
      decoyLabel.classList.remove('hidden');
    } else {
      decoyLabel.classList.add('hidden');
    }
  });

  /* ---------------- Mode UI ---------------- */

  function updateModeUI() {
    if (modeSelect.value === 'sstv-decode') {
      fileLabel.textContent = 'Select WAV';
      fileInput.accept = '.wav';
    } else {
      fileLabel.textContent = 'Select Image';
      fileInput.accept = 'image/*';
    }
    fileLabel.appendChild(fileInput);
  }

  modeSelect.addEventListener('change', updateModeUI);
  updateModeUI();

});
