// ui/app.js

// --- SAFE MODULE LOADING ---
let pgp = null;

try {
  pgp = await import("../modules/steggy-pgp.js");
} catch (e) {
  console.warn("PGP module not loaded", e);
}

// --- DOM HELPERS ---
const $ = id => document.getElementById(id);

// --- GUIDE ---
$("guideBtn").onclick = () => {
  $("guideOverlay").classList.remove("hidden");
};

$("closeGuide").onclick = () => {
  $("guideOverlay").classList.add("hidden");
};

// --- ADVANCED OPTIONS ---
$("advancedToggle").onclick = () => {
  $("advancedSection").classList.toggle("hidden");
};

// --- DECOY TOGGLE ---
$("enableDecoy").onchange = e => {
  $("decoyLabel").classList.toggle("hidden", !e.target.checked);
};

// --- MODE CHANGE ---
$("modeSelect").onchange = () => {
  const mode = $("modeSelect").value;
  const label = $("fileLabel");

  if (mode === "sstv-decode") {
    label.firstChild.textContent = "Select WAV ";
    $("fileInput").accept = ".wav,audio/wav";
  } else {
    label.firstChild.textContent = "Select Image ";
    $("fileInput").accept = "image/*";
  }
};

// --- CRYPTO SELECT ---
$("cryptoSelect").onchange = () => {
  const val = $("cryptoSelect").value;
  $("pgpSection").classList.toggle(
    "hidden",
    !(val === "pgp" || val === "pgp+aeg")
  );
};

// --- PGP ---
$("pgpGenerate").onclick = async () => {
  if (!pgp?.generateKeyPair) {
    alert("PGP module not available");
    return;
  }

  const keys = await pgp.generateKeyPair();
  $("pgpPublic").value = keys.publicKey;
  $("pgpPrivate").value = keys.privateKey;
};

$("pgpEncrypt").onclick = async () => {
  if (!pgp?.encrypt) {
    alert("PGP module not available");
    return;
  }

  const encrypted = await pgp.encrypt(
    $("payloadInput").value,
    $("pgpPublic").value
  );

  $("payloadInput").value = encrypted;
};

// --- RUN ---
$("runBtn").onclick = () => {
  alert("Run wired successfully. Core execution next step.");
};
