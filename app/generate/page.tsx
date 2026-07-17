"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { parseScript, uniqueSpeakers } from "@/lib/script-parser";
import { CHARACTER_PRESETS, type CharacterPreset } from "@/lib/characters";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface AssetOption {
  name: string;
  file: string;
}

interface AssetsResponse {
  backgrounds: AssetOption[];
}

interface Job {
  id: string;
  status: string;
  message: string;
  outputUrl?: string;
  error?: string;
}

export default function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [script, setScript] = useState("");
  const [generatingScript, setGeneratingScript] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);

  const [assets, setAssets] = useState<AssetsResponse | null>(null);
  const [background, setBackground] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [selectedPreset, setSelectedPreset] = useState<CharacterPreset>(
    CHARACTER_PRESETS[0]
  );

  useEffect(() => {
    fetch("/api/assets")
      .then((r) => r.json())
      .then((data: AssetsResponse) => {
        setAssets(data);
        if (data.backgrounds[0]) setBackground(data.backgrounds[0].file);
      })
      .catch(() => setSubmitError("Could not load assets."));
  }, []);

  const speakers = useMemo(() => {
    try {
      return uniqueSpeakers(parseScript(script));
    } catch {
      return [];
    }
  }, [script]);

  const handlePresetChange = useCallback((presetId: string) => {
    const preset = CHARACTER_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSelectedPreset(preset);
      setScript(preset.defaultScript);
    }
  }, []);

  useEffect(() => {
    if (!job || job.status === "done" || job.status === "error") return;
    const timer = setInterval(async () => {
      const res = await fetch(`/api/jobs/${job.id}`);
      if (!res.ok) return;
      const data: Job = await res.json();
      setJob(data);
    }, 1500);
    return () => clearInterval(timer);
  }, [job]);

  async function handleGenerateScript() {
    if (!topic.trim()) return;
    setGeneratingScript(true);
    setScriptError(null);
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          presetId: selectedPreset.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setScriptError(data.error ?? "Failed to generate script");
        return;
      }
      setScript(data.script);
    } catch (err) {
      setScriptError(err instanceof Error ? err.message : String(err));
    } finally {
      setGeneratingScript(false);
    }
  }

  async function handleGenerateVideo() {
    setSubmitError(null);
    if (speakers.length === 0) {
      setSubmitError("Generate a script first.");
      return;
    }
    if (!background) {
      setSubmitError("Pick a background clip.");
      return;
    }
    setSubmitting(true);
    try {
      const voiceBySpeaker: Record<string, string> = {};
      const characterBySpeaker: Record<string, string> = {};

      for (const s of selectedPreset.speakers) {
        voiceBySpeaker[s.name] = s.voiceFile;
        characterBySpeaker[s.name] = s.characterImage;
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script,
          background,
          speakerVoices: voiceBySpeaker,
          speakerCharacters: characterBySpeaker,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Failed to start generation");
        return;
      }
      setJob({ id: data.jobId, status: "queued", message: "Queued" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  const isRunning = job && job.status !== "done" && job.status !== "error";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-4xl px-6 pt-24 pb-16">
        <h1 className="text-2xl font-bold tracking-tight">Create a Video</h1>
        <p className="mt-1 text-sm text-black/50 dark:text-white/50">
          Pick your characters, enter a topic, and generate a viral video.
        </p>

        <div className="mt-8">
          <label className="font-medium text-sm block mb-2">
            Character Preset
          </label>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CHARACTER_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetChange(preset.id)}
                className={`text-left rounded-xl border p-3 transition-all ${
                  selectedPreset.id === preset.id
                    ? "border-black dark:border-white bg-black/5 dark:bg-white/5"
                    : "border-black/10 dark:border-white/15 hover:border-black/30 dark:hover:border-white/30"
                }`}
              >
                <div className="font-semibold text-sm">{preset.name}</div>
                <div className="mt-1 text-xs text-black/50 dark:text-white/50 line-clamp-2">
                  {preset.description}
                </div>
                <div className="mt-1.5 flex gap-1 flex-wrap">
                  {preset.speakers.map((s) => (
                    <span
                      key={s.name}
                      className="inline-block rounded-md bg-black/10 dark:bg-white/10 px-1.5 py-0.5 text-[10px]"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <label className="font-medium text-sm" htmlFor="topic">Topic</label>
          <div className="flex gap-2">
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleGenerateScript();
              }}
              placeholder="e.g. how to make eggs, why the sky is blue..."
              className="flex-1 rounded-xl border border-black/10 dark:border-white/15 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-black/30 dark:focus:border-white/30 transition-colors"
            />
            <button
              onClick={handleGenerateScript}
              disabled={!topic.trim() || generatingScript}
              className="rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {generatingScript ? "Generating..." : "Generate Script"}
            </button>
          </div>
          {scriptError && <p className="text-sm text-red-500">{scriptError}</p>}
        </div>

        {speakers.length > 0 && (
          <p className="mt-2 text-xs text-black/40 dark:text-white/40">
            Detected speakers: {speakers.join(", ")}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <label className="font-medium text-sm" htmlFor="script">Script</label>
          <textarea
            id="script"
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={10}
            placeholder="Generated script will appear here..."
            className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-transparent p-4 font-mono text-sm outline-none focus:border-black/30 dark:focus:border-white/30 transition-colors"
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm" htmlFor="background">
              Background clip
            </label>
            <select
              id="background"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className="rounded-xl border border-black/10 dark:border-white/15 bg-transparent p-2.5 text-sm outline-none"
            >
              {assets?.backgrounds.map((b) => (
                <option key={b.file} value={b.file}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-black/10 dark:border-white/15 p-4">
          <h3 className="font-medium text-sm mb-2">Characters &amp; Voices</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {selectedPreset.speakers.map((s) => (
              <div
                key={s.name}
                className="flex items-center gap-3 rounded-lg border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 p-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/10 dark:bg-white/10 text-sm font-bold">
                  {s.name[0]}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-[11px] text-black/40 dark:text-white/40 truncate">
                    Voice: {s.voiceFile} &middot; Image: {s.characterImage}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={handleGenerateVideo}
            disabled={submitting || !!isRunning || speakers.length === 0}
            className="self-start rounded-xl bg-black px-6 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {isRunning ? "Generating..." : "Generate Video"}
          </button>

          {submitError && <p className="text-sm text-red-500">{submitError}</p>}

          {job && (
            <div className="text-sm">
              <p>
                Status: <span className="font-medium">{job.status}</span>{" "}
                &mdash; {job.message}
              </p>
              {job.status === "error" && job.error && (
                <p className="text-red-500 mt-1">{job.error}</p>
              )}
            </div>
          )}

          {job?.status === "done" && job.outputUrl && (
            <div className="flex flex-col gap-2 items-start">
              <video
                src={job.outputUrl}
                controls
                className="max-w-xs rounded-xl border border-black/10 dark:border-white/15"
              />
              <a
                href={job.outputUrl}
                download
                className="text-sm text-black/60 dark:text-white/60 underline hover:text-black dark:hover:text-white transition-colors"
              >
                Download video
              </a>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
