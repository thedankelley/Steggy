// modules/steggy-fragment.js
// Payload fragmentation and reassembly for Steggy
// Created by Dan

/**
 * Fragmentation design goals:
 * - Allow payloads larger than a single image capacity
 * - Fragments are order-independent
 * - Each fragment is self-describing
 * - CRC-protected for corruption detection
 * - Supports future encryption layers without modification
 *
 * Fragment header format (big endian):
 * 0-4   "FRAG" magic
 * 4     version
 * 5-8   fragment index (uint32)
 * 9-12  fragment count (uint32)
 * 13-16 payload length (uint32)
 * 17-20 CRC32 of payload
 */

import { crc32 } from '../core/steggy-crc.js';

const MAGIC = [70, 82, 65, 71]; // "FRAG"
const VERSION = 1;
const HEADER_SIZE = 21;

/**
 * Split a payload into fragments
 *
 * @param {Uint8Array} payload
 * @param {number} maxFragmentSize
 * @returns {Uint8Array[]} array of fragment buffers
 */
export function fragmentPayload(payload, maxFragmentSize) {
  if (!(payload instanceof Uint8Array)) {
    throw new Error('fragmentPayload expects Uint8Array');
  }

  if (!Number.isInteger(maxFragmentSize) || maxFragmentSize <= HEADER_SIZE) {
    throw new Error('Invalid fragment size');
  }

  const usableSize = maxFragmentSize - HEADER_SIZE;
  const totalFragments = Math.ceil(payload.length / usableSize);
  const fragments = [];

  for (let i = 0; i < totalFragments; i++) {
    const start = i * usableSize;
    const end = Math.min(start + usableSize, payload.length);
    const slice = payload.slice(start, end);
    const crc = crc32(slice);

    const buffer = new Uint8Array(HEADER_SIZE + slice.length);
    buffer.set(MAGIC, 0);
    buffer[4] = VERSION;

    const view = new DataView(buffer.buffer);
    view.setUint32(5, i, false);
    view.setUint32(9, totalFragments, false);
    view.setUint32(13, slice.length, false);
    view.setUint32(17, crc, false);

    buffer.set(slice, HEADER_SIZE);
    fragments.push(buffer);
  }

  return fragments;
}

/**
 * Parse a single fragment
 *
 * @param {Uint8Array} fragment
 * @returns {object} parsed fragment
 */
export function parseFragment(fragment) {
  if (!(fragment instanceof Uint8Array)) {
    throw new Error('parseFragment expects Uint8Array');
  }

  if (fragment.length < HEADER_SIZE) {
    throw new Error('Fragment too small');
  }

  for (let i = 0; i < 4; i++) {
    if (fragment[i] !== MAGIC[i]) {
      throw new Error('Invalid fragment magic');
    }
  }

  const view = new DataView(fragment.buffer);
  const version = fragment[4];
  if (version !== VERSION) {
    throw new Error('Unsupported fragment version');
  }

  const index = view.getUint32(5, false);
  const count = view.getUint32(9, false);
  const length = view.getUint32(13, false);
  const crc = view.getUint32(17, false);

  const payload = fragment.slice(HEADER_SIZE, HEADER_SIZE + length);
  if (payload.length !== length) {
    throw new Error('Fragment length mismatch');
  }

  const actualCrc = crc32(payload);
  if (actualCrc !== crc) {
    throw new Error('Fragment CRC mismatch');
  }

  return {
    index,
    count,
    payload
  };
}

/**
 * Reassemble fragments into original payload
 *
 * @param {Uint8Array[]} fragments
 * @returns {Uint8Array} reassembled payload
 */
export function reassembleFragments(fragments) {
  if (!Array.isArray(fragments) || fragments.length === 0) {
    throw new Error('No fragments provided');
  }

  const parsed = fragments.map(parseFragment);
  const count = parsed[0].count;

  if (parsed.length !== count) {
    throw new Error(`Expected ${count} fragments, got ${parsed.length}`);
  }

  const seen = new Set();
  for (const frag of parsed) {
    if (frag.count !== count) {
      throw new Error('Fragment count mismatch');
    }
    if (seen.has(frag.index)) {
      throw new Error('Duplicate fragment index');
    }
    seen.add(frag.index);
  }

  parsed.sort((a, b) => a.index - b.index);

  let totalLength = 0;
  for (const frag of parsed) {
    totalLength += frag.payload.length;
  }

  const output = new Uint8Array(totalLength);
  let offset = 0;

  for (const frag of parsed) {
    output.set(frag.payload, offset);
    offset += frag.payload.length;
  }

  return output;
}
