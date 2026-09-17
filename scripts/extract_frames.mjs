#!/usr/bin/env node
// Extracts still frames from a screen recording the person provides (typically a mobile app that has no
// URL and can't be driven with Playwright — see SKILL.md "Track B"). Wraps the system `ffmpeg`
// binary rather than a bundled/npm ffmpeg — this project already confirmed ffmpeg is installed at
// /opt/homebrew/bin/ffmpeg, so there's no reason to add a heavy dependency for it.
//
// Two modes:
//
// Interval mode — even coverage across the whole recording, when there's no specific moment
// called out:
//   node extract_frames.mjs <video_path> <output_dir> --interval 2
//   (one frame every 2 seconds; default interval is 2 if omitted)
//
// Timestamp mode — specific moments the person pointed at ("look at what happens around 0:45"):
//   node extract_frames.mjs <video_path> <output_dir> --timestamps 0:12,0:45,1:03.5
//
// Output: a JSON array on stdout — { "id", "timestamp", "file" } per frame, and the frames
// themselves as <output_dir>/frame-<NNN>.png (interval mode) or <output_dir>/frame-<timestamp>.png
// (timestamp mode, colon replaced with '-' for a filesystem-safe name).
//
// This script only extracts frames — it never decides which frames matter. That judgment (which
// screen shows which principle) happens in the audit itself, by actually looking at the images.

import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync } from 'node:fs';
import { extname } from 'node:path';

function parseArgs(argv) {
  const [, , videoPath, outDir, ...rest] = argv;
  if (!videoPath || !outDir) {
    console.error('Usage: node extract_frames.mjs <video_path> <output_dir> [--interval <seconds>] [--timestamps t1,t2,...]');
    process.exit(1);
  }
  let mode = 'interval';
  let interval = 2;
  let timestamps = [];
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--interval') {
      mode = 'interval';
      interval = Number(rest[++i]);
    } else if (rest[i] === '--timestamps') {
      mode = 'timestamps';
      timestamps = rest[++i].split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return { videoPath, outDir, mode, interval, timestamps };
}

function checkFfmpeg() {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  } catch {
    console.error(JSON.stringify({
      error: 'ffmpeg not found on PATH. Install it (e.g. `brew install ffmpeg`) or provide screenshots instead of a recording — this run cannot extract frames without it.',
    }));
    process.exit(1);
  }
}

function extractInterval(videoPath, outDir, interval) {
  const pattern = `${outDir}/frame-%03d.png`;
  // -vf fps=1/interval takes one frame every `interval` seconds, not `interval` frames per second.
  execFileSync('ffmpeg', ['-y', '-i', videoPath, '-vf', `fps=1/${interval}`, pattern], { stdio: 'ignore' });
  const files = readdirSync(outDir).filter(f => /^frame-\d+\.png$/.test(f)).sort();
  return files.map((f, i) => ({ id: `frame-${String(i + 1).padStart(3, '0')}`, timestamp: secondsToTimestamp(i * interval), file: f }));
}

function secondsToTimestamp(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function extractTimestamps(videoPath, outDir, timestamps) {
  const results = [];
  for (const ts of timestamps) {
    const safeName = `frame-${ts.replace(/[:.]/g, '-')}.png`;
    const filePath = `${outDir}/${safeName}`;
    try {
      // -ss before -i seeks fast (keyframe-nearest); accurate enough for a UI screenshot, and
      // far faster than -ss after -i (which decodes from the start every time).
      execFileSync('ffmpeg', ['-y', '-ss', ts, '-i', videoPath, '-frames:v', '1', filePath], { stdio: 'ignore' });
      results.push({ id: safeName.replace(extname(safeName), ''), timestamp: ts, file: safeName, status: 'ok' });
    } catch (err) {
      results.push({ id: safeName.replace(extname(safeName), ''), timestamp: ts, file: null, status: 'error', reason: String(err && err.message ? err.message : err) });
    }
  }
  return results;
}

function main() {
  const { videoPath, outDir, mode, interval, timestamps } = parseArgs(process.argv);
  checkFfmpeg();
  mkdirSync(outDir, { recursive: true });

  let results;
  if (mode === 'timestamps') {
    if (timestamps.length === 0) {
      console.error('--timestamps was passed but no timestamps parsed — check the comma-separated list.');
      process.exit(1);
    }
    results = extractTimestamps(videoPath, outDir, timestamps);
  } else {
    results = extractInterval(videoPath, outDir, interval);
  }

  console.log(JSON.stringify(results, null, 2));
}

main();
