document.addEventListener("DOMContentLoaded", () => {

  const $ = id => document.getElementById(id);

  const guide = $("guideModal");

  $("guideBtn").onclick = () => guide.style.display = "block";
  $("closeGuide").onclick = () => guide.style.display = "none";

  $("advancedBtn").onclick = () => {
    const panel = $("advancedPanel");
    panel.style.display = panel.style.display === "none" ? "block" : "none";
  };

  $("pgpGenerate").onclick = async () => {
    if (!window.SteggyPGP) {
      alert("PGP module not loaded");
      return;
    }
    const keys = await window.SteggyPGP.generate();
    $("pgpPublic").value = keys.publicKey;
    $("pgpPrivate").value = keys.privateKey;
  };

  $("pgpEncrypt").onclick = async () => {
    const msg = $("payloadInput").value;
    const pub = $("pgpPublic").value;
    $("payloadInput").value = await window.SteggyPGP.encrypt(msg, pub);
  };

  $("pgpDecrypt").onclick = async () => {
    const msg = $("payloadInput").value;
    const priv = $("pgpPrivate").value;
    $("payloadInput").value = await window.SteggyPGP.decrypt(msg, priv);
  };

  $("runBtn").onclick = async () => {
    $("outputText").textContent = "Processing...";
    // Placeholder run hook
    $("outputText").textContent = "Run executed. Core wiring next.";
  };

});
