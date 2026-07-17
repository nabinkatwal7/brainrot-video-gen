import { readdir } from "node:fs/promises";
import path from "node:path";

export const ASSETS_ROOT = path.join(process.cwd(), "assets");
export const BACKGROUNDS_DIR = path.join(ASSETS_ROOT, "backgrounds");
export const VOICES_DIR = path.join(ASSETS_ROOT, "voices");
export const CHARACTERS_DIR = path.join(ASSETS_ROOT, "characters");

const VIDEO_EXT = new Set([".mp4", ".mov", ".webm", ".mkv"]);
const AUDIO_EXT = new Set([".wav", ".mp3"]);
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);

export interface AssetOption {
  name: string;
  file: string;
}

async function listAssets(dir: string, allowedExt: Set<string>): Promise<AssetOption[]> {
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return [];
  }
  return entries
    .filter((f) => allowedExt.has(path.extname(f).toLowerCase()))
    .sort()
    .map((f) => ({ name: path.parse(f).name, file: f }));
}

export function listBackgrounds() {
  return listAssets(BACKGROUNDS_DIR, VIDEO_EXT);
}

export function listVoices() {
  return listAssets(VOICES_DIR, AUDIO_EXT);
}

export function listCharacters() {
  return listAssets(CHARACTERS_DIR, IMAGE_EXT);
}
