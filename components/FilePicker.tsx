"use client";

import { ChangeEvent, useRef, useState } from "react";
import { FileAudio, Upload } from "lucide-react";
import { formatFileSize } from "@/lib/audio";

type Props = {
  file: File | null;
  analyzing: boolean;
  onSelect: (file: File) => void;
};

export default function FilePicker({ file, analyzing, onSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const accept = (candidate?: File) => {
    if (!candidate) return;
    if (candidate.type !== "audio/mpeg" && !candidate.name.toLowerCase().endsWith(".mp3")) {
      setError("MP3 파일만 선택할 수 있습니다.");
      return;
    }
    setError("");
    onSelect(candidate);
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => accept(event.target.files?.[0]);

  return (
    <section className="panel upload-panel">
      <div
        className={`drop-zone ${dragging ? "is-dragging" : ""}`}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); accept(event.dataTransfer.files[0]); }}
      >
        <input ref={inputRef} type="file" accept="audio/mpeg,.mp3" onChange={onChange} hidden />
        {file ? (
          <>
            <div className="file-icon"><FileAudio size={24} /></div>
            <div className="file-copy">
              <strong>{file.name}</strong>
              <span>{formatFileSize(file.size)} · {analyzing ? "BPM 분석 중…" : "브라우저에서 처리됨"}</span>
            </div>
            <button className="secondary-button" onClick={() => inputRef.current?.click()}>파일 변경</button>
          </>
        ) : (
          <>
            <div className="upload-icon"><Upload size={25} /></div>
            <div className="file-copy">
              <strong>MP3 파일을 여기에 놓으세요</strong>
              <span>또는 내 기기에서 파일을 선택하세요</span>
            </div>
            <button className="primary-button" onClick={() => inputRef.current?.click()}>MP3 파일 선택</button>
          </>
        )}
      </div>
      {error && <p className="field-error">{error}</p>}
      <p className="privacy-note">파일은 기기를 떠나지 않습니다. 모든 처리는 브라우저 안에서 이루어집니다.</p>
    </section>
  );
}
