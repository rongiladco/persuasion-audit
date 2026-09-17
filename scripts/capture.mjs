#!/usr/bin/env node
// Screenshots pages/elements for the persuasion-audit skill (Cialdini principles). Adapted
// verbatim from the cro-quick-wins skill's capture.mjs — same underlying need (real screenshots,
// not descriptions from memory), just applied to persuasion findings instead of CRO findings.
// Three things this script is for:
// 1) Orientation shots of a whole panel (homepage, pricing, onboarding step...) so the model can
//    actually look at the page before writing anything about it.
// 2) A highlighted shot of the specific element a finding is about (a social-proof widget, a
//    scarcity countdown, an authority badge), so the report shows the real evidence instead of
//    just describing it. Runs at both mobile and desktop viewports since persuasion patterns
//    often differ between the two (e.g. a trust badge visible on desktop but cut on mobile).
// 3) Multi-step flows (signup wizard, add-to-cart→checkout, a paywall reached only after a trial
//    prompt) — many panels this skill cares about only exist after a real user action, not at a
//    static URL. A plain goto-and-screenshot can't reach them.
//
// Usage:
//   node capture.mjs <jobs.json> <output_dir> [outfile]
//
// jobs.json is an array of job objects. Two shapes:
//
// Single-page job (unchanged from earlier versions):
// {
//   "id": "home-mobile-full",       // becomes <id>.png — short, filesystem-safe, unique
//   "url": "https://example.com/",
//   "viewport": "mobile" | "desktop",
//   "mode": "full" | "viewport" | "selector",
//     // full     = whole scrollable page, top to bottom
//     // viewport = only what's visible without scrolling (the "5-second test" crop)
//     // selector = one highlighted element, with context padding (requires "selector")
//   "selector": "<css selector>"    // required only when mode is "selector"
// }
//
// Flow job — a sequence of actions in one browser context/session, for panels that only
// exist after an interaction (checkout after add-to-cart, a confirmation page after a form
// submit):
// {
//   "id": "checkout-mobile",
//   "viewport": "mobile",
//   "mode": "flow",
//   "steps": [
//     { "action": "goto", "url": "https://example.com/products/x" },
//     { "action": "click", "selector": ".product-form__buy-btn" },
//     { "action": "waitForURL", "pattern": "**/cart**" },
//     { "action": "click", "selector": "text=Checkout" },
//     { "action": "waitForURL", "pattern": "**/checkout**" },
//     { "action": "wait", "ms": 1500 },                          // let async widgets (payment iframes etc.) render
//     { "action": "screenshot", "as": "checkout" }                // -> checkout-mobile__checkout.png
//   ]
// }
// Supported step actions: goto, click, fill, wait (fixed ms), waitForURL (glob pattern),
// waitForSelector (default state "visible"), scroll (by: pixels relative to current position,
// default one viewport height; or to: absolute Y) — see below for why this exists, screenshot
// (as: sub-id, clip: "full"|"viewport"|"selector" default "viewport", selector: required if clip
// is "selector"). A flow can include more than one screenshot step (e.g. one mid-flow, one at the
// end) — each produces its own file, all reported individually in the output array.
//
// Why "scroll" exists: a plain {mode:"full"} single-page job takes the fullPage screenshot
// immediately on load — on a site using scroll-triggered reveal animations (IntersectionObserver
// fade/slide-ins, common on modern marketing/portfolio sites), everything below the fold is still
// at its pre-animation state (usually opacity:0), so the screenshot comes back nearly blank past
// the hero. Confirmed for real (2026-09-17, rongilad.co). A flow job that scrolls in steps with a
// short wait between each (letting each section's animation actually fire) and screenshots along
// the way gets the real rendered content instead:
// {
//   "id": "home-desktop", "viewport": "desktop", "mode": "flow",
//   "steps": [
//     { "action": "goto", "url": "https://example.com/" },
//     { "action": "screenshot", "as": "01-hero" },
//     { "action": "scroll" },                               // one viewport height by default
//     { "action": "wait", "ms": 600 },
//     { "action": "screenshot", "as": "02-section" },
//     { "action": "scroll" },
//     { "action": "wait", "ms": 600 },
//     { "action": "screenshot", "as": "03-section" }
//   ]
// }
//
// Output: a JSON array — { "id", "status": "ok" | "hidden" | "not_found" | "error", "file": "<id>.png" | null, "reason": string | null }
// For a flow job, one entry per screenshot step, "id" set to "<job.id>__<step.as>" (or just
// job.id if there's exactly one unnamed screenshot step).
//
// Jobs sharing the same {url, viewport} reuse one page load instead of re-navigating per job —
// a single report can easily ask for 10+ shots (panel orientation + one per finding) against
// the same 3-4 URLs, and re-fetching each time is both slow and a needless extra hit on the
// site being reviewed. Flow jobs always get their own fresh context — a flow's whole point is
// a specific sequence of state changes (cart contents, form state), so it must not be reused
// or interleaved with other jobs, and cannot be cached/shared the way static-page jobs are.

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },   // standard modern-phone baseline (iPhone 12/13/14 class)
  desktop: { width: 1440, height: 1000 }, // matches web-accessibility-audit's desktop convention
};

