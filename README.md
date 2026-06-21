# BPM Studio

BPM Studio는 로컬 MP3 음악의 템포를 러닝 케이던스에 맞춰 변경하는 브라우저 웹앱입니다. 파일을 서버로 업로드하지 않고 Web Audio API, AudioWorklet, ffmpeg.wasm을 사용해 사용자의 브라우저 안에서만 처리합니다.

## 주요 기능

- 로컬 MP3 선택 및 드래그 앤 드롭
- Wavesurfer.js 파형, 클릭/드래그 탐색, 현재/전체 시간 표시
- 브라우저 내 BPM 자동 분석 및 수동 수정
- 현재 BPM과 목표 BPM에 따른 템포 배율 자동 계산
- 0.50×~2.50× 실시간 템포 슬라이더
- 기본 빠른 미리듣기: 가벼운 `playbackRate` 기반 안정 재생
- 선택형 고품질 미리듣기: SoundTouch AudioWorklet 기반 피치 유지
- 재생 중 템포 즉시 변경
- 최종 저장 시에만 ffmpeg.wasm으로 MP3 인코딩
- 변환 진행률 및 `원본파일명_목표BPMbpm.mp3` 다운로드
- 반응형 다크 UI

## 로컬 실행

Node.js 20 이상이 필요합니다. 프로젝트 루트에서 다음 명령을 실행합니다.

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다. `npm install`의 `postinstall` 스크립트는 SoundTouch worklet과 ffmpeg core 파일을 `public/` 아래로 복사합니다. 이 파일들은 앱 실행 시 동일 출처에서 로드됩니다.

### 스타일이 적용되지 않을 때

개발 서버를 종료한 뒤 프로젝트 루트에서 Next.js 캐시를 삭제하고 다시 실행합니다.

```bash
rm -rf .next
npm run dev
```

브라우저에 이전 CSS가 남아 있다면 `Cmd + Shift + R`로 강력 새로고침합니다. 이 프로젝트는 TailwindCSS 3을 사용하므로 `app/globals.css`의 `@tailwind base`, `@tailwind components`, `@tailwind utilities` 지시문과 CommonJS 방식의 `postcss.config.js`를 사용합니다.

프로덕션 빌드는 다음과 같이 확인할 수 있습니다.

```bash
npm run build
npm run start
```

## Vercel 배포

1. 이 프로젝트를 GitHub 저장소에 push합니다.
2. Vercel에서 저장소를 Import합니다.
3. Framework Preset은 Next.js, Build Command는 `npm run build`를 사용합니다.
4. 별도 환경 변수 없이 배포합니다.

`postinstall`에서 필요한 WASM/worklet 정적 파일을 생성하므로 Vercel 빌드 결과에도 포함됩니다.

## 브라우저 로컬 처리 구조

미리듣기와 저장은 의도적으로 분리되어 있습니다.

1. File API가 선택한 MP3를 브라우저 메모리에서 읽습니다.
2. Wavesurfer.js가 로컬 Blob URL을 사용해 파형을 그립니다.
3. `web-audio-beat-detector`가 디코딩된 AudioBuffer를 분석합니다.
4. Wavesurfer.js는 별도의 무음 인스턴스로 파형 표시와 seek UI만 담당합니다. 실제 소리는 전용 HTMLAudioElement에서 재생됩니다.
5. 기본 빠른 미리듣기는 AudioWorklet을 만들지 않고 `playbackRate`와 `preservesPitch=false`를 사용합니다. 피치는 변할 수 있지만 고배율에서도 처리 부하가 매우 작습니다.
6. 고품질 미리듣기를 선택할 때만 HTMLAudioElement → MediaElementAudioSourceNode → SoundTouch AudioWorklet → 스피커 그래프를 한 번 생성합니다. 템포 변경은 기존 노드의 AudioParam만 갱신하며 75ms debounce를 적용합니다.
7. MP3 저장 버튼을 누른 경우에만 ffmpeg.wasm이 메모리 파일시스템에서 `atempo` 필터와 MP3 인코더를 실행합니다. 미리듣기 엔진과 저장 엔진은 상태나 처리 그래프를 공유하지 않습니다.

어느 단계에서도 MP3 파일을 서버에 업로드하거나 서버 저장소에 기록하지 않습니다.

## 알려진 한계

- BPM 자동 분석은 곡의 리듬, 장르, 인트로 구성에 따라 부정확할 수 있습니다. 현재 BPM 입력값으로 보정할 수 있습니다.
- 큰 MP3 파일은 디코딩과 ffmpeg.wasm 인코딩에 많은 브라우저 메모리를 사용하며 시간이 오래 걸릴 수 있습니다.
- 실시간 템포 변경 품질과 짧은 지연은 브라우저 및 SoundTouch 알고리즘 특성에 따라 달라질 수 있습니다.
- 빠른 미리듣기는 안정성을 우선하므로 템포 변경 시 음정도 함께 변할 수 있습니다. 저장되는 MP3에는 이 제한이 적용되지 않습니다.
- AudioWorklet 때문에 HTTPS 또는 localhost 환경이 필요합니다. Vercel 배포 환경은 HTTPS를 제공합니다.
- Safari/iOS는 메모리 제한이 비교적 낮아 긴 파일 내보내기에 실패할 수 있습니다.

## 구조

```text
app/
  page.tsx
  globals.css
components/
  FilePicker.tsx
  WaveformPlayer.tsx
  BpmAnalyzer.tsx
  TempoControls.tsx
  PlayerControls.tsx
  ExportButton.tsx
lib/
  audio.ts
  bpm.ts
  tempo.ts
  exportMp3.ts
public/
  worklets/
  ffmpeg/
```
