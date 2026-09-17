# The 7 principles — definitions, digital manifestations, check questions, dark-pattern line

This file is the actual substance the audit is graded against. `SKILL.md` is about the *process*
(interview, capture, report structure) — the principles themselves live here so that file doesn't
bloat, same split as `cro-quick-wins/references/cro-principles.md`.

Source: Robert Cialdini, *Influence: The Psychology of Persuasion* (the original six) and
*Pre-Suasion* (Unity, added later as a seventh). Six of these are about triggering a decision;
Unity is about identity — "we," not "like" — which is why it's listed last and treated separately
in the report even though it's structurally a peer of the other six. Further reading, specifically
on applying these principles to digital products: Jakob Nielsen, ["Cialdini's Influence &
Persuasion Principles Applied to UX"](https://jakobnielsenphd.substack.com/p/cialdini-influence-persuasion) —
its evolutionary-mismatch framing (these reflexes evolved for small, face-to-face communities and
now run on a planet of strangers at scale) and its genuine-vs-counterfeit distinction both shaped
how this file separates a legitimate finding from a dark pattern.

**A plain-language line is required for every principle in the report** (see each principle's
"Plain-language" line below) — the technical name stays as the header (it's the real term of art,
worth keeping so the report can be cross-referenced against the source material), but a reader with
no background in persuasion psychology should never have to guess what "Authority" or "Unity" means
from the header alone.

For every principle below: what it is, how it actually shows up in a digital product (web or
app — the manifestations list deliberately isn't URL-specific, since screenshots/video frames from
an app on a phone are as legitimate a source as a live page), what to check for, and where the
line into a **dark pattern** sits. The dark-pattern line isn't a footnote — call it out in the
report exactly where it applies, not just once in a disclaimer section. A recommendation that
pushes a product across that line is not a "quick win," and the report should never suggest one
without flagging the risk explicitly.

## 1. Reciprocity

**Plain-language:** Give something real first, and people feel a pull to give back.

**What it is:** People feel obligated to return a favor. Give first — value, information, a small
gift — and the other side feels a pull to reciprocate (a purchase, a signup, a referral).

**Digital manifestations:** free trial with real functionality (not just a teaser), a genuinely
useful free tool/calculator/template (e.g. a free grader/calculator tool, not just a lead form
wearing a calculator's skin), free shipping or a first-order discount, a helpful resource (guide,
checklist) gated behind nothing more than an email, personalized help (live chat that actually
solves something before asking for anything).

**Check for:**
- Is anything of real value given before the product asks for something back (money, data,
  commitment)?
- Is the "free" thing actually useful, or a thin pretext to justify an ask?
- Does onboarding front-load value (a quick win inside the product itself) before the first
  paywall/upsell?

**Dark-pattern line:** a "free" gift with strings that aren't disclosed until after signup (e.g. a
trial that silently converts to a paid plan with a hard-to-find cancellation path) isn't
reciprocity — it's a bait-and-switch that borrows the psychological pull of reciprocity without
honoring the actual exchange. Flag this distinctly from a legitimate free trial with clear terms.

## 2. Commitment & Consistency

**Plain-language:** Once someone takes even a small step, they want their next choice to match it.

**What it is:** Once someone makes a small commitment (even a trivial one), they feel pressure to
act consistently with it — and are far more likely to agree to a larger, related ask later.

**Digital manifestations:** progressive profiling (ask for an email first, more later), a
multi-step signup/onboarding wizard instead of one long form, a public goal-setting or
preference-selection step early in onboarding, "you've completed 3 of 5 steps" progress
indicators, a small initial action (add to wishlist, start a free plan) that precedes a bigger one
(upgrade).

**Check for:**
- Does onboarding break a big ask into small, sequential commitments rather than one large form?
- Does the product surface a user's own past choices back to them ("you said X matters to you") to
  reinforce consistency before a bigger ask?
- Is there a visible sense of momentum/progress that makes stopping feel like an inconsistency?

