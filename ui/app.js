// ui/app.js
import { generatePGPKeyPair } from "../modules/steggy-pgp.js";

document.addEventListener("DOMContentLoaded", init);

/* --------------------------------------------------
   App State
-------------------------------------------------- */
const state = {
  advancedOpen: false
};

/* --------------------------------------------------
   Cached elements
-------------------------------------------------- */
let els = {};

function init() {
  cacheElements();
  bindEvents();
  updateUI();
}

/* --------------------------------------------------
   Cache + validate
-------------------------------------------------- */
function cacheElements() {
  const ids = [
    "mode",
    "encryption",
    "run-btn",

    "guide-btn",
    "guide-panel",
    "guide-close",

    "advanced-btn",
    "advanced-panel",

    "pgp-section",
    "pgp-generate",
    "pgp-public",
    "pgp-private",
    "pgp-download-public",
    "pgp-download-private"
  ];

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) {
      throw new Error(`UI element missing: #${id}`);
    }
    els[id] = el;
  });
}

/* --------------------------------------------------
   Event binding (ONCE)
-------------------------------------------------- */
function bindEvents() {
  els["encryption"].addEventListener("change", updateUI);

  // Guide
  els["guide-btn"].addEventListener("click", () => {
    els["guide-panel"].hidden = false;
  });

  els["guide-close"].addEventListener("click", (e) => {
    e.stopPropagation();
    els["guide-panel"].hidden = true;
  });

  // Advanced Options
  els["advanced-btn"].addEventListener("click", () => {
    state.advancedOpen = !state.advancedOpen;
    updateUI();
  });

  // PGP generation
  els["pgp-generate"].addEventListener("click", async () => {
    els["pgp-generate"].disabled = true;
    els["pgp-generate"].textContent = "Generating…";

    try {
      const keys = await generatePGPKeyPair();
      els["pgp-public"].value = keys.publicKey;
      els["pgp-private"].value = keys.privateKey;
    } catch (err) {
      alert("PGP key generation failed");
      console.error(err);
    } finally {
      els["pgp-generate"].disabled = false;
      els["pgp-generate"].textContent = "Generate PGP Keys";
    }
  });

  // Downloads
  els["pgp-download-public"].addEventListener("click", () => {
    downloadText("steggy-public.key", els["pgp-public"].value);
  });

  els["pgp-download-private"].addEventListener("click", () => {
    downloadText("steggy-private.key", els["pgp-private"].value);
  });

  // Run
  els["run-btn"].addEventListener("click", () => {
    alert("Run button works. Core wiring next.");
  });
}

/* --------------------------------------------------
   UI Controller
-------------------------------------------------- */
function updateUI() {
  const enc = els["encryption"].value;

  // Hide sections first
  els["pgp-section"].hidden = true;
  els["advanced-panel"].hidden = true;

  // Encryption modes that require PGP UI
  if (enc === "pgp" || enc === "pgp_aes") {
    els["pgp-section"].hidden = false;
  }

  // Advanced Options
  if (state.advancedOpen) {
    els["advanced-panel"].hidden = false;
  }
}

/* --------------------------------------------------
   Utilities
-------------------------------------------------- */
function downloadText(filename, text) {
  if (!text) {
    alert("Nothing to download");
    return;
  }

  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
