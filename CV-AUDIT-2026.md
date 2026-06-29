# 2026 CV Audit Report — Senior HTML5 / iGaming Game Developer

> Expert audit of `public/Edgar_Hovsepyan_CV.pdf` against 2026 ATS / recruiter "golden
> standards" (HERO/STAR/XYZ, 7.4-second scan, single-column ATS logic, 475–600 words).
> Produced by a 6-lens multi-agent review, adversarially verified: **51 grounded findings**
> (12 Must-Fix, 30 Optimization, 9 Minor; 6 dropped as overstated/ungrounded).

---

## 1. Verdict

This CV has a genuinely strong, authentic candidate underneath a structure that is actively working against him. The voice ("the weight of a spin, the snap of a reel stop") and the substance (50+ casino titles, full-cycle PixiJS v8, a real production AI tooling differentiator) are exactly what a 2026 iGaming studio wants — but the document is **not 2026-ready** in its current form. The single biggest risk is **silent, total-loss failure**: a contact email that likely bounces (`hovsepyanedgar94@` vs. the on-file `edgarhovsepyan94@`) combined with a work-status line (`On-site · No relocation`) that auto-rejects the candidate from the remote-first roles he has explicitly decided to target. The headline opportunity is equally clear: convert a prose-and-chips "visual PDF" into a clean single-column, bullet-driven, link-backed document — doing so unlocks ATS parseability, recruiter trust, and the game-dev-first / AI-as-differentiator positioning that is currently muddled.

---

## 2. ATS Readiness Score

**38 / 100.**

*Justification (general parseability + recruiter-scan, no JD provided):* A two-column "visual PDF" with boxed contact details, numbered/creative section headings ("Profile 01", "Selected Work 03", "Bust Craft"), zero links, prose instead of bullets, and a likely-bouncing email — these are foundational, structural failures that cap the score regardless of the strong underlying content. The score rises into the 80s almost mechanically once the single-column rebuild, standard headings, correct email, links, and bulleted experience are in place.

---

## 3. 🔴 Must-Fix

*(Duplicates merged across all six lenses. Do these before the CV goes anywhere.)*

**1. Correct the contact email — it likely bounces (flagged by 5 of 6 lenses).**
- **Problem:** The CV shows `hovsepyanedgar94@gmail.com`; the account on file is `edgarhovsepyan94@gmail.com`. The name order is transposed — one address does not exist. A recruiter who replies gets a bounce or silence and moves on, with no signal to the candidate. This nullifies every other claim on the page.
- **Fix:** ✅ **CONFIRMED — use `edgarhovsepyan94@gmail.com`.** Use the identical address across CV, portfolio, LinkedIn, and GitHub. *(Also fix the live site `src/data/profile.ts`, which has the same typo.)*

**2. Fix the work-status line — it self-rejects from the entire target market.**
- **Problem:** `Status: On-site · No relocation` and `● Available · Yerevan · On-site ready` contradict the locked targeting (Remote worldwide + on-site Yerevan). It tells every remote-first studio to skip, and ATS filters key on the word "Remote," which is entirely absent. Appears **twice** in the scan zone.
- **Fix:** ✅ Replace both; ensure **"Remote"** appears: `Remote (worldwide) or on-site Yerevan, Armenia`. Delete `No relocation`.

**3. Rebuild as a single-column document.**
- **Problem:** ATS parsers linearize the text stream, not the visual grid. The two-column layout with a right-hand contact box can scramble or drop phone/email/location — exactly what must survive.
- **Fix:** Single column. Contact details inline as plain body text under the name. Remove the boxed side column.

**4. Add machine-discoverable links — there are currently none.**
- **Problem:** No LinkedIn, GitHub, portfolio, or playable-game link. For a game/AI engineer this removes him from link-based screening and leaves every claim (50+ games, SBC award, 678 skills, Stake Engine studio) unverifiable.
- **Fix:** ✅ LinkedIn + GitHub now confirmed. Add as full `https://` plain-text URLs. Still need portfolio URL + a playable-game link (Non-Stop Roulette / Stake Engine studio).

**5. Replace the tech-tag headline with a clean resume TITLE that locks Game Dev first / AI second.**
- **Problem:** `Senior HTML5 Game Developer — iGaming · PixiJS · WebGL/WebGPU · AI Engineering` is a run-on tag string ending on "AI Engineering" as a co-equal headline term.
- **Fix:** Title: `Senior HTML5 Game Developer — iGaming`; subline: `PixiJS v8 · WebGL/WebGPU · casino game-feel — augmented by production AI tooling`.

---

## 4. 🟠 Optimization

