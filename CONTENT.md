# Portfolio — Front-End Content

All visible text content from the live site, gathered in one place for review/finalizing.
Ordered top-to-bottom as it renders on the page. Source files noted per section.

> **Fact source:** the live React app (`src/data/*.ts` + section components) is the single
> source of truth. `CV-2026.md` is the matching CV master. This file is a mirror of the
> site — regenerate it here whenever the data files change.
> _Last synced: 2026-07-21 — reconciled with `src/data` after the dev pass
> (title, stats, awards, languages, Games section, Résumé section, Telegram)._

---

## Identity / Profile (`src/data/profile.ts`)

- **First name:** EDGAR
- **Last name:** Hovsepyan
- **Wordmark (Armenian):** ԷԴԳԱՐ
- **Full name:** Edgar Hovsepyan
- **Initials / monogram:** Է|Հ
- **Title:** Senior Game Developer · 2D/3D for the Web
- **Badge:** ✦ SBC Americas 2025 GotY Shortlist · BFTH Arena 2024 Finalist
- **Location:** Yerevan, Armenia · Remote worldwide / on-site
- **Email:** edgarhovsepyan94@gmail.com
- **Phone:** +374 94 276 656
- **GitHub:** https://github.com/EdgarHovsepyan
- **LinkedIn:** https://www.linkedin.com/in/edgar-hovsepyan-03044117b
- **Telegram:** https://t.me/Dev_context
- **CV file:** /Edgar_Hovsepyan_CV.pdf

> ✅ Email is `edgarhovsepyan94@gmail.com` (a transposed-name typo `hovsepyanedgar94@`
> shipped in an early PDF — corrected everywhere on the site).

---

## Side Rails (`src/components/layout/SideRails.tsx`)

- Left: ՀԱՅ · Yerevan, Armenia
- Right: Est. 2017 · 7+ YRS

---

## Preloader (`src/components/effects/Preloader.tsx`)

- Mark: Է|Հ
- Caption: Loading portfolio

---

## Nav (`src/components/layout/Nav.tsx` · links from `src/data/navigation.ts`)

- Brand: Է|Հ · Edgar Hovsepyan
- Links: **Awards · Career · Work · Games · Stack · CV · Contact**
- CTA: ● Available

---

## Hero (`src/components/sections/Hero.tsx`)

- **Badge:** ✦ SBC Americas 2025 GotY Shortlist · BFTH Arena 2024 Finalist
- **Location:** Yerevan, Armenia · Remote worldwide / on-site
- **Eyebrow:** Edgar Hovsepyan
- **Wordmark:** ԷԴԳԱՐ (image)
- **Surname (H1):** Hovsepyan
- **Role:** Senior **Game Developer** · 2D/3D for the Web — TypeScript · PixiJS · Three.js · WebGL/WebGPU · **AI-assisted pipelines**
- **Summary:** All about the feel — the weight of a spin, the snap of a reel stop, the juice players remember. I join at zero and build to ten.
- **Actions:** Start a conversation → · Download CV ↓ · See the work ↓

---

## Stats Band (`src/data/stats.ts`)

| Value | Label |
|-------|-------|
| 7+ | Years in game dev |
| 50+ | Games shipped end to end |
| 14+ | Game verticals |
| 50+ | Developers mentored |
| 2025 | SBC Awards shortlist *(gold)* |
| 120 | FPS on mid-tier mobile |

---

## Marquee (`src/data/marquee.ts`)

PixiJS v8 ✦ WebGPU · **Shaders** ✦ Claude Code · MCP ✦ Spine VFX · **120 fps** ✦ Three.js ✦ Casino Math ✦

---

## Profile section — "01 / Profile" (`src/components/sections/Profile.tsx`)

- **Lead:** 50+ games shipped, every one profiled on a mid-tier Android before it went live.
- **Para:** In seven years I have shipped **50+ games end to end**, slots to crash to live and 3D roulette, and spent four of those years leading 10 Unity developers plus front-end, back-end and QA, building VR and WebXR worlds.
- **Para (muted):** My favorite problems sit where physics meets server truth: a Plinko ball that must land exactly where the backend already decided, a win ceremony that holds 120 fps in a browser tab. Our team's Non-Stop Roulette made the SBC Awards Americas 2025 Game of the Year shortlist. I want the next one to win.

---

## Awards — "Recognition — 2024 · 2025" (`src/components/sections/Awards.tsx`)

- **Kicker:** Recognition — 2024 · 2025
- **Primary — Title:** Game of the Year
- **Primary — Badge:** ✦ Shortlisted ✦
- **Primary — Detail:** Non-Stop Roulette · Pascal Gaming
- **Primary — Sub:** SBC Awards Americas 2025 — Game of the Year shortlist (team credit) · Certified across Latin America: Colombia · Peru · Brazil
- **Secondary — Badge:** ✦ Finalist ✦
- **Secondary — Title:** B.F.T.H. Arena Awards 2024
- **Secondary — Detail:** Industry recognition · iGaming

---

## Timeline / Career arc — "02 / Experience · Career arc" (`src/data/experience.ts`)

