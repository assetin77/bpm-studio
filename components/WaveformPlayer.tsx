"use client";

import { useEffect, useRef, useState } from "react";
import { Gauge, Sparkles } from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import { TempoAudioEngine, formatTime, type PlaybackState, type PreviewMode } from "@/lib/audio";
import PlayerControls from "./PlayerControls";

type Props = { file: File; tempo: number };

export default function WaveformPlayer({ file, tempo }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<TempoAudioEngine | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const tempoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, setState] = useState<PlaybackState>("idle");
  const [mode, setMode] = useState<PreviewMode>("fast");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!containerRef.current) return;
    setMode("fast");
    setState("idle");
    setCurrentTime(0);
    setReady(false);
    const url = URL.createObjectURL(file);
    const media = document.createElement("audio");
    media.preload = "auto";
    media.src = url;
    const engine = new TempoAudioEngine(media);
    engineRef.current = engine;

    // This WaveSurfer instance never plays audio. It only renders the waveform
    // and forwards seek gestures to the dedicated preview engine.
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      url,
      height: 124,
      waveColor: "#4c4566",
      progressColor: "#9b7cff",
      cursorColor: "#d9ceff",
      cursorWidth: 2,
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      normalize: true,
      interact: true,
      dragToSeek: true
    });
    wavesurferRef.current = wavesurfer;

    const unsubs = [
      wavesurfer.on("ready", (seconds) => { setDuration(seconds); setReady(true); }),
      wavesurfer.on("interaction", (seconds) => engine.seek(seconds)),
      wavesurfer.on("error", (cause) => setError(cause instanceof Error ? cause.message : "파형을 불러오지 못했습니다."))
    ];
    const onTimeUpdate = () => {
      setCurrentTime(media.currentTime);
      if (Number.isFinite(media.duration) && media.duration > 0) {
        wavesurfer.seekTo(media.currentTime / media.duration);
      }
    };
    const onPlay = () => setState("playing");
    const onPause = () => setState((value) => value === "idle" ? value : "paused");
    const onEnded = () => { setState("idle"); setCurrentTime(0); wavesurfer.seekTo(0); };
    media.addEventListener("timeupdate", onTimeUpdate);
    media.addEventListener("play", onPlay);
    media.addEventListener("pause", onPause);
    media.addEventListener("ended", onEnded);

    return () => {
      if (tempoTimerRef.current) clearTimeout(tempoTimerRef.current);
      unsubs.forEach((unsubscribe) => unsubscribe());
      media.removeEventListener("timeupdate", onTimeUpdate);
      media.removeEventListener("play", onPlay);
      media.removeEventListener("pause", onPause);
      media.removeEventListener("ended", onEnded);
      wavesurfer.destroy();
      void engine.destroy();
      URL.revokeObjectURL(url);
      wavesurferRef.current = null;
      engineRef.current = null;
    };
  }, [file]);

  // Keep UI responsive while limiting expensive AudioParam/playbackRate updates.
  useEffect(() => {
    if (tempoTimerRef.current) clearTimeout(tempoTimerRef.current);
    tempoTimerRef.current = setTimeout(() => engineRef.current?.setTempo(tempo), 75);
    return () => {
      if (tempoTimerRef.current) clearTimeout(tempoTimerRef.current);
    };
  }, [tempo]);

  const changeMode = async (nextMode: PreviewMode) => {
    try {
      setError("");
      await engineRef.current?.setMode(nextMode);
      setMode(nextMode);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "미리듣기 모드를 변경할 수 없습니다.");
    }
  };

  const play = async () => {
    try {
      setError("");
      engineRef.current?.setTempo(tempo);
      await engineRef.current?.play();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "오디오를 재생할 수 없습니다.");
    }
  };

  const pause = () => engineRef.current?.pause();
  const stop = () => {
    engineRef.current?.stop();
    wavesurferRef.current?.seekTo(0);
    setCurrentTime(0);
    setState("idle");
  };

  return (
    <section className="panel waveform-panel">
      <div className="section-heading">
        <div><span className="eyebrow">PREVIEW</span><h2>파형 미리듣기</h2></div>
        <span className="live-pill"><i /> {mode === "fast" ? "안정 재생" : "피치 유지"}</span>
      </div>
      <div className="preview-modes" role="group" aria-label="미리듣기 모드">
        <button className={mode === "fast" ? "active" : ""} onClick={() => void changeMode("fast")}>
          <Gauge size={16} />
          <span><strong>빠른 미리듣기</strong><small>끊김 최소화 · 피치가 변할 수 있음</small></span>
        </button>
        <button className={mode === "quality" ? "active" : ""} onClick={() => void changeMode("quality")}>
          <Sparkles size={16} />
          <span><strong>고품질 미리듣기</strong><small>피치 유지 · 기기에 따라 끊길 수 있음</small></span>
        </button>
      </div>
      <div className={`waveform ${ready ? "is-ready" : ""}`} ref={containerRef}>
        {!ready && <div className="waveform-loading"><span /> 파형을 그리는 중…</div>}
      </div>
      <div className="timeline"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
      <PlayerControls state={state} disabled={!ready} onPlay={play} onPause={pause} onStop={stop} />
      {error && <p className="field-error centered">{error}</p>}
    </section>
  );
}
