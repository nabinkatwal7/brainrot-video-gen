import { NextResponse } from "next/server";
import { generateScript } from "@/lib/ai";
import { CHARACTER_PRESETS } from "@/lib/characters";

export async function POST(request: Request) {
  let body: { topic?: string; presetId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const topic = body.topic?.trim();
  if (!topic) {
    return NextResponse.json({ error: "topic is required" }, { status: 400 });
  }

  const preset = CHARACTER_PRESETS.find((p) => p.id === body.presetId);
  const result = await generateScript(topic, preset);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ script: result.script });
}
