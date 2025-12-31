/*
  app.js

  UI glue.
  This is where bugs come to die.
*/

import { runSteggy } from '../core/steggy-core.js';

const runBtn = document.getElementById('runBtn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

runBtn.addEventListener('click', async () => {
  try {
    const img = document.getElementById('inputImage');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const result = await runSteggy({
      mode: document.getElementById('mode').value,
      imageData,
      payload: document.getElementById('payload').value,
      encryption: document.getElementById('encryption').value,
      publicKey: document.getElementById('pgpPublicKey')?.value || null,
      enableFragmentation: document.getElementById('enableFragmentation').checked
    });

    ctx.putImageData(result, 0, 0);
    alert('Steggy operation complete');

  } catch (e) {
    console.error(e);
    alert(e.message);
  }
});
