import { SteggySSTV } from "../modules/steggy-sstv.js";
import { SteggySSTVDecode } from "../modules/steggy-sstv-decode.js";

const modeSelect = document.getElementById("modeSelect");

const sstvEncodeSection = document.getElementById("sstvEncodeSection");
const sstvDecodeSection = document.getElementById("sstvDecodeSection");

modeSelect.addEventListener("change", () => {
  sstvEncodeSection.classList.add("hidden");
  sstvDecodeSection.classList.add("hidden");

  if (modeSelect.value === "sstv-encode") {
    sstvEncodeSection.classList.remove("hidden");
  }
  if (modeSelect.value === "sstv-decode") {
    sstvDecodeSection.classList.remove("hidden");
  }
});

/* ---------- SSTV ENCODE ---------- */

const sstvImageInput = document.getElementById("sstvImageInput");
const sstvMode = document.getElementById("sstvMode");
const sstvEncodeBtn = document.getElementById("sstvEncodeBtn");
const sstvAudio = document.getElementById("sstvAudio");

sstvEncodeBtn.addEventListener("click", async () => {
  const file = sstvImageInput.files[0];
  if (!file) {
    alert("Please select an image.");
    return;
  }

  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  try {
    const wavBlob = SteggySSTV.encode(imageData, sstvMode.value);
    sstvAudio.src = URL.createObjectURL(wavBlob);
    sstvAudio.classList.remove("hidden");
  } catch (e) {
    alert(e.message);
  }
});

/* ---------- SSTV DECODE ---------- */

const sstvWavInput = document.getElementById("sstvWavInput");
const sstvDecodeBtn = document.getElementById("sstvDecodeBtn");
const sstvDecodedImage = document.getElementById("sstvDecodedImage");

sstvDecodeBtn.addEventListener("click", async () => {
  const file = sstvWavInput.files[0];
  if (!file) {
    alert("Please select a WAV file.");
    return;
  }

  try {
    const imageData = await SteggySSTVDecode.decode(file);
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    canvas.getContext("2d").putImageData(imageData, 0, 0);

    sstvDecodedImage.src = canvas.toDataURL("image/png");
    sstvDecodedImage.classList.remove("hidden");
  } catch (e) {
    alert("Decode failed.");
  }
});
