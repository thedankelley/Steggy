import { encryptImageData, decryptImageData } from "./modules/steggy-core.js";
import { getAvailableSSTVModes, encodeImageToSSTV, samplesToWav } from "./modules/steggy-sstv.js";
import { decodeSSTVFromAudioFile } from "./modules/steggy-sstv-decode.js";

const $ = id => document.getElementById(id);
let currentImageData = null;

document.addEventListener("DOMContentLoaded", () => {

  // UI sections
  const encryptSection = $("encryptSection");
  const decryptSection = $("decryptSection");
  const advancedSection = $("advancedSection");

  // Canvas & image
  const canvas = $("imageCanvas");
  const ctx = canvas.getContext("2d");

  // Advanced Settings toggle
  $("toggleAdvanced").addEventListener("click", () => {
    advancedSection.classList.toggle("hidden");
  });

  // Mode select
  $("modeSelect").addEventListener("change", () => {
    const encrypt = $("modeSelect").value === "encrypt";
    encryptSection.classList.toggle("hidden", !encrypt);
    decryptSection.classList.toggle("hidden", encrypt);
  });

  // Image load
  $("imageInput").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.classList.remove("hidden");
      ctx.drawImage(img, 0, 0);
      currentImageData = ctx.getImageData(0, 0, img.width, img.height);
    };
    img.src = URL.createObjectURL(file);
  });

  // Encryption
  $("encryptBtn").addEventListener("click", async () => {
    if (!currentImageData) return alert("No image loaded");
    const protectedMsg = $("protectedMessage").value;
    const decoyMsg = $("decoyMessage").value;
    const options = {
      method: $("encryptionMethod").value,
      metadata: $("metadataMode").value
    };
    try {
      const newImg = await encryptImageData(currentImageData, protectedMsg, decoyMsg, options);
      canvas.width = newImg.width;
      canvas.height = newImg.height;
      ctx.putImageData(newImg, 0, 0);
      currentImageData = newImg;
      alert("Encryption successful!");
    } catch (e) {
      console.error(e);
      alert("Encryption failed: " + e.message);
    }
  });

  // Decryption
  $("decryptBtn").addEventListener("click", async () => {
    if (!currentImageData) return alert("No image loaded");
    try {
      const output = await decryptImageData(currentImageData);
      $("decryptOutput").textContent = output;
    } catch (e) {
      console.error(e);
      alert("Decryption failed: " + e.message);
    }
  });

  // SSTV Encode
  const sstvModeSelect = $("sstvMode");
  getAvailableSSTVModes().forEach(m => {
    const o = document.createElement("option");
    o.value = m.id;
    o.textContent = m.name;
    sstvModeSelect.appendChild(o);
  });

  $("generateSSTV").addEventListener("click", () => {
    if (!currentImageData) return alert("No image loaded");
    const { samples, sampleRate } = encodeImageToSSTV(currentImageData, sstvModeSelect.value);
    const wav = samplesToWav(samples, sampleRate);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(wav);
    a.download = "steggy-sstv.wav";
    a.click();
  });

  // SSTV Decode
  $("decodeSSTV").addEventListener("click", async () => {
    const file = $("sstvAudioInput").files[0];
    if (!file) return alert("No SSTV audio selected");
    try {
      const img = await decodeSSTVFromAudioFile(file, $("sstvDecodeMode").value);
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.classList.remove("hidden");
      ctx.putImageData(img, 0, 0);
      currentImageData = img;
      $("decryptOutput").textContent = "SSTV decoded successfully";
    } catch (e) {
      console.error(e);
      alert("SSTV decode failed: " + e.message);
    }
  });

});
