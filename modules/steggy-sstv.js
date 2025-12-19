/* steggy-sstv.js
   Minimal SSTV decode pipeline
   Offline compatible
*/

export async function decodeSSTV(file) {
  if (!file) {
    throw new Error("No SSTV file provided");
  }

  const audioCtx = new AudioContext();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  /* Placeholder decode:
     This currently renders a diagnostic image.
     Real SSTV demodulation hooks in here.
  */

  const width = 320;
  const height = 256;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const imgData = ctx.createImageData(width, height);

  /* Diagnostic waveform visualization */
  const channel = audioBuffer.getChannelData(0);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const sample = channel[(x + y * width) % channel.length] || 0;
      const v = Math.floor((sample + 1) * 127);
      imgData.data[i] = v;
      imgData.data[i + 1] = v;
      imgData.data[i + 2] = v;
      imgData.data[i + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const img = new Image();
  img.src = canvas.toDataURL("image/png");

  return img;
}
