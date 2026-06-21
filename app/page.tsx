"use client";

import { useState } from "react";
import { Activity, LockKeyhole } from "lucide-react";
import FilePicker from "@/components/FilePicker";
import WaveformPlayer from "@/components/WaveformPlayer";
import BpmAnalyzer from "@/components/BpmAnalyzer";
import TempoControls from "@/components/TempoControls";
import ExportButton from "@/components/ExportButton";
import { bpmFromTempo, clampTempo, tempoFromBpms } from "@/lib/tempo";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [currentBpm, setCurrentBpm] = useState<number | null>(null);
  const [targetBpm, setTargetBpm] = useState(180);
  const [tempo, setTempo] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  const selectFile = (nextFile: File) => {
    setFile(nextFile);
    setCurrentBpm(null);
    setTempo(1);
    setAnalysisError("");
  };

  const updateCurrentBpm = (value: number) => {
    setCurrentBpm(value || null);
    if (value > 0) setTempo(tempoFromBpms(value, targetBpm));
  };

  const updateTargetBpm = (value: number) => {
    const safeValue = value || 0;
    setTargetBpm(safeValue);
    if (currentBpm) setTempo(tempoFromBpms(currentBpm, safeValue));
  };

  const updateTempo = (value: number) => {
    const safeValue = clampTempo(value);
    setTempo(safeValue);
    if (currentBpm) setTargetBpm(bpmFromTempo(currentBpm, safeValue));
  };

  const changedBpm = currentBpm ? bpmFromTempo(currentBpm, tempo) : 0;

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#"><span><Activity size={22} /></span>BPM Studio</a>
        <div className="local-badge"><LockKeyhole size={13} /> 100% 로컬 처리</div>
      </header>

      <div className="page-shell">
        <section className="hero">
          <div className="hero-kicker"><span /> RUN TO YOUR RHYTHM</div>
          <h1>나의 리듬에 맞춰,<br /><em>음악도 함께 달리게.</em></h1>
          <p>MP3 음악을 나의 러닝 케이던스에 맞는 BPM으로 변환하세요.<br className="desktop-only" /> 피치는 그대로, 템포만 자연스럽게 조절합니다.</p>
        </section>

        <FilePicker file={file} analyzing={analyzing} onSelect={selectFile} />

        {file ? (
          <div className="studio-grid">
            <WaveformPlayer file={file} tempo={tempo} />
            <section className="panel settings-panel">
              <div className="section-heading compact">
                <div><span className="eyebrow">BPM SETTINGS</span><h2>템포 설정</h2></div>
              </div>
              <div className="bpm-grid">
                <BpmAnalyzer
                  file={file}
                  value={currentBpm}
                  analyzing={analyzing}
                  error={analysisError}
                  onAnalyzingChange={setAnalyzing}
                  onError={setAnalysisError}
                  onChange={updateCurrentBpm}
                />
                <TempoControls
                  targetBpm={targetBpm}
                  tempo={tempo}
                  changedBpm={changedBpm}
                  disabled={!currentBpm || analyzing}
                  onTargetChange={updateTargetBpm}
                  onTempoChange={updateTempo}
                />
              </div>
              <ExportButton file={file} tempo={tempo} targetBpm={targetBpm} disabled={!currentBpm || analyzing} />
            </section>
          </div>
        ) : (
          <section className="empty-preview">
            <div className="empty-wave" aria-hidden="true">
              {Array.from({ length: 54 }, (_, index) => <i key={index} style={{ height: `${10 + ((index * 17) % 46)}px` }} />)}
            </div>
            <p>MP3 파일을 선택하면 파형과 BPM 분석이 시작됩니다.</p>
          </section>
        )}
      </div>

      <footer><span>BPM Studio</span><p>음악은 서버로 전송되거나 저장되지 않습니다.</p></footer>
    </main>
  );
}
