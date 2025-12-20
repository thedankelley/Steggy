// steggy-sstv-mic.js
// Live SSTV capture via microphone (optional)

export class SteggySSTVMic {
  static async listen(durationMs = 60000) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const recorder = ctx.createScriptProcessor(4096, 1, 1);

    const samples = [];
    source.connect(recorder);
    recorder.connect(ctx.destination);

    recorder.onaudioprocess = e => {
      samples.push(...e.inputBuffer.getChannelData(0));
    };

    await new Promise(r => setTimeout(r, durationMs));
    stream.getTracks().forEach(t => t.stop());

    return new Float32Array(samples);
  }
}
