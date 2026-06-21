import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const assets = [
  ["node_modules/@soundtouchjs/audio-worklet/dist/soundtouch-worklet.js", "public/worklets/soundtouch-worklet.js"],
  ["node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.js", "public/ffmpeg/ffmpeg-core.js"],
  ["node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.wasm", "public/ffmpeg/ffmpeg-core.wasm"]
];

for (const [source, destination] of assets) {
  const output = join(root, destination);
  await mkdir(dirname(output), { recursive: true });
  await copyFile(join(root, source), output);
}
