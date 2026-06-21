export type PlaybackState = "idle" | "playing" | "paused";
export type PreviewMode = "fast" | "quality";

export class TempoAudioEngine {
  private context: AudioContext | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private worklet: AudioWorkletNode | null = null;
  private mode: PreviewMode = "fast";
  private tempo = 1;

  constructor(readonly media: HTMLAudioElement) {
    this.media.preservesPitch = false;
  }

  private async initializeQualityGraph() {
    if (!this.context) {
      this.context = new AudioContext();
      await this.context.audioWorklet.addModule("/worklets/soundtouch-worklet.js");
      this.worklet = new AudioWorkletNode(this.context, "soundtouch-processor");
      this.source = this.context.createMediaElementSource(this.media);
    }
    if (this.context.state === "suspended") await this.context.resume();
  }

  private connectForMode() {
    if (!this.source || !this.context) return;
    this.source.disconnect();
    this.worklet?.disconnect();

    if (this.mode === "quality" && this.worklet) {
      this.source.connect(this.worklet);
      this.worklet.connect(this.context.destination);
    } else {
      this.source.connect(this.context.destination);
    }
  }

  async setMode(mode: PreviewMode) {
    if (mode === this.mode) return;
    const wasPlaying = !this.media.paused;
    if (wasPlaying) this.media.pause();

    if (mode === "quality") await this.initializeQualityGraph();
    this.mode = mode;
    this.connectForMode();
    this.applyTempo();

    if (wasPlaying) await this.media.play();
  }

  setTempo(tempo: number) {
    this.tempo = tempo;
    this.applyTempo();
  }

  private applyTempo() {
    if (this.mode === "fast") {
      this.media.preservesPitch = false;
      this.media.playbackRate = this.tempo;
      return;
    }

    this.media.playbackRate = 1;
    this.media.preservesPitch = true;
    const parameter = this.worklet?.parameters.get("tempo");
    if (parameter && this.context) {
      parameter.setTargetAtTime(this.tempo, this.context.currentTime, 0.04);
    }
  }

  async play() {
    if (this.mode === "quality") await this.initializeQualityGraph();
    this.applyTempo();
    await this.media.play();
  }

  pause() {
    this.media.pause();
  }

  stop() {
    this.media.pause();
    this.media.currentTime = 0;
  }

  seek(seconds: number) {
    this.media.currentTime = Math.max(0, Math.min(seconds, this.media.duration || seconds));
  }

  async destroy() {
    this.media.pause();
    this.source?.disconnect();
    this.worklet?.disconnect();
    await this.context?.close();
    this.context = null;
    this.source = null;
    this.worklet = null;
  }
}

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
