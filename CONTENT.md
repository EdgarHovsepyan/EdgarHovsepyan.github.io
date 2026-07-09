# Portfolio — Front-End Content

All visible text content from the live site, gathered in one place for review/finalizing.
Ordered top-to-bottom as it renders on the page. Source files noted per section.

---

## Identity / Profile (`src/data/profile.ts`)

- **First name:** EDGAR
- **Last name:** Hovsepyan
- **Wordmark (Armenian):** ԷԴԳԱՐ
- **Full name:** Edgar Hovsepyan
- **Initials / monogram:** ԷՀ
- **Title:** AI-Powered Creative Game Developer
- **Badge:** ✦ SBC Awards Americas 2025 · GotY Shortlist
- **Location:** Yerevan, Armenia · On-site ready
- **Email:** edgarhovsepyan94@gmail.com
- **Phone:** +374 94 276 656
- **GitHub:** https://github.com/EdgarHovsepyan
- **LinkedIn:** https://www.linkedin.com/in/edgar-hovsepyan-03044117b
- **CV file:** /Edgar_Hovsepyan_CV.pdf

> ✅ Email corrected to **edgarhovsepyan94@gmail.com** in `src/data/profile.ts` (was a transposed-name typo `hovsepyanedgar94@`).

---

## Nav (`src/components/layout/Nav.tsx`)

- Brand: ԷՀ · Edgar Hovsepyan
- Links: **Awards · Career · Work · Stack · Contact**
- CTA: ● Available

---

## Side Rails (`src/components/layout/SideRails.tsx`)

- Left: ՀԱՅ · Yerevan, Armenia
- Right: Est. 2017 · 7+ YRS

---

## Preloader (`src/components/effects/Preloader.tsx`)

- Mark: ԷՀ
- Caption: Loading portfolio

---

## Hero (`src/components/sections/Hero.tsx`)

- **Badge:** ✦ SBC Awards Americas 2025 · GotY Shortlist
- **Location:** Yerevan, Armenia · On-site ready
- **Eyebrow:** Edgar Hovsepyan
- **Wordmark:** ԷԴԳԱՐ (image)
- **Surname (H1):** Hovsepyan
- **Role:** Senior **HTML5 Game Developer** — iGaming · PixiJS · WebGL/WebGPU · **AI Engineering**
- **Summary:** All about the feel — the weight of a spin, the snap of a reel stop, the juice players remember. I join at zero and build to ten.
- **Actions:** Start a conversation → · Download CV ↓ · See the work ↓

---

## Stats Band (`src/data/stats.ts`)

| Value | Label |
|-------|-------|
| 7+ | Years in game dev |
| 50+ | Casino games shipped |
| 678 | Claude Code skills |
| 50+ | Developers mentored |
| 2025 | SBC Awards shortlist *(gold)* |
| 0→1 | AI pipelines in prod |

---

## Marquee (`src/data/marquee.ts`)

PixiJS v8 ✦ WebGPU · **Shaders** ✦ Claude Code · MCP ✦ Spine VFX · **120 fps** ✦ Three.js ✦ Casino Math ✦

---

## Profile section — "01 / Profile" (`src/components/sections/Profile.tsx`)

- **Lead:** The mentor & AI evangelist the team comes to.
- **Para:** 7+ years, **50+ HTML5 casino titles** shipped end-to-end — blank canvas to regulator-ready. I don't job-hop; I join at zero and build to ten, then build the AI pipelines the team runs on.
- **Para (muted):** Clean TypeScript on one side; Spine, GLSL/WGSL shaders, 2D/3D physics and 120 fps win-ceremonies on the other.

---

## Awards — "Recognition — 2025" (`src/components/sections/Awards.tsx`)

- **Kicker:** Recognition — 2025
- **Title:** Game of the Year
- **Badge:** ✦ Shortlisted ✦
- **Detail:** Non-Stop Roulette · Pascal Gaming
- **Sub:** SBC Awards Americas 2025 — Game of the Year shortlist · Certified across Latin America: Colombia · Peru · Brazil

---

## Timeline / Career arc — "02 / Experience" (`src/data/experience.ts`)

Section hint: *Hover a role to expand the stack & achievements*

### 2024 — Now · Senior HTML5 Game Developer
**Pascal Gaming · BetConstruct**
Full-cycle PixiJS v8 / TypeScript across the whole floor — slots, poker & Hold'em, blackjack, roulette & 3D roulette, baccarat, Hi-Lo, crash, Plinko, Mines, Penalty, Deal-or-No-Deal, arcade & branded.
*Tags:* PixiJS v8 · TypeScript · Spine VFX · Claude Code · MCP
- Part of the team behind Non-Stop Roulette — SBC Awards Americas 2025 Game of the Year shortlist (certified across Colombia, Peru & Brazil)
- Built the studio's Spine + particle VFX web editor
- Shipped an AI animation-benchmark / QA tool for the artists
- Owns the Claude Code + MCP build pipeline; mentors mid & junior devs

