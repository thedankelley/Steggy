// modules/steggy-sstv-mic.js

import { decodeSSTVFromSamples } from "./steggy-sstv-decode.js";

export class SSTVMicDecoder {
  constructor(onImageDecoded, onStatus) {
    this.audioContext = null;
    this.stream = null;
    this.processor = null;
    this.samples = [];
    this.listening = false;
    this.onImageDecoded = onImageDecoded;
    this.onStatus = onStatus;
  }

  async start() {
    if (this.listening) return;

    this.audioContext = new AudioContext({ sampleRate: 44100 });
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const source = this.audioContext.createMediaStreamSource(this.stream);
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);

    this.processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      this.samples.push(...input);
    };

    this.listening = true;
    this.onStatus?.("Listening for SSTV signal…");
  }

  async stop() {
    if (!this.listening) return;

    this.processor.disconnect();
    this.stream.getTracks().forEach(t => t.stop());
    await this.audioContext.close();

    this.listening = false;
    this.onStatus?.("Decoding SSTV signal…");

    const sampleArray = new Float32Array(this.samples);
    this.samples = [];

    const imageData = await decodeSSTVFromSamples(sampleArray);
    this.onImageDecoded?.(imageData);
  }
}
