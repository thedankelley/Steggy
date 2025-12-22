console.log("[Steggy] UI loading");

function $(id) {
  return document.getElementById(id);
}

document.addEventListener("DOMContentLoaded", async () => {

  // GUIDE
  $("guideBtn").onclick = () => $("guideModal").classList.remove("hidden");
  $("closeGuide").onclick = () => $("guideModal").classList.add("hidden");

  // ADVANCED
  $("advancedToggle").onclick = () =>
    $("advancedSection").classList.toggle("hidden");

  // MODE VISIBILITY
  function updateVisibility() {
    const mode = $("modeSelect").value;
    const enc = $("encryptionMode").value;

    $("advancedToggle").classList.toggle("hidden", mode !== "encrypt");
    $("sstvEncodeSection").classList.toggle("hidden", mode !== "encrypt");
    $("fragmentSection").classList.toggle("hidden", mode !== "encrypt");

    $("pgpSection").classList.toggle(
      "hidden",
      !(enc === "pgp" || enc === "pgp+aes")
    );
  }

  $("modeSelect").onchange = updateVisibility;
  $("encryptionMode").onchange = updateVisibility;
  updateVisibility();

  // PGP DOWNLOADS
  $("downloadPublicKey").onclick = () => {
    const blob = new Blob([$(`pgpPublic`).value], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "steggy_public.asc";
    a.click();
  };

  $("downloadPrivateKey").onclick = () => {
    const blob = new Blob([$(`pgpPrivate`).value], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "steggy_private.asc";
    a.click();
  };

});
