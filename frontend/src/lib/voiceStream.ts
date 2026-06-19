/**
 * Minimum-latency voice streaming client.
 *
 * Flow:
 *   connect() → send config → stream PCM audio (binary) →
 *   receive transcript events + MP3 audio binary frames →
 *   queue audio for gapless playback
 *
 * Barge-in: detected via analyser node volume spike during playback;
 * sends {"type":"barge_in"} and stops all queued audio immediately.
 */

export interface VoiceStreamConfig {
  wsUrl: string;          // e.g. "wss://host/ws/voice"
  voiceId: string;
  voiceGender?: string;
  systemPrompt: string;
  model: string;
  knowledgeBase?: string;
  language?: string;
  ttsProvider?: string;
}

export interface VoiceStreamCallbacks {
  onReady?: () => void;
  onTranscript?: (text: string, isFinal: boolean, speechFinal: boolean) => void;
  onLlmText?: (text: string) => void;
  onTurnEnd?: () => void;
  onLatency?: (data: LatencySummary) => void;
  onStopAudio?: () => void;
  onError?: (msg: string) => void;
  onVolumeChange?: (volume: number) => void;
  onSpeechStarted?: () => void;
  onSpeechEnded?: () => void;
}

export interface LatencySummary {
  stt_eot_ms: number | null;
  llm_first_token_ms: number | null;
  tts_first_byte_ms: number | null;
  total_perceived_ms: number | null;
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
const SAMPLE_RATE = 16000;   // Deepgram expects 16 kHz
const PCM_CHUNK_SIZE = 4096; // samples per ScriptProcessor callback
const SPEECH_THRESHOLD = 0.03;
const SILENCE_THRESHOLD = 0.015;
const BARGE_IN_VOLUME_THRESHOLD = 0.04;

export class VoiceStreamClient {
  private ws: WebSocket | null = null;
  private recordingCtx: AudioContext | null = null;
  private playbackCtx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isRecording = false;
  private isPlaying = false;
  private activeSources: AudioBufferSourceNode[] = [];
  private nextPlayTime = 0;
  private callbacks: VoiceStreamCallbacks;

  constructor(callbacks: VoiceStreamCallbacks) {
    this.callbacks = callbacks;
  }

  // ── Connection ──────────────────────────────────────────────

  async connect(cfg: VoiceStreamConfig, deviceId?: string): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(cfg.wsUrl);
    this.ws.binaryType = "arraybuffer";

    await new Promise<void>((resolve, reject) => {
      this.ws!.onopen = () => resolve();
      this.ws!.onerror = (e) => reject(new Error("WS connect failed"));
    });

    this.ws.onmessage = (e) => this._handleMessage(e);
    this.ws.onclose = () => {
      this.callbacks.onError?.("Connection closed");
      this._stopRecording();
    };

    // Send session config
    this._sendJson({
      type: "config",
      voice_id: cfg.voiceId,
      voice_gender: cfg.voiceGender,
      system_prompt: cfg.systemPrompt,
      model: cfg.model,
      knowledge_base: cfg.knowledgeBase ?? "",
      language: cfg.language ?? "en-US",
      tts_provider: cfg.ttsProvider ?? "deepgram",
    });

    // Start microphone
    await this._startMic(deviceId);
  }

  disconnect(): void {
    this._sendJson({ type: "end_session" });
    this._stopRecording();
    this._stopAllAudio();
    this.ws?.close();
    this.ws = null;
    this.playbackCtx?.close();
    this.playbackCtx = null;
  }

