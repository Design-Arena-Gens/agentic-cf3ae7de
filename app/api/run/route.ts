import { NextResponse } from 'next/server';
import { z } from 'zod';
import { runPipeline } from '@/lib/pipeline/agent';
import type { PipelineInput } from '@/lib/pipeline/types';
import { createJob, getJobs, summarizeJob, updateJob } from '@/lib/store';

const runSchema = z.object({
  topic: z.string().min(3, 'Topic is required'),
  tone: z.enum(['informative', 'playful', 'dramatic']).default('informative'),
  targetDurationSec: z.number().min(30).max(600).default(180),
  visibility: z.enum(['public', 'unlisted', 'private']).default('unlisted'),
});

export async function GET() {
  const jobs = getJobs().map(summarizeJob);
  return NextResponse.json({ jobs });
}

export async function POST(request: Request) {
  let payload: PipelineInput;
  try {
    const json = await request.json();
    payload = runSchema.parse(json);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid payload', details: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }

  const job = createJob(payload);
  updateJob(job.id, { status: 'running' });

  try {
    const result = await runPipeline(payload);
    updateJob(job.id, { status: 'success', result });
    const updated = getJobs().find((item) => item.id === job.id);
    return NextResponse.json({ jobId: job.id, result: updated ? summarizeJob(updated) : null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    updateJob(job.id, { status: 'failed', error: message });
    return NextResponse.json({ error: message, jobId: job.id }, { status: 500 });
  }
}
