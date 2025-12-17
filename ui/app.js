import {
  getAvailableSSTVModes,
  encodeImageToSSTV,
  samplesToWav
} from "./modules/steggy-sstv.js";

import {
  decodeSSTVFromAudioFile
} from "./modules/steggy-sstv-decode.js";

let currentImageData = null;

document.addEventListener("DOMContentLoaded", () => {
  const modeSelect = document.getElementById("modeSelect");
  const encryptSection = document.getElementById("encryptSection");
  const decryptSection = document.getElementById("decryptSection");
  const sstvSection = document.getElementById("sstvSection");

  const imageInput = document.getElementById("imageInput");
  const canvas = document.getElementById("imageCanvas");
  const ctx = canvas.getContext("2d");

  const decryptOutput = document.getElementById("decryptOutput");

  const enableSSTV = document.getElementById("enableSSTV");
  const sstvOptions = document.getElementById("sstvOptions");
  const sstvModeSelect = document.getElementById("sstvMode");
  const downloadSSTV = document.getElementById("downloadSSTV");

  const sstvAudioInput = document.getElementById("sstvAudioInput");
  const sstvDecodeMode = document.getElementById("sstvDecodeMode");
  const decodeSSTVBtn = document.getElementById("decodeSSTVBtn");

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
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      currentImageData = ctx.getImageData(0, 0, img.width, img.height);
    };
    img.src = URL.createObjectURL(imageInput.files[0]);
  });

  enableSSTV.addEventListener("change", () => {
    sstvOptions.classList.toggle("hidden", !enableSSTV.checked);
  });

  downloadSSTV.addEventListener("click", () => {
    const { samples, sampleRate } =
      encodeImageToSSTV(currentImageData, sstvModeSelect.value);
    const wav = samplesToWav(samples, sampleRate);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(wav);
    a.download = "steggy-sstv.wav";
    a.click();
  });

  decodeSSTVBtn.addEventListener("click", async () => {
    const file = sstvAudioInput.files[0];
    if (!file) {
      alert("No SSTV audio selected");
      return;
    }

    try {
      const imgData =
        await decodeSSTVFromAudioFile(file, sstvDecodeMode.value);

      canvas.width = imgData.width;
      canvas.height = imgData.height;
      ctx.putImageData(imgData, 0, 0);
      currentImageData = imgData;

      decryptOutput.textContent = "SSTV image decoded successfully";
    } catch (e) {
      alert("Failed to decode SSTV audio");
    }
  });
});
