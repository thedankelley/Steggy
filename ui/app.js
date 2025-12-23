import { generatePGPKeys } from "../modules/steggy-pgp.js";

/* ---------- ELEMENTS ---------- */

const guideBtn = document.getElementById("guideBtn");
const guideModal = document.getElementById("guideModal");
const closeGuide = document.getElementById("closeGuide");

const modeSelect = document.getElementById("modeSelect");
const advancedToggle = document.getElementById("advancedToggle");
const advancedPanel = document.getElementById("advancedPanel");

const pgpPanel = document.getElementById("pgpPanel");
const sstvPanel = document.getElementById("sstvPanel");

/* ---------- GUIDE (FIXED) ---------- */

// HARD ENSURE HIDDEN ON LOAD
guideModal.classList.add("hidden");
guideModal.setAttribute("aria-hidden", "true");

guideBtn.addEventListener("click", () => {
  guideModal.classList.remove("hidden");
  guideModal.setAttribute("aria-hidden", "false");
});

closeGuide.addEventListener("click", () => {
  guideModal.classList.add("hidden");
  guideModal.setAttribute("aria-hidden", "true");
});

/* ---------- ADVANCED OPTIONS ---------- */

advancedToggle.addEventListener("click", () => {
  advancedPanel.classList.toggle("hidden");
});

/* ---------- MODE SWITCHING ---------- */

modeSelect.addEventListener("change", () => {
  const mode = modeSelect.value;

  pgpPanel.classList.add("hidden");
  sstvPanel.classList.add("hidden");

  if (mode === "pgp" || mode === "both") {
    pgpPanel.classList.remove("hidden");
  }

  if (mode.startsWith("sstv")) {
    sstvPanel.classList.remove("hidden");
  }
});

/* ---------- PGP ---------- */

document.getElementById("generatePGP").addEventListener("click", async () => {
  const keys = await generatePGPKeys();

  document.getElementById("pgpPublicKey").value = keys.publicKey;
  document.getElementById("pgpPrivateKey").value = keys.privateKey;
});
