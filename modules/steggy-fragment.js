export function fragmentPayload(data, fragmentSize = 512) {
  const bytes = new TextEncoder().encode(data);
  const total = Math.ceil(bytes.length / fragmentSize);

  const fragments = [];
  for (let i = 0; i < total; i++) {
    const slice = bytes.slice(i * fragmentSize, (i + 1) * fragmentSize);
    fragments.push({
      index: i,
      total,
      payload: slice
    });
  }
  return fragments;
}

export function defragmentPayload(fragments) {
  fragments.sort((a, b) => a.index - b.index);

  const total = fragments[0].total;
  if (fragments.length !== total) {
    throw new Error("Missing fragments");
  }

  const full = fragments.reduce((acc, f) => {
    acc.push(...f.payload);
    return acc;
  }, []);

  return new TextDecoder().decode(new Uint8Array(full));
}
