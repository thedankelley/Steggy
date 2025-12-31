/*
  steggy-fragment.js

  Payload fragmentation logic.
  This exists so large payloads don’t blow up images.

  Why is this harder than it should be?
  Because computers hate us.
*/

const DEFAULT_CHUNK_SIZE = 512;

export function fragmentPayload(payload, chunkSize = DEFAULT_CHUNK_SIZE) {
  const chunks = [];

  for (let i = 0; i < payload.length; i += chunkSize) {
    chunks.push(payload.slice(i, i + chunkSize));
  }

  return JSON.stringify({
    fragmented: true,
    total: chunks.length,
    chunks
  });
}
