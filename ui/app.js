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

const guideBtn = document.getElementById("guideBtn");
const guideModal = document.getElementById("guideModal");
const closeGuide = document.getElementById("closeGuide");

guideBtn.onclick = () => guideModal.classList.remove("hidden");
closeGuide.onclick = () => guideModal.classList.add("hidden");

// Mode handling
modeSelect.onchange = () => {
  const mode = modeSelect.value;

  if (mode.includes("sstv")) {
    fileLabel.textContent = "Select WAV File";
    fileInput.accept = ".wav";
  } else {
    fileLabel.textContent = "Select Image";
    fileInput.accept = "image/*";
  }
};

// Crypto handling
cryptoMode.onchange = () => {
  const val = cryptoMode.value;
  pgpSection.classList.toggle("hidden", !val.includes("pgp"));
};

// Advanced
advancedToggle.onclick = () => {
  advancedPanel.classList.toggle("hidden");
};

enableDecoy.onchange = () => {
  decoySection.classList.toggle("hidden", !enableDecoy.checked);
};

enableFragmentation.onchange = () => {
  fragmentOptions.classList.toggle("hidden", !enableFragmentation.checked);
};

// Placeholder run
document.getElementById("runBtn").onclick = () => {
  document.getElementById("output").textContent = "Ready to process.";
};
