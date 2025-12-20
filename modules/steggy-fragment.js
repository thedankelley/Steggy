const CHUNK_SIZE = 1024;

export function fragment(bytes) {
  const chunks = [];
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    chunks.push(bytes.slice(i, i + CHUNK_SIZE));
  }
  return concat(chunks);
}

export function reassemble(bytes) {
  return bytes;
}

function concat(chunks) {
  let total = 0;
  chunks.forEach(c => total += c.length);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}
