// steggy-core.js
// Steggy 2.0 core orchestration layer
// Responsible for container format, validation, and module coordination

import { SteggyCRC } from "./steggy-crc.js";
import { SteggyImageLSB } from "../modules/steggy-image-lsb.js";

export class SteggyCore {
  constructor(modules = {}) {
    this.modules = modules;
    this.VERSION = 2;
  }

  /* ============================================================
     Container Format
     ============================================================
     [0-3]   MAGIC "STGY"
     [4]     VERSION
     [5]     FLAGS
     [6-7]   HEADER LENGTH (uint16)
     [..]    HEADER JSON
     [..]    PAYLOAD + CRC32
  */

  static MAGIC = [0x53, 0x54, 0x47, 0x59];

  /* ============================================================
     Capacity Calculation
     ============================================================ */
  calculateCapacity(imageData) {
    if (!imageData || !imageData.data) {
      throw new Error("Invalid ImageData");
    }
    const pixels = imageData.data.length / 4;
    return Math.floor((pixels * 3) / 8);
  }

  /* ============================================================
     Container Builder
     ============================================================ */
  buildContainer(headerObj, payloadBytes) {
    const headerJson = JSON.stringify(headerObj);
    const headerBytes = new TextEncoder().encode(headerJson);
    const payloadWithCRC = SteggyCRC.appendCRC(payloadBytes);

    const totalLength =
      4 + // MAGIC
      1 + // VERSION
      1 + // FLAGS
      2 + // HEADER LENGTH
      headerBytes.length +
      payloadWithCRC.length;

    const out = new Uint8Array(totalLength);
    let offset = 0;

    out.set(SteggyCore.MAGIC, offset);
    offset += 4;

    out[offset++] = this.VERSION;
    out[offset++] = headerObj.flags || 0;

    out[offset++] = (headerBytes.length >>> 8) & 0xff;
    out[offset++] = headerBytes.length & 0xff;

    out.set(headerBytes, offset);
    offset += headerBytes.length;

    out.set(payloadWithCRC, offset);

    return out;
  }

  /* ============================================================
     Container Parser
     ============================================================ */
  parseContainer(containerBytes) {
    let offset = 0;

    for (let i = 0; i < 4; i++) {
      if (containerBytes[offset++] !== SteggyCore.MAGIC[i]) {
        throw new Error("Invalid Steggy container magic");
      }
    }

    const version = containerBytes[offset++];
    if (version !== this.VERSION) {
      throw new Error("Unsupported Steggy container version");
    }

    const flags = containerBytes[offset++];
    const headerLength =
      (containerBytes[offset++] << 8) |
      containerBytes[offset++];

    const headerJson = new TextDecoder().decode(
      containerBytes.slice(offset, offset + headerLength)
    );
    offset += headerLength;

    const header = JSON.parse(headerJson);
    const payloadWithCRC = containerBytes.slice(offset);
    const payload = SteggyCRC.verifyAndStrip(payloadWithCRC);

    return { header, payload, flags };
  }

  /* ============================================================
     Encrypt Orchestration
     ============================================================ */
  async encrypt({
    imageData,
    protectedPayload,
    decoyPayload = null,
    options = {}
  }) {
    if (!imageData) {
      throw new Error("ImageData required for encryption");
    }

    let payload = protectedPayload;

    if (options.useAES) {
      if (!this.modules.aes) {
        throw new Error("AES module not available");
      }
      payload = await this.modules.aes.encrypt(
        payload,
        options.aesPassword
      );
    }

    if (options.usePGP) {
      if (!this.modules.pgp) {
        throw new Error("PGP module not available");
      }
      payload = await this.modules.pgp.encrypt(
        payload,
        options.pgpPublicKey
      );
    }

    if (options.fragment) {
      if (!this.modules.fragment) {
        throw new Error("Fragmentation module not available");
      }
      payload = this.modules.fragment.fragment(
        payload,
        this.calculateCapacity(imageData)
      );
    }

    if (decoyPayload) {
      if (!this.modules.decoy) {
        throw new Error("Decoy module not available");
      }
      payload = this.modules.decoy.combine(decoyPayload, payload);
    }

    const capacity = this.calculateCapacity(imageData);
    if (payload.length > capacity) {
      throw new Error("Payload exceeds image capacity");
    }

    const header = {
      flags: this._buildFlags(options),
      aes: !!options.useAES,
      pgp: !!options.usePGP,
      fragment: !!options.fragment,
      decoy: !!decoyPayload,
      timestamp: Date.now()
    };

    const container = this.buildContainer(header, payload);
    return SteggyImageLSB.embed(imageData, container);
  }

  /* ============================================================
     Decrypt Orchestration
     ============================================================ */
  async decryptFromImage(imageData, options = {}) {
    if (!imageData) {
      throw new Error("ImageData required for decryption");
    }

    // Probe first 12 bytes to determine header size
    const probe = SteggyImageLSB.extract(imageData, 12);

    // Bytes 6-7 contain header length
    const headerLength = (probe[6] << 8) | probe[7];
    const containerHeaderSize = 8 + headerLength;

    // Extract full container conservatively
    const maxBytes = this.calculateCapacity(imageData);
    const containerBytes = SteggyImageLSB.extract(imageData, maxBytes);

    const { header, payload } = this.parseContainer(containerBytes);
    let data = payload;

    if (header.decoy && options.extractDecoy) {
      if (!this.modules.decoy) {
        throw new Error("Decoy module not available");
      }
      data = this.modules.decoy.extractDecoy(data);
    }

    if (header.fragment) {
      if (!this.modules.fragment) {
        throw new Error("Fragmentation module not available");
      }
      data = this.modules.fragment.reassemble(data);
    }

    if (header.pgp && options.pgpPrivateKey) {
      if (!this.modules.pgp) {
        throw new Error("PGP module not available");
      }
      data = await this.modules.pgp.decrypt(
        data,
        options.pgpPrivateKey,
        options.pgpPassphrase || ""
      );
    }

    if (header.aes && options.aesPassword) {
      if (!this.modules.aes) {
        throw new Error("AES module not available");
      }
      data = await this.modules.aes.decrypt(
        data,
        options.aesPassword
      );
    }

    return {
      header,
      data
    };
  }

  /* ============================================================
     Flags Helper
     ============================================================ */
  _buildFlags(options) {
    let flags = 0;
    if (options.useAES) flags |= 0x01;
    if (options.usePGP) flags |= 0x02;
    if (options.fragment) flags |= 0x04;
    if (options.decoy) flags |= 0x08;
    return flags;
  }
}
