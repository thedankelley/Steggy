import { encryptImageData, decryptImageData } from "../modules/steggy-core.js";
import { generatePGPKeyPair } from "../modules/steggy-pgp.js";
import { getAvailableSSTVModes, encodeImageToSSTV, samplesToWav } from "../modules/steggy-sstv.js";

const $ = id => document.getElementById(id);
let currentImageData = null;

document.addEventListener("DOMContentLoaded", () => {

const canvas = $("imageCanvas");
const ctx = canvas.getContext("2d");

$("toggleAdvanced").onclick = () => {
  $("advancedSection").classList.toggle("hidden");
};

$("modeSelect").onchange = () => {
  const encrypt = $("modeSelect").value === "encrypt";
  $("encryptSection").classList.toggle("hidden", !encrypt);
  $("decryptSection").classList.toggle("hidden", encrypt);
};

$("imageInput").onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.classList.remove("hidden");
    ctx.drawImage(img,0,0);
    currentImageData = ctx.getImageData(0,0,img.width,img.height);
  };
  img.src = URL.createObjectURL(file);
};

$("encryptBtn").onclick = async () => {
  if (!currentImageData) return alert("No image loaded");
  const img = await encryptImageData(
    currentImageData,
    $("protectedMessage").value,
    $("decoyMessage").value,
    {
      method: $("encryptionMethod").value,
      pgpPublicKey: $("pgpPublicKey").value
    }
  );
  ctx.putImageData(img,0,0);
  currentImageData = img;
  alert("Encryption complete");
};

$("decryptBtn").onclick = async () => {
  if (!currentImageData) return alert("No image loaded");
  const msg = await decryptImageData(currentImageData,{
    pgpPrivateKey:$("pgpPrivateKey").value,
    pgpPassphrase:$("pgpPassphrase").value
  });
  $("decryptOutput").textContent = msg;
};

$("generatePGPKeys").onclick = async () => {
  const { publicKey, privateKey } = await generatePGPKeyPair();
  $("pgpPublicKey").value = publicKey;
  $("pgpPrivateKey").value = privateKey;
};

function download(name,content){
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([content]));
  a.download=name;
  a.click();
}

$("downloadPGPPublic").onclick = () =>
  download("steggy_public.asc",$("pgpPublicKey").value);

$("downloadPGPPrivate").onclick = () =>
  download("steggy_private.asc",$("pgpPrivateKey").value);

const sstvSelect = $("sstvMode");
getAvailableSSTVModes().forEach(m=>{
  const o=document.createElement("option");
  o.value=m.id;
  o.textContent=m.name;
  sstvSelect.appendChild(o);
});

$("generateSSTV").onclick = () => {
  if (!currentImageData) return alert("No image loaded");
  const { samples, sampleRate } =
    encodeImageToSSTV(currentImageData,sstvSelect.value);
  const wav = samplesToWav(samples,sampleRate);
  download("steggy-sstv.wav",wav);
};

});
