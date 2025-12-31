/*
  app.js

  UI glue layer.
  If something breaks here, the UI just stares at you blankly.
*/

import { runSteggy } from '../core/steggy-core.js';

/* ---------- DOM ---------- */

const runBtn = document.getElementById('runBtn');
const payloadField = document.getElementById('payload');
const encryptionSelect = document.getElementById('encryption');
const passwordField = document.getElementById('aesPassword');
const pgpPublicKeyField = document.getElementById('pgpPublicKey');
const fragmentToggle = document.getElementById('enableFragmentation');

/* ---------- RUN ---------- */

runBtn.addEventListener('click', async () => {
  try {
    const config = {
      mode: document.getElementById('mode').value,
      encryption: encryptionSelect.value,
      payload: payloadField.value,
      password: passwordField?.value || null,
      publicKey: pgpPublicKeyField?.value || null,
      enableFragmentation: fragmentToggle.checked
    };

    const result = await runSteggy(config);

    alert('Encryption complete.\nPayload ready for embedding.');
    console.log(result);

  } catch (err) {
    console.error(err);
    alert(err.message || 'An error occurred while running Steggy');
  }
});
