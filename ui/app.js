document.addEventListener("DOMContentLoaded", () => {

  const $ = id => document.getElementById(id);

  const advancedToggle = $("advancedToggle");
  const advancedPanel = $("advancedPanel");

  advancedToggle.addEventListener("click", () => {
    advancedPanel.classList.toggle("hidden");
  });

  const guideModal = $("guideModal");

  $("guideButton").addEventListener("click", () => {
    guideModal.classList.remove("hidden");
  });

  $("closeGuide").addEventListener("click", () => {
    guideModal.classList.add("hidden");
  });

  $("modeSelect").addEventListener("change", () => {
    // Visibility logic will be added in Stage 2
  });

  $("runButton").addEventListener("click", () => {
    $("outputText").textContent = "UI is stable. Logic will be wired next.";
  });

});
