export async function decodeSSTV(arrayBuffer) {
  // Minimal stub that validates WAV container
  const view = new DataView(arrayBuffer);
  if (
    view.getUint32(0, false) !== 0x52494646 || // RIFF
    view.getUint32(8, false) !== 0x57415645   // WAVE
  ) {
    throw new Error("Invalid WAV file");
  }

  return {
    width: 320,
    height: 256,
    data: new Uint8ClampedArray(320 * 256 * 4)
  };
}
