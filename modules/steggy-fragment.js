/*
  steggy-fragment.js

  Fragmentation + reassembly.
  Because sometimes payloads are thicc.
*/

const CHUNK_SIZE = 512;

export function fragmentPayload(payload) {
  const chunks = [];
  for (let i = 0; i < payload.length; i += CHUNK_SIZE) {
    chunks.push(payload.slice(i, i + CHUNK_SIZE));
  }

  return JSON.stringify({
    fragmented: true,
    total: chunks.length,
    chunks
  });
}

export function reassemblePayload(obj) {
  if (!obj.fragmented || !obj.chunks) {
    throw new Error('Invalid fragment container');
  }

  return obj.chunks.join('');
}