**Dark-pattern line:** a "confirmshaming" cancel/decline button ("No thanks, I don't want to save
money") manufactures false inconsistency-guilt rather than reflecting a real prior commitment —
that's manipulation dressed as this principle, not the principle itself. Same for a forced
continuity flow that relies on sunk-cost guilt rather than genuine alignment with something the
user actually chose. Flag both explicitly.

## 3. Social Proof

**Plain-language:** People look at what others are doing to decide what's normal or safe to do.

**What it is:** People look to others' behavior — especially people similar to them — to decide
what's correct, particularly under uncertainty.

**Digital manifestations:** review counts and star ratings, "X people bought this," testimonials
with real names/photos/companies, logos of customers or press mentions, live/recent-activity
notifications ("someone in [city] just signed up," or a real "booked N times in the last 24 hours"
counter — legitimate only if it reflects real, current activity), user counts ("join 50,000+
teams"), case studies with attributable, verifiable outcomes, community size indicators. Testimonials
filtered/segmented by the viewer's own context (industry, company size) carry more weight than a
generic wall of quotes, since proof from people like the viewer is stronger than proof in general.

**Check for:**
- Is social proof present at the actual decision point (next to the CTA, on the pricing page), not
  buried on a separate "About" page no one visits before deciding?
- Is it specific and verifiable (a named customer, a real number) rather than vague ("thousands of
  happy users")?
- Does it match the audience — proof from similar users/companies carries more weight than generic
  proof.

**Dark-pattern line:** fabricated or wildly inflated numbers, fake review clusters, a "5 people are
viewing this right now" widget that fires on every visit regardless of real traffic, or purchased
reviews. This is the single most common dark-pattern violation of a legitimate principle — call
out anything that reads as manufactured urgency-via-fake-crowd distinctly from real, verifiable
social proof, and say so even if it can't be fully confirmed (note it as "verify this reflects real
activity" rather than asserting fraud outright).

## 4. Liking

**Plain-language:** People say yes more easily to people or brands they feel warmly toward.

**What it is:** People say yes more easily to people/brands they like — driven by similarity,
compliments, familiarity, and cooperation toward a shared goal.

**Digital manifestations:** a distinct, human brand voice (not generic corporate copy), a
founder/team story with real faces, personalization that reflects the user's own context back to
them, an aesthetic that signals care and craft (not necessarily "beautiful" — consistent and
intentional), humor or warmth in microcopy (error messages, empty states, confirmation screens),
customer-support interactions that feel human.

**Check for:**
- Does the product's voice/tone feel distinct and consistent, or generic and interchangeable with
  any competitor?
- Are there real human touches (a name, a face, a specific detail) anywhere in the flow, or is
  everything abstracted into "our team"/"our platform"?
- Does empty-state/error copy build goodwill or just state a failure coldly?

**Dark-pattern line:** liking is the principle least prone to a dark-pattern form on its own — the
risk here is usually *absence* (a cold, extractive-feeling product) rather than manipulation. Worth
noting as an opportunity gap more often than a violation, but still worth a line if a product
performs warmth it doesn't back up (e.g. a "personal note from the founder" that's obviously mass-
templated with no real personalization) — that reads as manufactured liking, not earned liking.

## 5. Authority

**Plain-language:** People trust and defer to whoever looks like a credible expert.

**What it is:** People defer to credible expertise, credentials, and legitimate authority —
especially under uncertainty or when the decision feels technical/high-stakes. This is also the
principle most likely to misfire silently: a confident, professional presentation suppresses a
viewer's own scrutiny even when nothing behind it has actually been verified — exactly why a claim
of authority needs to survive a "can this be checked?" test, not just a "does this look credible?"
one.

**Digital manifestations:** credentials/certifications displayed (security badges, compliance
logos — SOC 2, GDPR), expert endorsements or contributor bios with real qualifications, media
mentions ("as seen in..."), years-in-business or scale indicators, clear expert authorship on
content (not anonymous "the team"), professional design quality itself (a polished product signals
competence).

**Check for:**
- Is real expertise/credibility visible where it matters (pricing/checkout for trust-sensitive
  purchases, onboarding for anything touching sensitive data)?
- Are claims of authority backed by something verifiable (a real certification, a named expert)
  rather than asserted ("industry-leading," "#1 rated") with nothing behind it?
- For anything handling money/health/legal/personal data — is authority/trust signaling present at
  all, given how much it matters in those categories specifically?

**Dark-pattern line:** a fake trust badge (an unearned "as seen in" logo, a made-up certification,
a countdown-style "verified by [authority]" stamp with no real backing) is fraud, not persuasion —
flag it as a compliance/legal risk, not just a UX note, if evidence suggests a badge or claim isn't
real.

## 6. Scarcity

**Plain-language:** Things feel more valuable the moment they seem limited or about to run out.

**What it is:** People value things more, and decide faster, when they perceive them as limited —
in supply, in time, or in access.

**Digital manifestations:** low-stock indicators ("only 3 left"), limited-time offers with a real
countdown, limited-seat/limited-cohort language (courses, beta access, a genuine waitlist that
actually gates access rather than being cosmetic), exclusive/invite-only framing, seasonal or
one-time-only product drops.

**Check for:**
- Is the scarcity real and verifiable (an actual inventory count, an actual deadline) or asserted
  with no visible backing?
- Does a countdown timer, once expired, actually end the offer — or does it silently reset on
  reload/revisit?
- Is scarcity used selectively on genuinely limited things, or applied blanket-wide (every product,
  every page) to the point it reads as noise rather than signal?

**Dark-pattern line:** this is the principle with the most well-documented dark-pattern history —
a fake countdown that resets, a "low stock" label shown regardless of actual inventory, an
"X people are looking at this" popup with no real basis. Treat any scarcity signal encountered
during the audit as needing verification, and if it can't be verified as real (which will usually
be the case from screenshots/a live page alone), say so explicitly rather than crediting it as a
strength — phrase it as "uses a low-stock/countdown pattern; whether the underlying signal is real
data or a static/decorative element should be confirmed with the product team," not as a confirmed
finding either way.

## 7. Unity (from *Pre-Suasion*)

**Plain-language:** People say yes fastest to those they see as truly "one of us" — not just similar
to them, but actually on the same team.

**What it is:** The strongest form of "we," not just similarity ("people like you") — a genuine
sense of shared, joint identity (family, team, community, a group you belong to, not just resemble).
Cialdini added this as distinct from Liking and Social Proof because shared *identity* moves people
more than shared *traits* or *behavior*.

**Digital manifestations:** community features (forums, member directories, shared spaces,
user-published content other users actually rely on — not a ghost-town gallery), "member,"
"insider," or cohort-based language that frames the user as part of a group rather than a customer
of a vendor, co-creation mechanics (user-generated content, feedback that visibly shapes the
product, a public changelog crediting the specific user/request behind a shipped feature), a
founding-member/early-adopter identity, language that uses "we"/"us" to include the user rather than
"we" meaning only the company, shared rituals (a cohort start date, a shared onboarding cohort, a
members-only event, leaderboards/shout-outs that name real members rather than anonymized ranks).

**Check for:**
- Does the product ever frame the user as part of a "we," or is the relationship always
  transactional vendor-and-customer framing?
- Is there a real community/cohort mechanic, or just cosmetic "member" language slapped onto an
  otherwise standard SaaS relationship?
- Does user contribution/feedback visibly shape the product (a changelog crediting users, a
  community-requested feature), reinforcing genuine shared identity?

**Dark-pattern line:** "insider"/"member" language with zero actual community or shared-identity
substance behind it (no real group, no real belonging, just a marketing label on a standard
transaction) is a hollow claim, not unity — note it as an opportunity to build real substance behind
the label rather than crediting the label itself as a strength.

## Using this file during the audit

For each principle: state what's actually present (with a screenshot/citation), rate it
Strong/Moderate/Weak/Absent, list concrete opportunities, and — whenever a finding sits at or past
the dark-pattern line above — say so plainly in that finding, not just in a general caveat. Not
every principle will be relevant to every product; a principle genuinely absent and not worth
pursuing for this product (e.g. Scarcity for an enterprise B2B tool with no inventory or time-bound
offer concept) should be marked "not applicable, here's why" rather than forced into a false
finding. **Whenever a rating comes out Absent, say briefly why** if there's a structural reason (a
pre-launch product has no reviews yet; a B2B tool with no inventory has no honest scarcity story) —
a bare "Absent" with no context reads as a gap in the audit, not a gap in the product.

