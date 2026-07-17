import path from "node:path";
import { mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import { parseScript, uniqueSpeakers } from "./script-parser";
import { isTtsSidecarReady, synthesizeLine } from "./tts-client";
import { computeTimeline, type RenderedLine } from "./caption-timing";
import { writeAssSubtitles, mixNarration, composeVideo } from "./ffmpeg-pipeline";
import { updateJob } from "./job-store";
import { BACKGROUNDS_DIR, VOICES_DIR, CHARACTERS_DIR } from "./assets";

export interface GenerateRequest {
  script: string;
  background: string;
  speakerVoices: Record<string, string>;
  speakerCharacters?: Record<string, string>;
}

function resolveAssetPath(dir: string, filename: string): string {
  const resolved = path.resolve(dir, filename);
  if (!resolved.startsWith(path.resolve(dir) + path.sep)) {
    throw new Error(`Invalid asset path: ${filename}`);
  }
  return resolved;
}

const OUTPUT_DIR = path.join(process.cwd(), "public", "generated");

export async function runPipeline(jobId: string, req: GenerateRequest): Promise<void> {
  const tempDir = path.join(os.tmpdir(), `brainify-${jobId}`);

  try {
    const lines = parseScript(req.script);
    const speakers = uniqueSpeakers(lines);

    for (const speaker of speakers) {
      if (!req.speakerVoices[speaker]) {
        throw new Error(`No voice sample selected for speaker "${speaker}"`);
      }
    }

    updateJob(jobId, { status: "synthesizing", message: "Checking TTS sidecar..." });
    const ready = await isTtsSidecarReady();
    if (!ready) {
      throw new Error(
        "TTS sidecar isn't reachable. Start it with `uvicorn main:app --port 8008` in tts-service/."
      );
    }

    await mkdir(tempDir, { recursive: true });

    const renderedLines: RenderedLine[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      updateJob(jobId, {
        status: "synthesizing",
        message: `Synthesizing line ${i + 1}/${lines.length} (${line.speaker})...`,
      });
      const voicePath = resolveAssetPath(VOICES_DIR, req.speakerVoices[line.speaker]);
      const audioBuffer = await synthesizeLine(line.text, voicePath);
      const audioPath = path.join(tempDir, `line-${i}.wav`);
      await writeFile(audioPath, audioBuffer);
      renderedLines.push({ speaker: line.speaker, text: line.text, audioPath });
    }

    updateJob(jobId, { status: "rendering", message: "Timing captions..." });
    const timeline = await computeTimeline(renderedLines);

    const assPath = path.join(tempDir, "captions.ass");
    await writeAssSubtitles(timeline.wordTimings, assPath);

    updateJob(jobId, { status: "rendering", message: "Mixing narration audio..." });
    const narrationPath = path.join(tempDir, "narration.wav");
    await mixNarration(
      renderedLines.map((l) => l.audioPath),
      timeline.lineTimings.map((lt) => lt.start),
      narrationPath
    );

    const backgroundPath = resolveAssetPath(BACKGROUNDS_DIR, req.background);

    const characterImages = speakers
      .filter((s) => req.speakerCharacters?.[s])
      .map((s) => ({
        speaker: s,
        path: resolveAssetPath(CHARACTERS_DIR, req.speakerCharacters![s]),
      }));

    updateJob(jobId, { status: "rendering", message: "Composing final video..." });
    await mkdir(OUTPUT_DIR, { recursive: true });
    const outPath = path.join(OUTPUT_DIR, `${jobId}.mp4`);
    await composeVideo({
      backgroundPath,
      narrationPath,
      assPath,
      totalDuration: timeline.totalDuration,
      characterImages,
      lineTimings: timeline.lineTimings,
      outPath,
    });

    updateJob(jobId, {
      status: "done",
      message: "Done",
      outputUrl: `/generated/${jobId}.mp4`,
    });
  } catch (err) {
    updateJob(jobId, {
      status: "error",
      message: "Failed",
      error: err instanceof Error ? err.message : String(err),
    });
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}
