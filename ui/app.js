import { generatePGPKeyPair } from "../modules/steggy-pgp.js";

// PGP elements
const pgpGenerateBtn = document.getElementById("pgp-generate");
const pgpPublicField = document.getElementById("pgp-public");
const pgpPrivateField = document.getElementById("pgp-private");
const downloadPubBtn = document.getElementById("pgp-download-public");
const downloadPrivBtn = document.getElementById("pgp-download-private");

// Generate keys
pgpGenerateBtn.onclick = async () => {
  pgpGenerateBtn.disabled = true;
  pgpGenerateBtn.textContent = "Generating…";

  try {
    const keys = await generatePGPKeyPair();

    pgpPublicField.value = keys.publicKey;
    pgpPrivateField.value = keys.privateKey;

  } catch (err) {
    alert(err.message || "PGP generation failed");
  } finally {
    pgpGenerateBtn.disabled = false;
    pgpGenerateBtn.textContent = "Generate Keys";
  }
};

// Download helper
function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// Download buttons
downloadPubBtn.onclick = () => {
  if (!pgpPublicField.value) {
    alert("No public key to download");
    return;
  }
  downloadText("steggy-public.key", pgpPublicField.value);
};

downloadPrivBtn.onclick = () => {
  if (!pgpPrivateField.value) {
    alert("No private key to download");
    return;
  }
  downloadText("steggy-private.key", pgpPrivateField.value);
};
