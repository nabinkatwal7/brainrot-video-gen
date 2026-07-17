import { NextResponse } from "next/server";
import { listBackgrounds, listVoices, listCharacters } from "@/lib/assets";

export async function GET() {
  const [backgrounds, voices, characters] = await Promise.all([
    listBackgrounds(),
    listVoices(),
    listCharacters(),
  ]);
  return NextResponse.json({ backgrounds, voices, characters });
}
