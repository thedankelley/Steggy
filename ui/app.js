import { generatePGPKeyPair, encryptPGP } from "../modules/steggy-pgp.js";

document.addEventListener("DOMContentLoaded", () => {

  // -------- Elements --------
  const modeSelect = document.getElementById("modeSelect");
  const fileInput = document.getElementById("fileInput");
  const fileLabel = document.getElementById("fileLabel");

  const cryptoSelect = document.getElementById("cryptoSelect");
  const pgpOptions = document.getElementById("pgpOptions");

  const generatePGPBtn = document.getElementById("generatePGPBtn");
  const downloadPubKeyBtn = document.getElementById("downloadPubKeyBtn");
  const downloadPrivKeyBtn = document.getElementById("downloadPrivKeyBtn");
  const encryptWithPGPBtn = document.getElementById("encryptWithPGPBtn");

  const pubKeyField = document.getElementById("pgpPublicKey");
  const privKeyField = document.getElementById("pgpPrivateKey");
  const payloadInput = document.getElementById("payloadInput");

  const advancedToggle = document.getElementById("advancedToggle");
  const advancedPanel = document.getElementById("advancedPanel");

  const enableDecoy = document.getElementById("enableDecoy");
  const decoyPayload = document.getElementById("decoyPayload");

  const enableFragmentation = document.getElementById("enableFragmentation");
  const fragmentCount = document.getElementById("fragmentCount");

  const guideBtn = document.getElementById("guideBtn");
  const guideModal = document.getElementById("guideModal");
  const closeGuideBtn = document.getElementById("closeGuideBtn");

  // -------- Helpers --------
  const show = el => el.classList.remove("hidden");
  const hide = el => el.classList.add("hidden");

  // -------- Mode Logic --------
  modeSelect.addEventListener("change", () => {
    if (modeSelect.value === "sstv-decode") {
      fileLabel.textContent = "Select WAV";
      fileInput.accept = ".wav";
    } else {
      fileLabel.textContent = "Select Image";
      fileInput.accept = "image/*";
    }
  });

  // -------- Crypto Logic --------
  cryptoSelect.addEventListener("change", () => {
    if (cryptoSelect.value === "pgp" || cryptoSelect.value === "pgp+a") {
      show(pgpOptions);
    } else {
      hide(pgpOptions);
    }
  });

  // -------- PGP --------
  generatePGPBtn.onclick = async () => {
    const { publicKey, privateKey } = await generatePGPKeyPair();
    pubKeyField.value = publicKey;
    privKeyField.value = privateKey;
  };

  downloadPubKeyBtn.onclick = () => download("public.key", pubKeyField.value);
  downloadPrivKeyBtn.onclick = () => download("private.key", privKeyField.value);

  encryptWithPGPBtn.onclick = async () => {
    payloadInput.value = await encryptPGP(payloadInput.value, pubKeyField.value);
  };

  // -------- Advanced --------
  advancedToggle.onclick = () => {
    advancedPanel.classList.toggle("hidden");
  };

  enableDecoy.onchange = () => {
    enableDecoy.checked ? show(decoyPayload) : hide(decoyPayload);
  };

  enableFragmentation.onchange = () => {
    enableFragmentation.checked ? show(fragmentCount) : hide(fragmentCount);
  };

  // -------- Guide --------
  guideBtn.onclick = () => show(guideModal);
  closeGuideBtn.onclick = () => hide(guideModal);

  // -------- Utils --------
  function download(name, content) {
    if (!content) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content]));
    a.download = name;
    a.click();
  }
});
