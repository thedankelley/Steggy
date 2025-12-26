/*
  app.js
  Phase 4A: UI → Core handshake

  This file should stay boring.
  If it starts looking smart, we fucked up.
*/

import { runSteggy } from "../core/steggy-core.js";

const modeSelect = document.getElementById("modeSelect");
const fileInput = document.getElementById("fileInput");
const payloadInput = document.getElementById("payloadInput");
const cryptoSelect = document.getElementById("cryptoSelect");

const pgpSection = document.getElementById("pgpSection");
const pgpPublicKey = document.getElementById("pgpPublicKey");
const pgpPrivateKey = document.getElementById("pgpPrivateKey");

const runBtn = document.getElementById("runBtn");

/* -----------------------------
   Run Button
   ----------------------------- */

runBtn.addEventListener("click", async () => {
  try {
    if (!fileInput.files.length) {
      alert("Please select a file first.");
      return;
    }

    const inputFile = fileInput.files[0];

    const options = {
      mode: modeSelect.value,
      payload: payloadInput.value,
      crypto: cryptoSelect.value,
      pgp: {
        publicKey: pgpPublicKey.value,
        privateKey: pgpPrivateKey.value
      }
    };

    // This is the big moment.
    const result = await runSteggy(inputFile, options);

    alert("Steggy completed successfully.");

    // Later: preview / download result here

  } catch (err) {
    console.error(err);
    alert(
      "An error occurred while running Steggy.\n\n" +
      (err.message || "Unknown error")
    );
  }
});
