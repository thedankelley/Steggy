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
advBtn?.addEventListener("click", () => advSection.classList.toggle("hidden"));

// Run button placeholder
const runBtn = document.getElementById("runBtn");
runBtn.onclick = () => {
  alert("Run clicked — logic will be linked here");
};

// Other UI wiring placeholders
// Decoy, Fragmentation, PGP, SSTV logic should be wired from here
