import { embedMessage, extractMessage } from "../core/steggy-core.js";
import { generatePGPKeypair, encryptPGP, decryptPGP } from "../modules/steggy-pgp.js";
import { decodeSSTVFromWav } from "../modules/steggy-sstv-decode.js";
import { SSTVMicDecoder } from "../modules/steggy-sstv-mic.js";
import { hashData } from "../modules/steggy-hash.js";

const $ = id => document.getElementById(id);

const modeSelect = $("modeSelect");
const advancedToggle = $("advancedToggle");
const advancedSection = $("advancedSection");
const encryptionMode = $("encryptionMode");
const pgpSection = $("pgpSection");
const runBtn = $("runBtn");
const statusBox = $("status");
const outputImage = $("outputImage");

advancedToggle.onclick = () => {
  advancedSection.classList.toggle("hidden");
};

encryptionMode.onchange = () => {
  pgpSection.classList.toggle(
    "hidden",
    encryptionMode.value === "aes"
  );
};

$("generatePGP").onclick = async () => {
  const { publicKey, privateKey } = await generatePGPKeypair();
  $("pgpPublic").value = publicKey;
  $("pgpPrivate").value = privateKey;
};

$("downloadPublic").onclick = () => {
  download("public.asc", $("pgpPublic").value);
};

$("downloadPrivate").onclick = () => {
  download("private.asc", $("pgpPrivate").value);
};

$("encryptWithPGP").onclick = async () => {
  const encrypted = await encryptPGP(
    $("protectedMessage").value,
    $("pgpPublic").value
  );
  $("protectedMessage").value = encrypted;
};

function download(name, data) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([data]));
  a.download = name;
  a.click();
}

modeSelect.onchange = () => {
  $("sstvSection").classList.toggle(
    "hidden",
    !modeSelect.value.startsWith("sstv")
  );
  $("sstvDecodeOptions").classList.toggle(
    "hidden",
    modeSelect.value !== "sstv-decode"
  );
};

const micDecoder = new SSTVMicDecoder(
  canvas => {
    outputImage.innerHTML = "";
    outputImage.appendChild(canvas);
    statusBox.textContent = "SSTV decoded from microphone";
  },
  msg => statusBox.textContent = msg
);

$("sstvMicStart").onclick = () => micDecoder.start();
$("sstvMicStop").onclick = () => micDecoder.stop();

runBtn.onclick = async () => {
  statusBox.textContent = "Processing…";
  outputImage.innerHTML = "";

  if (modeSelect.value === "encrypt") {
    const img = $("imageInput").files[0];
    const result = await embedMessage(img, {
      protected: $("protectedMessage").value,
      decoy: $("decoyMessage").value,
      encryption: encryptionMode.value
    });

    outputImage.appendChild(result.canvas);
    statusBox.textContent = "Image generated";

  } else if (modeSelect.value === "decrypt") {
    const img = $("imageInput").files[0];
    const extracted = await extractMessage(img);

    let msg = extracted.protected;
    if (encryptionMode.value !== "aes") {
      msg = await decryptPGP(msg, $("pgpPrivate").value);
    }

    $("protectedMessage").value = msg;
    $("decoyMessage").value = extracted.decoy;
    statusBox.textContent = "Message extracted";

  } else if (modeSelect.value === "sstv-decode") {
    const wav = $("sstvWavInput").files[0];
    const buf = await wav.arrayBuffer();
    const canvas = await decodeSSTVFromWav(buf);
    outputImage.appendChild(canvas);
    statusBox.textContent = "SSTV decoded from WAV";
  }
};
