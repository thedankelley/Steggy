// ---------- ELEMENTS ----------

const guideBtn = document.getElementById("guideBtn");
const guideModal = document.getElementById("guideModal");
const closeGuide = document.getElementById("closeGuide");

const advancedToggle = document.getElementById("advancedToggle");
const advancedPanel = document.getElementById("advancedPanel");

// ---------- GUIDE ----------

guideModal.classList.add("hidden");
guideModal.setAttribute("aria-hidden", "true");

guideBtn.addEventListener("click", () => {
  guideModal.classList.remove("hidden");
  guideModal.setAttribute("aria-hidden", "false");
});

closeGuide.addEventListener("click", () => {
  guideModal.classList.add("hidden");
  guideModal.setAttribute("aria-hidden", "true");
});

// ---------- ADVANCED OPTIONS ----------

advancedToggle.addEventListener("click", () => {
  advancedPanel.classList.toggle("hidden");
});

// ---------- RUN ----------

document.getElementById("runBtn").addEventListener("click", () => {
  const imageMode = document.getElementById("imageMode").value;
  const sstvMode = document.getElementById("sstvMode").value;
  const payload = document.getElementById("payload").value;

  const fragmentation = document.getElementById("enableFragmentation").checked;
  const decoy = document.getElementById("enableDecoy").checked;

  document.getElementById("output").textContent =
    `Image Mode: ${imageMode}
SSTV Mode: ${sstvMode}
Fragmentation: ${fragmentation}
Decoy: ${decoy}
Payload:
${payload}`;
});
