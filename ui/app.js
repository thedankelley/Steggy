// ui/app.js
// UI controller only.
// If crypto breaks, it’s not this file’s fault.

const guideBtn = document.getElementById("guideBtn");
const guideModal = document.getElementById("guideModal");
const closeGuideBtn = document.getElementById("closeGuideBtn");

const modeSelect = document.getElementById("modeSelect");
const fileInput = document.getElementById("fileInput");
const fileLabel = document.getElementById("fileLabel");

const cryptoSelect = document.getElementById("cryptoSelect");
const pgpOptions = document.getElementById("pgpOptions");

const advancedToggle = document.getElementById("advancedToggle");
const advancedOptions = document.getElementById("advancedOptions");

const enableFragmentation = document.getElementById("enableFragmentation");
const fragmentationOptions = document.getElementById("fragmentationOptions");

const enableDecoy = document.getElementById("enableDecoy");
const decoyPayload = document.getElementById("decoyPayload");

const runBtn = document.getElementById("runBtn");

/* ---------------- GUIDE ---------------- */

// Never auto-open. Ever. Again.
guideBtn.addEventListener("click", () => {
  guideModal.classList.remove("hidden");
});

closeGuideBtn.addEventListener("click", () => {
  guideModal.classList.add("hidden");
});

/* ---------------- MODE ---------------- */

modeSelect.addEventListener("change", () => {
  const mode = modeSelect.value;

  if (mode === "sstv-decode") {
    fileLabel.textContent = "Select WAV";
    fileInput.accept = ".wav";
  } else {
    fileLabel.textContent = "Select Image";
    fileInput.accept = "image/*";
  }
});

/* ---------------- CRYPTO ---------------- */

cryptoSelect.addEventListener("change", () => {
  const crypto = cryptoSelect.value;

  if (crypto === "pgp" || crypto === "both") {
    pgpOptions.classList.remove("hidden");
  } else {
    pgpOptions.classList.add("hidden");
  }
});

/* ---------------- ADVANCED OPTIONS ---------------- */

advancedToggle.addEventListener("click", () => {
  advancedOptions.classList.toggle("hidden");
});

enableFragmentation.addEventListener("change", () => {
  fragmentationOptions.classList.toggle(
    "hidden",
    !enableFragmentation.checked
  );
});

enableDecoy.addEventListener("change", () => {
  decoyPayload.classList.toggle(
    "hidden",
    !enableDecoy.checked
  );
});

/* ---------------- RUN ---------------- */

runBtn.addEventListener("click", async () => {
  try {
    // Core wiring happens later — this is intentional for now.
    alert("UI is wired correctly. Core execution comes next.");
  } catch (err) {
    console.error("Run error:", err);
    alert("An error occurred while running Steggy.");
  }
});
