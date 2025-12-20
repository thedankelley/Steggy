// steggy-core.js
import { SteggyCRC } from "./steggy-crc.js";

export class SteggyCore {
  constructor(modules = {}) {
    this.modules = modules;
    this.VERSION = 2;
  }

  /* --------------------------------------------------
     Container Format
     --------------------------------------------------
     [MAGIC 4]  S T G Y
     [VER 1]
     [FLAGS 1]
     [HEADER_LEN 2]
     [HEADER JSON]
     [PAYLOAD BYTES + CRC]
  */

  static MAGIC = [0x53, 0x54, 0x47, 0x59];

  /* --------------------------------------------------
     Capacity calculation
     -------------------------------------------------- */
  calculateCapacity(imageData) {
    if (!imageData || !imageData.data) {
      throw new Error("Invalid ImageData");
    }
    const pixels = imageData.data.length / 4;
    return Math.floor(pixels * 3 / 8);
  }

  /* --------------------------------------------------
     Build container
     -------------------------------------------------- */
  buildContainer(headerObj, payloadBytes) {
    const headerJson = JSON.stringify(headerObj);
    const headerBytes = new TextEncoder().encode(headerJson);

    const payloadWithCRC = SteggyCRC.appendCRC(payloadBytes);

    const totalLen =
      4 + 1 + 1 + 2 +
      headerBytes.length +
      payloadWithCRC.length;

    const out = new Uint8Array(totalLen);
    let o = 0;

    out.set(SteggyCore.MAGIC, o); o += 4;
    out[o++] = this.VERSION;
    out[o++] = headerObj.flags || 0;
    out[o++] = (headerBytes.length >>> 8) & 0xFF;
    out[o++] = headerBytes.length & 0xFF;
    out.set(headerBytes, o); o += headerBytes.length;
    out.set(payloadWithCRC, o);

    return out;
  }

  /* --------------------------------------------------
     Parse container
     -------------------------------------------------- */
  parseContainer(containerBytes) {
    let o = 0;

    for (let i = 0; i < 4; i++) {
      if (containerBytes[o++] !== SteggyCore.MAGIC[i]) {
        throw new Error("Invalid Steggy container");
      }
    }

    const version = containerBytes[o++];
    if (version !== this.VERSION) {
      throw new Error("Unsupported Steggy version");
    }

    const flags = containerBytes[o++];
    const headerLen = (containerBytes[o++] << 8) | containerBytes[o++];
    const headerJson = new TextDecoder().decode(
      containerBytes.slice(o, o + headerLen)
    );
    o += headerLen;

    const header = JSON.parse(headerJson);
    const payloadWithCRC = containerBytes.slice(o);
    const payload = SteggyCRC.verifyAndStrip(payloadWithCRC);

    return { header, payload, flags };
  }

  /* --------------------------------------------------
     Encrypt orchestration
     -------------------------------------------------- */
  async encrypt({
    imageData,
    protectedPayload,
    decoyPayload = null,
    options = {}
  }) {
    const capacity = this.calculateCapacity(imageData);

    let payload = protectedPayload;

    if (options.useAES) {
      payload = await this.modules.aes.encrypt(payload, options.aesPassword);
    }

    if (options.usePGP) {
      payload = await this.modules.pgp.encrypt(payload, options.pgpPublicKey);
    }

    if (options.fragment) {
      payload = this.modules.fragment.fragment(payload, capacity);
    }

    if (decoyPayload) {
      payload = this.modules.decoy.combine(decoyPayload, payload);
    }

    if (payload.length > capacity) {
      throw new Error("Payload exceeds image capacity");
    }

    const header = {
      flags: this._buildFlags(options),
      fragment: !!options.fragment,
      decoy: !!decoyPayload,
      aes: !!options.useAES,
      pgp: !!options.usePGP,
      timestamp: Date.now()
    };

    return this.buildContainer(header, payload);
  }

  /* --------------------------------------------------
     Decrypt orchestration
     -------------------------------------------------- */
  async decrypt(containerBytes, options = {}) {
    const { header, payload } = this.parseContainer(containerBytes);
    let data = payload;

    if (header.decoy && options.extractDecoy) {
      data = this.modules.decoy.extractDecoy(data);
    }

    if (header.fragment) {
      data = this.modules.fragment.reassemble(data);
    }

    if (header.pgp && options.pgpPrivateKey) {
      data = await this.modules.pgp.decrypt(data, options.pgpPrivateKey);
    }

    if (header.aes && options.aesPassword) {
      data = await this.modules.aes.decrypt(data, options.aesPassword);
    }

    return { header, data };
  }

  /* --------------------------------------------------
     Flags helper
     -------------------------------------------------- */
  _buildFlags(options) {
    let f = 0;
    if (options.useAES) f |= 0x01;
    if (options.usePGP) f |= 0x02;
    if (options.fragment) f |= 0x04;
    if (options.decoy) f |= 0x08;
    return f;
  }
}
