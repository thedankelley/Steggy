import { embedMessage, extractMessage } from "../core/steggy-core.js";
import { fragmentPayload, reassembleFragments } from "../modules/steggy-fragment.js";
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

const fragmentationToggle = document.createElement("input");
fragmentationToggle.type = "checkbox";
fragmentationToggle.id = "fragmentToggle";

const fragmentCountInput = document.createElement("input");
fragmentCountInput.type = "number";
fragmentCountInput.min = 2;
fragmentCountInput.value = 2;
fragmentCountInput.id = "fragmentCount";

advancedSection.appendChild(document.createElement("hr"));
advancedSection.appendChild(labelWrap("Enable Fragmentation", fragmentationToggle));
advancedSection.appendChild(labelWrap("Fragments per message", fragmentCountInput));

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

$("downloadPublic").onclick = () => download("public.asc", $("pgpPublic").value);
$("downloadPrivate").onclick = () => download("private.asc", $("pgpPrivate").value);

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

  $("imageInput").multiple = modeSelect.value === "decrypt";
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
    let payload = $("protectedMessage").value;

    if (fragmentationToggle.checked) {
      const fragments = fragmentPayload(payload, {
        parts: Number(fragmentCountInput.value)
      });

      for (const fragment of fragments) {
        const result = await embedMessage(img, {
          protected: fragment,
          decoy: $("decoyMessage").value,
          encryption: encryptionMode.value
        });
        outputImage.appendChild(result.canvas);
      }

      statusBox.textContent = "Fragmented images generated";
      return;
    }

    const result = await embedMessage(img, {
      protected: payload,
      decoy: $("decoyMessage").value,
      encryption: encryptionMode.value
    });

    outputImage.appendChild(result.canvas);
    statusBox.textContent = "Image generated";

  } else if (modeSelect.value === "decrypt") {
    const files = Array.from($("imageInput").files);
    const fragments = [];

    for (const file of files) {
      const extracted = await extractMessage(file);
      fragments.push(extracted.protected);
    }

    let message = fragments.length > 1
      ? reassembleFragments(fragments)
      : fragments[0];

    if (encryptionMode.value !== "aes") {
      message = await decryptPGP(message, $("pgpPrivate").value);
    }

    $("protectedMessage").value = message;
    statusBox.textContent = "Message reassembled";

  } else if (modeSelect.value === "sstv-decode") {
    const wav = $("sstvWavInput").files[0];
    const buf = await wav.arrayBuffer();
    const canvas = await decodeSSTVFromWav(buf);
    outputImage.appendChild(canvas);
    statusBox.textContent = "SSTV decoded from WAV";
  }
};

function labelWrap(text, el) {
  const label = document.createElement("label");
  label.style.display = "block";
  label.textContent = text;
  label.appendChild(el);
  return label;
}
