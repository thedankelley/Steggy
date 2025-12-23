import {
  generatePGPKeyPair,
  encryptWithPGP
} from "../modules/steggy-pgp.js";

const modeSelect = document.getElementById("modeSelect");
const fileInput = document.getElementById("fileInput");
const fileLabel = document.getElementById("fileLabel");

const cryptoMode = document.getElementById("cryptoMode");
const pgpSection = document.getElementById("pgpSection");

const advancedToggle = document.getElementById("advancedToggle");
const advancedPanel = document.getElementById("advancedPanel");

const enableDecoy = document.getElementById("enableDecoy");
const decoySection = document.getElementById("decoySection");

const enableFragmentation = document.getElementById("enableFragmentation");
const fragmentOptions = document.getElementById("fragmentOptions");

const payloadField = document.getElementById("payload");

const pgpPublic = document.getElementById("pgpPublic");
const pgpPrivate = document.getElementById("pgpPrivate");
const pgpGenerateBtn = document.getElementById("pgpGenerate");
const pgpEncryptBtn = document.getElementById("pgpEncrypt");
const pgpDownloadBtn = document.getElementById("pgpDownload");

const guideBtn = document.getElementById("guideBtn");
const guideModal = document.getElementById("guideModal");
const closeGuide = document.getElementById("closeGuide");

// --------------------
// Guide modal
// --------------------
guideBtn.onclick = () => guideModal.classList.remove("hidden");
closeGuide.onclick = () => guideModal.classList.add("hidden");

// --------------------
// Mode handling
// --------------------
modeSelect.onchange = () => {
  const mode = modeSelect.value;

  if (mode === "sstv-decode") {
    fileLabel.textContent = "Select WAV File";
    fileInput.accept = ".wav";
  } else {
    // Image Encrypt, Image Decrypt, SSTV Encode
    fileLabel.textContent = "Select Image";
    fileInput.accept = "image/*";
  }
};

// Trigger once on load
modeSelect.onchange();

// --------------------
// Crypto mode handling
// --------------------
cryptoMode.onchange = () => {
  const val = cryptoMode.value;
  pgpSection.classList.toggle("hidden", !val.includes("pgp"));
};

// --------------------
// Advanced options
// --------------------
advancedToggle.onclick = () => {
  advancedPanel.classList.toggle("hidden");
};

enableDecoy.onchange = () => {
  decoySection.classList.toggle("hidden", !enableDecoy.checked);
};

enableFragmentation.onchange = () => {
  fragmentOptions.classList.toggle("hidden", !enableFragmentation.checked);
};

// --------------------
// PGP logic
// --------------------
pgpGenerateBtn.onclick = async () => {
  pgpGenerateBtn.disabled = true;
  pgpGenerateBtn.textContent = "Generating…";

  try {
    const { publicKey, privateKey } = await generatePGPKeyPair();
    pgpPublic.value = publicKey;
    pgpPrivate.value = privateKey;
  } catch (err) {
    alert("PGP key generation failed");
    console.error(err);
  } finally {
    pgpGenerateBtn.disabled = false;
    pgpGenerateBtn.textContent = "Generate PGP Keys";
  }
};

pgpEncryptBtn.onclick = async () => {
  if (!pgpPublic.value.trim()) {
    alert("Public key required");
    return;
  }

  try {
    const encrypted = await encryptWithPGP(
      payloadField.value,
      pgpPublic.value
    );
    payloadField.value = encrypted;
  } catch (err) {
    alert("PGP encryption failed");
    console.error(err);
  }
};

pgpDownloadBtn.onclick = () => {
  const pubBlob = new Blob([pgpPublic.value], { type: "text/plain" });
  const privBlob = new Blob([pgpPrivate.value], { type: "text/plain" });

  downloadFile(pubBlob, "steggy-public.asc");
  downloadFile(privBlob, "steggy-private.asc");
};

function downloadFile(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// --------------------
// Run placeholder (core wiring next)
// --------------------
document.getElementById("runBtn").onclick = () => {
  document.getElementById("output").textContent =
    "PGP logic active. Ready to wire steggy-core.";
};
