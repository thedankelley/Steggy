// UI controller for Steggy
// If something breaks here, it's almost always wiring or state,
// not crypto. Crypto lives elsewhere and scares us all equally.

import { runSteggy } from "../core/steggy-core.js";
import * as pgp from "../modules/steggy-pgp.js";

const modeSelect = document.getElementById("modeSelect");
const fileInput = document.getElementById("fileInput");
const fileLabel = document.getElementById("fileLabel");
const payloadField = document.getElementById("payload");
const runButton = document.getElementById("runButton");
const output = document.getElementById("output");

// Guide
const guideToggle = document.getElementById("guideToggle");
const guidePanel = document.getElementById("guidePanel");
const closeGuide = document.getElementById("closeGuide");

// Advanced
const advancedToggle = document.getElementById("advancedToggle");
const advancedPanel = document.getElementById("advancedPanel");
const encryptionSelect = document.getElementById("encryptionSelect");

// PGP
const pgpPanel = document.getElementById("pgpPanel");
const pgpPublic = document.getElementById("pgpPublic");
const pgpPrivate = document.getElementById("pgpPrivate");

const generatePGP = document.getElementById("generatePGP");
const downloadPublic = document.getElementById("downloadPublic");
const downloadPrivate = document.getElementById("downloadPrivate");
const encryptWithPGP = document.getElementById("encryptWithPGP");

/* ---------------- GUIDE ---------------- */

guideToggle.onclick = () => guidePanel.classList.toggle("hidden");
closeGuide.onclick = () => guidePanel.classList.add("hidden");

/* -------------- ADVANCED --------------- */

advancedToggle.onclick = () =>
  advancedPanel.classList.toggle("hidden");

encryptionSelect.onchange = () => {
  pgpPanel.classList.toggle(
    "hidden",
    !["pgp", "both"].includes(encryptionSelect.value)
  );
};

/* ---------------- MODE ---------------- */

modeSelect.onchange = () => {
  const mode = modeSelect.value;

  // Update file label dynamically
  if (mode === "decrypt-sstv") {
    fileLabel.firstChild.textContent = "Select WAV ";
  } else {
    fileLabel.firstChild.textContent = "Select Image ";
  }
};

/* ---------------- PGP ---------------- */

// Yes this is async.
// Yes it blocks.
// Yes it scares people.
// Welcome to cryptography.
generatePGP.onclick = async () => {
  const keys = await pgp.generateKeyPair();
  pgpPublic.value = keys.publicKey;
  pgpPrivate.value = keys.privateKey;
};

downloadPublic.onclick = () =>
  download("public.asc", pgpPublic.value);

downloadPrivate.onclick = () =>
  download("private.asc", pgpPrivate.value);

encryptWithPGP.onclick = async () => {
  payloadField.value = await pgp.encryptMessage(
    payloadField.value,
    pgpPublic.value
  );
};

/* ---------------- RUN ---------------- */

runButton.onclick = async () => {
  try {
    const file = fileInput.files[0];
    if (!file) throw new Error("No file selected");

    const mode = modeSelect.value;

    const result = await runSteggy(file, {
      mode,
      payload: payloadField.value,
      encryption: encryptionSelect.value,
      pgp: {
        publicKey: pgpPublic.value,
        privateKey: pgpPrivate.value
      }
    });

    output.textContent = "Success";
    if (result?.blob) {
      const url = URL.createObjectURL(result.blob);
      const img = document.createElement("img");
      img.src = url;
      output.appendChild(img);
    }

  } catch (err) {
    alert("An error occurred while running Steggy.\n\n" + err.message);
  }
};

/* ------------- HELPERS ---------------- */

function download(name, text) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text]));
  a.download = name;
  a.click();
}
