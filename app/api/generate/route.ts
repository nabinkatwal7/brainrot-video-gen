import { NextResponse } from "next/server";
import { createJob } from "@/lib/job-store";
import { runPipeline, type GenerateRequest } from "@/lib/pipeline";

export async function POST(request: Request) {
  let body: GenerateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.script?.trim() || !body.background) {
    return NextResponse.json({ error: "script and background are required" }, { status: 400 });
  }

  const job = createJob();
  // Fire-and-forget: the client polls /api/jobs/[id] for progress.
  runPipeline(job.id, body);

  return NextResponse.json({ jobId: job.id });
}
