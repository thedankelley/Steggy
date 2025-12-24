// ui/app.js
document.body.style.border = "4px solid green";

const guideBtn = document.getElementById("guideBtn");
const guideOverlay = document.getElementById("guideOverlay");
const closeGuide = document.getElementById("closeGuide");
const advBtn = document.getElementById("advancedToggle");
const advSection = document.getElementById("advancedSection");

guideBtn.onclick = () => {
  guideOverlay.classList.remove("hidden");
};

closeGuide.onclick = () => {
  guideOverlay.classList.add("hidden");
};

advBtn.onclick = () => {
  advSection.classList.toggle("hidden");
};

alert("app.js module loaded successfully");
