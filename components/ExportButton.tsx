"use client";

import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { exportTempoMp3 } from "@/lib/exportMp3";

type Props = { file: File; tempo: number; targetBpm: number; disabled: boolean };

export default function ExportButton({ file, tempo, targetBpm, disabled }: Props) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const exportFile = async () => {
    setExporting(true);
    setProgress(0);
    setError("");
    try {
      await exportTempoMp3(file, tempo, targetBpm, setProgress);
      setProgress(1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "MP3 저장에 실패했습니다.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="export-section">
      <button className="export-button" disabled={disabled || exporting} onClick={exportFile}>
        {exporting ? <LoaderCircle className="spin" size={20} /> : <Download size={20} />}
        {exporting ? `MP3 변환 중 ${Math.round(progress * 100)}%` : "MP3 저장"}
      </button>
      {exporting && <div className="progress-track"><span style={{ width: `${progress * 100}%` }} /></div>}
      <p>최종 저장 시에만 브라우저에서 MP3를 인코딩합니다.</p>
      {error && <p className="field-error centered">{error}</p>}
    </section>
  );
}
