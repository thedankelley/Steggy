/*
  steggy-core.js
  Central orchestrator.

  Everything funnels through here.
*/

export async function runSteggy(inputFile, options) {
  // Sanity logging (remove later)
  console.log("Running Steggy with:", {
    file: inputFile.name,
    options
  });

  // Phase 4A: just prove the pipeline works
  // Later phases will branch based on options.mode

  if (!options.payload && options.mode.includes("encrypt")) {
    throw new Error("No payload provided for encryption.");
  }

  // Fake async to prove flow
  await new Promise(r => setTimeout(r, 300));

  return {
    success: true
  };
}
