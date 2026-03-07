/**
 * StemExporter — captures live audio output to a WAV file using MediaRecorder.
 *
 * Usage:
 *   const exporter = new StemExporter();
 *   await exporter.start();
 *   // play your project
 *   const blob = await exporter.stop();
 *   // blob is a WAV/WebM file — download it
 */

export type ExportFormat = "webm" | "ogg";
export type ExportState  = "idle" | "recording" | "processing" | "done" | "error";

export interface ExportProgress {
  state:    ExportState;
  duration: number;  // seconds recorded so far
  message:  string;
}

export class StemExporter {
  private recorder:    MediaRecorder | null = null;
  private chunks:      Blob[] = [];
  private startTime:   number = 0;
  private destination: MediaStreamAudioDestinationNode | null = null;
  private onProgress?: (p: ExportProgress) => void;
  private tickInterval: ReturnType<typeof setInterval> | null = null;

  state: ExportState = "idle";

  constructor(onProgress?: (p: ExportProgress) => void) {
    this.onProgress = onProgress;
  }

  /** Connect the audio context destination to the recorder, then start. */
  async start(audioContext: AudioContext): Promise<void> {
    if (this.state === "recording") return;

    // Create a MediaStreamDestination connected to the audio context output
    this.destination = audioContext.createMediaStreamDestination();

    // Connect the master output to our capture node
    // Caller is responsible for ensuring audio is routed here, or we
    // capture directly from the context destination's stream if available.
    const stream = this.destination.stream;

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")
        ? "audio/ogg;codecs=opus"
        : "";

    this.recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    this.chunks   = [];

    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };

    this.recorder.start(100); // collect every 100ms
    this.startTime = Date.now();
    this.state     = "recording";

    this.tickInterval = setInterval(() => {
      this.report("recording", `Recording… ${this.elapsed()}s`);
    }, 500);

    this.report("recording", "Recording started");
  }

  /**
   * If the audio engine uses Tone.js and exposes the Tone.Destination node,
   * this connects that node to the exporter's capture destination.
   */
  connectSource(sourceNode: AudioNode): void {
    if (this.destination) {
      sourceNode.connect(this.destination);
    }
  }

  /** Stop recording and return the captured Blob. */
  async stop(): Promise<Blob> {
    if (!this.recorder || this.state !== "recording") {
      return new Blob([], { type: "audio/webm" });
    }

    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }

    this.state = "processing";
    this.report("processing", `Processing ${this.elapsed()}s of audio…`);

    return new Promise((resolve) => {
      this.recorder!.onstop = () => {
        const mime = this.chunks[0]?.type ?? "audio/webm";
        const blob = new Blob(this.chunks, { type: mime });
        this.state = "done";
        this.report("done", `Export complete — ${(blob.size / 1024).toFixed(0)} KB`);
        resolve(blob);
      };
      this.recorder!.stop();
    });
  }

  /** Trigger a browser download of the exported file. */
  static download(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement("a");
    a.href    = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 1000);
  }

  cancel() {
    if (this.recorder && this.state === "recording") {
      this.recorder.stop();
    }
    if (this.tickInterval) clearInterval(this.tickInterval);
    this.state = "idle";
    this.chunks = [];
    this.report("idle", "Export cancelled");
  }

  private elapsed(): string {
    return ((Date.now() - this.startTime) / 1000).toFixed(1);
  }

  private report(state: ExportState, message: string) {
    this.onProgress?.({
      state,
      duration: (Date.now() - this.startTime) / 1000,
      message,
    });
  }
}
