export function fragment(data, max) {
  const parts = [];
  for (let i = 0; i < data.length; i += max) {
    parts.push(data.slice(i, i + max));
  }
  return parts;
}

export function reassemble(parts) {
  const total = parts.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}
