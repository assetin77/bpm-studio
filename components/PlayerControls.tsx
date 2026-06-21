"use client";

import { Pause, Play, Square } from "lucide-react";
import type { PlaybackState } from "@/lib/audio";

type Props = {
  state: PlaybackState;
  disabled: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
};

export default function PlayerControls({ state, disabled, onPlay, onPause, onStop }: Props) {
  return (
    <div className="player-controls" aria-label="재생 컨트롤">
      {state === "playing" ? (
        <button className="round-button main" onClick={onPause} disabled={disabled} aria-label="일시정지">
          <Pause size={22} fill="currentColor" />
        </button>
      ) : (
        <button className="round-button main" onClick={onPlay} disabled={disabled} aria-label="재생">
          <Play size={22} fill="currentColor" />
        </button>
      )}
      <button className="round-button" onClick={onStop} disabled={disabled} aria-label="정지">
        <Square size={17} fill="currentColor" />
      </button>
    </div>
  );
}
