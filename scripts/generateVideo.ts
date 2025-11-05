#!/usr/bin/env tsx

import { runPipeline } from '../lib/pipeline/agent';

async function main() {
  const topic = process.argv[2] ?? 'AI breakthroughs you missed this week';
  const toneArg = process.argv[3] ?? 'informative';
  const durationArg = Number(process.argv[4] ?? 180);
  const tone = toneArg === 'playful' || toneArg === 'dramatic' ? toneArg : 'informative';

  const result = await runPipeline({
    topic,
    tone,
    targetDurationSec: isFinite(durationArg) ? durationArg : 180,
    visibility: 'private',
  });

  console.log('Rendered video path:', result.videoPath);
  if (result.youtubeUrl) {
    console.log('Uploaded to YouTube:', result.youtubeUrl);
  } else {
    console.log('YouTube credentials missing – video stored locally');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
