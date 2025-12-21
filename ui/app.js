import { embedMessage, extractMessage } from "../core/steggy-core.js";
import { generatePGPKeypair, encryptPGP, decryptPGP } from "../modules/steggy-pgp.js";
import { decodeSSTVFromWav } from "../modules/steggy-sstv-decode.js";
import { SSTVMicDecoder } from "../modules/steggy-sstv-mic.js";
import { hashData } from "../modules/steggy-hash.js";

document.addEventListener("DOMContentLoaded", () => {

  const $ = id => document.getElementById(id);

  const modeSelect = $("modeSelect");
  const advancedToggle = $("advancedToggle");
  const advancedSection = $("advancedSection");
  const encryptionMode = $("encryptionMode");
  const pgpSection = $("pgpSection");
  const statusBox = $("status");
  const output = $("output");

  /* ---------- GUIDE ---------- */

  $("guideBtn").onclick = () =>
    $("guideModal").classList.remove("hidden");

  $("closeGuide").onclick = () =>
    $("guideModal").classList.add("hidden");

  /* ---------- ADVANCED ---------- */

  advancedToggle.onclick = () =>
    advancedSection.classList.toggle("hidden");

  encryptionMode.onchange = () =>
    pgpSection.classList.toggle(
      "hidden",
      encryptionMode.value === "aes"
    );

  /* ---------- MODE SWITCH ---------- */

  function refreshModeUI() {
    const mode = modeSelect.value;

    $("sstvSection").classList.toggle("hidden", !mode.startsWith("sstv"));
    $("sstvEncodeControls").classList.toggle("hidden", mode !== "sstv-encode");
    $("sstvDecodeControls").classList.toggle("hidden", mode !== "sstv-decode");

    $("imageSection").classList.toggle("hidden", mode.startsWith("sstv"));
  }

  modeSelect.onchange = refreshModeUI;
  refreshModeUI();

  /* ---------- PGP ---------- */

  $("generatePGP").onclick = async () => {
    const keys = await generatePGPKeypair();
    $("pgpPublic").value = keys.publicKey;
    $("pgpPrivate").value = keys.privateKey;
  };

  $("downloadPublic").onclick = () =>
    download("public.asc", $("pgpPublic").value);

  $("downloadPrivate").onclick = () =>
    download("private.asc", $("pgpPrivate").value);

  $("encryptWithPGP").onclick = async () => {
    $("protectedMessage").value = await encryptPGP(
      $("protectedMessage").value,
      $("pgpPublic").value
    );
  };

  $("decryptWithPGP").onclick = async () => {
    $("protectedMessage").value = await decryptPGP(
      $("protectedMessage").value,
      $("pgpPrivate").value
    );
  };

  /* ---------- SSTV ---------- */

  const micDecoder = new SSTVMicDecoder(
    canvas => {
      output.innerHTML = "";
      output.appendChild(canvas);
      statusBox.textContent = "SSTV decoded from microphone";
    },
    msg => statusBox.textContent = msg
  );

  $("sstvMicStart").onclick = () => micDecoder.start();
  $("sstvMicStop").onclick = () => micDecoder.stop();

  /* ---------- RUN ---------- */

  $("runBtn").onclick = async () => {
    output.innerHTML = "";
    statusBox.textContent = "Processing…";

    const mode = modeSelect.value;

    if (mode === "encrypt") {
      const img = $("imageInput").files[0];

      const result = await embedMessage(img, {
        protected: $("protectedMessage").value,
        decoy: $("decoyMessage").value,
        encryption: encryptionMode.value
      });

      output.appendChild(result.canvas);
      await showHash(result.canvas);
      statusBox.textContent = "Image generated";
    }

    if (mode === "decrypt") {
      const img = $("imageInput").files[0];
      const extracted = await extractMessage(img);

      $("protectedMessage").value = extracted.protected;
      $("decoyMessage").value = extracted.decoy;

      statusBox.textContent = "Message extracted";
    }

    if (mode === "sstv-decode") {
      const wav = $("sstvWavInput").files[0];
      const buf = await wav.arrayBuffer();
      const canvas = await decodeSSTVFromWav(buf);

      output.appendChild(canvas);
      statusBox.textContent = "SSTV decoded from WAV";
    }
  };

  /* ---------- HELPERS ---------- */

  async function showHash(canvas) {
    canvas.toBlob(async blob => {
      const buf = await blob.arrayBuffer();
      $("hashes").textContent =
        "SHA-256: " + await hashData(buf);
    });
  }

  function download(name, data) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([data]));
    a.download = name;
    a.click();
  }
});
