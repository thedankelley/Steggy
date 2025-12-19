const $ = id => document.getElementById(id);

let core, pgp, sstv;

/* ---------- INIT ---------- */

async function init() {
  core = await import("../core/steggy-core.js");
  pgp  = await import("../modules/steggy-pgp.js");
  sstv = await import("../modules/steggy-sstv.js");

  wireUI();
}

function wireUI() {

  /* ----- Advanced toggle ----- */
  let advOpen = false;
  $("advanced").style.display = "none";

  $("toggleAdvanced").onclick = () => {
    advOpen = !advOpen;
    $("advanced").style.display = advOpen ? "block" : "none";
  };

  /* ----- Method selection ----- */
  $("method").onchange = () => {
    const m = $("method").value;
    $("aesFields").style.display = m === "aes" ? "block" : "none";
    $("pgpFields").style.display = m === "pgp" ? "block" : "none";
  };

  $("aesFields").style.display = "none";
  $("pgpFields").style.display = "none";

  /* ----- Mode switching ----- */
  $("mode").onchange = () => {
    const m = $("mode").value;

    $("encryptSection").style.display = m === "encrypt" ? "block" : "none";
    $("sstvSection").style.display   = m === "sstv-decode" ? "block" : "none";
    $("imageInput").style.display   = m !== "sstv-decode" ? "block" : "none";
  };

  /* ----- File inputs ----- */
  let imageFile = null;
  let sstvFile  = null;

  $("imageInput").onchange = e => imageFile = e.target.files[0] || null;
  $("sstvInput").onchange  = e => sstvFile  = e.target.files[0] || null;

  /* ----- PGP buttons ----- */
  $("genKeys").onclick = async () => {
    const keys = await pgp.generateKeyPair();
    $("pgpPublic").value  = keys.publicKey;
    $("pgpPrivate").value = keys.privateKey;
  };

  $("downloadPub").onclick = () => {
    if (!$("pgpPublic").value) return alert("No public key");
    download("public.asc", $("pgpPublic").value);
  };

  $("downloadPriv").onclick = () => {
    if (!$("pgpPrivate").value) return alert("No private key");
    download("private.asc", $("pgpPrivate").value);
  };

  /* ----- Run button ----- */
  $("run").onclick = async () => {
    $("output").innerHTML = "";

    try {
      /* SSTV decode */
      if ($("mode").value === "sstv-decode") {
        if (!sstvFile) throw new Error("Select SSTV audio");
        const img = await sstv.decodeSSTV(sstvFile);
        $("output").appendChild(img);
        return;
      }

      if (!imageFile) throw new Error("Select image");

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

      const out = document.createElement("img");
      out.src = canvas.toDataURL("image/png");
      $("output").appendChild(out);

      const a = document.createElement("a");
      a.href = out.src;
      a.download = "steggy.png";
      a.textContent = "Download image";
      $("output").appendChild(a);

    } catch (err) {
      alert(err.message);
    }
  };
}

/* ---------- UTIL ---------- */

function download(name, text) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text]));
  a.download = name;
  a.click();
}

/* ---------- START ---------- */

init();
