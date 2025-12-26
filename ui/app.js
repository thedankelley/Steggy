/*
  app.js
  This file is responsible for:
  - Wiring UI events
  - Showing / hiding UI sections
  - Calling into steggy-core later

  If the UI stops responding, it's probably here.
*/

const modeSelect = document.getElementById("modeSelect");
const fileInput = document.getElementById("fileInput");
const fileLabel = document.getElementById("fileLabel");

const cryptoSelect = document.getElementById("cryptoSelect");
const pgpSection = document.getElementById("pgpSection");

const guideBtn = document.getElementById("guideBtn");
const guideModal = document.getElementById("guideModal");
const closeGuideBtn = document.getElementById("closeGuideBtn");

const runBtn = document.getElementById("runBtn");

/* ----------------------------
   Guide Modal Logic
   ---------------------------- */

guideBtn.addEventListener("click", () => {
  guideModal.classList.remove("hidden");
});

closeGuideBtn.addEventListener("click", () => {
  guideModal.classList.add("hidden");
});

/* ----------------------------
   Mode Handling
   ---------------------------- */

modeSelect.addEventListener("change", () => {
  const mode = modeSelect.value;

  // This label change is purely UX
  if (mode === "sstv-decrypt") {
    fileLabel.textContent = "Select WAV";
  } else {
    fileLabel.textContent = "Select Image";
  }
});

/* ----------------------------
   Crypto Selection Logic
   ---------------------------- */

cryptoSelect.addEventListener("change", () => {
  const crypto = cryptoSelect.value;

  // Show PGP UI only when needed
  if (crypto === "pgp" || crypto === "aes+pgp") {
    pgpSection.classList.remove("hidden");
  } else {
    pgpSection.classList.add("hidden");
  }
});

/* ----------------------------
   Run Button
   ---------------------------- */

runBtn.addEventListener("click", async () => {
  try {
    // This is intentionally a stub right now.
    // steggy-core will be wired here in Phase 4.
    alert("Steggy run invoked (core not yet wired)");
  } catch (err) {
    // If you see this alert, something real broke
    alert("An error occurred while running Steggy");
    console.error(err);
  }
});
