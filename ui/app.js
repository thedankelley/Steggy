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

function wireUI() {

  $("sstvSection").style.display = "none";
  $("pgpFields").style.display = "none";
  $("aesFields").style.display = "block";

  /* ----- Advanced ----- */
  let adv = false;
  $("toggleAdvanced").onclick = () => {
    adv = !adv;
    $("advanced").style.display = adv ? "block" : "none";
  };

  /* ----- Mode ----- */
  $("mode").onchange = () => {
    const m = $("mode").value;
    $("sstvSection").style.display = m === "sstv-decode" ? "block" : "none";
    $("imageInput").style.display = m === "sstv-decode" ? "none" : "block";
  };

  /* ----- Method ----- */
  $("method").onchange = () => {
    const m = $("method").value;
    $("aesFields").style.display = (m === "aes" || m === "both") ? "block" : "none";
    $("pgpFields").style.display = (m === "pgp" || m === "both") ? "block" : "none";
  };

  /* ----- File Inputs ----- */
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

  /* ----- PGP Actions ----- */
  $("genKeys").onclick = async () => {
    const keys = await pgp.generatePGPKeypair();
    $("pgpPublic").value = keys.publicKey;
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

  $("downloadPub").onclick = () => download("public.asc", $("pgpPublic").value);
  $("downloadPriv").onclick = () => download("private.asc", $("pgpPrivate").value);

  /* ----- Run ----- */
  $("run").onclick = async () => {
    $("output").innerHTML = "";

    try {
      if ($("mode").value === "sstv-decode") {
        const img = await sstv.decodeSSTV(sstvFile);
        $("output").appendChild(img);
        return;
      }

      if (!imageFile) throw new Error("No image selected");

      const img = new Image();
      img.src = URL.createObjectURL(imageFile);
      await img.decode();

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

        const out = document.createElement("img");
        out.src = canvas.toDataURL("image/png");
        $("output").appendChild(out);

        const a = document.createElement("a");
        a.href = out.src;
        a.download = "steggy.png";
        a.textContent = "Download image";
        $("output").appendChild(a);
        return;
      }

      if ($("mode").value === "decrypt") {
        const msg = await core.decryptImageData(data, {
          password: $("aesPassword").value,
          pgpPrivateKey: $("pgpPrivate").value,
          pgpPassphrase: $("pgpPass").value
        });
        $("output").textContent = msg;
      }

    } catch (e) {
      alert(e.message);
    }
  };
}

function download(name, text) {
  if (!text) return alert("Nothing to download");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text]));
  a.download = name;
  a.click();
}

init();
