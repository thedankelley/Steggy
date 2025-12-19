const $ = id => document.getElementById(id);

const ui = {
  imageFile: null,
  sstvFile: null,
  advancedOpen: false,
  core: null,
  pgp: null,
  sstv: null
};

/* ---------- UI INIT ---------- */

$("advanced").style.display = "none";
$("aesFields").style.display = "none";
$("pgpFields").style.display = "none";

$("toggleAdvanced").onclick = () => {
  ui.advancedOpen = !ui.advancedOpen;
  $("advanced").style.display = ui.advancedOpen ? "block" : "none";
};

$("method").onchange = () => {
  const m = $("method").value;
  $("aesFields").style.display = m === "aes" ? "block" : "none";
  $("pgpFields").style.display = m === "pgp" ? "block" : "none";
};

$("mode").onchange = () => {
  const m = $("mode").value;
  $("encryptSection").style.display = m === "encrypt" ? "block" : "none";
  $("sstvSection").style.display = m === "sstv-decode" ? "block" : "none";
  $("imageInput").style.display = m !== "sstv-decode" ? "block" : "none";
};

$("imageInput").onchange = e => ui.imageFile = e.target.files[0] || null;
$("sstvInput").onchange = e => ui.sstvFile = e.target.files[0] || null;

/* ---------- HASHING ---------- */

async function sha256(file) {
  const buf = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2,"0")).join("");
}

/* ---------- DOWNLOAD ---------- */

function downloadText(name, text) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text]));
  a.download = name;
  a.click();
}

/* ---------- MODULE LOAD ---------- */

(async () => {
  ui.core = await import("../core/steggy-core.js");
  ui.pgp = await import("../modules/steggy-pgp.js");
  ui.sstv = await import("../modules/steggy-sstv.js");
})();

/* ---------- RUN ---------- */

$("run").onclick = async () => {
  $("output").innerHTML = "";
  $("hashPanel").innerHTML = "";

  try {
    if ($("mode").value === "sstv-decode") {
      if (!ui.sstvFile) throw new Error("Select SSTV audio file");
      const img = await ui.sstv.decodeSSTV(ui.sstvFile);
      $("output").append(img);
      return;
    }

    if (!ui.imageFile) throw new Error("Select image");

    const inputHash = await sha256(ui.imageFile);
    $("hashPanel").innerHTML += `<div>Input SHA-256: ${inputHash}</div>`;

    const img = new Image();
    img.src = URL.createObjectURL(ui.imageFile);
    await img.decode();

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    let data = ctx.getImageData(0,0,canvas.width,canvas.height);

    if ($("mode").value === "encrypt") {
      data = await ui.core.encryptImageData(
        data,
        $("protectedMsg").value,
        $("decoyMsg").value,
        {
          method: $("method").value,
          password: $("aesPassword").value,
          pgpPublicKey: $("pgpPublic").value
        }
      );
      ctx.putImageData(data,0,0);
    }

    if ($("mode").value === "decrypt") {
      const msg = await ui.core.decryptImageData(data,{
        password: $("aesPassword").value,
        pgpPrivateKey: $("pgpPrivate").value,
        pgpPassphrase: $("pgpPass").value
      });
      $("output").textContent = msg;
      return;
    }

    const outImg = document.createElement("img");
    outImg.src = canvas.toDataURL("image/png");
    $("output").append(outImg);

    const outBlob = await (await fetch(outImg.src)).blob();
    const outHash = await sha256(outBlob);
    $("hashPanel").innerHTML += `<div>Output SHA-256: ${outHash}</div>`;

    const dl = document.createElement("a");
    dl.href = outImg.src;
    dl.download = "steggy.png";
    dl.textContent = "Download image";
    $("output").append(dl);

  } catch (e) {
    alert(e.message);
  }
};
