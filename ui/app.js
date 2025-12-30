import { runSteggy } from "../core/steggy-core.js";
import { generateKeypair } from "../modules/steggy-pgp.js";

// ---------- Guide ----------
const guideBtn = document.getElementById("guide-btn");
const guidePanel = document.getElementById("guide-panel");

guideBtn.addEventListener("click", () => {
  guidePanel.hidden = !guidePanel.hidden;
});

// ---------- PGP Visibility ----------
const encryptionSelect = document.getElementById("encryption");
const pgpSection = document.getElementById("pgp-section");

function updatePGPVisibility() {
  const val = encryptionSelect.value;
  const shouldShow = val === "pgp" || val === "both";

  if (shouldShow) {
    pgpSection.classList.add("active");
    pgpSection.setAttribute("aria-hidden", "false");
  } else {
    pgpSection.classList.remove("active");
    pgpSection.setAttribute("aria-hidden", "true");
  }
}

encryptionSelect.addEventListener("change", updatePGPVisibility);
updatePGPVisibility(); // initial state

// ---------- PGP Key Generation ----------
const generateBtn = document.getElementById("generate-pgp");
const pubField = document.getElementById("pgp-public");
const privField = document.getElementById("pgp-private");

generateBtn.addEventListener("click", async () => {
  try {
    const keys = await generateKeypair();
    pubField.value = keys.publicKey;
    privField.value = keys.privateKey;
  } catch (err) {
    alert("PGP key generation failed:\n" + err.message);
    console.error(err);
  }
});

// ---------- Run ----------
document.getElementById("run-btn").addEventListener("click", async () => {
  const file = document.getElementById("image-input").files[0];

  try {
    const result = await runSteggy(file, {
      mode: document.getElementById("mode").value,
      payload: document.getElementById("payload").value,
      encryption: encryptionSelect.value,
      pgp: {
        publicKey: pubField.value.trim(),
        privateKey: privField.value.trim()
      }
    });

    document.getElementById("output").textContent =
      JSON.stringify(result, null, 2);
  } catch (err) {
    document.getElementById("output").textContent =
      "Error: " + err.message;
  }
});
