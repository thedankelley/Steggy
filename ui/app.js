// UI wiring for Steggy (all elements present, functional toggles)

const guideBtn = document.getElementById("guideBtn");
const guideOverlay = document.getElementById("guideOverlay");
const closeGuide = document.getElementById("closeGuide");

guideBtn.onclick = () => guideOverlay.classList.remove("hidden");
closeGuide.onclick = () => guideOverlay.classList.add("hidden");

// Advanced Options Toggle
const advBtn = document.getElementById("advancedToggle");
const advSection = document.getElementById("advancedSection");
advBtn.onclick = () => advSection.classList.toggle("hidden");

// Mode selection
const modeSelect = document.getElementById("modeSelect");
const fileLabel = document.getElementById("fileLabel");
const fileInput = document.getElementById("fileInput");

modeSelect.onchange = () => {
  if (modeSelect.value.includes("sstv-decrypt")) {
    fileLabel.textContent = "Select WAV";
    fileInput.accept = ".wav";
  } else {
    fileLabel.textContent = "Select Image";
    fileInput.accept = "image/*";
  }
};

// Advanced Options
const encryptionType = document.getElementById("encryptionType");
const pgpOptions = document.getElementById("pgpOptions");

encryptionType.onchange = () => {
  const val = encryptionType.value;
  pgpOptions.classList.toggle("hidden", !(val === "pgp" || val === "both"));
};

// Decoy
const enableDecoy = document.getElementById("enableDecoy");
const decoyText = document.getElementById("decoyText");
enableDecoy.onchange = () => decoyText.classList.toggle("hidden", !enableDecoy.checked);

// Fragmentation
const enableFragment = document.getElementById("enableFragment");
const fragmentOptions = document.getElementById("fragmentOptions");
enableFragment.onchange = () => fragmentOptions.classList.toggle("hidden", !enableFragment.checked);

// PGP buttons
const generatePGP = document.getElementById("generatePGP");
const publicKey = document.getElementById("publicKey");
const privateKey = document.getElementById("privateKey");
const downloadPubKey = document.getElementById("downloadPubKey");
const downloadPrivKey = document.getElementById("downloadPrivKey");
const encryptPGP = document.getElementById("encryptPGP");
const decryptPGP = document.getElementById("decryptPGP");
const uploadPGPKey = document.getElementById("uploadPGPKey");

// Mock wiring (for now)
generatePGP.onclick = () => {
  publicKey.value = "Public Key (mock)";
  privateKey.value = "Private Key (mock)";
};
downloadPubKey.onclick = () => alert("Download public key");
downloadPrivKey.onclick = () => alert("Download private key");
encryptPGP.onclick = () => alert("Encrypt payload with PGP");
decryptPGP.onclick = () => alert("Decrypt PGP payload");

// Run button
document.getElementById("runBtn").onclick = () => {
  alert(`Mode selected: ${modeSelect.value}\nFile: ${fileInput.files[0] ? fileInput.files[0].name : "none"}\nPayload: ${document.getElementById("payloadText").value}`);
};
