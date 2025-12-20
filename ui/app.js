const $ = id => document.getElementById(id);

let core, pgp, sstv;
let imageFile = null;
let sstvFile = null;

async function init() {
  core = await import("../core/steggy-core.js");
  pgp  = await import("../modules/steggy-pgp.js");
  sstv = await import("../modules/steggy-sstv.js");
  wireUI();
}

/* ================= UI WIRING ================= */

function wireUI() {

  /* Initial state */
  $("sstvSection").style.display = "none";
  $("pgpFields").style.display = "none";
  $("aesFields").style.display = "block";
  $("advanced").style.display = "none";

  /* ---------- Advanced ---------- */
  let adv = false;
  $("toggleAdvanced").onclick = () => {
    adv = !adv;
    $("advanced").style.display = adv ? "block" : "none";
  };

  /* ---------- Mode ---------- */
  $("mode").onchange = () => {
    const m = $("mode").value;
    $("sstvSection").style.display = m === "sstv-decode" ? "block" : "none";
    $("imageInput").style.display = m === "sstv-decode" ? "none" : "block";
  };

  /* ---------- Method ---------- */
  $("method").onchange = () => {
    const m = $("method").value;
    $("aesFields").style.display = (m === "aes" || m === "both") ? "block" : "none";
    $("pgpFields").style.display = (m === "pgp" || m === "both") ? "block" : "none";
  };

  /* ---------- File Inputs ---------- */
  $("imageInput").onchange = e => imageFile = e.target.files[0] || null;

  $("sstvInput").onchange = e => {
    const f = e.target.files[0];
    if (!f || !f.type.includes("wav")) {
      alert("Select a WAV file");
      e.target.value = "";
      return;
    }
    sstvFile = f;
  };

  $("pgpPrivateUpload").onchange = async e => {
    const f = e.target.files[0];
    if (!f) return;
    $("pgpPrivate").value = await f.text();
  };

  /* ---------- PGP ---------- */
  $("genKeys").onclick = async () => {
    const keys = await pgp.generatePGPKeypair();
    $("pgpPublic").value  = keys.publicKey;
    $("pgpPrivate").value = keys.privateKey;
  };

  $("pgpEncryptBtn").onclick = async () => {
    if (!$("pgpPublic").value) return alert("Public key required");
    const encrypted = await pgp.pgpEncrypt(
      $("protectedMsg").value,
      $("pgpPublic").value
    );
    $("protectedMsg").value = encrypted;
  };

  $("downloadPub").onclick  = () => download("public.asc",  $("pgpPublic").value);
  $("downloadPriv").onclick = () => download("private.asc", $("pgpPrivate").value);

  /* ---------- Run ---------- */
  $("run").onclick = async () => {
    $("output").innerHTML = "";
    $("hashes").innerHTML = "";

    try {
      /* ===== SSTV DECODE ===== */
      if ($("mode").value === "sstv-decode") {
        const img = await sstv.decodeSSTV(sstvFile);
        $("output").appendChild(img);
        return;
      }

      /* ===== SSTV ENCODE ===== */
      if ($("mode").value === "sstv-encode") {
        if (!imageFile) throw new Error("Select image");
        const img = await loadImage(imageFile);
        const wav = await sstv.encodeSSTV(img);
        downloadBlob("steggy-sstv.wav", wav);
        return;
      }

      /* ===== IMAGE STEGO ===== */
      if (!imageFile) throw new Error("Select image");

      const inputHash = await sha256File(imageFile);

      const img = await loadImage(imageFile);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      let data = ctx.getImageData(0, 0, canvas.width, canvas.height);

      if ($("mode").value === "encrypt") {
        data = await core.encryptImageData(
          data,
          $("protectedMsg").value,
          $("decoyMsg").value,
          {
            method: $("method").value,
            password: $("aesPassword").value,
            pgpPublicKey: $("pgpPublic").value
          }
        );
        ctx.putImageData(data, 0, 0);
      }

      if ($("mode").value === "decrypt") {
        const msg = await core.decryptImageData(data, {
          password: $("aesPassword").value,
          pgpPrivateKey: $("pgpPrivate").value,
          pgpPassphrase: $("pgpPass").value
        });
        $("output").textContent = msg;
        return;
      }

      const outDataUrl = canvas.toDataURL("image/png");
      const outBlob = await (await fetch(outDataUrl)).blob();
      const outHash = await sha256Blob(outBlob);

      const outImg = document.createElement("img");
      outImg.src = outDataUrl;
      $("output").appendChild(outImg);

      downloadBlob("steggy.png", outBlob);

      showHashes(inputHash, outHash);

    } catch (e) {
      alert(e.message);
    }
  };
}

/* ================= UTILITIES ================= */

async function loadImage(file) {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();
  return img;
}

function download(name, text) {
  if (!text) return alert("Nothing to download");
  downloadBlob(name, new Blob([text]));
}

function downloadBlob(name, blob) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
}

async function sha256File(file) {
  return sha256ArrayBuffer(await file.arrayBuffer());
}

async function sha256Blob(blob) {
  return sha256ArrayBuffer(await blob.arrayBuffer());
}

async function sha256ArrayBuffer(buf) {
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(hash)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function showHashes(input, output) {
  $("hashes").innerHTML = `
    <p><strong>Input Image SHA-256</strong><br>${input}</p>
    <p><strong>Output Image SHA-256</strong><br>${output}</p>
  `;
}

/* ================= START ================= */

init();
