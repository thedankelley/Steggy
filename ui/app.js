document.addEventListener('DOMContentLoaded', async () => {
  const modeSelect = document.getElementById('modeSelect');
  const fileLabel = document.getElementById('fileLabel');
  const fileInput = document.getElementById('fileInput');

  const guideBtn = document.getElementById('guideBtn');
  const guideOverlay = document.getElementById('guideOverlay');
  const closeGuideBtn = document.getElementById('closeGuideBtn');

  const runBtn = document.getElementById('runBtn');
  const payloadInput = document.getElementById('payloadInput');

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

  // 🔌 Phase 3: Run → steggy-core
  runBtn.addEventListener('click', async () => {
    try {
      const file = fileInput.files[0];
      const payload = payloadInput.value;
      const mode = modeSelect.value;

      if (!file) {
        alert('Please select a file first.');
        return;
      }

      // Lazy-load core to avoid breaking UI if module fails
      const core = await import('../core/steggy-core.js');

      if (!core.runSteggy) {
        alert('Steggy core not available.');
        return;
      }

      await core.runSteggy({
        mode,
        file,
        payload
      });

      alert('Operation complete.');
    } catch (err) {
      console.error(err);
      alert('An error occurred while running Steggy.');
    }
  });

  updateFileLabel();
});
