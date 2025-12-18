import {
  encryptImageData,
  decryptImageData
} from "../core/steggy-core.js";

const $ = id => document.getElementById(id);

let imageData = null;
let canvas = $("canvas");
let ctx = canvas.getContext("2d");

$("toggleAdvanced").onclick = () => {
  $("advanced").classList.toggle("hidden");
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
  if (!imageData) return alert("No image loaded");

  const options = {
    method: $("method").value,
    password: $("password").value,
    pgpPublicKey: $("pgpPublicKey").value,
    pgpPrivateKey: $("pgpPrivateKey").value,
    pgpPassphrase: $("pgpPassphrase").value
  };

  try {
    let result;
    if ($("mode").value === "encrypt") {
      result = await encryptImageData(
        imageData,
        $("protectedMessage").value,
        $("decoyMessage").value,
        options
      );
    } else {
      const msg = await decryptImageData(imageData, options);
      alert("Decrypted message:\n\n" + msg);
      return;
    }

    ctx.putImageData(result, 0, 0);
    alert("Operation successful");
  } catch (e) {
    alert("Error: " + e.message);
  }
};
