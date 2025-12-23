import { generatePGPKeys, encryptPGP, decryptPGP } from "../modules/steggy-pgp.js";

const modeSelect = document.getElementById("modeSelect");
const advancedPanel = document.getElementById("advancedPanel");
const advancedToggle = document.getElementById("advancedToggle");

const pgpPanel = document.getElementById("pgpPanel");
const sstvPanel = document.getElementById("sstvPanel");
const fragmentPanel = document.getElementById("fragmentPanel");

const guideBtn = document.getElementById("guideBtn");
const guideModal = document.getElementById("guideModal");
const closeGuide = document.getElementById("closeGuide");

advancedToggle.onclick = () => {
  advancedPanel.classList.toggle("hidden");
};

guideBtn.onclick = () => {
  guideModal.classList.remove("hidden");
};

closeGuide.onclick = () => {
  guideModal.classList.add("hidden");
};

modeSelect.onchange = () => {
  const mode = modeSelect.value;

  pgpPanel.classList.add("hidden");
  sstvPanel.classList.add("hidden");

  if (mode === "pgp" || mode === "both") {
    pgpPanel.classList.remove("hidden");
  }

  if (mode.startsWith("sstv")) {
    sstvPanel.classList.remove("hidden");
  }
};

document.getElementById("generatePGP").onclick = async () => {
  const keys = await generatePGPKeys();
  document.getElementById("pgpPublicKey").value = keys.publicKey;
  document.getElementById("pgpPrivateKey").value = keys.privateKey;
};
