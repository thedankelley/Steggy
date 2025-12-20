// steggy-sstv-mic.js

export class SteggySSTVMic {
  static async listen(callback) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    callback(stream);
  }
}
