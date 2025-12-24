import { generatePGPKeyPair } from "../modules/steggy-pgp.js";

document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // ELEMENT REFERENCES
  // =========================
  const cryptoSelect = document.getElementById("cryptoSelect");
  const pgpContainer = document.getElementById("pgpOptions");
  const advancedBtn = document.getElementById("advancedToggle");
  const advancedPanel = document.getElementById("advancedPanel");

  const generatePGPBtn = document.getElementById("generatePGPBtn");
  const downloadPubBtn = document.getElementById("downloadPubKeyBtn");
  const downloadPrivBtn = document.getElementById("downloadPrivKeyBtn");

  const pubKeyField = document.getElementById("pgpPublicKey");
  const privKeyField = document.getElementById("pgpPrivateKey");

  // =========================
  // VISIBILITY HELPERS
  // =========================
  function hide(el) {
    if (el) el.style.display = "none";
  }

  function show(el) {
    if (el) el.style.display = "block";
  }

  // =========================
  // INITIAL STATE
  // =========================
  hide(pgpContainer);
  hide(advancedPanel);

  // =========================
  // CRYPTO MODE TOGGLING
  // =========================
  cryptoSelect.addEventListener("change", () => {
    const mode = cryptoSelect.value;

    if (mode === "pgp" || mode === "pgp+a") {
      show(pgpContainer);
    } else {
      hide(pgpContainer);
    }
  });

  // =========================
  // ADVANCED OPTIONS TOGGLE
  // =========================
  advancedBtn.addEventListener("click", () => {
    const isVisible = advancedPanel.style.display === "block";
    advancedPanel.style.display = isVisible ? "none" : "block";
  });

  // =========================
  // PGP KEY GENERATION
  // =========================
  generatePGPBtn.addEventListener("click", async () => {
    try {
      const { publicKey, privateKey } = await generatePGPKeyPair();
      pubKeyField.value = publicKey;
      privKeyField.value = privateKey;
      alert("PGP keys generated successfully.");
    } catch (err) {
      alert("PGP generation failed.");
      console.error(err);
    }
  });

  // =========================
  // DOWNLOAD HELPERS
  // =========================
  function download(filename, content) {
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  downloadPubBtn.addEventListener("click", () => {
    if (!pubKeyField.value) {
      alert("No public key to download.");
      return;
    }
    download("public.key", pubKeyField.value);
  });

  downloadPrivBtn.addEventListener("click", () => {
    if (!privKeyField.value) {
      alert("No private key to download.");
      return;
    }
    download("private.key", privKeyField.value);
  });
});
