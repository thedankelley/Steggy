// app.js - handles UI interactions for Steggy
document.addEventListener('DOMContentLoaded', () => {
  const advancedToggle = document.getElementById('advanced-toggle');
  const advancedOptions = document.getElementById('advanced-options');
  const cryptoSelect = document.getElementById('crypto-select');
  const pgpFields = document.getElementById('pgp-fields');
  const decoyToggle = document.getElementById('decoy-toggle');
  const decoyPayload = document.getElementById('decoy-payload');
  const fragmentToggle = document.getElementById('fragment-toggle');
  const fragmentOptions = document.getElementById('fragment-options');
  const guideBtn = document.getElementById('guide-btn');

  // Toggle Advanced Options
  advancedToggle.addEventListener('click', () => {
    advancedOptions.hidden = !advancedOptions.hidden;
  });

  // Toggle PGP fields
  cryptoSelect.addEventListener('change', () => {
    pgpFields.hidden = !(cryptoSelect.value === 'pgp' || cryptoSelect.value === 'both');
  });

  // Toggle Decoy Payload
  decoyToggle.addEventListener('change', () => {
    decoyPayload.hidden = !decoyToggle.checked;
  });

  // Toggle Fragmentation options
  fragmentToggle.addEventListener('change', () => {
    fragmentOptions.hidden = !fragmentToggle.checked;
  });

  // Guide button - just toggle a placeholder alert for now
  guideBtn.addEventListener('click', () => {
    alert('Guide opened! (placeholder, will implement full guide later)');
  });

  // Run button placeholder
  document.getElementById('run-btn').addEventListener('click', () => {
    const mode = document.getElementById('mode-select').value;
    const file = document.getElementById('file-input').files[0];
    const payload = document.getElementById('payload-input').value;
    alert(`Run clicked with mode: ${mode}, file: ${file ? file.name : 'none'}, payload length: ${payload.length}`);
  });
});
