import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { buildAtempoFilter } from "./tempo";

let ffmpeg: FFmpeg | null = null;
let loaded = false;

async function getFfmpeg(onProgress: (progress: number) => void) {
  if (!ffmpeg) ffmpeg = new FFmpeg();
  ffmpeg.on("progress", ({ progress }) => onProgress(Math.max(0, Math.min(1, progress))));

  if (!loaded) {
    await ffmpeg.load({
      coreURL: "/ffmpeg/ffmpeg-core.js",
      wasmURL: "/ffmpeg/ffmpeg-core.wasm"
    });
    loaded = true;
  }
  return ffmpeg;
}

export async function exportTempoMp3(
  file: File,
  tempo: number,
  targetBpm: number,
  onProgress: (progress: number) => void
) {
  const instance = await getFfmpeg(onProgress);
  const stamp = Date.now();
  const inputName = `input-${stamp}.mp3`;
  const outputName = `output-${stamp}.mp3`;

  try {
    await instance.writeFile(inputName, await fetchFile(file));
    await instance.exec([
      "-i", inputName,
      "-vn",
      "-filter:a", buildAtempoFilter(tempo),
      "-codec:a", "libmp3lame",
      "-b:a", "192k",
      outputName
    ]);
    const data = await instance.readFile(outputName);
    const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(data);
    const blob = new Blob([bytes.slice().buffer], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);
    const baseName = file.name.replace(/\.mp3$/i, "");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${baseName}_${Math.round(targetBpm)}bpm.mp3`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } finally {
    await instance.deleteFile(inputName).catch(() => undefined);
    await instance.deleteFile(outputName).catch(() => undefined);
  }
}
