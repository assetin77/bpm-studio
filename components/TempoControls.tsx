"use client";

import { Gauge } from "lucide-react";
import { MAX_TEMPO, MIN_TEMPO } from "@/lib/tempo";

type Props = {
  targetBpm: number;
  tempo: number;
  changedBpm: number;
  disabled: boolean;
  onTargetChange: (value: number) => void;
  onTempoChange: (value: number) => void;
};

export default function TempoControls({ targetBpm, tempo, changedBpm, disabled, onTargetChange, onTempoChange }: Props) {
  const progress = ((tempo - MIN_TEMPO) / (MAX_TEMPO - MIN_TEMPO)) * 100;

  return (
    <>
      <div className="control-card accent-card">
        <label htmlFor="target-bpm">목표 BPM</label>
        <div className="number-input-wrap">
          <input id="target-bpm" type="number" min="30" max="400" value={targetBpm} disabled={disabled} onChange={(event) => onTargetChange(Number(event.target.value))} />
          <span>BPM</span>
        </div>
        <p>러닝 케이던스와 같은 값을 입력하세요.</p>
      </div>

      <div className="tempo-card">
        <div className="tempo-topline">
          <div><span className="eyebrow">TEMPO RATIO</span><h2>템포 배율</h2></div>
          <strong>{tempo.toFixed(2)}<small>×</small></strong>
        </div>
        <input
          className="tempo-slider"
          aria-label="템포 배율"
          type="range"
          min={MIN_TEMPO}
          max={MAX_TEMPO}
          step="0.01"
          value={tempo}
          disabled={disabled}
          onChange={(event) => onTempoChange(Number(event.target.value))}
          style={{ "--progress": `${progress}%` } as React.CSSProperties}
        />
        <div className="range-labels"><span>0.50×</span><span>1.00×</span><span>1.50×</span><span>2.00×</span><span>2.50×</span></div>
        <div className="result-strip">
          <div className="result-icon"><Gauge size={22} /></div>
          <div><span>변경 후 BPM</span><strong>{changedBpm || "—"}</strong></div>
          <p>저장 파일은 피치를 유지하며 템포만 변경합니다.</p>
        </div>
      </div>
    </>
  );
}
