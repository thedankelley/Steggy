// steggy-fragment.js

export class SteggyFragment {
  static fragment(payload, capacity) {
    const chunks = [];
    let offset = 0;
    while (offset < payload.length) {
      chunks.push(payload.slice(offset, offset + capacity));
      offset += capacity;
    }

    return SteggyFragment._wrapFragments(chunks);
  }

  static _wrapFragments(chunks) {
    const parts = [];
    chunks.forEach((chunk, idx) => {
      const header = new Uint8Array(6);
      header[0] = 0xF1;
      header[1] = 0xF2;
      header[2] = idx;
      header[3] = chunks.length;
      header[4] = (chunk.length >>> 8) & 0xFF;
      header[5] = chunk.length & 0xFF;

      const out = new Uint8Array(header.length + chunk.length);
      out.set(header, 0);
      out.set(chunk, header.length);
      parts.push(out);
    });
    return parts.flat();
  }

  static reassemble(bytes) {
    const fragments = [];
    let o = 0;

    while (o < bytes.length) {
      if (bytes[o++] !== 0xF1 || bytes[o++] !== 0xF2) {
        throw new Error("Fragment header missing");
      }
      const index = bytes[o++];
      const total = bytes[o++];
      const len = (bytes[o++] << 8) | bytes[o++];
      fragments[index] = bytes.slice(o, o + len);
      o += len;

      if (fragments.filter(Boolean).length === total) {
        break;
      }
    }

    return fragments.reduce((acc, f) => {
      const out = new Uint8Array(acc.length + f.length);
      out.set(acc, 0);
      out.set(f, acc.length);
      return out;
    }, new Uint8Array());
  }
}
