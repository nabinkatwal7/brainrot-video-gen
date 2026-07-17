import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeFile } from "node:fs/promises";
import type { LineTiming, WordTiming } from "./caption-timing";

const execFileAsync = promisify(execFile);

const VIDEO_WIDTH = 1080;
const VIDEO_HEIGHT = 1920;

/** ffmpeg's filtergraph parser needs forward slashes and an escaped drive-letter colon. */
function escapeFilterPath(p: string): string {
  return p.replace(/\\/g, "/").replace(/:/g, "\\:");
}

function formatAssTime(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = Math.floor(clamped % 60);
  const cs = Math.round((clamped - Math.floor(clamped)) * 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

/** Writes a karaoke-style "one big word at a time" ASS subtitle file from word timings. */
export async function writeAssSubtitles(wordTimings: WordTiming[], outPath: string): Promise<void> {
  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: ${VIDEO_WIDTH}
PlayResY: ${VIDEO_HEIGHT}
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Caption,Arial Black,96,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,5,2,5,60,60,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events = wordTimings
    .map((w) => {
      const text = w.word.toUpperCase().replace(/\r?\n/g, " ");
      return `Dialogue: 0,${formatAssTime(w.start)},${formatAssTime(w.end)},Caption,,0,0,0,,${text}`;
    })
    .join("\n");

  await writeFile(outPath, header + events + "\n", "utf-8");
}

interface CharacterImage {
  speaker: string;
  path: string;
}

/**
 * Mixes per-line narration clips into a single track, each delayed to its computed start time
 * within the overall timeline.
 */
export async function mixNarration(
  lineAudioPaths: string[],
  lineStarts: number[],
  outPath: string
): Promise<void> {
  const args: string[] = [];
  for (const p of lineAudioPaths) {
    args.push("-i", p);
  }

  const delayLabels = lineAudioPaths.map((_, i) => {
    const delayMs = Math.max(0, Math.round(lineStarts[i] * 1000));
    return `[${i}:a]adelay=delays=${delayMs}:all=1[a${i}]`;
  });
  const mixInputs = lineAudioPaths.map((_, i) => `[a${i}]`).join("");
  const filter = `${delayLabels.join(";")};${mixInputs}amix=inputs=${lineAudioPaths.length}:duration=longest:normalize=0[aout]`;

  args.push(
    "-filter_complex", filter,
    "-map", "[aout]",
    "-ar", "44100",
    "-ac", "1",
    "-y", outPath
  );

  await execFileAsync("ffmpeg", args, { maxBuffer: 1024 * 1024 * 64 });
}

export interface ComposeOptions {
  backgroundPath: string;
  narrationPath: string;
  assPath: string;
  totalDuration: number;
  characterImages: CharacterImage[];
  lineTimings: LineTiming[];
  outPath: string;
}

/** Composes the final vertical video: looped/cropped background + character overlays + burned captions + narration audio. */
export async function composeVideo(opts: ComposeOptions): Promise<void> {
  const { backgroundPath, narrationPath, assPath, totalDuration, characterImages, lineTimings, outPath } = opts;

  const args: string[] = [
    "-stream_loop", "-1",
    "-i", backgroundPath,
  ];
  for (const img of characterImages) {
    args.push("-loop", "1", "-i", img.path);
  }
  args.push("-i", narrationPath);

  const filters: string[] = [
    `[0:v]scale=${VIDEO_WIDTH}:${VIDEO_HEIGHT}:force_original_aspect_ratio=increase,crop=${VIDEO_WIDTH}:${VIDEO_HEIGHT},setsar=1[bg0]`,
  ];

  let lastLabel = "bg0";
  characterImages.forEach((img, i) => {
    const inputIndex = i + 1; // 0 is background
    const imgLabel = `img${i}`;
    filters.push(`[${inputIndex}:v]scale=380:-1[${imgLabel}]`);

    const turns = lineTimings.filter((lt) => lt.speaker === img.speaker);
    const enableExpr = turns.map((t) => `between(t\\,${t.start.toFixed(3)}\\,${t.end.toFixed(3)})`).join("+");
    const nextLabel = `bg${i + 1}`;
    filters.push(
      `[${lastLabel}][${imgLabel}]overlay=x=(W-w)/2:y=H-h-140:enable='${enableExpr}'[${nextLabel}]`
    );
    lastLabel = nextLabel;
  });

  filters.push(`[${lastLabel}]subtitles=filename='${escapeFilterPath(assPath)}'[vout]`);

  const narrationInputIndex = characterImages.length + 1;

  args.push(
    "-filter_complex", filters.join(";"),
    "-map", "[vout]",
    "-map", `${narrationInputIndex}:a`,
    "-t", totalDuration.toFixed(3),
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "192k",
    "-movflags", "+faststart",
    "-y", outPath
  );

  await execFileAsync("ffmpeg", args, { maxBuffer: 1024 * 1024 * 64 });
}