*(Rewritten examples use only the candidate's own facts — no invented metrics; placeholders marked `[number needed]`.)*

**A. Convert all five roles from prose to 3–5 quantified HERO bullets.** Every role is a single run-on paragraph; 2026 standard is scannable bullets, each led by an achievement.
> **Pascal (example shape):**
> - Shipped `[number needed]` production casino titles across 14+ game verticals (slots, live & 3D roulette, blackjack, crash, Plinko, Mines, Deal-or-No-Deal) in full-cycle PixiJS v8 / TypeScript.
> - Architected the studio's Spine + particle VFX web editor, adopted by `[number needed]` artists.
> - Sustained 120 fps on mid-tier mobile during win ceremonies with `[number needed]`+ simultaneous particles via draw-call batching and zero-GC pooling.
> - Built and led adoption of the Claude Code + MCP build pipeline (asset packing, atlas generation, prototyping).
> - Mentored mid & junior devs.

**B. Lead every role's first bullet with a number.** None currently does — all open on scope/activity, so it reads "what I was busy doing," not "what I delivered." Mark `[number needed]` where none exists — do not invent.

**C. Attach a measured effect (the "Y") to metric-less claims.** Only hard metric is "120 fps."
> `Cut artist animation-QA time by [X%] by building an AI animation-benchmark tool.`
> `Reduced build-pipeline turnaround from [X] to [Y] via Claude Code + MCP automation.`

**D. Swap weak/ownership verbs for achievement verbs.** "built/owned/helped/brought in" → **Architected / Mentored [N] / Introduced and led adoption of**.

**E. State "678 Claude Code skills" once, reframed around outcome + backed by a link — delete the other two instances.** Repeated 3× with no proof, the oddly-precise count reads as vanity. Round honestly (`600+`) unless a public repo literally shows 678; if private, add "(private repo, available on request)."

**F. Disambiguate the overlapping employment dates.** Extra Studio (2019–2023) sits inside Fastexverse (2020–2024) and brushes Pascal's 2024 start — reads as two concurrent full-time roles and undercuts "I don't job-hop." Use `MMM YYYY` granularity and label any concurrent role (e.g. `freelance / contract`). Never erase a role to hide overlap — translate honestly.

**G. Promote a 2–3 sentence Branding Statement to the top third, under the title.** The brand pitch is currently buried in "Profile (01)."

**H. Reorder bullets so games lead and AI follows as the accelerant** (locked positioning).

**I. Translate internal jargon.** "join at zero and build to ten" → `scale products from prototype to live`; "the whole floor" → `the studio's full casino catalog (14+ verticals)`; "Bust Craft" → `Slot & Casino Game Systems`.

**J. Cut the "AI evangelist" label — keep the proof.** His concrete tooling already proves it. Keep "mentor" (backed by 50+ devs).

**K. Move Education to the bottom, condensed to 1–2 lines.** Keep the Anthropic AI-Engineering line as it reinforces the differentiator.

**L. Anchor the 120 fps metric with its conditions** (device, particle count).

**M. Add one outcome to the WhatsApp agent and Picsart mentoring** (currently capability lists).

**N. Maintain one master CV + 3–5 JD-tailored versions** (slots / iGaming multi-game / rendering-WebGPU / AI-tooling / Stake-Engine indie).

**O. Export a selectable-text PDF *and* a parallel .docx;** confirm clean copy-paste order before submitting.

---

## 5. 🟡 Minor / Polish

- **SBC Award:** ✅ Resolved — **SBC Awards Americas 2025 — Game of the Year shortlist** (Non-Stop Roulette, Pascal Gaming). Use this exact wording everywhere; add "team credit." *(The PDF's "2026 finalist" was wrong.)*
- **Tenure math:** "7+ yrs" undersells a 2017 start (~9 yrs). State the honest figure once, reconciled with corrected non-overlapping dates.
- **Compliance-sensitive wording:** "near-miss / LDW" next to "Compliance-ready (UKGC/MGA)" reads as a contradiction to a regulator-aware reviewer. Reframe to `volatility & paytable tuning, deterministic outcome books, replay verification`.
- **Cliché trim (keep the voice):** Keep "all about the feel" + the sensory craft line — it earns its place. Replace "founder mindset" with the concrete fact. Drop "AI-accelerated prototyping" as redundant. Hold "I don't job-hop" until the date overlaps are clarified.
- **Drop numbered/creative section headings.** Use: Summary, Professional Experience, Projects, Skills, Education, Awards.
- **Confirm typography:** body 10–12pt standard font, consistent spacing, real white space — no sub-10pt.
- **Trim the 8-category tech chip wall to 4 grouped categories.**
- **Limit AI to one stat chip, not two.**

---

## 6. The 7.4-Second Scan

**What a recruiter grabs:** "Senior HTML5 Game Developer," iGaming, PixiJS, 50+ games, 7+ yrs, 120 fps, an SBC mention, and a distinctive confident voice. Seniority + domain land fast.

**What they miss or never reach:** any *quantified* achievement (buried in prose), any *clickable proof* (none), the AI differentiator framed as an edge rather than a competing headline, and a clean non-overlapping timeline. In two columns the eye hits the busy right-rail chip wall before the hero achievement, scrambling reading order.

**The 3 reject triggers (by damage):**
1. **`On-site · No relocation`** (×2) → instant filter-out of every remote search he's targeting.
2. **The email mismatch** → if the printed address is the bouncing one, a silent, irreversible reject.
3. **Zero links** → "show me the game" reflex hits nothing; big claims read as unverifiable.

---

## 7. Word-count & Length

**Current estimate: ~850–1,000 words** across two dense two-column pages — well above the **475–600** sweet spot. Driven by:
1. **The Page-2 "Deep Skills" wall**, which largely re-states the Tech Stack chips in paragraph form — **delete it**, folding unique terms (KTX2, deterministic replay, eval-driven prompts) into chips or role bullets.
2. **The ~110-word Profile** — **cut to ~45–50 words**, leading with positioning + one or two hard numbers, keeping a single line of voice.

**Target:** one tight page (lean two-page max) — 475–600 words of core narrative + experience, skills as scannable chips. De-densifying Page 2 also removes the pressure to shrink type below 10pt.

---

*Net: the candidate is strong and the voice is an asset — protect it. The work is structural, not substantive. Fix the five Must-Fixes (email + status line are zero-cost, total-loss items), rebuild single-column with links and bullets, and this moves from ~38 to high-80s without inventing a single metric. Every `[number needed]` placeholder must be filled with real figures before sending.*
