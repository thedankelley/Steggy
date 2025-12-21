/* ======================================================
   EXISTING app.js CONTENT
   - All encryption logic
   - All PGP logic
   - All SSTV logic
   - All fragment logic
   - All UI wiring
   ====================================================== */

/* ------------------------------------------------------
   Drop 8: Guidebook wiring (ADDITIVE ONLY)
------------------------------------------------------ */

const guideBtn = document.getElementById("guideBtn");
const guideOverlay = document.getElementById("guideOverlay");
const guideClose = document.getElementById("guideClose");

if (guideBtn && guideOverlay && guideClose) {
  guideBtn.addEventListener("click", () => {
    guideOverlay.classList.remove("hidden");
  });

  guideClose.addEventListener("click", () => {
    guideOverlay.classList.add("hidden");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      guideOverlay.classList.add("hidden");
    }
  });
}
