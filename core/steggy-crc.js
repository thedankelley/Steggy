// steggy-crc.js
// CRC32 implementation for integrity verification

export class SteggyCRC {
  static table = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c >>> 0;
    }
    return table;
  })();

  static crc32(bytes) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) {
      crc = SteggyCRC.table[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  static appendCRC(payloadBytes) {
    const crc = SteggyCRC.crc32(payloadBytes);
    const out = new Uint8Array(payloadBytes.length + 4);
    out.set(payloadBytes, 0);
    out[out.length - 4] = (crc >>> 24) & 0xFF;
    out[out.length - 3] = (crc >>> 16) & 0xFF;
    out[out.length - 2] = (crc >>> 8) & 0xFF;
    out[out.length - 1] = crc & 0xFF;
    return out;
  }

  static verifyAndStrip(payloadWithCRC) {
    if (payloadWithCRC.length < 5) {
      throw new Error("Payload too small for CRC");
    }
    const data = payloadWithCRC.slice(0, -4);
    const crcExpected =
      (payloadWithCRC[payloadWithCRC.length - 4] << 24) |
      (payloadWithCRC[payloadWithCRC.length - 3] << 16) |
      (payloadWithCRC[payloadWithCRC.length - 2] << 8) |
      payloadWithCRC[payloadWithCRC.length - 1];

    const crcActual = SteggyCRC.crc32(data);
    if ((crcActual >>> 0) !== (crcExpected >>> 0)) {
      throw new Error("CRC mismatch, data corrupted");
    }
    return data;
  }
}