// Same technique as web-accessibility-audit's capture_screenshots.mjs: an inset box-shadow
// draws strictly inside the element's own border box, so it can never get clipped by a clip
// region that exactly matches that box (an outline can, even at offset 0, in some browsers).
const HIGHLIGHT_STYLE = 'inset 0 0 0 3px #ff2d55, inset 0 0 0 5px rgba(255,255,255,0.9)';
const CONTEXT_PADDING = 28; // fixed pixel pad around the element, not "climb to nearest ancestor" — see the sibling script's note on why a fixed pad is more predictable than ancestor-climbing.

async function getPage(cache, browser, url, viewportName) {
  const key = `${viewportName}::${url}`;
  if (cache.has(key)) return cache.get(key);
  const context = await browser.newContext({ viewport: VIEWPORTS[viewportName] });
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  } catch {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  }
  cache.set(key, page);
  return page;
}

// Shared by both the standalone "selector" mode and a flow's "screenshot" step with
// clip:"selector" — one highlighted, padded capture of a single element.
async function screenshotSelector(page, selector, filePath) {
  const locator = page.locator(selector).first();
  const count = await locator.count();
  if (count === 0) {
    return { status: 'not_found', file: null, reason: `Selector matched no element: ${selector}` };
  }
  const visible = await locator.isVisible();
  if (!visible) {
    return { status: 'hidden', file: null, reason: 'Element exists but is not visible in the current rendered state.' };
  }

  await locator.scrollIntoViewIfNeeded();
  const targetHandle = await locator.elementHandle();
  const prevShadow = await targetHandle.evaluate((el, style) => {
    const prev = el.style.boxShadow;
    el.style.boxShadow = style;
    return prev;
  }, HIGHLIGHT_STYLE);

  const box = await targetHandle.boundingBox();
  if (box) {
    const vp = page.viewportSize();
    const clip = {
      x: Math.max(0, box.x - CONTEXT_PADDING),
      y: Math.max(0, box.y - CONTEXT_PADDING),
      width: Math.min(box.width + CONTEXT_PADDING * 2, vp.width),
      height: Math.min(box.height + CONTEXT_PADDING * 2, vp.height),
    };
    await page.screenshot({ path: filePath, clip });
  } else {
    await targetHandle.screenshot({ path: filePath });
  }

  await targetHandle.evaluate((el, prev) => { el.style.boxShadow = prev; }, prevShadow);
  return { status: 'ok', file: filePath.split('/').pop(), reason: null };
}

