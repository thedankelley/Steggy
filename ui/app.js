// ui/app.js — HARDENED VERSION

console.log("[Steggy] app.js loading…");

function $(id) {
  const el = document.getElementById(id);
  if (!el) console.warn(`[Steggy] Missing element: #${id}`);
  return el;
}

// --- SAFE MODULE LOADING ---
let core = {};
let pgp = {};
let sstvDecode = {};

async function loadModules() {
  try {
    core = await import("../core/steggy-core.js");
    console.log("[Steggy] core loaded");
  } catch (e) {
    console.error("[Steggy] core failed", e);
  }

  try {
    pgp = await import("../modules/steggy-pgp.js");
    console.log("[Steggy] pgp loaded");
  } catch (e) {
    console.error("[Steggy] pgp failed", e);
  }

  try {
    sstvDecode = await import("../modules/steggy-sstv-decode.js");
    console.log("[Steggy] sstv decode loaded");
  } catch (e) {
    console.error("[Steggy] sstv decode failed", e);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[Steggy] DOM ready");

  await loadModules();

  // --- GUIDE ---
  $("guideBtn")?.addEventListener("click", () => {
    console.log("[Steggy] Guide open");
    $("guideModal")?.classList.remove("hidden");
  });

  $("closeGuide")?.addEventListener("click", () => {
    $("guideModal")?.classList.add("hidden");
  });

  // --- ADVANCED OPTIONS ---
  $("advancedToggle")?.addEventListener("click", () => {
    console.log("[Steggy] Advanced toggle");
    $("advancedSection")?.classList.toggle("hidden");
  });

  // --- ENCRYPTION MODE ---
  $("encryptionMode")?.addEventListener("change", e => {
    const mode = e.target.value;
    console.log("[Steggy] Encryption mode:", mode);
    $("pgpSection")?.classList.toggle("hidden", mode === "aes");
  });

  // --- PGP ---
  $("generatePGP")?.addEventListener("click", async () => {
    if (!pgp.generatePGPKeypair) {
      alert("PGP module not loaded");
      return;
    }

    const keys = await pgp.generatePGPKeypair();
    $("pgpPublic").value = keys.publicKey;
    $("pgpPrivate").value = keys.privateKey;
  });

  $("encryptWithPGP")?.addEventListener("click", async () => {
    $("protectedMessage").value =
      await pgp.encryptPGP(
        $("protectedMessage").value,
        $("pgpPublic").value
      );
  });

  $("decryptWithPGP")?.addEventListener("click", async () => {
    $("protectedMessage").value =
      await pgp.decryptPGP(
        $("protectedMessage").value,
        $("pgpPrivate").value
      );
  });

  // --- RUN ---
  $("runBtn")?.addEventListener("click", async () => {
    console.log("[Steggy] Run clicked");

    const mode = $("modeSelect")?.value;

    if (mode === "encrypt") {
      if (!core.embedMessage) {
        alert("Core not loaded");
        return;
      }

      const img = $("imageInput").files[0];
      const result = await core.embedMessage(img, {
        protected: $("protectedMessage").value,
        decoy: $("decoyMessage").value,
        encryption: $("encryptionMode").value
      });

      $("output").innerHTML = "";
      $("output").appendChild(result.canvas);
    }

    if (mode === "decrypt") {
      const img = $("imageInput").files[0];
      const extracted = await core.extractMessage(img);
      $("protectedMessage").value = extracted.protected;
      $("decoyMessage").value = extracted.decoy;
    }
  });

  console.log("[Steggy] UI wired successfully");
});
