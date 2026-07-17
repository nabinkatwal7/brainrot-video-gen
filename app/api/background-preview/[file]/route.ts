import { NextResponse } from "next/server";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";

const BACKGROUNDS_DIR = path.join(process.cwd(), "assets", "backgrounds");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const safe = path.resolve(BACKGROUNDS_DIR, file);
  if (!safe.startsWith(path.resolve(BACKGROUNDS_DIR) + path.sep)) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  try {
    const stats = await stat(safe);
    const stream = createReadStream(safe);
    const ext = path.extname(file).toLowerCase();
    const contentType =
      ext === ".webm" ? "video/webm" :
      ext === ".mov" ? "video/quicktime" :
      ext === ".mkv" ? "video/x-matroska" :
      "video/mp4";
    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(stats.size),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
