import { CHARACTER_PRESETS, type CharacterPreset } from "./characters";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

function getApiKey(): string | null {
  return process.env.GEMINI_API_KEY ?? null;
}

interface ScriptResult {
  script: string;
  error?: string;
}

export async function generateScript(
  topic: string,
  preset?: CharacterPreset,
  storyMode = false
): Promise<ScriptResult> {
  const p = preset ?? CHARACTER_PRESETS[0];
  const speakerNames = p.speakers.map((s) => s.name);
  const speakerStyles = p.speakers
    .map((s) => `- ${s.name}: ${s.style}`)
    .join("\n");

  const apiKey = getApiKey();

  let prompt: string;
  if (storyMode) {
    prompt = `Generate a short "Reddit reacts" video script. ${speakerNames.join(" and ")} from "${p.name}" read a hilarious Reddit AITA / TIFU / relationship post about: "${topic}".

Character styles:
${speakerStyles}

Format EXACTLY like this (one speaker reads the story, the other reacts):
${speakerNames[0]}: <reading the Reddit post>
${speakerNames[1]}: <reacting to it>
${speakerNames[0]}: <continues the story>
${speakerNames[1]}: <reacts again>
(continue for 6-10 lines total)

Rules:
- Make it funny and in-character
- 6-10 lines total
- Every line starts with "${speakerNames[0]}:" or "${speakerNames[1]}:"
- No narration or stage directions`;
  } else {
    prompt = `Generate a short, funny dialogue between ${speakerNames.join(" and ")} from "${p.name}" about the topic: "${topic}".

Character styles:
${speakerStyles}

Format each line EXACTLY like this:
${speakerNames[0]}: <dialogue>
${speakerNames[1]}: <dialogue>

Rules:
- Make it hilarious and in-character
- Keep it 6-10 lines total
- Every line must start with "${speakerNames[0]}:" or "${speakerNames[1]}:"
- No narration, no stage directions`;
  }

  if (apiKey) {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 500 },
        }),
      });

      if (!response.ok) {
        const error = await response.text().catch(() => "");
        throw new Error(`Gemini API error (${response.status}): ${error.slice(0, 200)}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      const lines = text
        .split("\n")
        .map((l: string) => l.trim())
        .filter((l: string) =>
          new RegExp(`^(${speakerNames.map(s => escapeRegex(s)).join("|")}):`, "i").test(l)
        )
        .map((l: string) =>
          l.replace(/^\*+/g, "").replace(/\*+$/g, "").trim()
        );

      if (lines.length >= 2) {
        return { script: lines.join("\n") };
      }
    } catch (err) {
      console.error("Gemini API call failed, using fallback:", err);
    }
  }

  return { script: p.defaultScript };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
