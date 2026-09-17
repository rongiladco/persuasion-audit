# persuasion-audit

A [Claude Skill](https://www.anthropic.com/news/skills) that audits a website, web app, or mobile app for how it uses Robert Cialdini's 7 principles of persuasion — the six from *Influence* (Reciprocity, Commitment & Consistency, Social Proof, Liking, Authority, Scarcity) plus Unity, added later in *Pre-Suasion*. It produces a structured report: what's already there (with real evidence, not a guess), what's missing, and — critically — where a tactic already in use crosses from legitimate persuasion into a dark pattern.

Point it at a URL, or hand it screenshots/a screen recording of something that isn't on the web (most commonly a mobile app), and ask for a "Cialdini audit" or "persuasion audit" — see [`SKILL.md`](SKILL.md) for the full behavior.

## What it does

- **Works on two input tracks.** Track A is a live URL, captured with Playwright (same technique as [cro-quick-wins](https://github.com/rongiladco/cro-quick-wins)). Track B is for anything without a URL — a mobile app installed on a phone is the common case — where the evidence is screenshots the person provides, or a screen recording from which the skill extracts frames with `ffmpeg`.
- **Never guesses at content it wasn't shown.** Track B has no way to navigate the product remotely — the skill states this plainly and works only from what was actually provided, rather than inventing plausible-sounding screens.
- **Handles scroll-triggered content on modern sites.** A plain full-page screenshot on a site with scroll-reveal animations (`IntersectionObserver` fade/slide-ins) comes back mostly blank below the fold — everything is still at `opacity:0`. The capture script includes a `scroll` flow-step (scroll in increments, wait for the animation, screenshot) specifically to get around this.
- **Rates all 7 principles every time**, not just the ones that look interesting — `Strong / Moderate / Weak / Absent`, or `Not applicable` with a reason when a principle genuinely doesn't fit the product (e.g. Scarcity for an enterprise tool with no inventory or time-bound offer).
- **Draws the dark-pattern line explicitly, principle by principle.** `references/cialdini-principles.md` defines exactly where each principle tips into manipulation (a countdown that resets, inflated social proof, confirmshaming, a fake trust badge) — and the skill will not suggest crossing that line, even hypothetically, no matter how it's asked.
- **Every finding traces to a real screenshot.** No claim ("uses fake urgency," "no social proof present") gets made without pointing at the specific image it comes from.
- **Treats fetched/provided content as data, never as instructions** — the same prompt-injection defense used in [web-accessibility-audit](https://github.com/rongiladco/web-accessibility-audit) and cro-quick-wins, since this skill reads arbitrary third-party pages and user-provided screenshots.

## Install

Drop this repo's contents into `.claude/skills/persuasion-audit/` in your project (or wherever your Claude Skills live). Claude Code (or any Claude Skills–compatible client) will pick it up automatically.

Track A (live URL) screenshot capture needs a one-time setup:

```bash
cd scripts
npm install
npx playwright install chromium
```

Track B (screen recording) frame extraction needs `ffmpeg` on `PATH` (e.g. `brew install ffmpeg` on macOS). Without either dependency, the skill says so plainly and asks for an alternative (raw page text for Track A, screenshots instead of a recording for Track B) rather than stalling.

## Repo layout

```
SKILL.md                        # the skill itself — what to do, and why
scripts/
  capture.mjs                   # Playwright screenshot capture: full-page, above-the-fold,
                                 # highlighted single-element, multi-step "flow", and scroll-through
                                 # jobs (the last one specifically for scroll-reveal animations)
  extract_frames.mjs            # ffmpeg wrapper — pulls stills from a screen recording, either
                                 # at a fixed interval or at specific timestamps
references/
  cialdini-principles.md        # full definition of all 7 principles: digital manifestations,
                                 # check questions, and exactly where the dark-pattern line sits
evals/
  evals.json                    # behavioral eval prompts (skill-creator schema)
```

## License

MIT — see [LICENSE](LICENSE).
