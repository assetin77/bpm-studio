"use client";

import { useEffect } from "react";
import { LoaderCircle, RotateCcw } from "lucide-react";
import { analyzeBpm } from "@/lib/bpm";

type Props = {
  file: File;
  value: number | null;
  analyzing: boolean;
  error: string;
  onAnalyzingChange: (value: boolean) => void;
  onError: (value: string) => void;
  onChange: (value: number) => void;
};

export default function BpmAnalyzer({ file, value, analyzing, error, onAnalyzingChange, onError, onChange }: Props) {
  const runAnalysis = async () => {
    onAnalyzingChange(true);
    onError("");
    try {
      onChange(await analyzeBpm(file));
    } catch {
      onError("자동 분석에 실패했습니다. 현재 BPM을 직접 입력해 주세요.");
    } finally {
      onAnalyzingChange(false);
    }
  };

  useEffect(() => { void runAnalysis(); }, [file]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="control-card">
      <div className="control-label-row">
        <label htmlFor="current-bpm">현재 BPM</label>
        {analyzing ? <span className="status analyzing"><LoaderCircle size={13} /> 분석 중</span> : value ? <span className="status success">분석 완료</span> : null}
      </div>
      <div className="number-input-wrap">
        <input
          id="current-bpm"
          type="number"
          min="30"
          max="300"
          value={value ?? ""}
          placeholder="—"
          disabled={analyzing}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <span>BPM</span>
      </div>
      <p>자동 감지 결과를 직접 수정할 수 있어요.</p>
      {error && <button className="retry-button" onClick={runAnalysis}><RotateCcw size={13} /> 다시 분석</button>}
      {error && <small className="field-error">{error}</small>}
    </div>
  );
}
