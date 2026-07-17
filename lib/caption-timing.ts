import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/** Seconds of silence inserted between consecutive speaker turns. */
export const TURN_GAP_SECONDS = 0.35;

export async function getAudioDuration(filePath: string): Promise<number> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "json",
    filePath,
  ]);
  const parsed = JSON.parse(stdout) as { format?: { duration?: string } };
  const duration = parseFloat(parsed.format?.duration ?? "");
  if (!Number.isFinite(duration)) {
    throw new Error(`Could not read duration for ${filePath}`);
  }
  return duration;
}

export interface RenderedLine {
  speaker: string;
  text: string;
  audioPath: string;
}

export interface LineTiming {
  speaker: string;
  text: string;
  audioPath: string;
  start: number;
  end: number;
}

export interface WordTiming {
  speaker: string;
  word: string;
  start: number;
  end: number;
}

export interface Timeline {
  lineTimings: LineTiming[];
  wordTimings: WordTiming[];
  totalDuration: number;
}

/**
 * Builds a full timeline from per-line audio clips. Word-level timestamps are estimated
 * proportionally to word length within each line's known (ffprobe) duration -- there's no
 * forced aligner in the loop, but this is a close enough approximation for burned-in captions.
 */
export async function computeTimeline(lines: RenderedLine[]): Promise<Timeline> {
  const lineTimings: LineTiming[] = [];
  const wordTimings: WordTiming[] = [];

  let cursor = 0;
  for (const line of lines) {
    const duration = await getAudioDuration(line.audioPath);
    const words = line.text.split(/\s+/).filter(Boolean);
    const weights = words.map((w) => w.length + 1);
    const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;

    let t = cursor;
    for (let i = 0; i < words.length; i++) {
      const wordDuration = (weights[i] / totalWeight) * duration;
      wordTimings.push({
        speaker: line.speaker,
        word: words[i],
        start: t,
        end: t + wordDuration,
      });
      t += wordDuration;
    }

    lineTimings.push({
      speaker: line.speaker,
      text: line.text,
      audioPath: line.audioPath,
      start: cursor,
      end: cursor + duration,
    });

    cursor += duration + TURN_GAP_SECONDS;
  }

  return {
    lineTimings,
    wordTimings,
    totalDuration: Math.max(0, cursor - TURN_GAP_SECONDS),
  };
}
