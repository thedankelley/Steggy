import { encryptPayload, decryptPayload } from "./core/steggy-core.js";
import { embedInImage, extractFromImage } from "./modules/steggy-image.js";
import { encodeSSTV, decodeSSTV } from "./modules/steggy-sstv.js";

document.addEventListener("DOMContentLoaded", () => {
  const runBtn = document.getElementById("runBtn");

  runBtn.addEventListener("click", async () => {
    try {
      const mode = document.getElementById("modeSelect").value;
      const cryptoMode = document.getElementById("cryptoSelect").value;

      const payload = document.getElementById("payloadInput").value;
      const aesPassword = document.getElementById("aesPassword")?.value || "";

      const pgpPublicKey =
        document.getElementById("pgpPublicKey")?.value || "";
      const pgpPrivateKey =
        document.getElementById("pgpPrivateKey")?.value || "";

      const fileInput = document.getElementById("carrierFile");
      const file = fileInput?.files?.[0];

      if (!file && mode !== "decryptText") {
        alert("Please select a carrier file.");
        return;
      }

      // -------------------------
      // ENCRYPT MODES
      // -------------------------
      if (mode === "image-encrypt" || mode === "sstv-encrypt") {
        if (!payload) {
          alert("Payload is empty.");
          return;
        }

        const encryptedPayload = await encryptPayload({
          payload,
          cryptoMode,
          aesPassword,
          pgpPublicKey
        });

        if (mode === "image-encrypt") {
          await embedInImage(file, encryptedPayload);
        } else {
          await encodeSSTV(file, encryptedPayload);
        }
      }

      // -------------------------
      // DECRYPT MODES
      // -------------------------
      else if (mode === "image-decrypt" || mode === "sstv-decrypt") {
        let extracted;

        if (mode === "image-decrypt") {
          extracted = await extractFromImage(file);
        } else {
          extracted = await decodeSSTV(file);
        }

        const decrypted = await decryptPayload({
          encryptedPayload: extracted,
          cryptoMode,
          aesPassword,
          pgpPrivateKey
        });

        document.getElementById("outputField").value = decrypted;
      }

    } catch (err) {
      console.error(err);
      alert(err.message || "Operation failed.");
    }
  });
});
