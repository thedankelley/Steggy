import {
  encryptImageData,
  decryptImageData
} from "../core/steggy-core.js";

import {
  generatePGPKeyPair,
  pgpEncrypt,
  pgpDecrypt
} from "../core/steggy-pgp.js";

import * as sstv from "../core/steggy-sstv.js";
import * as sstvDecode from "../core/steggy-sstv-decode.js";

/* ================= STATE ================= */

const state = {
  mode: "encrypt",
  method: "aes",
  threatModel: "journalist",
  imageData: null,
  sstvFile: null
};

/* ================= DOM ================= */

const $ = id => document.getElementById(id);

const encryptBtn = $("runEncrypt");
const decryptBtn = $("runDecrypt");
const advToggle = $("advancedToggle");
const advPanel = $("advancedPanel");

const pgpSection = $("pgpSection");
const aesSection = $("aesSection");
const sstvSection = $("sstvSection");

const imageInput = $("imageInput");
const outputImg = $("outputImage");
const downloadBtn = $("downloadImage");

const threatSelect = $("threatModel");
const methodSelect = $("cryptoMethod");

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  applyThreatModel("journalist");
  updateVisibility();
});

/* ================= EVENTS ================= */

function bindEvents() {
  advToggle.addEventListener("click", () => {
    advPanel.classList.toggle("hidden");
  });

  threatSelect.addEventListener("change", e => {
    applyThreatModel(e.target.value);
  });

  methodSelect.addEventListener("change", e => {
    state.method = e.target.value;
    updateVisibility();
  });

  imageInput.addEventListener("change", handleImageUpload);

  encryptBtn.addEventListener("click", runEncrypt);
  decryptBtn.addEventListener("click", runDecrypt);

  $("generatePGP").addEventListener("click", generatePGP);
  $("encryptWithPGP").addEventListener("click", encryptPayloadWithPGP);
  $("decryptWithPGP").addEventListener("click", decryptExtractedPGP);

  $("sstvDecodeBtn").addEventListener("click", runSSTVDecode);
}

/* ================= VISIBILITY ================= */

function updateVisibility() {
  pgpSection.classList.toggle(
    "hidden",
    !(state.method === "pgp" || state.method === "both")
  );

  aesSection.classList.toggle(
    "hidden",
    !(state.method === "aes" || state.method === "both")
  );

  sstvSection.classList.toggle(
    "hidden",
    state.mode !== "decrypt"
  );
}

/* ================= THREAT MODELS ================= */

function applyThreatModel(model) {
  state.threatModel = model;

  if (model === "journalist") {
    state.method = "both";
    methodSelect.value = "both";
    $("stripMetadata").checked = true;
    $("enableDecoy").checked = true;
  }

  if (model === "activist") {
    state.method = "pgp";
    methodSelect.value = "pgp";
    $("stripMetadata").checked = true;
    $("enableDecoy").checked = true;
  }

  if (model === "emergency") {
    state.method = "none";
    methodSelect.value = "none";
    $("enableSSTV").checked = true;
  }

  updateVisibility();
}

/* ================= IMAGE HANDLING ================= */

async function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    state.imageData = ctx.getImageData(0, 0, img.width, img.height);
  };
  img.src = URL.createObjectURL(file);
}

/* ================= ENCRYPT ================= */

async function runEncrypt() {
  if (!state.imageData) {
    alert("No image loaded");
    return;
  }

  try {
    const protectedMsg = $("protectedPayload").value;
    const decoyMsg = $("enableDecoy").checked
      ? $("decoyPayload").value
      : null;

    const opts = collectOptions();

    const result = await encryptImageData(
      state.imageData,
      protectedMsg,
      decoyMsg,
      opts
    );

    renderOutput(result);
  } catch (err) {
    alert(err.message);
  }
}

/* ================= DECRYPT ================= */

async function runDecrypt() {
  try {
    const opts = collectOptions();
    const result = await decryptImageData(state.imageData, opts);
    $("decryptOutput").value = result;
  } catch (err) {
    alert(err.message);
  }
}

/* ================= OUTPUT ================= */

function renderOutput(imageData) {
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext("2d");
  ctx.putImageData(imageData, 0, 0);

  const url = canvas.toDataURL("image/png");
  outputImg.src = url;
  outputImg.classList.remove("hidden");

  downloadBtn.onclick = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "steggy-output.png";
    a.click();
  };
}

/* ================= OPTIONS ================= */

function collectOptions() {
  return {
    method: state.method,
    password: $("aesPassword")?.value || "",
    pgpPublicKey: $("pgpPublicKey")?.value || "",
    pgpPrivateKey: $("pgpPrivateKey")?.value || "",
    pgpPassphrase: $("pgpPassphrase")?.value || ""
  };
}

/* ================= PGP ================= */

async function generatePGP() {
  const keys = await generatePGPKeyPair();
  $("pgpPublicKey").value = keys.publicKey;
  $("pgpPrivateKey").value = keys.privateKey;
}

async function encryptPayloadWithPGP() {
  const plaintext = $("protectedPayload").value;
  const pub = $("pgpPublicKey").value;
  const encrypted = await pgpEncrypt(plaintext, pub);
  $("protectedPayload").value = encrypted;
}

async function decryptExtractedPGP() {
  const encrypted = $("decryptOutput").value;
  const priv = $("pgpPrivateKey").value;
  const pass = $("pgpPassphrase").value;
  const decrypted = await pgpDecrypt(encrypted, priv, pass);
  $("decryptOutput").value = decrypted;
}

/* ================= SSTV ================= */

async function runSSTVDecode() {
  const file = $("sstvFile").files[0];
  if (!file) {
    alert("No WAV file selected");
    return;
  }

  const img = await sstvDecode.decode(file);
  outputImg.src = img;
  outputImg.classList.remove("hidden");
}