### The genuine-vs-counterfeit gut-check

For every finding, one question cuts through most ambiguity: **is this principle actually,
verifiably present — or has it been counterfeited to look present?** A real customer quote with a
checkable name and company is a genuine finding. The same quote with no attribution, or a
"1,204 people bought this today" counter with no way to verify it reflects real activity, is a
counterfeit — score it as weak/absent on the merits and flag the counterfeit itself as the
dark-pattern risk, not as a strength that happens to have an asterisk. A principle that's genuinely
*available* to the product (real customers exist, real expertise exists) but simply isn't being
surfaced anywhere is a third case — a missed opportunity, not a violation — and belongs in
**Opportunities**, not **Dark-pattern risk**.

### A sharper test for a borderline dark-pattern call

When a finding sits close to the line and the call isn't obvious, these questions (adapted from the
persuasion-ethics literature on dark patterns) help separate honest persuasion from manipulation —
worth running through mentally rather than eyeballing it:
- **Truth:** Is the underlying trigger (the stock count, the testimonial, the credential) real?
- **Regret:** Would someone who found out how this worked, tomorrow, still be glad they said yes?
- **Transparency:** Does the tactic survive being explained plainly to the person it's aimed at?
- **Comprehension:** Could a normal user actually state what they just agreed to (price, renewal
  terms, what they're joining)?

A tactic that fails several of these isn't a matter of taste — call it a dark-pattern risk plainly,
per the per-principle lines above.
