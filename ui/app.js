import { encrypt, decrypt } from "../core/steggy-core.js";
import { sha256 } from "../modules/steggy-hash.js";

const mode = document.getElementById("mode");

mode.onchange = () => {
  document.querySelectorAll("[data-mode]").forEach(s => {
    s.style.display = s.dataset.mode === mode.value ? "block" : "none";
  });
};

async function loadImage(file) {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();
  const c = new OffscreenCanvas(img.width, img.height);
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
}

document.getElementById("encryptBtn").onclick = async () => {
  const imgData = await loadImage(cover.files[0]);
  const out = await encrypt({
    imageData: imgData,
    payload: payload.value,
    options: { aesPassword: aes.value || null }
  });

  const c = document.createElement("canvas");
  c.width = out.width;
  c.height = out.height;
  c.getContext("2d").putImageData(out, 0, 0);

  c.toBlob(async b => {
    hash.textContent = await sha256(await b.arrayBuffer());
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = "stego.png";
    a.click();
  });
};

document.getElementById("decryptBtn").onclick = async () => {
  const imgData = await loadImage(stego.files[0]);
  const data = await decrypt({
    imageData: imgData,
    options: { aesPassword: aesDec.value || null }
  });
  output.textContent = new TextDecoder().decode(data);
};
