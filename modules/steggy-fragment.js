import { crc32 } from "./steggy-crc.js";

export function fragmentPayload(data, fragmentSize = 512) {
  const bytes = new TextEncoder().encode(data);
  const total = Math.ceil(bytes.length / fragmentSize);
  const fragments = [];

  for (let i = 0; i < total; i++) {
    const payload = bytes.slice(i * fragmentSize, (i + 1) * fragmentSize);
    const checksum = crc32(payload);

    fragments.push({
      index: i,
      total,
      payload,
      checksum
    });
  }
  return fragments;
}

export function defragmentPayload(fragments) {
  fragments.sort((a, b) => a.index - b.index);

  if (fragments.length !== fragments[0].total) {
    throw new Error("Incomplete payload");
  }

  const combined = [];

  for (const f of fragments) {
    if (crc32(f.payload) !== f.checksum) {
      throw new Error("Corrupted fragment detected");
    }
    combined.push(...f.payload);
  }

  return new TextDecoder().decode(new Uint8Array(combined));
}
