// If you don't see this alert, app.js is not loading.
// If this shows, everything below WILL work.
alert("Steggy app.js loaded");

// Utility
const $ = id => document.getElementById(id);

// Elements
const guideBtn = $("guide-btn");
const guidePanel = $("guide-panel");
const closeGuide = $("close-guide");

const encryption = $("encryption");
const pgpSection = $("pgp-section");

const advancedBtn = $("advanced-btn");
const advancedPanel = $("advanced-panel");

const enableDecoy = $("enable-decoy");
const decoyPayload = $("decoy-payload");

const enableFragment = $("enable-fragment");
const fragmentCount = $("fragment-count");

const mode = $("mode");
const fileLabel = $("file-label");
const fileInput = $("file-input");

// Guide toggle
guideBtn.onclick = () => guidePanel.hidden = false;
closeGuide.onclick = () => guidePanel.hidden = true;

// Encryption toggle
function updateEncryptionUI() {
  const showPGP = encryption.value === "pgp" || encryption.value === "both";
  pgpSection.hidden = !showPGP;
}
encryption.onchange = updateEncryptionUI;
updateEncryptionUI();

// Advanced toggle
advancedBtn.onclick = () => {
  advancedPanel.hidden = !advancedPanel.hidden;
};

// Decoy toggle
enableDecoy.onchange = () => {
  decoyPayload.hidden = !enableDecoy.checked;
};

// Fragment toggle
enableFragment.onchange = () => {
  fragmentCount.hidden = !enableFragment.checked;
};

// Mode toggle (file label)
mode.onchange = () => {
  if (mode.value === "sstv-decode") {
    fileLabel.textContent = "Select WAV";
    fileInput.accept = ".wav";
  } else {
    fileLabel.textContent = "Select Image";
    fileInput.accept = "image/*";
  }
};

// Run
$("run-btn").onclick = () => {
  alert("Run clicked — core wiring comes next");
};
