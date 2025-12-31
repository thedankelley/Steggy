/*
  steggy-crc.js

  CRC32 implementation.
  Used to detect corruption or tampering.
  Not crypto. Just tells you if shit broke.
*/

export function crc32(str) {
  let crc = 0 ^ -1;

  for (let i = 0; i < str.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i)) & 0xff];
  }

  return (crc ^ -1) >>> 0;
}

const table = (() => {
  let c;
  const table = new Uint32Array(256);

  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();
