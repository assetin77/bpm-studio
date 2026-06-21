export const MIN_TEMPO = 0.5;
export const MAX_TEMPO = 2.5;

export function clampTempo(value: number) {
  return Math.min(MAX_TEMPO, Math.max(MIN_TEMPO, value));
}

export function tempoFromBpms(currentBpm: number, targetBpm: number) {
  if (!currentBpm || !targetBpm) return 1;
  return clampTempo(targetBpm / currentBpm);
}

export function bpmFromTempo(currentBpm: number, tempo: number) {
  return Math.round(currentBpm * tempo);
}

export function buildAtempoFilter(tempo: number) {
  const factors: number[] = [];
  let remaining = clampTempo(tempo);

  while (remaining > 2) {
    factors.push(2);
    remaining /= 2;
  }
  factors.push(remaining);

  return factors.map((factor) => `atempo=${factor.toFixed(6)}`).join(",");
}
