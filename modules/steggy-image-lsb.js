// steggy-image-lsb.js
// Pixel-level LSB steganography engine

export class SteggyImageLSB {

  static embed(imageData, payloadBytes) {
    const data = imageData.data;
    const totalBits = payloadBytes.length * 8;
    const capacityBits = Math.floor((data.length / 4) * 3);

    if (totalBits > capacityBits) {
      throw new Error("Payload exceeds image LSB capacity");
    }

    let bitIndex = 0;

    for (let i = 0; i < data.length && bitIndex < totalBits; i += 4) {
      for (let c = 0; c < 3; c++) {
        if (bitIndex >= totalBits) break;

        const byte = payloadBytes[Math.floor(bitIndex / 8)];
        const bit = (byte >> (7 - (bitIndex % 8))) & 1;

        data[i + c] = (data[i + c] & 0xFE) | bit;
        bitIndex++;
      }
    }

    return imageData;
  }

  static extract(imageData, byteLength) {
    const data = imageData.data;
    const totalBits = byteLength * 8;
    const out = new Uint8Array(byteLength);

    let bitIndex = 0;

    for (let i = 0; i < data.length && bitIndex < totalBits; i += 4) {
      for (let c = 0; c < 3; c++) {
        if (bitIndex >= totalBits) break;

        const bit = data[i + c] & 1;
        out[Math.floor(bitIndex / 8)] |= bit << (7 - (bitIndex % 8));
        bitIndex++;
      }
    }

    return out;
  }
}
