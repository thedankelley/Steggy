import * as core from "../core/steggy-core.js";
import * as crc from "../core/steggy-crc.js";
import * as decoy from "../modules/steggy-decoy.js";
import * as fragment from "../modules/steggy-fragment.js";
import * as hash from "../modules/steggy-hash.js";
import * as pgp from "../modules/steggy-pgp.js";
import * as sstv from "../modules/steggy-sstv.js";
import * as sstvDecode from "../modules/steggy-sstv-decode.js";
import * as sstvMic from "../modules/steggy-sstv-mic.js";

// DOM elements
const guideBtn = document.getElementById("guideBtn");
const guideOverlay = document.getElementById("guideOverlay");
const closeGuide = document.getElementById("closeGuide");
const advBtn = document.getElementById("advancedToggle");
const advSection = document.getElementById("advancedSection");
const modeSelect = document.getElementById("modeSelect");
const fileLabel = document.getElementById("fileLabel");
const fileInput = document.getElementById("fileInput");
const encryptionType = document.getElementById("encryptionType");
const pgpOptions = document.getElementById("pgpOptions");
const enableDecoy = document.getElementById("enableDecoy");
const decoyText = document.getElementById("decoyText");
const enableFragment = document.getElementById("enableFragment");
const fragmentOptions = document.getElementById("fragmentOptions");
const runBtn = document.getElementById("runBtn");

// Guide toggle
guideBtn.onclick = () => guideOverlay.classList.remove("hidden");
closeGuide.onclick = () => guideOverlay.classList.add("hidden");

// Advanced Options toggle
advBtn.onclick = () => advSection.classList.toggle("hidden");

// Mode change
modeSelect.onchange = () => {
  if (modeSelect.value.includes("sstv-decrypt")) {
    fileLabel.textContent = "Select WAV";
    fileInput.accept = ".wav";
  } else {
    fileLabel.textContent = "Select Image";
    fileInput.accept = "image/*";
  }
};

// Encryption type toggle
encryptionType.onchange = () => {
  const val = encryptionType.value;
  pgpOptions.classList.toggle("hidden", !(val === "pgp" || val === "both"));
};

// Decoy toggle
enableDecoy.onchange = () => decoyText.classList.toggle("hidden", !enableDecoy.checked);

// Fragment toggle
enableFragment.onchange = () => fragmentOptions.classList.toggle("hidden", !enableFragment.checked);

// PGP buttons
document.getElementById("generatePGP").onclick = async () => {
  const keys = await pgp.generateKeys();
  document.getElementById("publicKey").value = keys.public;
  document.getElementById("privateKey").value = keys.private;
};

document.getElementById("downloadPubKey").onclick = () => pgp.downloadKey("public");
document.getElementById("downloadPrivKey").onclick = () => pgp.downloadKey("private");
document.getElementById("encryptPGP").onclick = () => pgp.encryptPayload();
document.getElementById("decryptPGP").onclick = () => pgp.decryptPayload();

// Run button
runBtn.onclick = () => core.runSteggy({
  mode: modeSelect.value,
  file: fileInput.files[0],
  payload: document.getElementById("payloadText").value,
  encryption: encryptionType.value,
  decoy: enableDecoy.checked ? decoyText.value : null,
  fragments: enableFragment.checked ? parseInt(document.getElementById("fragmentCount").value) : null
});
