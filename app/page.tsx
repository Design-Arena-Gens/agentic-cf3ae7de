'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type JobSummary = {
  id: string;
  status: 'queued' | 'running' | 'failed' | 'success';
  topic: string;
  tone: string;
  visibility: string;
  createdAgo: string;
  duration?: number;
  youtubeUrl?: string;
};

type ApiResponse = {
  jobs: JobSummary[];
};

const tones = [
  { value: 'informative', label: 'Informative' },
  { value: 'playful', label: 'Playful' },
  { value: 'dramatic', label: 'Dramatic' },
];

export default function HomePage() {
  const [topic, setTopic] = useState('AI news of the week');
  const [tone, setTone] = useState('informative');
  const [visibility, setVisibility] = useState('unlisted');
  const [duration, setDuration] = useState(180);
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const response = await fetch('/api/run', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to load jobs');
      }
      const data: ApiResponse = await response.json();
      setJobs(data.jobs ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          tone,
          visibility,
          targetDurationSec: duration,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? 'Failed to trigger agent');
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const runningJob = useMemo(() => jobs.find((job) => job.status === 'running'), [jobs]);

  return (
    <main className="min-h-screen px-6 py-12 flex justify-center">
      <div className="w-full max-w-6xl space-y-12">
        <header className="glass p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <p className="text-sm uppercase tracking-[0.35em] text-indigo-200">AutoTube Studio</p>
              <h1 className="text-4xl md:text-5xl font-semibold text-slate-50">
                Autonomous YouTube production pipeline
              </h1>
              <p className="text-slate-300 text-lg">
                Generate scripts, synthesize voiceovers, render full HD clips, and ship straight to your channel.
              </p>
            </div>
            <div className="text-right">
              <p className="text-emerald-300 text-sm font-medium">Pipeline status</p>
              <p className="text-2xl font-semibold">
                {runningJob ? 'Rendering new drop…' : 'Standing by'}
              </p>
            </div>
          </div>
        </header>

        <section className="grid lg:grid-cols-[2fr,3fr] gap-8">
          <form onSubmit={onSubmit} className="glass p-8 space-y-6">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Topic</label>
              <input
                className="w-full rounded-xl bg-slate-900/60 border border-indigo-500/40 px-4 py-3 text-base focus:border-indigo-400 focus:outline-none"
                placeholder="Weekly AI news roundup"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Tone</label>
                <select
                  className="w-full rounded-xl bg-slate-900/60 border border-indigo-500/40 px-4 py-3 text-base"
                  value={tone}
                  onChange={(event) => setTone(event.target.value)}
                >
                  {tones.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Visibility</label>
                <select
                  className="w-full rounded-xl bg-slate-900/60 border border-indigo-500/40 px-4 py-3 text-base"
                  value={visibility}
                  onChange={(event) => setVisibility(event.target.value)}
                >
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Target duration (seconds)</label>
              <input
                type="number"
                min={30}
                max={600}
                step={10}
                className="w-full rounded-xl bg-slate-900/60 border border-indigo-500/40 px-4 py-3 text-base"
                value={duration}
                onChange={(event) => setDuration(Number(event.target.value))}
              />
            </div>

            {error && (
              <p className="text-sm text-rose-300 bg-rose-900/40 px-4 py-3 rounded-xl border border-rose-500/30">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-indigo-500 hover:bg-indigo-400 transition-colors py-4 text-lg font-semibold text-slate-950 disabled:bg-indigo-900 disabled:text-indigo-300"
            >
              {isLoading ? 'Orchestrating…' : 'Generate & Upload'}
            </button>
            <p className="text-xs text-slate-400">
              Requires OPENAI and YouTube credentials in project environment variables for fully automated publishing.
            </p>
          </form>

          <div className="glass p-8 space-y-6 overflow-hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent runs</h2>
              <button
                onClick={refresh}
                className="text-sm text-indigo-300 hover:text-indigo-100"
              >
                Refresh
              </button>
            </div>

            <div className="space-y-4 max-h-[520px] overflow-auto pr-2">
              {jobs.length === 0 && (
                <p className="text-sm text-slate-400">No runs yet. Launch the agent to generate your first episode.</p>
              )}

              {jobs.map((job) => (
                <article key={job.id} className="border border-slate-700/60 rounded-2xl p-4 bg-slate-900/40">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-indigo-200 uppercase tracking-wide">{job.status}</p>
                      <h3 className="text-lg font-semibold text-slate-100">{job.topic}</h3>
                    </div>
                    <span className="text-xs text-slate-400">{job.createdAgo}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-300">
                    <span className="bg-slate-800/80 rounded-full px-3 py-1">Tone: {job.tone}</span>
                    <span className="bg-slate-800/80 rounded-full px-3 py-1">Visibility: {job.visibility}</span>
                    {job.duration !== undefined && (
                      <span className="bg-slate-800/80 rounded-full px-3 py-1">Render {job.duration}s</span>
                    )}
                  </div>
                  {job.youtubeUrl && (
                    <a
                      href={job.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-indigo-300 hover:text-indigo-100 text-sm"
                    >
                      View on YouTube →
                    </a>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
