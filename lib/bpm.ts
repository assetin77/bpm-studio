import { analyze } from "web-audio-beat-detector";

export async function analyzeBpm(file: File) {
  const context = new AudioContext();
  try {
    const buffer = await context.decodeAudioData(await file.arrayBuffer());
    const bpm = await analyze(buffer);
    if (!Number.isFinite(bpm) || bpm <= 0) throw new Error("유효한 BPM을 찾지 못했습니다.");
    return Math.round(bpm);
  } finally {
    await context.close();
  }
}
