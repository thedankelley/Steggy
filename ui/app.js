import {
  encryptImageData,
  decryptImageData
} from "../core/steggy-core.js";

import {
  decodeSSTVFromAudio,
  decodeSSTVFromSamples
} from "../modules/steggy-sstv-decode.js";

import {
  startMicCapture,
  stopMicCapture
} from "../modules/steggy-sstv-mic.js";

const $ = id => document.getElementById(id);
let canvas = $("canvas");
let ctx = canvas.getContext("2d");
let imageData = null;

$("mode").onchange = () => {
  const sstv = $("mode").value === "sstv-decode";
  $("imageInput").classList.toggle("hidden", sstv);
  $("audioInput").classList.toggle("hidden", !sstv);
  $("sstvMode").classList.toggle("hidden", !sstv);
  $("micStart").classList.toggle("hidden", !sstv);
  $("micStop").classList.toggle("hidden", !sstv);
};

$("imageInput").onchange = e => {
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.classList.remove("hidden");
    ctx.drawImage(img, 0, 0);
    imageData = ctx.getImageData(0, 0, img.width, img.height);
  };
  img.src = URL.createObjectURL(e.target.files[0]);
};

$("run").onclick = async () => {
  if ($("mode").value !== "sstv-decode") return;

  const file = $("audioInput").files[0];
  if (!file) return alert("No audio file");

  const img = await decodeSSTVFromAudio(file, $("sstvMode").value);
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.classList.remove("hidden");
  ctx.putImageData(img, 0, 0);
};

$("micStart").onclick = async () => {
  await startMicCapture(async (samples, rate) => {
    if (samples.length < rate * 2) return;
    const img = await decodeSSTVFromSamples(
      samples,
      rate,
      $("sstvMode").value
    );
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.classList.remove("hidden");
    ctx.putImageData(img, 0, 0);
  });
};

$("micStop").onclick = () => {
  stopMicCapture();
};
