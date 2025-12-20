import { SteggySSTV } from "../modules/steggy-sstv.js";
import { SteggySSTVDecode } from "../modules/steggy-sstv-decode.js";

const modeSelect = document.getElementById("modeSelect");
const encodeSection = document.getElementById("sstvEncodeSection");
const decodeSection = document.getElementById("sstvDecodeSection");

modeSelect.onchange = () => {
  encodeSection.classList.toggle("hidden", modeSelect.value !== "sstv-encode");
  decodeSection.classList.toggle("hidden", modeSelect.value !== "sstv-decode");
};

const fragInput = document.createElement("input");
fragInput.type = "number";
fragInput.min = 1;
fragInput.value = 1;
fragInput.style.marginTop = "0.5rem";
encodeSection.appendChild(fragInput);

document.getElementById("sstvEncodeBtn").onclick = async () => {
  const imgFile = document.getElementById("sstvImageInput").files[0];
  if (!imgFile) return alert("Select image");

  const img = new Image();
  img.src = URL.createObjectURL(imgFile);
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.getContext("2d").drawImage(img, 0, 0);

  const frames = SteggySSTV.encode(
    canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height),
    document.getElementById("sstvMode").value,
    parseInt(fragInput.value)
  );

  frames.forEach((wav, i) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(wav);
    a.download = `sstv_fragment_${i + 1}.wav`;
    a.textContent = `Download Fragment ${i + 1}`;
    encodeSection.appendChild(a);
    encodeSection.appendChild(document.createElement("br"));
  });
};

document.getElementById("sstvDecodeBtn").onclick = async () => {
  const files = [...document.getElementById("sstvWavInput").files];
  if (!files.length) return alert("Select WAV files");

  try {
    const imageData = await SteggySSTVDecode.decodeMultiple(files);
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    canvas.getContext("2d").putImageData(imageData, 0, 0);

    document.getElementById("sstvDecodedImage").src = canvas.toDataURL();
    document.getElementById("sstvDecodedImage").classList.remove("hidden");
  } catch (e) {
    alert(e.message);
  }
};
