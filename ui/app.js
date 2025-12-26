/*
  app.js
  UI-only logic for now.
  Core wiring happens in Phase 4.
*/

const modeSelect = document.getElementById("modeSelect");
const fileLabel = document.getElementById("fileLabel");
const cryptoSelect = document.getElementById("cryptoSelect");
const pgpSection = document.getElementById("pgpSection");

const guideBtn = document.getElementById("guideBtn");
const guideModal = document.getElementById("guideModal");
const closeGuideBtn = document.getElementById("closeGuideBtn");

const runBtn = document.getElementById("runBtn");

/* -----------------------------
   Guide Modal
   ----------------------------- */

guideBtn.addEventListener("click", () => {
  guideModal.classList.remove("hidden");
});

closeGuideBtn.addEventListener("click", () => {
  guideModal.classList.add("hidden");
});

/* -----------------------------
   Mode Handling
   ----------------------------- */

modeSelect.addEventListener("change", () => {
  const mode = modeSelect.value;

  if (mode === "sstv-decrypt") {
    fileLabel.textContent = "Select WAV";
  } else {
    fileLabel.textContent = "Select Image";
  }
});

/* -----------------------------
   Crypto Selection
   ----------------------------- */

cryptoSelect.addEventListener("change", () => {
  const crypto = cryptoSelect.value;

  if (crypto === "pgp" || crypto === "aes+pgp") {
    pgpSection.classList.remove("hidden");
  } else {
    pgpSection.classList.add("hidden");
  }
});

/* -----------------------------
   Run (stub)
   ----------------------------- */

runBtn.addEventListener("click", () => {
  alert("Steggy run invoked (core not wired yet)");
});
