export interface ScriptLine {
  speaker: string;
  text: string;
}

/**
 * Parses "Speaker: text" lines (one turn per line) into an ordered list of turns.
 * Blank lines and lines without a "Name:" prefix are ignored.
 */
export function parseScript(raw: string): ScriptLine[] {
  const lines: ScriptLine[] = [];

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const match = line.match(/^([^:]{1,40}):\s*(.+)$/);
    if (!match) continue;

    const [, speaker, text] = match;
    if (!text.trim()) continue;

    lines.push({ speaker: speaker.trim(), text: text.trim() });
  }

  if (lines.length === 0) {
    throw new Error(
      "No valid script lines found. Use one turn per line, formatted as 'Speaker: text'."
    );
  }

  return lines;
}

export function uniqueSpeakers(lines: ScriptLine[]): string[] {
  return Array.from(new Set(lines.map((l) => l.speaker)));
}
