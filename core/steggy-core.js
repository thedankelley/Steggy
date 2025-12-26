/*
  steggy-core.js
  Phase 4B — Image encode/decode

  This is the central brain.
  If something breaks, it’s probably our fault in here.
*/

export async function runSteggy(inputFile, options) {
  const { mode, payload } = options;

  if (!inputFile.type.startsWith("image/")) {
    throw new Error("Selected file is not an image.");
  }

  const imageBitmap = await createImageBitmap(inputFile);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  ctx.drawImage(imageBitmap, 0, 0);

  const imageData = ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );

  if (mode === "encrypt-image") {
    if (!payload) {
      throw new Error("No payload provided for encryption.");
    }

    embedPayload(imageData, payload);
    ctx.putImageData(imageData, 0, 0);

    return await canvasToBlob(canvas);
  }

  if (mode === "decrypt-image") {
    return extractPayload(imageData);
  }

  throw new Error("Unsupported mode.");
}

/* --------------------------------
   Payload Encoding
   -------------------------------- */

function embedPayload(imageData, payload) {
  const bytes = new TextEncoder().encode(payload + "\0");
  const data = imageData.data;

  const capacity = Math.floor(data.length / 4) * 3 / 8;
  if (bytes.length > capacity) {
    throw new Error("Payload too large for this image.");
  }

  let bitIndex = 0;

  for (let i = 0; i < data.length && bitIndex < bytes.length * 8; i += 4) {
    for (let channel = 0; channel < 3; channel++) {
      if (bitIndex >= bytes.length * 8) break;

      const byte = bytes[Math.floor(bitIndex / 8)];
      const bit = (byte >> (7 - (bitIndex % 8))) & 1;

      data[i + channel] =
        (data[i + channel] & 0xfe) | bit;

      bitIndex++;
    }
  }
}

/* --------------------------------
   Payload Decoding
   -------------------------------- */

function extractPayload(imageData) {
  const data = imageData.data;
  const bytes = [];

  let currentByte = 0;
  let bitCount = 0;

  for (let i = 0; i < data.length; i += 4) {
    for (let channel = 0; channel < 3; channel++) {
      const bit = data[i + channel] & 1;
      currentByte = (currentByte << 1) | bit;
      bitCount++;

      if (bitCount === 8) {
        if (currentByte === 0) {
          return new TextDecoder().decode(
            new Uint8Array(bytes)
          );
        }
        bytes.push(currentByte);
        currentByte = 0;
        bitCount = 0;
      }
    }
  }

  throw new Error("No payload found in image.");
}

/* --------------------------------
   Helpers
   -------------------------------- */

function canvasToBlob(canvas) {
  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), "image/png");
  });
}
