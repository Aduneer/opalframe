import { assetPath } from "./site";

export type SoundState = "off" | "loading" | "on" | "paused" | "error";

// One controller belongs to the root layout, not to individual page headers.
// No context or audio request exists until the visitor activates sound.
export class AmbientAudio {
  private state: SoundState = "off";
  private listeners = new Set<() => void>();
  private context?: AudioContext;
  private gain?: GainNode;
  private buffer?: AudioBuffer;
  private source?: AudioBufferSourceNode;
  private retiring?: AudioBufferSourceNode;
  private download?: AbortController;
  private enabled = false;
  private recording = false;
  private request = 0;
  private offset = 0;
  private startedAt = 0;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  getSnapshot = () => this.state;
  getServerSnapshot = (): SoundState => "off";

  private publish(state: SoundState) {
    if (state === this.state) return;
    this.state = state;
    this.listeners.forEach((listener) => listener());
  }

  connect() {
    const visibility = () => {
      if (!this.enabled) return;
      if (document.hidden) {
        this.stop();
        if (!this.retiring) void this.context?.suspend().catch(() => {});
        this.publish("paused");
      } else if (!this.recording) {
        void this.resume();
      }
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      this.disable();
      void this.context?.close().catch(() => {});
      this.context = undefined;
      this.gain = undefined;
    };
  }

  setRecording(recording: boolean) {
    this.recording = recording;
    if (!this.enabled) return;
    if (recording) {
      this.stop(0);
      this.publish("paused");
    } else if (!document.hidden) {
      void this.resume();
    }
  }

  toggle = () => {
    if (this.enabled) this.disable();
    else if (!this.recording) void this.activate();
  };

  private disable() {
    this.enabled = false;
    this.request++;
    this.download?.abort();
    this.download = undefined;
    this.stop();
    if (!this.retiring) void this.context?.suspend().catch(() => {});
    this.publish("off");
  }

  private fail() {
    this.disable();
    this.publish("error");
  }

  private async activate() {
    this.enabled = true;
    const request = ++this.request;
    this.publish("loading");
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.gain = this.context.createGain();
        this.gain.gain.value = 0;
        this.gain.connect(this.context.destination);
      }
      // Resume synchronously inside the gesture, before fetch/decode awaits.
      const resumed = this.context.resume();
      const decoded = (async () => {
        if (this.buffer) return this.buffer;
        const download = new AbortController();
        this.download = download;
        const response = await fetch(assetPath("/audio/quiet-01.flac"), {
          signal: download.signal,
        });
        if (!response.ok) throw new Error("Sound download failed");
        return this.context!.decodeAudioData(await response.arrayBuffer());
      })();
      const [, buffer] = await Promise.all([resumed, decoded]);
      if (request !== this.request) return;
      this.buffer = buffer;
      this.download = undefined;
      await this.resume();
    } catch {
      if (request === this.request) this.fail();
    }
  }

  private async resume() {
    if (!this.enabled || !this.buffer || !this.context || !this.gain) return;
    if (document.hidden || this.recording) return;
    const request = this.request;
    try {
      await this.context.resume();
      if (request !== this.request || document.hidden || this.recording) return;
      if (!this.source) {
        this.retiring?.stop();
        this.retiring = undefined;
        const source = this.context.createBufferSource();
        source.buffer = this.buffer;
        source.loop = true;
        source.connect(this.gain);
        this.source = source;
        this.startedAt = this.context.currentTime;
        this.offset %= this.buffer.duration;
        this.gain.gain.cancelScheduledValues(this.startedAt);
        this.gain.gain.setValueAtTime(0, this.startedAt);
        this.gain.gain.linearRampToValueAtTime(1, this.startedAt + 1.2);
        source.start(this.startedAt, this.offset);
      }
      this.publish("on");
    } catch {
      if (request === this.request) this.fail();
    }
  }

  private stop(fade = 0.12) {
    const source = this.source;
    if (!source || !this.context || !this.gain) return;
    const now = this.context.currentTime;
    this.offset += now - this.startedAt;
    const level = this.gain.gain.value;
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(level, now);
    this.gain.gain.linearRampToValueAtTime(0, now + fade);
    source.stop(now + fade);
    this.source = undefined;
    this.retiring = source;
    source.onended = () => {
      source.disconnect();
      if (this.retiring === source) this.retiring = undefined;
      if (!this.source) void this.context?.suspend().catch(() => {});
    };
  }
}