### 2020 — 2024 · Team Lead · Metaverse Platform Engineer
**Fastexverse · PandaMR**
Joined at zero, built the metaverse platform to ten. Led a cross-functional team (Unity, Unreal, front, back, QA) on a metaverse aggregator.
*Tags:* Unity · Unreal · WebXR · Web3 / NFT
- Shipped live events & ticketing, performance venues, in-world casino & iGaming integrations
- Immersive 3D worlds with VR/AR/WebXR
- Wallet integrations and on-chain transitions
- Brought in the team's first AI tooling

### 2019 — 2023 · HTML5 Game Developer · iGaming
**Extra Studio LLC**
Owned mini games, mini table games and playable ads — the studio's biggest output — concept to art integration.
*Tags:* Three.js · PlayCanvas · Playable Ads
- Built & optimised gameplay for desktop and mobile
- Helped juniors level up
- Concept-to-art-integration ownership

### 2018 — 2019 · Three.js Developer
**Arakssys**
Built virtual rooms and computer-vision calcs for apartment renovation & visualisation.
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

## Selected Work — "03 / Things I built" (`src/data/work.ts`)

### A1 · VFX Tooling
A Spine + particle web editor/viewer and an AI animation-benchmark / QA tool built for the art team.
*Tags:* Spine · Particles · AI QA

### A2 · 678 Claude Code Skills
A reusable agent library + MCP servers for asset generation, atlas packing and prototyping.
*Tags:* MCP · Agents · Pipelines

### A3 · 3D Bet-on Tables
3D Roulette, 3D Hi-Lo, 3D Baccarat, Blackjack and Deal-or-No-Deal — deterministic, replay-verified.
*Tags:* WebGL · Physics · Casino Math

### A4 · Indie & Ventures
EV-charging platform (NestJS/OCPP), a WhatsApp AI sales agent (RAG), and an indie slot studio on Stake Engine.
*Tags:* NestJS · RAG · Stake Engine

---

## Extra Studio band (`src/components/sections/ExtraStudio.tsx`)

- **Kicker:** Extra Studio · 2019 — 2023
- **Title:** The Extra Studio floor
- **Caption:** **40+ titles shipped.** Mini games, mini table games and playable ads, the studio's biggest output — owned concept to art integration, desktop and mobile.
- *Image alt:* Extra Studio games — 40+ shipped casino titles including slots, roulette, baccarat, poker and blackjack

---

## Shader Band (`src/components/sections/ShaderBand.tsx`)

- Mark: ԷՀ
- Caption: AI-Powered Creative Game Developer

---

## Core Expertise — "04 / The stack" (`src/data/expertise.ts`)

### AI Engineering *(wide, accent)*
**The model as a teammate inside the engine.**
Production agentic pipelines on Anthropic's stack — Claude Code, custom Skills and the Model Context Protocol — not a chatbot beside the work.
*Chips:* Claude Code · MCP Ecosystem · Agentic Systems · Context Eng. · RAG · AI Pipelines

### Core & Slots
PixiJS v7/v8 · HTML5 Slot Engines · TypeScript · JavaScript · Reel Math · Free-Spins / Bonus

### Rendering & FX
WebGPU · WGSL / GLSL · GPU Instancing · Custom Filters · Spine · Particles · Matter.js · Rapier · Cannon / Ammo

### Engines & 3D
Three.js / WebGL · Babylon.js · PlayCanvas · Cocos Creator · Unity · Unreal

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
Armenian — Native · Russian — C1 · English — B2

---

## Contact — "05 / Let's build" (`src/components/sections/Contact.tsx`)

- **Heading:** Got a game to **ship?**
- **CTA:** Start a conversation →
- **Email:** edgarhovsepyan94@gmail.com
- **Socials:** GitHub · LinkedIn
- **Details:**
  - Location — Yerevan, Armenia
  - Phone — +374 94 276 656
  - Status — On-site · No relocation *(green)*
  - Elsewhere — GitHub · LinkedIn

---

## Footer (`src/components/layout/Footer.tsx`)

- Brand: ԷՀ · Edgar Hovsepyan
- Role: AI-Powered Creative Game Developer
- Links: GitHub · LinkedIn
- © 2026 · Yerevan, Armenia
