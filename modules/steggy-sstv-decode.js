// steggy-sstv-decode.js
// Fragment-aware SSTV decoder

import { crc32 } from "../core/steggy-crc.js";

export class SteggySSTVDecode {

  static async decodeMultiple(files) {
    const fragments = [];

    for (const file of files) {
      const bytes = await this._decodeWav(file);

      const magic = String.fromCharCode(...bytes.slice(0, 4));
      if (magic !== "SSTV") continue;

      const index = bytes[4];
      const total = bytes[5];
      const expectedCrc = new DataView(bytes.buffer).getUint32(6);

      const payload = bytes.slice(10);
      const actualCrc = crc32(payload);

      if (expectedCrc !== actualCrc) {
        throw new Error(`CRC mismatch on fragment ${index}`);
      }

      fragments[index] = { payload, total };
    }

    if (fragments.length !== fragments[0].total) {
      throw new Error("Missing SSTV fragments");
    }

    const fullData = fragments.flatMap(f => [...f.payload]);
    return this._rebuildImage(fullData);
  }

  static async _decodeWav(file) {
    const buf = await file.arrayBuffer();
    return new Uint8Array(buf.slice(44));
  }

  static _rebuildImage(data) {
    // Assume original dimensions embedded externally
    const width = 320;
    const height = data.length / (width * 4);

    return new ImageData(new Uint8ClampedArray(data), width, height);
  }
}