  bargeIn(): void {
    this._sendJson({ type: "barge_in" });
    this._stopAllAudio();
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  // ── Microphone ──────────────────────────────────────────────

  private async _startMic(deviceId?: string): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    // Recording context locked to 16 kHz — Deepgram expects this rate
    this.recordingCtx = new AudioContext({ sampleRate: SAMPLE_RATE });
    if (this.recordingCtx.state === "suspended") {
      await this.recordingCtx.resume();
    }

    const source = this.recordingCtx.createMediaStreamSource(this.stream);

    // Analyser for volume / barge-in detection
    this.analyser = this.recordingCtx.createAnalyser();
    this.analyser.fftSize = 256;
    source.connect(this.analyser);

    this.processor = this.recordingCtx.createScriptProcessor(PCM_CHUNK_SIZE, 1, 1);
    source.connect(this.processor);
    this.processor.connect(this.recordingCtx.destination);

    let speaking = false;

    this.processor.onaudioprocess = (e) => {
      const channelData = e.inputBuffer.getChannelData(0);

      // Volume
      let sum = 0;
      for (let i = 0; i < channelData.length; i++) sum += channelData[i] ** 2;
      const vol = Math.sqrt(sum / channelData.length);
      this.callbacks.onVolumeChange?.(vol);

      // Client-side volume-based barge-in is disabled to prevent echo/ambient feedback from falsely cutting off responses.
      // We rely on the backend's highly accurate Deepgram VAD SpeechStarted event instead.
      /*
      if (this.isPlaying && vol > BARGE_IN_VOLUME_THRESHOLD) {
        this.bargeIn();
      }
      */

      // Speech activity tracking
      if (vol > SPEECH_THRESHOLD && !speaking) {
        speaking = true;
        this.callbacks.onSpeechStarted?.();
      } else if (vol < SILENCE_THRESHOLD && speaking) {
        speaking = false;
        this.callbacks.onSpeechEnded?.();
      }

      // Convert float32 → int16 PCM and send
      if (this.ws?.readyState === WebSocket.OPEN) {
        const pcm = new Int16Array(channelData.length);
        for (let i = 0; i < channelData.length; i++) {
          const s = Math.max(-1, Math.min(1, channelData[i]));
          pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        this.ws.send(pcm.buffer);
      }
    };

    this.isRecording = true;
  }

  private _stopRecording(): void {
    this.processor?.disconnect();
    this.processor = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.recordingCtx?.close();
    this.recordingCtx = null;
    this.isRecording = false;
  }

  // ── Audio playback ──────────────────────────────────────────

  private _getPlaybackCtx(): AudioContext {
    if (!this.playbackCtx || this.playbackCtx.state === "closed") {
      this.playbackCtx = new AudioContext();
    }
    return this.playbackCtx;
  }

  private async _playAudioBytes(data: ArrayBuffer): Promise<void> {
    const ctx = this._getPlaybackCtx();
    
    // Parse raw 16-bit signed PCM (mono, 16 kHz)
    const pcmData = new Int16Array(data);
    if (pcmData.length === 0) return;

    // Convert to float32 PCM [-1.0, 1.0]
    const float32Data = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      float32Data[i] = pcmData[i] / 32768.0;
    }

    // Create AudioBuffer
    const buffer = ctx.createBuffer(1, float32Data.length, SAMPLE_RATE);
    buffer.copyToChannel(float32Data, 0);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    this.activeSources.push(source);
    source.onended = () => {
      const idx = this.activeSources.indexOf(source);
      if (idx !== -1) this.activeSources.splice(idx, 1);
      if (this.activeSources.length === 0) {
        this.isPlaying = false;
        this.nextPlayTime = 0;
      }
    };

    // Gapless: schedule back-to-back
    const now = ctx.currentTime;
    const start = Math.max(now, this.nextPlayTime);
    source.start(start);
    this.nextPlayTime = start + buffer.duration;
    this.isPlaying = true;
  }

  private _stopAllAudio(): void {
    const sources = [...this.activeSources];
    sources.forEach((s) => {
      try { s.stop(); } catch { /* already stopped */ }
    });
    this.activeSources = [];
    this.isPlaying = false;
    this.nextPlayTime = 0;
    this.callbacks.onStopAudio?.();
  }

  // ── Message handler ─────────────────────────────────────────

  private _handleMessage(e: MessageEvent): void {
    if (e.data instanceof ArrayBuffer) {
      // MP3 audio frame — queue for playback
      void this._playAudioBytes(e.data);
      return;
    }

    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(e.data as string);
    } catch {
      return;
    }

    switch (msg.type) {
      case "ready":
        this.callbacks.onReady?.();
        break;
      case "transcript":
        this.callbacks.onTranscript?.(
          msg.text as string,
          msg.is_final as boolean,
          msg.speech_final as boolean,
        );
        break;
      case "llm_text":
        this.callbacks.onLlmText?.(msg.text as string);
        break;
      case "turn_end":
        this.callbacks.onTurnEnd?.();
        break;
      case "latency":
        this.callbacks.onLatency?.(msg as unknown as LatencySummary);
        break;
      case "stop_audio":
        this._stopAllAudio();
        break;
      case "error":
        this.callbacks.onError?.(msg.message as string);
        break;
    }
  }

  // ── Helpers ─────────────────────────────────────────────────

  private _sendJson(data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}
