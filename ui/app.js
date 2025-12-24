document.addEventListener('DOMContentLoaded', () => {
  const modeSelect = document.getElementById('modeSelect');
  const fileLabel = document.getElementById('fileLabel');
  const fileInput = document.getElementById('fileInput');

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

  guideBtn.addEventListener('click', () => {
    guideOverlay.classList.add('active');
  });

  closeGuideBtn.addEventListener('click', () => {
    guideOverlay.classList.remove('active');
  });

  updateFileLabel();
});
