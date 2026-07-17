"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { parseScript, uniqueSpeakers } from "@/lib/script-parser";
import {
  CHARACTER_PRESETS,
  REDDIT_STORY_PRESETS,
  type CharacterPreset,
} from "@/lib/characters";
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

type Step = "characters" | "script" | "background" | "generate";

const STEPS: { key: Step; label: string }[] = [
  { key: "characters", label: "Characters" },
  { key: "script", label: "Script" },
  { key: "background", label: "Background" },
  { key: "generate", label: "Generate" },
];

export default function GeneratePage() {
  const [step, setStep] = useState<Step>("characters");
  const [topic, setTopic] = useState("");
  const [script, setScript] = useState(CHARACTER_PRESETS[0].defaultScript);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [storyMode, setStoryMode] = useState(false);

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

  const handlePresetChange = useCallback((preset: CharacterPreset) => {
    setSelectedPreset(preset);
    setScript(preset.defaultScript);
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

  function handleStoryModeChange(checked: boolean) {
    setStoryMode(checked);
    const newPresets = checked ? REDDIT_STORY_PRESETS : CHARACTER_PRESETS;
    const stillExists = newPresets.find((p) => p.id === selectedPreset.id);
    if (!stillExists) {
      handlePresetChange(newPresets[0]);
    }
  }

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  function goToStep(s: Step) {
    setStep(s);
  }

  function goNext() {
    const idx = stepIndex;
    if (idx < STEPS.length - 1) {
      setStep(STEPS[idx + 1].key);
    }
  }

  function goBack() {
    const idx = stepIndex;
    if (idx > 0) {
      setStep(STEPS[idx - 1].key);
    }
  }

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
          storyMode,
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
        {/* Stepper */}
        <nav className="flex items-center gap-1 mb-10">
          {STEPS.map((s, i) => {
            const isActive = step === s.key;
            const isDone = stepIndex > i;
            return (
              <button
                key={s.key}
                onClick={() => goToStep(s.key)}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "text-black dark:text-white"
                    : isDone
                    ? "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                    : "text-black/30 dark:text-white/30 cursor-default"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold border transition-colors ${
                    isActive
                      ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                      : isDone
                      ? "border-black/40 dark:border-white/40 bg-black/10 dark:bg-white/10"
                      : "border-black/15 dark:border-white/15"
                  }`}
                >
                  {isDone ? "✓" : i + 1}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
                {i < STEPS.length - 1 && (
                  <span className="mx-1 text-black/15 dark:text-white/15">—</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Step 1: Characters */}
        {step === "characters" && (
          <section>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Choose Your Characters</h2>
                <p className="mt-1 text-sm text-black/50 dark:text-white/50">
                  Pick a character pair for your brainrot video.
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  checked={storyMode}
                  onChange={(e) => handleStoryModeChange(e.target.checked)}
                  className="rounded border-black/30 dark:border-white/30"
                />
                Reddit story
              </label>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(storyMode ? REDDIT_STORY_PRESETS : CHARACTER_PRESETS).map((preset) => {
                const isSelected = selectedPreset.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetChange(preset)}
                    className={`text-left rounded-xl border p-4 transition-all ${
                      isSelected
                        ? "border-black dark:border-white bg-black/5 dark:bg-white/5 ring-1 ring-black/20 dark:ring-white/20"
                        : "border-black/10 dark:border-white/15 hover:border-black/30 dark:hover:border-white/30"
                    }`}
                  >
                    <div className="flex gap-3 mb-3">
                      {preset.speakers.slice(0, 2).map((s) => (
                        <div key={s.name} className="flex-1">
                          <div className="aspect-[3/4] rounded-lg overflow-hidden bg-black/5 dark:bg-white/5">
                            <img
                              src={`/api/character-image/${s.characterImage}`}
                              alt={s.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="mt-1.5 text-[11px] font-medium text-center truncate">
                            {s.name}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="font-semibold text-sm">{preset.name}</div>
                    <div className="mt-0.5 text-xs text-black/50 dark:text-white/50 line-clamp-2">
                      {preset.description}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Character preview + voice samples */}
            <div className="mt-6 rounded-xl border border-black/10 dark:border-white/15 p-5">
              <h3 className="font-medium text-sm mb-4">{selectedPreset.name} — Voices</h3>
              <div className="grid gap-5 sm:grid-cols-2">
                {selectedPreset.speakers.slice(0, 2).map((s) => (
                  <div key={s.name} className="flex items-center gap-4">
                    <div className="w-16 h-20 rounded-lg overflow-hidden shrink-0 bg-black/5 dark:bg-white/5">
                      <img
                        src={`/api/character-image/${s.characterImage}`}
                        alt={s.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{s.name}</div>
                      <div className="text-[11px] text-black/40 dark:text-white/40 mt-0.5">
                        {s.style}
                      </div>
                      <audio
                        controls
                        className="mt-2 h-8 w-full"
                        preload="none"
                      >
                        <source
                          src={`/api/voice/${s.voiceFile}`}
                          type={s.voiceFile.endsWith(".mp3") ? "audio/mpeg" : "audio/wav"}
                        />
                      </audio>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={goNext}
                className="rounded-xl bg-black px-6 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
              >
                Next — Script
              </button>
            </div>
          </section>
        )}

        {/* Step 2: Script */}
        {step === "script" && (
          <section>
            <h2 className="text-xl font-bold tracking-tight">Write Your Script</h2>
            <p className="mt-1 text-sm text-black/50 dark:text-white/50">
              Enter a topic, toggle Reddit story mode, and generate a script.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGenerateScript();
                }}
                placeholder={
                  storyMode
                    ? "e.g. AITA for eating my roommate's food..."
                    : "e.g. how to make eggs, why the sky is blue..."
                }
                className="flex-1 min-w-[200px] rounded-xl border border-black/10 dark:border-white/15 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-black/30 dark:focus:border-white/30 transition-colors"
              />
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={storyMode}
                  onChange={(e) => handleStoryModeChange(e.target.checked)}
                  className="rounded border-black/30 dark:border-white/30"
                />
                Reddit story
              </label>
              <button
                onClick={handleGenerateScript}
                disabled={!topic.trim() || generatingScript}
                className="rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                {generatingScript ? "Generating..." : "Generate Script"}
              </button>
            </div>
            {scriptError && (
              <p className="mt-2 text-sm text-red-500">{scriptError}</p>
            )}

            <div className="mt-5 flex flex-col gap-2">
              <label className="font-medium text-sm" htmlFor="script">
                Script
              </label>
              <textarea
                id="script"
                value={script}
                onChange={(e) => setScript(e.target.value)}
                rows={10}
                placeholder="Generated script will appear here..."
                className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-transparent p-4 font-mono text-sm outline-none focus:border-black/30 dark:focus:border-white/30 transition-colors"
              />
            </div>

            {speakers.length > 0 && (
              <div className="mt-4 rounded-xl border border-black/10 dark:border-white/15 p-4">
                <h3 className="font-medium text-sm mb-3">Characters in this script</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {selectedPreset.speakers
                    .filter((s) => speakers.includes(s.name))
                    .map((s) => (
                      <div key={s.name} className="flex items-center gap-3">
                        <div className="w-10 h-13 rounded-lg overflow-hidden shrink-0 bg-black/5 dark:bg-white/5">
                          <img
                            src={`/api/character-image/${s.characterImage}`}
                            alt={s.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium">{s.name}</div>
                          <audio controls className="mt-1 h-7 w-full" preload="none">
                            <source
                              src={`/api/voice/${s.voiceFile}`}
                              type={s.voiceFile.endsWith(".mp3") ? "audio/mpeg" : "audio/wav"}
                            />
                          </audio>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={goBack}
                className="rounded-xl border border-black/20 dark:border-white/20 px-5 py-2.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Back
              </button>
              <button
                onClick={goNext}
                disabled={speakers.length === 0}
                className="rounded-xl bg-black px-6 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                Next — Background
              </button>
            </div>
          </section>
        )}

        {/* Step 3: Background */}
        {step === "background" && (
          <section>
            <h2 className="text-xl font-bold tracking-tight">Pick a Background</h2>
            <p className="mt-1 text-sm text-black/50 dark:text-white/50">
              Choose a looping gameplay clip for your video background.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {assets?.backgrounds.map((b) => {
                const isSelected = background === b.file;
                return (
                  <button
                    key={b.file}
                    onClick={() => setBackground(b.file)}
                    className={`text-left rounded-xl border overflow-hidden transition-all ${
                      isSelected
                        ? "border-black dark:border-white ring-1 ring-black/20 dark:ring-white/20"
                        : "border-black/10 dark:border-white/15 hover:border-black/30 dark:hover:border-white/30"
                    }`}
                  >
                    <div className="aspect-video bg-black/10 dark:bg-white/10 relative">
                      <video
                        src={`/api/background-preview/${b.file}`}
                        className="h-full w-full object-cover"
                        muted
                        loop
                        playsInline
                        onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                        onMouseLeave={(e) => {
                          const vid = e.target as HTMLVideoElement;
                          vid.pause();
                          vid.currentTime = 0;
                        }}
                        preload="metadata"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <span className="text-white text-xs font-bold bg-black/60 px-2 py-1 rounded">
                            Selected
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <div className="text-xs font-medium truncate">{b.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected background preview */}
            {background && (
              <div className="mt-6 rounded-xl overflow-hidden border border-black/10 dark:border-white/15">
                <video
                  key={background}
                  src={`/api/background-preview/${background}`}
                  className="w-full max-h-[300px] object-cover"
                  controls
                  muted
                  loop
                  preload="auto"
                />
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={goBack}
                className="rounded-xl border border-black/20 dark:border-white/20 px-5 py-2.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Back
              </button>
              <button
                onClick={goNext}
                disabled={!background}
                className="rounded-xl bg-black px-6 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                Next — Generate
              </button>
            </div>
          </section>
        )}

        {/* Step 4: Generate */}
        {step === "generate" && (
          <section>
            <h2 className="text-xl font-bold tracking-tight">Generate Your Video</h2>
            <p className="mt-1 text-sm text-black/50 dark:text-white/50">
              Review your choices and generate the final TikTok-style video.
            </p>

            {/* Summary */}
            <div className="mt-6 rounded-xl border border-black/10 dark:border-white/15 divide-y divide-black/5 dark:divide-white/5">
              <div className="p-4 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {selectedPreset.speakers.slice(0, 2).map((s) => (
                    <div
                      key={s.name}
                      className="w-10 h-13 rounded-lg overflow-hidden border-2 border-white dark:border-black bg-black/5 dark:bg-white/5"
                    >
                      <img
                        src={`/api/character-image/${s.characterImage}`}
                        alt={s.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-sm font-medium">{selectedPreset.name}</div>
                  <div className="text-xs text-black/50 dark:text-white/50">
                    {storyMode ? "Reddit Story Mode" : "Topic: " + (topic || "N/A")}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs font-medium text-black/50 dark:text-white/50 uppercase tracking-wider mb-2">
                  Script ({speakers.length} lines)
                </div>
                <pre className="text-xs font-mono whitespace-pre-wrap text-black/80 dark:text-white/80 line-clamp-5">
                  {script || "No script yet."}
                </pre>
              </div>
              <div className="p-4 flex items-center gap-4">
                <div className="w-20 aspect-video rounded-lg overflow-hidden bg-black/10 dark:bg-white/10 shrink-0">
                  {background && (
                    <video
                      src={`/api/background-preview/${background}`}
                      className="h-full w-full object-cover"
                      muted
                      preload="metadata"
                    />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium">
                    {assets?.backgrounds.find((b) => b.file === background)?.name ??
                      "Background"}
                  </div>
                  <div className="text-xs text-black/50 dark:text-white/50">
                    {background}
                  </div>
                </div>
              </div>
            </div>

            {/* Generate button + progress */}
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={handleGenerateVideo}
                disabled={submitting || !!isRunning || speakers.length === 0}
                className="self-start rounded-xl bg-black px-8 py-3 text-sm font-medium text-white dark:bg-white dark:text-black disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                {isRunning
                  ? "Generating..."
                  : submitting
                  ? "Starting..."
                  : "Generate Video"}
              </button>

              {submitError && (
                <p className="text-sm text-red-500">{submitError}</p>
              )}

              {job && (
                <div className="rounded-xl border border-black/10 dark:border-white/15 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        job.status === "done"
                          ? "bg-green-500"
                          : job.status === "error"
                          ? "bg-red-500"
                          : "bg-yellow-500 animate-pulse"
                      }`}
                    />
                    <span className="text-sm font-medium capitalize">
                      {job.status}
                    </span>
                    <span className="text-sm text-black/50 dark:text-white/50">
                      — {job.message}
                    </span>
                  </div>

                  {/* Progress bar */}
                  {job.status !== "done" && job.status !== "error" && (
                    <div className="h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div className="h-full w-2/5 rounded-full bg-black dark:bg-white animate-pulse" />
                    </div>
                  )}

                  {job.status === "error" && job.error && (
                    <p className="text-sm text-red-500 mt-2">{job.error}</p>
                  )}
                </div>
              )}

              {job?.status === "done" && job.outputUrl && (
                <div className="mt-4 flex flex-col gap-3 items-start">
                  <div className="rounded-xl overflow-hidden border border-black/10 dark:border-white/15 max-w-sm">
                    <video
                      src={job.outputUrl}
                      controls
                      className="w-full aspect-[9/16] max-h-[500px] object-cover bg-black"
                    />
                  </div>
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

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={goBack}
                className="rounded-xl border border-black/20 dark:border-white/20 px-5 py-2.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Back
              </button>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
