// steggy-decoy.js

export class SteggyDecoy {
  static MARKER = new TextEncoder().encode("DEC0Y");

  static combine(decoyBytes, protectedBytes) {
    const out = new Uint8Array(
      SteggyDecoy.MARKER.length +
      4 +
      decoyBytes.length +
      protectedBytes.length
    );

    let o = 0;
    out.set(SteggyDecoy.MARKER, o); o += SteggyDecoy.MARKER.length;
    out[o++] = (decoyBytes.length >>> 24) & 0xFF;
    out[o++] = (decoyBytes.length >>> 16) & 0xFF;
    out[o++] = (decoyBytes.length >>> 8) & 0xFF;
    out[o++] = decoyBytes.length & 0xFF;
    out.set(decoyBytes, o); o += decoyBytes.length;
    out.set(protectedBytes, o);
    return out;
  }

  static extractDecoy(bytes) {
    const marker = bytes.slice(0, 5);
    if (!marker.every((v, i) => v === SteggyDecoy.MARKER[i])) {
      throw new Error("No decoy payload found");
    }
    const len =
      (bytes[5] << 24) |
      (bytes[6] << 16) |
      (bytes[7] << 8) |
      bytes[8];

    return bytes.slice(9, 9 + len);
  }

  static extractProtected(bytes) {
    const len =
      (bytes[5] << 24) |
      (bytes[6] << 16) |
      (bytes[7] << 8) |
      bytes[8];
    return bytes.slice(9 + len);
  }
}
