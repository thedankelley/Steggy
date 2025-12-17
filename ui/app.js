import { getAvailableSSTVModes, encodeImageToSSTV, samplesToWav } from "./modules/steggy-sstv.js";
import { decodeSSTVFromAudioFile } from "./modules/steggy-sstv-decode.js";

let currentImageData = null;

const $ = id => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {

  const modeSelect = $("modeSelect");
  const encryptSection = $("encryptSection");
  const decryptSection = $("decryptSection");
  const advancedSection = $("advancedSection");

  const imageInput = $("imageInput");
  const canvas = $("imageCanvas");
  const ctx = canvas.getContext("2d");

  const toggleAdvanced = $("toggleAdvanced");

  const sstvModeSelect = $("sstvMode");

  getAvailableSSTVModes().forEach(m => {
    const o = document.createElement("option");
    o.value = m.id;
    o.textContent = m.name;
    sstvModeSelect.appendChild(o);
  });

  function updateMode() {
    const isEncrypt = modeSelect.value === "encrypt";
    encryptSection.classList.toggle("hidden", !isEncrypt);
    decryptSection.classList.toggle("hidden", isEncrypt);
  }

  modeSelect.addEventListener("change", updateMode);
  updateMode();

  toggleAdvanced.addEventListener("click", () => {
    advancedSection.classList.toggle("hidden");
  });

  imageInput.addEventListener("change", () => {
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.classList.remove("hidden");
      ctx.drawImage(img, 0, 0);
      currentImageData = ctx.getImageData(0, 0, img.width, img.height);
    };
    img.src = URL.createObjectURL(imageInput.files[0]);
  });

  $("generateSSTV").addEventListener("click", () => {
    if (!currentImageData) return alert("No image loaded");
    const { samples, sampleRate } =
      encodeImageToSSTV(currentImageData, sstvModeSelect.value);
    const wav = samplesToWav(samples, sampleRate);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(wav);
    a.download = "steggy-sstv.wav";
    a.click();
  });

  $("decodeSSTV").addEventListener("click", async () => {
    const file = $("sstvAudioInput").files[0];
    if (!file) return alert("No SSTV audio selected");
    try {
      const img = await decodeSSTVFromAudioFile(
        file,
        $("sstvDecodeMode").value
      );
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.classList.remove("hidden");
      ctx.putImageData(img, 0, 0);
      currentImageData = img;
    } catch {
      alert("SSTV decode failed");
    }
  });

});
