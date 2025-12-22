// ui/app.js — Steggy 2.0 Stable UI Wiring

console.log("[Steggy] app.js loading");

function $(id) {
  const el = document.getElementById(id);
  if (!el) console.warn(`[Steggy] Missing element: ${id}`);
  return el;
}

let core = {};
let pgp = {};
let fragment = {};
let sstv = {};
let sstvDecode = {};

async function loadModules() {
  try { core = await import("../core/steggy-core.js"); } catch (e) { console.error(e); }
  try { pgp = await import("../modules/steggy-pgp.js"); } catch (e) { console.error(e); }
  try { fragment = await import("../modules/steggy-fragment.js"); } catch (e) { console.error(e); }
  try { sstv = await import("../modules/steggy-sstv.js"); } catch (e) { console.error(e); }
  try { sstvDecode = await import("../modules/steggy-sstv-decode.js"); } catch (e) { console.error(e); }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadModules();
  console.log("[Steggy] Modules loaded");

  // --- GUIDE ---
  $("guideBtn")?.addEventListener("click", () =>
    $("guideModal")?.classList.remove("hidden")
  );
  $("closeGuide")?.addEventListener("click", () =>
    $("guideModal")?.classList.add("hidden")
  );

  // --- ADVANCED OPTIONS ---
  $("advancedToggle")?.addEventListener("click", () =>
    $("advancedSection")?.classList.toggle("hidden")
  );

  // --- MODE SWITCH ---
  $("modeSelect")?.addEventListener("change", updateVisibility);
  $("encryptionMode")?.addEventListener("change", updateVisibility);
  $("encoderSelect")?.addEventListener("change", updateVisibility);

  function updateVisibility() {
    const mode = $("modeSelect").value;
    const enc = $("encryptionMode").value;
    const encoder = $("encoderSelect")?.value;

    $("advancedToggle").classList.toggle("hidden", mode !== "encrypt");

    $("pgpSection")?.classList.toggle(
      "hidden",
      !(enc === "pgp" || enc === "pgp+aes")
    );

    $("fragmentSection")?.classList.toggle(
      "hidden",
      mode !== "encrypt"
    );

    $("sstvEncodeSection")?.classList.toggle(
      "hidden",
      mode !== "encrypt" || encoder !== "sstv"
    );

    $("sstvDecodeSection")?.classList.toggle(
      "hidden",
      mode !== "decrypt"
    );
  }

  updateVisibility();

  // --- PGP ---
  $("generatePGP")?.addEventListener("click", async () => {
    const keys = await pgp.generatePGPKeypair();
    $("pgpPublic").value = keys.publicKey;
    $("pgpPrivate").value = keys.privateKey;
  });

  $("encryptWithPGP")?.addEventListener("click", async () => {
    $("protectedMessage").value = await pgp.encryptPGP(
      $("protectedMessage").value,
      $("pgpPublic").value
    );
  });

  $("decryptWithPGP")?.addEventListener("click", async () => {
    $("protectedMessage").value = await pgp.decryptPGP(
      $("protectedMessage").value,
      $("pgpPrivate").value
    );
  });

  // --- RUN ---
  $("runBtn")?.addEventListener("click", async () => {
    const mode = $("modeSelect").value;

    if (mode === "encrypt") {
      const img = $("imageInput").files[0];
      if (!img) return alert("Select an image");

      let payload = {
        protected: $("protectedMessage").value,
        decoy: $("decoyMessage").value,
        encryption: $("encryptionMode").value
      };

      // Fragmentation
      if ($("fragmentCount")?.value > 1) {
        payload = fragment.fragmentPayload(
          payload,
          parseInt($("fragmentCount").value, 10)
        );
      }

      const result = await core.embedMessage(img, payload);
      $("output").innerHTML = "";
      $("output").appendChild(result.canvas);

      // SSTV encode
      if ($("encoderSelect")?.value === "sstv") {
        const wav = await sstv.encodeImageToWav(result.canvas);
        const a = document.createElement("a");
        a.href = URL.createObjectURL(wav);
        a.download = "steggy_sstv.wav";
        a.click();
      }
    }

    if (mode === "decrypt") {
      const files = [...$("imageInput").files];
      if (!files.length) return alert("Select image(s)");

      let extracted = await core.extractMessage(files);

      if (extracted.fragmented) {
        extracted = fragment.reassemblePayload(extracted);
      }

      $("protectedMessage").value = extracted.protected || "";
      $("decoyMessage").value = extracted.decoy || "";
    }
  });

  console.log("[Steggy] UI ready");
});
