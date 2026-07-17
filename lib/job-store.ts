import { randomUUID } from "node:crypto";

export type JobStatus = "queued" | "synthesizing" | "rendering" | "done" | "error";

export interface Job {
  id: string;
  status: JobStatus;
  message: string;
  outputUrl?: string;
  error?: string;
  createdAt: number;
}

const jobs = new Map<string, Job>();

export function createJob(): Job {
  const job: Job = {
    id: randomUUID(),
    status: "queued",
    message: "Queued",
    createdAt: Date.now(),
  };
  jobs.set(job.id, job);
  return job;
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function updateJob(id: string, patch: Partial<Job>): void {
  const job = jobs.get(id);
  if (!job) return;
  Object.assign(job, patch);
}
