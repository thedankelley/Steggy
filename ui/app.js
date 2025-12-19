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

  $("advanced").style.display = "none";
  let adv = false;

  $("toggleAdvanced").onclick = () => {
    adv = !adv;
    $("advanced").style.display = adv ? "block" : "none";
  };

  $("method").onchange = () => {
    $("aesFields").style.display = $("method").value === "aes" ? "block" : "none";
    $("pgpFields").style.display = $("method").value === "pgp" ? "block" : "none";
  };

  $("mode").onchange = () => {
    const m = $("mode").value;
    $("sstvSection").style.display = m === "sstv-decode" ? "block" : "none";
    $("imageInput").style.display = m === "sstv-decode" ? "none" : "block";
  };

  $("imageInput").onchange = e => imageFile = e.target.files[0] || null;

  $("sstvInput").onchange = e => {
    const f = e.target.files[0];
    if (!f || !f.type.includes("wav")) {
      alert("Please select a WAV file");
      e.target.value = "";
      return;
    }
    sstvFile = f;
  };

  $("genKeys").onclick = async () => {
    try {
      const keys = await pgp.generatePGPKeypair();
      $("pgpPublic").value  = keys.publicKey;
      $("pgpPrivate").value = keys.privateKey;
    } catch (e) {
      alert("PGP generation failed: " + e.message);
    }
  };

  $("downloadPub").onclick = () => download("public.asc", $("pgpPublic").value);
  $("downloadPriv").onclick = () => download("private.asc", $("pgpPrivate").value);

  $("run").onclick = async () => {
    $("output").innerHTML = "";

    try {
      if ($("mode").value === "sstv-decode") {
        if (!sstvFile) throw new Error("No SSTV file");
        const img = await sstv.decodeSSTV(sstvFile);
        $("output").appendChild(img);
        return;
      }

      if (!imageFile) throw new Error("No image");

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
        data = await core.encryptImageData(data,
          $("protectedMsg").value,
          $("decoyMsg").value,
          {
            method: $("method").value,
            password: $("aesPassword").value,
            pgpPublicKey: $("pgpPublic").value
          });
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

function download(name, text) {
  if (!text) return alert("Nothing to download");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text]));
  a.download = name;
  a.click();
}

init();