async function runFlow(browser, job, outDir) {
  const { id, viewport, steps } = job;
  const flowResults = [];
  if (!VIEWPORTS[viewport]) {
    return [{ id, status: 'error', file: null, reason: `Unknown viewport "${viewport}" — expected "mobile" or "desktop".` }];
  }
  if (!Array.isArray(steps) || steps.length === 0) {
    return [{ id, status: 'error', file: null, reason: 'mode "flow" requires a non-empty "steps" array.' }];
  }

  const context = await browser.newContext({ viewport: VIEWPORTS[viewport] });
  const page = await context.newPage();

  try {
    for (const [i, step] of steps.entries()) {
      const label = `${id} step ${i + 1} (${step.action})`;
      try {
        if (step.action === 'goto') {
          try {
            await page.goto(step.url, { waitUntil: 'networkidle', timeout: 30000 });
          } catch {
            await page.goto(step.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
          }
        } else if (step.action === 'click') {
          await page.locator(step.selector).first().click({ timeout: step.timeout ?? 10000 });
        } else if (step.action === 'fill') {
          await page.locator(step.selector).first().fill(step.value ?? '', { timeout: step.timeout ?? 10000 });
        } else if (step.action === 'wait') {
          await page.waitForTimeout(step.ms ?? 1000);
        } else if (step.action === 'waitForURL') {
          await page.waitForURL(step.pattern, { timeout: step.timeout ?? 20000 });
        } else if (step.action === 'waitForSelector') {
          await page.locator(step.selector).first().waitFor({ state: step.state ?? 'visible', timeout: step.timeout ?? 10000 });
        } else if (step.action === 'scroll') {
          // Needed because a plain fullPage:true screenshot fires before scroll-triggered reveal
          // animations (IntersectionObserver-based fade/slide-ins, common on modern marketing
          // sites) ever run — the page renders almost entirely blank below the fold. Scrolling
          // step-by-step and waiting between steps lets each section actually animate in before
          // it's captured. `by` scrolls relative to current position (viewport heights by
          // default); `to` scrolls to an absolute Y position.
          if (typeof step.to === 'number') {
            await page.evaluate((y) => window.scrollTo(0, y), step.to);
          } else {
            const amount = step.by ?? await page.evaluate(() => window.innerHeight);
            await page.evaluate((y) => window.scrollBy(0, y), amount);
          }
        } else if (step.action === 'screenshot') {
          const subId = step.as || (steps.filter(s => s.action === 'screenshot').length === 1 ? null : `step${i + 1}`);
          const shotId = subId ? `${id}__${subId}` : id;
          const filePath = `${outDir}/${shotId}.png`;
          const clipMode = step.clip || 'viewport';
          if (clipMode === 'full') {
            await page.screenshot({ path: filePath, fullPage: true });
            flowResults.push({ id: shotId, status: 'ok', file: `${shotId}.png`, reason: null });
          } else if (clipMode === 'viewport') {
            await page.screenshot({ path: filePath, fullPage: false });
            flowResults.push({ id: shotId, status: 'ok', file: `${shotId}.png`, reason: null });
          } else if (clipMode === 'selector') {
            if (!step.selector) {
              flowResults.push({ id: shotId, status: 'error', file: null, reason: 'screenshot step with clip:"selector" requires a "selector" field.' });
            } else {
              const r = await screenshotSelector(page, step.selector, filePath);
              flowResults.push({ id: shotId, ...r });
            }
          } else {
            flowResults.push({ id: shotId, status: 'error', file: null, reason: `Unknown clip mode "${clipMode}" — expected "full", "viewport", or "selector".` });
          }
        } else {
          flowResults.push({ id: `${id}__step${i + 1}`, status: 'error', file: null, reason: `Unknown flow step action "${step.action}".` });
        }
      } catch (err) {
        // A failed step (e.g. a click target that never appeared) stops the rest of this
        // flow — later steps almost always depend on it — but is reported clearly rather
        // than silently producing no output, so the caller knows exactly which step broke
        // and can decide whether to retry with a different selector, add a wait, etc.
        flowResults.push({ id: `${id}__step${i + 1}`, status: 'error', file: null, reason: `${label} failed: ${String(err && err.message ? err.message : err)}` });
        break;
      }
    }
  } finally {
    await context.close();
  }

  if (flowResults.length === 0) {
    flowResults.push({ id, status: 'error', file: null, reason: 'Flow completed with no screenshot steps — nothing was captured.' });
  }
  return flowResults;
}

async function main() {
  const [, , jobsPath, outDir, outfile] = process.argv;
  if (!jobsPath || !outDir) {
    console.error('Usage: node capture.mjs <jobs.json> <output_dir> [outfile]');
    process.exit(1);
  }
  const jobs = JSON.parse(readFileSync(jobsPath, 'utf-8'));
  mkdirSync(outDir, { recursive: true });

  const results = [];
  let browser;
  const pageCache = new Map();
  try {
    browser = await chromium.launch();

    for (const job of jobs) {
      const { id, url, viewport, mode, selector, steps } = job;

      if (mode === 'flow') {
        const flowResults = await runFlow(browser, job, outDir);
        results.push(...flowResults);
        continue;
      }

      try {
        if (!VIEWPORTS[viewport]) {
          results.push({ id, status: 'error', file: null, reason: `Unknown viewport "${viewport}" — expected "mobile" or "desktop".` });
          continue;
        }
        const page = await getPage(pageCache, browser, url, viewport);
        const filePath = `${outDir}/${id}.png`;

        if (mode === 'full') {
          await page.screenshot({ path: filePath, fullPage: true });
          results.push({ id, status: 'ok', file: `${id}.png`, reason: null });
          continue;
        }

        if (mode === 'viewport') {
          await page.screenshot({ path: filePath, fullPage: false });
          results.push({ id, status: 'ok', file: `${id}.png`, reason: null });
          continue;
        }

        if (mode === 'selector') {
          if (!selector) {
            results.push({ id, status: 'error', file: null, reason: 'mode "selector" requires a "selector" field.' });
            continue;
          }
          const r = await screenshotSelector(page, selector, filePath);
          results.push({ id, ...r });
          continue;
        }

        results.push({ id, status: 'error', file: null, reason: `Unknown mode "${mode}" — expected "full", "viewport", "selector", or "flow".` });
      } catch (err) {
        results.push({ id, status: 'error', file: null, reason: String(err && err.message ? err.message : err) });
      }
    }
  } finally {
    if (browser) await browser.close();
  }

  const output = JSON.stringify(results, null, 2);
  if (outfile) {
    writeFileSync(outfile, output);
  } else {
    console.log(output);
  }
}

main();
