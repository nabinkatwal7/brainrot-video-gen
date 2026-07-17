const TTS_SIDECAR_URL = process.env.TTS_SIDECAR_URL ?? "http://127.0.0.1:8008";

export async function isTtsSidecarReady(): Promise<boolean> {
  try {
    const res = await fetch(`${TTS_SIDECAR_URL}/health`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Calls the local Coqui XTTS v2 sidecar and returns the synthesized line as WAV bytes.
 * @param speed - playback speed multiplier (1.0 = normal, 1.3 = 30% faster)
 */
export async function synthesizeLine(
  text: string,
  speakerWavPath: string,
  language = "en",
  speed = 1.3
): Promise<Buffer> {
  const res = await fetch(`${TTS_SIDECAR_URL}/synthesize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, speaker_wav: speakerWavPath, language, speed }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`TTS sidecar error (${res.status}): ${detail.slice(0, 500)}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
