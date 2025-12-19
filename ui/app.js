const $ = id => document.getElementById(id);

const uiState = {
  advancedOpen: false,
  imageFile: null,
  cryptoReady: false,
  core: null,
  pgp: null
};

/* ---------- UI ALWAYS WIRES FIRST ---------- */

function initUI() {
  $("advanced").style.display = "none";
  $("aesFields").style.display = "none";
  $("pgpFields").style.display = "none";

  $("toggleAdvanced").addEventListener("click", () => {
    uiState.advancedOpen = !uiState.advancedOpen;
    $("advanced").style.display = uiState.advancedOpen ? "block" : "none";
  });

  $("method").addEventListener("change", () => {
    const m = $("method").value;
    $("aesFields").style.display = m === "aes" ? "block" : "none";
    $("pgpFields").style.display = m === "pgp" ? "block" : "none";
  });

  $("mode").addEventListener("change", () => {
    const m = $("mode").value;
    $("encryptSection").style.display = m === "encrypt" ? "block" : "none";
    $("decryptSection").style.display = m === "decrypt" ? "block" : "none";
  });

  $("imageInput").addEventListener("change", e => {
    uiState.imageFile = e.target.files[0] || null;
  });

  $("genKeys").addEventListener("click", async () => {
    if (!uiState.pgp) {
      alert("PGP module not loaded");
      return;
    }
    const keys = await uiState.pgp.generatePGPKeypair();
    $("pgpPublic").value = keys.publicKey;
    $("pgpPrivate").value = keys.privateKey;
  });

  $("downloadPub").addEventListener("click", () =>
    downloadText("steggy_public.asc", $("pgpPublic").value)
  );

  $("downloadPriv").addEventListener("click", () =>
    downloadText("steggy_private.asc", $("pgpPrivate").value)
  );

  $("run").addEventListener("click", runAction);
}

/* ---------- SAFE MODULE LOAD ---------- */

async function loadCrypto() {
  try {
    uiState.core = await import("../core/steggy-core.js");
    uiState.pgp = await import("../modules/steggy-pgp.js");
    uiState.cryptoReady = true;
    console.log("Steggy crypto loaded");
  } catch (err) {
    console.error(err);
    alert("Crypto modules failed to load. Check folder paths.");
  }
}

/* ---------- HELPERS ---------- */

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

/* ---------- RUN ---------- */

async function runAction() {
  if (!uiState.cryptoReady) {
    alert("Crypto system not ready yet.");
    return;
  }

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
      const out = await uiState.core.encryptImageData(
        imageData,
        $("protectedMsg").value,
        $("decoyMsg").value,
        {
          method: $("method").value,
          password: $("aesPassword").value,
          pgpPublicKey: $("pgpPublic").value
        }
      );

      ctx.putImageData(out, 0, 0);
      showImage(canvas);
    }

    if ($("mode").value === "decrypt") {
      const msg = await uiState.core.decryptImageData(imageData, {
        password: $("aesPassword").value,
        pgpPrivateKey: $("pgpPrivate").value,
        pgpPassphrase: $("pgpPass").value
      });
      $("output").textContent = msg;
    }
  } catch (e) {
    alert(e.message);
  }
}

function showImage(canvas) {
  const img = document.createElement("img");
  img.src = canvas.toDataURL("image/png");

  const dl = document.createElement("a");
  dl.href = img.src;
  dl.download = "steggy.png";
  dl.textContent = "Download image";

  $("output").innerHTML = "";
  $("output").append(img, dl);
}

/* ---------- BOOT ---------- */

initUI();
loadCrypto();
