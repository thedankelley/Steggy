document.addEventListener('DOMContentLoaded', () => {

  const modeSelect = document.getElementById('modeSelect');
  const fileLabel = document.getElementById('fileLabel');
  const fileInput = document.getElementById('fileInput');

  const advancedToggle = document.getElementById('advancedToggle');
  const advancedPanel = document.getElementById('advancedPanel');

  const encryptionSelect = document.getElementById('encryptionSelect');
  const pgpPanel = document.getElementById('pgpPanel');

  const decoyToggle = document.getElementById('decoyToggle');
  const decoyInput = document.getElementById('decoyInput');

  const fragmentToggle = document.getElementById('fragmentToggle');
  const fragmentPanel = document.getElementById('fragmentPanel');

  const guideBtn = document.getElementById('guideBtn');
  const guideOverlay = document.getElementById('guideOverlay');
  const closeGuideBtn = document.getElementById('closeGuideBtn');

  function updateFileLabel() {
    if (modeSelect.value === 'sstv-decode') {
      fileLabel.textContent = 'Select WAV';
      fileInput.accept = '.wav';
    } else {
      fileLabel.textContent = 'Select Image';
      fileInput.accept = 'image/*';
    }
  }

  modeSelect.addEventListener('change', updateFileLabel);

  advancedToggle.addEventListener('click', () => {
    advancedPanel.classList.toggle('hidden');
  });

  encryptionSelect.addEventListener('change', () => {
    const val = encryptionSelect.value;
    pgpPanel.classList.toggle('hidden', !(val === 'pgp' || val === 'both'));
  });

  decoyToggle.addEventListener('change', () => {
    decoyInput.classList.toggle('hidden', !decoyToggle.checked);
  });

  fragmentToggle.addEventListener('change', () => {
    fragmentPanel.classList.toggle('hidden', !fragmentToggle.checked);
  });

  guideBtn.addEventListener('click', () => {
    guideOverlay.classList.remove('hidden');
  });

  closeGuideBtn.addEventListener('click', () => {
    guideOverlay.classList.add('hidden');
  });

  updateFileLabel();
});
