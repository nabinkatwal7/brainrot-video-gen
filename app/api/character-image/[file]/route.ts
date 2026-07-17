import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

const CHARACTERS_DIR = path.join(process.cwd(), "assets", "characters");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const safe = path.resolve(CHARACTERS_DIR, file);
  if (!safe.startsWith(path.resolve(CHARACTERS_DIR) + path.sep)) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  try {
    const buffer = await readFile(safe);
    const ext = path.extname(file).toLowerCase();
    const contentType = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
    return new NextResponse(buffer, {
      headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=3600" },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
