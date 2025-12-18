import {
  encryptImageData,
  decryptImageData
} from "../core/steggy-core.js";

import {
  decodeSSTVFromAudio
} from "../modules/steggy-sstv-decode.js";

const $ = id => document.getElementById(id);

let imageData = null;
let canvas = $("canvas");
let ctx = canvas.getContext("2d");

$("toggleAdvanced").onclick = () => {
  $("advanced").classList.toggle("hidden");
};

$("mode").onchange = () => {
  const mode = $("mode").value;
  $("imageInput").classList.toggle("hidden", mode === "sstv-decode");
  $("audioInput").classList.toggle("hidden", mode !== "sstv-decode");
};

$("imageInput").onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.classList.remove("hidden");
    ctx.drawImage(img, 0, 0);
    imageData = ctx.getImageData(0, 0, img.width, img.height);
  };
  img.src = URL.createObjectURL(file);
};

$("run").onclick = async () => {
  try {
    if ($("mode").value === "sstv-decode") {
      const file = $("audioInput").files[0];
      if (!file) return alert("No audio file provided");

      const decoded = await decodeSSTVFromAudio(file);
      canvas.width = decoded.width;
      canvas.height = decoded.height;
      canvas.classList.remove("hidden");
      ctx.putImageData(decoded, 0, 0);
      return;
    }

    if (!imageData) return alert("No image loaded");

    const options = {
      method: $("method").value,
      password: $("password").value,
      pgpPublicKey: $("pgpPublicKey").value,
      pgpPrivateKey: $("pgpPrivateKey").value,
      pgpPassphrase: $("pgpPassphrase").value
    };

    if ($("mode").value === "encrypt") {
      const result = await encryptImageData(
        imageData,
        $("protectedMessage").value,
        $("decoyMessage").value,
        options
      );
      ctx.putImageData(result, 0, 0);
      alert("Encryption successful");
    } else {
      const msg = await decryptImageData(imageData, options);
      alert("Decrypted message:\n\n" + msg);
    }
  } catch (e) {
    alert("Error: " + e.message);
  }
};
