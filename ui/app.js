// ui/app.js
// UI controller for Steggy
// This file should never import core logic directly except where noted
// If something breaks again, start reading here

import { generatePGPKeyPair } from "../modules/steggy-pgp.js";

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindEvents();
  updateUI();
});

/* --------------------------------------------------
   Element cache
   -------------------------------------------------- */

let els = {};

function cacheElements() {
  els.mode = document.getElementById("mode");
  els.encryption = document.getElementById("encryption");

  els.runBtn = document.getElementById("run-btn");

  // Guide
  els.guideBtn = document.getElementById("guide-btn");
  els.guidePanel = document.getElementById("guide-panel");
  els.guideClose = document.getElementById("guide-close");

  // PGP
  els.pgpSection = document.getElementById("pgp-section");
  els.pgpGenerate = document.getElementById("pgp-generate");
  els.pgpPublic = document.getElementById("pgp-public");
  els.pgpPrivate = document.getElementById("pgp-private");
  els.pgpDownloadPub = document.getElementById("pgp-download-public");
  els.pgpDownloadPriv = document.getElementById("pgp-download-private");
}

/* --------------------------------------------------
   Event binding (ONCE)
   -------------------------------------------------- */

function bindEvents() {
  els.mode.addEventListener("change", updateUI);
  els.encryption.addEventListener("change", updateUI);

  // Guide
  els.guideBtn.addEventListener("click", () => {
    els.guidePanel.hidden = false;
  });

  els.guideClose.addEventListener("click", () => {
    els.guidePanel.hidden = true;
  });

  // PGP key generation
  els.pgpGenerate.addEventListener("click", async () => {
    els.pgpGenerate.disabled = true;
    els.pgpGenerate.textContent = "Generating…";

    try {
      const keys = await generatePGPKeyPair();
      els.pgpPublic.value = keys.publicKey;
      els.pgpPrivate.value = keys.privateKey;
    } catch (err) {
      alert("PGP key generation failed");
      console.error(err);
    } finally {
      els.pgpGenerate.disabled = false;
      els.pgpGenerate.textContent = "Generate PGP Keys";
    }
  });

  // Downloads
  els.pgpDownloadPub.addEventListener("click", () => {
    downloadText("steggy-public.key", els.pgpPublic.value);
  });

  els.pgpDownloadPriv.addEventListener("click", () => {
    downloadText("steggy-private.key", els.pgpPrivate.value);
  });

  // Run (stub for now)
  els.runBtn.addEventListener("click", () => {
    alert("Run wired correctly. Core execution comes next.");
  });
}

/* --------------------------------------------------
   UI State Controller
   -------------------------------------------------- */

function updateUI() {
  const encryption = els.encryption.value;

  // Hide everything first
  els.pgpSection.hidden = true;

  // Show PGP UI only when relevant
  if (encryption === "pgp" || encryption === "pgp+aes") {
    els.pgpSection.hidden = false;
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
