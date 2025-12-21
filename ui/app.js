import { embedMessage, extractMessage } from "../core/steggy-core.js";
import { fragmentPayload, reassembleFragments } from "../modules/steggy-fragment.js";
import { generatePGPKeypair, encryptPGP, decryptPGP } from "../modules/steggy-pgp.js";
import { hashData } from "../modules/steggy-hash.js";

const $ = id => document.getElementById(id);

$("guideBtn").onclick = () => $("guideModal").classList.remove("hidden");
$("closeGuide").onclick = () => $("guideModal").classList.add("hidden");

$("advancedToggle").onclick = () =>
  $("advancedSection").classList.toggle("hidden");

$("encryptionMode").onchange = () =>
  $("pgpSection").classList.toggle("hidden",
    $("encryptionMode").value === "aes"
  );

$("generatePGP").onclick = async () => {
  const keys = await generatePGPKeypair();
  $("pgpPublic").value = keys.publicKey;
  $("pgpPrivate").value = keys.privateKey;
};

$("downloadPublic").onclick = () => download("public.asc", $("pgpPublic").value);
$("downloadPrivate").onclick = () => download("private.asc", $("pgpPrivate").value);

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

$("runBtn").onclick = async () => {
  const mode = $("modeSelect").value;
  const img = $("imageInput").files[0];
  $("output").innerHTML = "";

  if (mode === "encrypt") {
    const result = await embedMessage(img, {
      protected: $("protectedMessage").value,
      decoy: $("decoyMessage").value,
      encryption: $("encryptionMode").value
    });

    $("output").appendChild(result.canvas);
    showHash(result.canvas);
  }

  if (mode === "decrypt") {
    const extracted = await extractMessage(img);
    $("protectedMessage").value = extracted.protected;
    $("decoyMessage").value = extracted.decoy;
  }
};

function showHash(canvas) {
  canvas.toBlob(async blob => {
    const buf = await blob.arrayBuffer();
    $("hashes").textContent = "SHA-256: " + await hashData(buf);
  });
}

function download(name, data) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([data]));
  a.download = name;
  a.click();
}
