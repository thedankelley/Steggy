import { encryptImageData, decryptImageData } from "../core/steggy-core.js";
import { generatePGPKeypair } from "../modules/steggy-pgp.js";

const $ = id => document.getElementById(id);

const state = {
  image: null
};

$("toggleAdvanced").onclick = () => {
  $("advanced").style.display =
    $("advanced").style.display === "none" ? "block" : "none";
};

$("method").onchange = () => {
  $("aesFields").style.display = $("method").value === "aes" ? "block" : "none";
  $("pgpFields").style.display = $("method").value === "pgp" ? "block" : "none";
};

$("mode").onchange = () => {
  const m = $("mode").value;
  $("encryptSection").style.display = m === "encrypt" ? "block" : "none";
  $("decryptSection").style.display = m === "decrypt" ? "block" : "none";
};

$("imageInput").onchange = e => {
  state.image = e.target.files[0];
};

$("genKeys").onclick = async () => {
  const kp = await generatePGPKeypair();
  $("pgpPublic").value = kp.publicKey;
  $("pgpPrivate").value = kp.privateKey;
};

function download(name, text) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text]));
  a.download = name;
  a.click();
}

$("downloadPub").onclick = () =>
  download("public.asc", $("pgpPublic").value);
$("downloadPriv").onclick = () =>
  download("private.asc", $("pgpPrivate").value);

$("run").onclick = async () => {
  if (!state.image) return alert("Select an image");

  const img = new Image();
  img.src = URL.createObjectURL(state.image);
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  let imageData = ctx.getImageData(0, 0, img.width, img.height);

  try {
    let result;

    if ($("mode").value === "encrypt") {
      result = await encryptImageData(
        imageData,
        $("protectedMsg").value,
        $("decoyMsg").value,
        {
          method: $("method").value,
          password: $("aesPassword").value,
          pgpPublicKey: $("pgpPublic").value
        }
      );
      ctx.putImageData(result, 0, 0);
    }

    if ($("mode").value === "decrypt") {
      const msg = await decryptImageData(imageData, {
        password: $("aesPassword").value,
        pgpPrivateKey: $("pgpPrivate").value,
        pgpPassphrase: $("pgpPass").value
      });
      $("output").innerText = msg;
      return;
    }

    const outImg = document.createElement("img");
    outImg.src = canvas.toDataURL("image/png");

    const dl = document.createElement("a");
    dl.href = outImg.src;
    dl.download = "steggy.png";
    dl.textContent = "Download image";

    $("output").innerHTML = "";
    $("output").append(outImg, dl);

  } catch (e) {
    alert(e.message);
  }
};
