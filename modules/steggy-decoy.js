export function extractDecoy(container) {
  return container.decoy || null;
}

export function hasDecoy(flags) {
  return (flags & 0x08) !== 0;
}
