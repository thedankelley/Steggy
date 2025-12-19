import { encryptImageData, decryptImageData } from "../core/steggy-core.js";
import { generatePGPKeypair } from "../modules/steggy-pgp.js";

const $ = id => document.getElementById(id);

const uiState = {
  advancedOpen: false,
  imageFile: null
};

/* ---------- Initial UI Setup ---------- */

$("advanced").style.display = "none";
$("aesFields").style.display = "none";
$("pgpFields").style.display = "none";

/* ---------- Mode Switching ---------- */

$("mode").addEventListener("change", () => {
  const mode = $("mode").value;

  $("encryptSection").style.display = mode === "encrypt" ? "block" : "none";
  $("decryptSection").style.display = mode === "decrypt" ? "block" : "none";
});

/* ---------- Advanced Toggle ---------- */

$("toggleAdvanced").addEventListener("click", () => {
  uiState.advancedOpen = !uiState.advancedOpen;
  $("advanced").style.display = uiState.advancedOpen ? "block" : "none";
});

/* ---------- Method Selection ---------- */

$("method").addEventListener("change", () => {
  const method = $("method").value;

  $("aesFields").style.display = method === "aes" ? "block" : "none";
  $("pgpFields").style.display = method === "pgp" ? "block" : "none";
});

/* ---------- Image Load ---------- */

$("imageInput").addEventListener("change", e => {
  uiState.imageFile = e.target.files[0] || null;
});

/* ---------- PGP ---------- */

$("genKeys").addEventListener("click", async () => {
  const keys = await generatePGPKeypair();
  $("pgpPublic").value = keys.publicKey;
  $("pgpPrivate").value = keys.privateKey;
});

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

$("downloadPub").addEventListener("click", () => {
  downloadText("steggy_public.asc", $("pgpPublic").value);
});

$("downloadPriv").addEventListener("click", () => {
  downloadText("steggy_private.asc", $("pgpPrivate").value);
});

/* ---------- Run ---------- */

$("run").addEventListener("click", async () => {
  if (!uiState.imageFile) {
    alert("Please select an image.");
    return;
  }

  const img = new Image();
  img.src = URL.createObjectURL(uiState.imageFile);
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  let imageData = ctx.getImageData(0, 0, img.width, img.height);

  try {
    if ($("mode").value === "encrypt") {
      const result = await encryptImageData(
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

      const outImg = document.createElement("img");
      outImg.src = canvas.toDataURL("image/png");

      const dl = document.createElement("a");
      dl.href = outImg.src;
      dl.download = "steggy.png";
      dl.textContent = "Download image";

      $("output").innerHTML = "";
      $("output").append(outImg, dl);
    }

    if ($("mode").value === "decrypt") {
      const msg = await decryptImageData(imageData, {
        password: $("aesPassword").value,
        pgpPrivateKey: $("pgpPrivate").value,
        pgpPassphrase: $("pgpPass").value
      });

      $("output").textContent = msg;
    }

  } catch (err) {
    alert(err.message);
  }
});
