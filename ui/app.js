// ui/app.js
import * as core from "../core/steggy-core.js";
import * as crc from "../core/steggy-crc.js";
import * as decoy from "../modules/steggy-decoy.js";
import * as fragment from "../modules/steggy-fragment.js";
import * as hash from "../modules/steggy-hash.js";
import * as pgp from "../modules/steggy-pgp.js";
import * as sstv from "../modules/steggy-sstv.js";
import * as sstvDecode from "../modules/steggy-sstv-decode.js";
import * as sstvMic from "../modules/steggy-sstv-mic.js";

// Guide toggle
const guideBtn = document.getElementById("guideBtn");
const guideOverlay = document.getElementById("guideOverlay");
const closeGuide = document.getElementById("closeGuide");

guideBtn.onclick = () => guideOverlay.classList.remove("hidden");
closeGuide.onclick = () => guideOverlay.classList.add("hidden");

// Advanced options toggle
const advBtn = document.getElementById("advancedToggle");
const advSection = document.getElementById("advancedSection");

advBtn.addEventListener("click", () => advSection.classList.toggle("hidden"));

// Mode selection
const modeSelect = document.getElementById("modeSelect");
const fileInput = document.getElementById("fileInput");
const payloadText = document.getElementById("payloadText");

modeSelect.addEventListener("change", () => {
  const mode = modeSelect.value;
  if (mode.includes("sstv")) {
    fileInput.accept = mode.includes("decrypt") ? ".wav" : "image/*";
  } else {
    fileInput.accept = "image/*";
  }
});

// Run button
const runBtn = document.getElementById("runBtn");
runBtn.onclick = () => {
  const mode = modeSelect.value;
  alert(`Run clicked for mode: ${mode}`);
};

// TODO: Wire Advanced Options, PGP, SSTV, Fragmentation fully
