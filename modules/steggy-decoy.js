const MAGIC = new TextEncoder().encode("DECOY");

export function encodeDecoy(text) {
  const data = new TextEncoder().encode(text);
  const out = new Uint8Array(MAGIC.length + data.length);
  out.set(MAGIC);
  out.set(data, MAGIC.length);
  return out;
}

export function decodeDecoy(bytes) {
  for (let i = 0; i < MAGIC.length; i++) {
    if (bytes[i] !== MAGIC[i]) throw new Error("No decoy");
  }
  return new TextDecoder().decode(bytes.slice(MAGIC.length));
}
