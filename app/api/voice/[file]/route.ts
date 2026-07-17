import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

const VOICES_DIR = path.join(process.cwd(), "assets", "voices");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const safe = path.resolve(VOICES_DIR, file);
  if (!safe.startsWith(path.resolve(VOICES_DIR) + path.sep)) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  try {
    const buffer = await readFile(safe);
    const ext = path.extname(file).toLowerCase();
    const contentType = ext === ".mp3" ? "audio/mpeg" : "audio/wav";
    return new NextResponse(buffer, {
      headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=3600" },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
