document.addEventListener('DOMContentLoaded', () => {
  const modeSelect = document.getElementById('modeSelect');
  const fileLabel = document.getElementById('fileLabel');
  const fileInput = document.getElementById('fileInput');
  const runBtn = document.getElementById('runBtn');

  const guideBtn = document.getElementById('guideBtn');
  const guideOverlay = document.getElementById('guideOverlay');
  const closeGuideBtn = document.getElementById('closeGuideBtn');

  function updateFileLabel() {
    const mode = modeSelect.value;
    if (mode === 'sstv-decode') {
      fileLabel.textContent = 'Select WAV';
      fileInput.accept = '.wav';
    } else {
      fileLabel.textContent = 'Select Image';
      fileInput.accept = 'image/*';
    }
  }

  modeSelect.addEventListener('change', updateFileLabel);

  runBtn.addEventListener('click', () => {
    alert('Run pressed. Core wiring comes next.');
  });

  guideBtn.addEventListener('click', () => {
    guideOverlay.classList.remove('hidden');
  });

  closeGuideBtn.addEventListener('click', () => {
    guideOverlay.classList.add('hidden');
  });

  updateFileLabel();
});
