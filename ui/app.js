import { runSteggy } from "../core/steggy-core.js";
import { generateKeypair } from "../modules/steggy-pgp.js";

const guideBtn = document.getElementById("guide-btn");
const guidePanel = document.getElementById("guide-panel");

guideBtn.addEventListener("click", () => {
  guidePanel.hidden = !guidePanel.hidden;
});

const generateBtn = document.getElementById("generate-pgp");
const pubField = document.getElementById("pgp-public");
const privField = document.getElementById("pgp-private");

generateBtn.addEventListener("click", async () => {
  try {
    const keys = await generateKeypair();
    pubField.value = keys.publicKey;
    privField.value = keys.privateKey;
  } catch (err) {
    alert("PGP key generation failed: " + err.message);
  }
});

document.getElementById("run-btn").addEventListener("click", async () => {
  const mode = document.getElementById("mode").value;
  const encryption = document.getElementById("encryption").value;
  const payload = document.getElementById("payload").value;

  const fileInput = document.getElementById("image-input");
  const file = fileInput.files[0];

  const pgp = {
    publicKey: pubField.value.trim(),
    privateKey: privField.value.trim()
  };

  try {
    const result = await runSteggy(file, {
      mode,
      payload,
      encryption,
      pgp
    });

    document.getElementById("output").textContent =
      JSON.stringify(result, null, 2);
  } catch (err) {
    document.getElementById("output").textContent =
      "Error: " + err.message;
  }
});
