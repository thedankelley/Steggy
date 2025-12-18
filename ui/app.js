import { encryptImageData, decryptImageData } from "../core/steggy-core.js";
import { generatePGPKeyPair } from "../modules/steggy-pgp.js";
import { decodeSSTVFromAudio } from "../modules/steggy-sstv-decode.js";

const $ = id => document.getElementById(id);

let imageData = null;
let currentImageURL = null;

const canvas = $("canvas");
const ctx = canvas.getContext("2d");

$("toggleAdvanced").onclick = () => {
  $("advanced").classList.toggle("hidden");
};

$("mode").onchange = () => {
  const mode = $("mode").value;

  $("imageInput").classList.toggle("hidden", mode === "sstv-decode");
  $("audioInput").classList.toggle("hidden", mode !== "sstv-decode");

  $("protectedMessage").classList.toggle("hidden", mode !== "encrypt");
  $("decoyMessage").classList.toggle("hidden", mode !== "encrypt");

  $("output").classList.add("hidden");
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

$("generatePGP").onclick = async () => {
  const passphrase = prompt("Enter a passphrase for your private key:");
  if (!passphrase) return;

  const { publicKey, privateKey } = await generatePGPKeyPair(passphrase);
  $("pgpPublicKey").value = publicKey;
  $("pgpPrivateKey").value = privateKey;
  $("pgpPassphrase").value = passphrase;
};

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

$("downloadPublic").onclick = () => {
  downloadText("steggy_public.asc", $("pgpPublicKey").value);
};

$("downloadPrivate").onclick = () => {
  downloadText("steggy_private.asc", $("pgpPrivateKey").value);
};

$("run").onclick = async () => {
  try {
    const mode = $("mode").value;

    if (mode === "sstv-decode") {
      const file = $("audioInput").files[0];
      if (!file) return alert("No audio file");

      const img = await decodeSSTVFromAudio(file, "martin1");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.classList.remove("hidden");
      ctx.putImageData(img, 0, 0);
      $("downloadImage").classList.remove("hidden");
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

    if (mode === "encrypt") {
      const result = await encryptImageData(
        imageData,
        $("protectedMessage").value,
        $("decoyMessage").value,
        options
      );

      ctx.putImageData(result, 0, 0);
      imageData = result;
      $("downloadImage").classList.remove("hidden");
    } else {
      const msg = await decryptImageData(imageData, options);
      $("output").value = msg;
      $("output").classList.remove("hidden");
    }
  } catch (err) {
    alert(err.message);
  }
};

$("downloadImage").onclick = () => {
  canvas.toBlob(blob => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "steggy_output.png";
    a.click();
  });
};
