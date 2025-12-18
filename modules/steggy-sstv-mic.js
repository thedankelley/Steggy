// Live microphone SSTV capture
let audioCtx;
let processor;
let stream;
let buffer = [];

export async function startMicCapture(onData) {
  audioCtx = new AudioContext();
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const source = audioCtx.createMediaStreamSource(stream);
  processor = audioCtx.createScriptProcessor(4096, 1, 1);

  source.connect(processor);
  processor.connect(audioCtx.destination);

  processor.onaudioprocess = e => {
    const input = e.inputBuffer.getChannelData(0);
    buffer.push(...input);
    onData(buffer, audioCtx.sampleRate);
  };
}

export function stopMicCapture() {
  if (processor) processor.disconnect();
  if (stream) stream.getTracks().forEach(t => t.stop());
  buffer = [];
}
