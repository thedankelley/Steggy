import * as core from "../core/steggy-core.js";

const $ = id => document.getElementById(id);

const modeSelect = $("modeSelect");
const advancedToggle = $("advancedToggle");
const advancedPanel = $("advancedPanel");
const cryptoMode = $("cryptoMode");
const aesSection = $("aesSection");
const pgpSection = $("pgpSection");
const sstvSection = $("sstvSection");

advancedToggle.onclick = () => {
  advancedPanel.classList.toggle("hidden");
};

cryptoMode.onchange = () => {
  aesSection.classList.toggle("hidden",
    !["aes","both"].includes(cryptoMode.value));
  pgpSection.classList.toggle("hidden",
    !["pgp","both"].includes(cryptoMode.value));
};

modeSelect.onchange = () => {
  sstvSection.classList.toggle("hidden",
    modeSelect.value !== "decrypt");
};

$("pgpGenerate").onclick = async () => {
  const keys = await core.generatePGPKeys();
  $("pgpPublic").value = keys.publicKey;
  $("pgpPrivate").value = keys.privateKey;
};

$("pgpEncryptPayload").onclick = async () => {
  const encrypted = await core.encryptWithPGP(
    $("payloadInput").value,
    $("pgpPublic").value
  );
  $("payloadInput").value = encrypted;
};

$("downloadPublic").onclick = () =>
  download("public.asc", $("pgpPublic").value);

$("downloadPrivate").onclick = () =>
  download("private.asc", $("pgpPrivate").value);

$("runBtn").onclick = async () => {
  try {
    const result = await core.encrypt({
      payload: $("payloadInput").value,
      decoy: $("decoyInput").value,
      pgp: ["pgp","both"].includes(cryptoMode.value)
        ? { publicKey: $("pgpPublic").value }
        : null,
      aes: ["aes","both"].includes(cryptoMode.value)
        ? { password: $("aesPassword").value }
        : null,
      fragment: $("fragmentMode").value === "auto"
    });

    $("outputSection").classList.remove("hidden");
    $("outputText").textContent = result;
  } catch (e) {
    alert(e.message);
  }
};

function download(name, data) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([data]));
  a.download = name;
  a.click();
}