Section hint: *Hover a role to expand the stack & achievements*

### 2024 — Now · Senior Game Developer
**Pascal Gaming · BetConstruct**
Full-cycle PixiJS v8 / TypeScript across the whole floor — slots, poker & Hold'em, blackjack, roulette & 3D roulette, baccarat, Hi-Lo, crash, Plinko, Mines, Penalty, Deal-or-No-Deal, arcade & branded.
*Tags:* PixiJS v8 · TypeScript · Spine VFX · Claude Code · MCP
- Part of the team behind Non-Stop Roulette — SBC Awards Americas 2025 Game of the Year shortlist (certified across Colombia, Peru & Brazil)
- Built the studio's Spine + particle VFX web editor, used daily by 15 people across the 21-animator art team
- Shipped an AI animation-benchmark / QA tool for the artists
- Own the Claude Code + MCP build pipeline; mentor mid & junior devs

### 2020 — 2024 · Team Lead · Metaverse Platform Engineer
**Fastexverse · PandaMR**
Joined at zero and built the platform to production. Led 10 Unity developers plus front-end, back-end and QA on a metaverse aggregator.
*Tags:* Unity · WebXR · Web3 / NFT
- Shipped live events & ticketing, performance venues, in-world casino & iGaming integrations
- Immersive 3D worlds with VR/AR/WebXR
- Wallet integrations and on-chain transactions
- Brought in the team's first AI tooling

### 2019 — 2023 · Game Developer · Freelance
**Extra Studio LLC · alongside the Fastexverse role**
Owned mini games, mini table games and playable ads — the studio's biggest output — from concept to art integration.
*Tags:* Three.js · PlayCanvas · Playable Ads
- Built & optimized gameplay for desktop and mobile
- Helped juniors level up

### 2018 — 2019 · Three.js Developer
**Arakssys**
Built virtual rooms and computer-vision calcs for apartment renovation & visualization.
*Tags:* Three.js · React · Computer Vision
- Focused on rendering accuracy
- Cross-browser performance

### 2017 — 2018 · Front-End Developer
**WebApricot**
First step into WebGL — responsive cross-browser pages and early Three.js / WebGL builds, where the custom-shader habit started.
*Tags:* WebGL · Three.js · Responsive
- Early custom-shader work
- Cross-browser responsive builds

---

## Selected Work — "03 / Selected work · Things I built" (`src/data/work.ts`)

### A1 · VFX Tooling
A Spine + particle web editor and an AI animation-benchmark / QA tool, used daily by 15 people across a 21-animator art team.
*Tags:* Spine · Particles · AI QA

### A2 · AI Build Pipelines
Claude Code + MCP tooling the team uses daily: asset generation, atlas packing, game scaffolding and prototyping.
*Tags:* Claude Code · MCP · Pipelines

### A3 · 3D Bet-on Tables
3D Roulette, 3D Hi-Lo, 3D Baccarat, Blackjack and Deal-or-No-Deal — deterministic, replay-verified.
*Tags:* WebGL · Physics · Casino Math

### A4 · Indie & Ventures
EV-charging platform (NestJS/OCPP), a WhatsApp AI sales agent (RAG), and an indie slot studio on Stake Engine.
*Tags:* NestJS · RAG · Stake Engine

---

## Games — "04 / Shipped games · Play the work" (`src/data/games.ts`)

- **Hint:** Live fun-mode demos · Pascal Gaming
- **Playable cards** open the official Pascal Gaming fun-mode launcher (`pg.pascalgaming.com`); button label **Play demo**.
- **Case-study cards** (real-money titles, no public demo) show **Real-money title · demo on request**.

| Game | Type | Demo | Craft | Ribbon |
|------|------|------|-------|--------|
| **Non-Stop Roulette** *(featured)* | Live Roulette | case study | Co-developed with the game team: 3D wheel integration and continuous live rounds. | SBC Awards Americas 2025 · GotY Shortlist |
| 3D Roulette | 3D Table | case study | GLB wheel meshes optimized in Blender; deterministic ball physics on server outcomes. | — |
| Non-Stop Blackjack | Blackjack | case study | Continuous-deal table flow, side-bet math and card-deal win ceremonies. | — |
| **Multiplier Blackjack** *(featured)* | Blackjack | Play demo | Full table engine, Perfect-Pair side-bet math, card deal VFX. | — |
| **Super Blaize** *(featured)* | Multiplier | Play demo | Custom multiplier engine, three difficulty tiers, shader FX. | — |
| **Bet on Poker** *(featured)* | Poker | Play demo | Contest lobby and real-time SignalR round flow. | — |
| **Mega Plinko** *(featured)* | Plinko | Play demo | Deterministic Plinko physics landing exactly on server-decided outcomes. | — |
| Flaming Heart | Slot | Play demo | Reel engine, Spine win lines, classic-slot math config. | — |
| Golden Tree | Slot | Play demo | Reel engine with Spine wild-expansion choreography. | — |
| Sugar Balloon | Crash | Play demo | Grid engine, boosted-bet multiplier math, balloon FX. | — |
| Franken Alive | Slot | Play demo | Reel engine, lab-theme VFX and bonus multipliers. | — |
| Juicy Storm | Slot | Play demo | Cluster-pays engine, cascade FX, candy-gloss shaders. | — |

