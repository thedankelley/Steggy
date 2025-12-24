import * as core from "../core/steggy-core.js";
import * as crc from "../core/steggy-crc.js";
import * as decoy from "../modules/steggy-decoy.js";
import * as fragment from "../modules/steggy-fragment.js";
import * as hash from "../modules/steggy-hash.js";
import * as pgp from "../modules/steggy-pgp.js";
import * as sstv from "../modules/steggy-sstv.js";
import * as sstvDecode from "../modules/steggy-sstv-decode.js";
import * as sstvMic from "../modules/steggy-sstv-mic.js";

// Guide
const guideBtn = document.getElementById("guideBtn");
const guideOverlay = document.getElementById("guideOverlay");
const closeGuide = document.getElementById("closeGuide");
guideBtn.onclick = () => guideOverlay.classList.remove("hidden");
closeGuide.onclick = () => guideOverlay.classList.add("hidden");

// Advanced Options Toggle
const advBtn = document.getElementById("advancedToggle");
const advSection = document.getElementById("advancedSection");
advBtn.onclick = () => advSection.classList.toggle("hidden");

// Mode & File handling
const modeSelect = document.getElementById("modeSelect");
const fileInput = document.getElementById("fileInput");
const fileLabel = document.getElementById("fileLabel");

modeSelect.onchange = () => {
  if (modeSelect.value.includes("sstv-decrypt")) {
    fileLabel.textContent = "Select WAV";
    fileInput.accept = ".wav";
  } else {
    fileLabel.textContent = "Select Image";
    fileInput.accept = "image/*";
  }
};

// Advanced Options wiring
const encryptionType = document.getElementById("encryptionType");
const pgpOptions = document.getElementById("pgpOptions");
encryptionType.onchange = () => {
  pgpOptions.classList.toggle("hidden", !(encryptionType.value === "pgp" || encryptionType.value === "both"));
};

// Decoy payload
const enableDecoy = document.getElementById("enableDecoy");
const decoyText = document.getElementById("decoyText");
enableDecoy.onchange = () => decoyText.classList.toggle("hidden", !enableDecoy.checked);

// Fragmentation
const enableFragment = document.getElementById("enableFragment");
const fragmentOptions = document.getElementById("fragmentOptions");
enableFragment.onchange = () => fragmentOptions.classList.toggle("hidden", !enableFragment.checked);

// PGP Buttons
const generatePGP = document.getElementById("generatePGP");
const publicKey = document.getElementById("publicKey");
const privateKey = document.getElementById("privateKey");
const downloadPubKey = document.getElementById("downloadPubKey");
const downloadPrivKey = document.getElementById("downloadPrivKey");
const encryptPGP = document.getElementById("encryptPGP");
const decryptPGP = document.getElementById("decryptPGP");
const uploadPGPKey = document.getElementById("uploadPGPKey");

generatePGP.onclick = async () => {
  const { pub, priv } = await pgp.generateKeys();
  publicKey.value = pub;
  privateKey.value = priv;
};

downloadPubKey.onclick = () => pgp.downloadKey(publicKey.value, "publicKey.asc");
downloadPrivKey.onclick = () => pgp.downloadKey(privateKey.value, "privateKey.asc");

encryptPGP.onclick = () => pgp.encryptPayload(payloadText.value, publicKey.value).then(enc => {
  payloadText.value = enc;
});

decryptPGP.onclick = () => {
  const key = privateKey.value || uploadPGPKey.files[0];
  pgp.decryptPayload(payloadText.value, key).then(dec => {
    payloadText.value = dec;
  });
};

// Run button
document.getElementById("runBtn").onclick = async () => {
  const mode = modeSelect.value;
  const file = fileInput.files[0];
  const text = payloadText.value;
  // Call core.run or sstv/fragment/decoy as needed
  alert(`Running mode: ${mode}`);
};
