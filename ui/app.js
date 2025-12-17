import {
  getAvailableSSTVModes,
  encodeImageToSSTV,
  samplesToWav
} from "./modules/steggy-sstv.js";

let currentImageData = null;

document.addEventListener("DOMContentLoaded", () => {
  const modeSelect = document.getElementById("modeSelect");
  const encryptSection = document.getElementById("encryptSection");
  const decryptSection = document.getElementById("decryptSection");
  const sstvSection = document.getElementById("sstvSection");

  const imageInput = document.getElementById("imageInput");
  const canvas = document.getElementById("imageCanvas");
  const ctx = canvas.getContext("2d");

  const encryptBtn = document.getElementById("encryptBtn");
  const decryptBtn = document.getElementById("decryptBtn");

  const protectedMessage = document.getElementById("protectedMessage");
  const decoyMessage = document.getElementById("decoyMessage");
  const decryptOutput = document.getElementById("decryptOutput");

  const enableSSTV = document.getElementById("enableSSTV");
  const sstvOptions = document.getElementById("sstvOptions");
  const sstvModeSelect = document.getElementById("sstvMode");
  const downloadSSTV = document.getElementById("downloadSSTV");

  // Populate SSTV modes
  getAvailableSSTVModes().forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = m.name;
    sstvModeSelect.appendChild(opt);
  });

  function updateModeUI() {
    const mode = modeSelect.value;
    encryptSection.classList.toggle("hidden", mode !== "encrypt");
    decryptSection.classList.toggle("hidden", mode !== "decrypt");
    sstvSection.classList.toggle("hidden", mode !== "encrypt");
  }

  modeSelect.addEventListener("change", updateModeUI);
  updateModeUI();

  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      currentImageData = ctx.getImageData(0, 0, img.width, img.height);
    };
    img.src = URL.createObjectURL(file);
  });

  encryptBtn.addEventListener("click", () => {
    if (!currentImageData) {
      alert("No image loaded");
      return;
    }

    alert("Steganographic encryption via steggy-core will run here");
  });

  decryptBtn.addEventListener("click", () => {
    if (!currentImageData) {
      alert("No image loaded");
      return;
    }

    decryptOutput.textContent =
      "Steganographic extraction via steggy-core will run here";
  });

  enableSSTV.addEventListener("change", () => {
    sstvOptions.classList.toggle("hidden", !enableSSTV.checked);
  });

  downloadSSTV.addEventListener("click", () => {
    if (!currentImageData) {
      alert("No image loaded");
      return;
    }

    const mode = sstvModeSelect.value;
    const { samples, sampleRate } =
      encodeImageToSSTV(currentImageData, mode);

    const wav = samplesToWav(samples, sampleRate);
    const url = URL.createObjectURL(wav);

    const a = document.createElement("a");
    a.href = url;
    a.download = "steggy-sstv.wav";
    a.click();
  });
});