---

## "I build the rush" band (`src/components/sections/ExtraStudio.tsx`)

- **Kicker:** What I do · Where I'm going
- **Title:** I build the rush
- **Caption:** I engineer how casino games **feel**.
- **Body:** The weight of a spin, the snap of a reel stop, the near-miss that pulls a thumb back for one more. Fifty-plus titles in seven years, every win ceremony landed at 120 fps. Next: bigger titles, the SBC shortlist turned into a trophy, and my own studio running Claude Code and MCP pipelines start to finish.
- **Tags:** Game feel · 120fps ceremonies · SBC GotY shortlist · Claude Code + MCP
- *Background:* four ambient concept reels (v1–v4.mp4), blur-to-focus on scroll.

---

## Skybox 360° (`src/components/sections/Skybox360.tsx`)

- Immersive WebGL/Three.js interlude — a 360° casino-floor panorama the viewer scrolls through.
- Rendered wordmark: **EDGAR HOVSEPYAN**
- Rendered sub: **SENIOR GAME DEVELOPER**
- Accessible label: "360 degree casino floor panorama with the name Edgar Hovsepyan"

---

## Core Expertise — "05 / Core expertise · The stack" (`src/data/expertise.ts`)

### AI Engineering *(wide, accent)*
**The model as a teammate inside the engine.**
Production agentic pipelines on Anthropic's stack — Claude Code, custom Skills and the Model Context Protocol — not a chatbot beside the work.
*Chips:* Claude Code · MCP Ecosystem · Agentic Systems · Context Eng. · RAG · AI Pipelines

### Core & Slots
PixiJS v7/v8 · HTML5 Slot Engines · TypeScript · JavaScript · Reel Math · Free-Spins / Bonus

### Rendering & FX
WebGPU · WGSL / GLSL · GPU Instancing · Custom Filters · Spine · Particles · Matter.js · Rapier · Cannon / Ammo

### Engines & 3D
Three.js / WebGL · Babylon.js · PlayCanvas · Cocos Creator · Unity

### Game Systems
Game Cores · RTP / Paytable · Win Ceremony · Game-feel · State Machines · Tweening / Easing · Audio FX

### Rendering, Physics & Deep 3D *(wide)*
**Hand-written shaders, zero-GC tickers, 120 fps on mobile.**
Dual WebGPU/WebGL2 filter paths, KTX2 atlases, GPU instancing and deterministic 2D/3D physics across Three.js, Babylon & PlayCanvas.
*Chips:* Displacement · Glow / Refraction · Object Pooling · Raycast Vehicles

### Architecture
MobX · Redux · RxJS · SignalR / WS · React · TypeScript · OOP / ECS

### Tooling & Pipeline
Vite / Webpack · TexturePacker · KTX2 / Basis · Git / CI · NestJS · OCPP

### Immersive & Web3
VR / AR · WebXR · Web3 / NFT · Wallets · Metaverse

### Leadership
Team Lead · Mentoring · 0→1 Delivery · Code Review · Cross-functional

### Languages
Armenian — Native · Russian — Full professional · English — Professional working

---

## Résumé — "06 / Résumé · Download the CV" (`src/components/sections/Resume.tsx`)

Four downloadable CV files (served from `/public/cv/`):

| Label | Format | For | File |
|-------|--------|-----|------|
| **Premium CV** *(featured)* | PDF | Designed, single-page, on-brand — recruiters, LinkedIn, referrals & direct-to-studio | `/cv/Edgar_Hovsepyan_CV.pdf` |
| ATS CV | PDF | Single-column, parser-friendly — online application portals & ATS screening | `/cv/Edgar_Hovsepyan_CV_ATS.pdf` |
| ATS CV | DOCX | Word version, identical content — portals that only accept .docx | `/cv/Edgar_Hovsepyan_CV_ATS.docx` |
| Branded CV | PDF | Light, print-friendly layout with accent styling — a middle-ground option | `/cv/Edgar_Hovsepyan_CV_Branded.pdf` |

---

## Contact — "07 / Let's build" (`src/components/sections/Contact.tsx` · details from `src/data/contact.ts`)

- **Heading:** Got a game to **ship?**
- **CTA:** Start a conversation →
- **Email:** edgarhovsepyan94@gmail.com
- **Socials:** GitHub · LinkedIn · Telegram
- **Details:**
  - Location — Yerevan, Armenia
  - Phone — +374 94 276 656
  - Status — Remote worldwide · or on-site Yerevan *(green)*
  - Elsewhere — GitHub · LinkedIn · Telegram

---

## Footer (`src/components/layout/Footer.tsx`)

- Brand: Է|Հ · Edgar Hovsepyan
- Links: GitHub · LinkedIn · Telegram
- © 2026 · Yerevan, Armenia
