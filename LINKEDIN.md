# LinkedIn update, Edgar Hovsepyan

Paste each block as is. This is a draft kept with the site source; nothing here has been posted to LinkedIn.

Before you edit: Settings → Visibility → "Share profile updates with your network" → Off, so the changes do not go out as a feed post.

---

## 1. Headline

**Main (games + platform):**

```
Senior iGaming Engineer | Games, Platform and Tooling | PixiJS / Three.js, TypeScript, C#/.NET, Kubernetes
```

**Alternative (platform first, your 23 November choice):**

```
Senior Game Platform Engineer (iGaming) | C#/.NET, TypeScript, Kubernetes, GitOps | PixiJS / Three.js
```

---

## 2. About

```
I build casino games and the services they run on.

At RedCore (RC Games) I work on both sides of the game. On the front: Plinko, Dice, Mines and the mini games. Underneath: a standalone random-number service for real-money play, bet history on ClickHouse, Keycloak sign-in, and GitOps delivery on Kubernetes across dev, preprod and prod.

Before that I spent seven years shipping 50+ casino titles in PixiJS, Three.js and WebGL: slots, crash, Plinko, poker, blackjack, live and 3D roulette. At Pascal Gaming I was part of the team behind Non-Stop Roulette, shortlisted for Game of the Year at SBC Awards Americas 2025. I also built the studio's Spine and particle VFX editor, which 15 people on the art team used every day.

Earlier I led 10 Unity developers, plus front-end, back-end and QA, on a metaverse platform that went from prototype to production with live events, VR, AR and WebXR worlds, and on-chain payments.

How I work: test-first, with the fairness and failure cases written down before the code. I leave teams with documentation and with AI agent skills they can reuse. Claude Code and MCP are part of my daily build.

What I am good for: a game that has to feel right at 120 fps on a mid-tier phone, and a round that has to be provably fair when a regulator or a player checks it.

Yerevan, Armenia. Remote or on site.
Portfolio: edgarhovsepyan.github.io
```

---

## 3. Experience

### 3.1 New entry

- **Title:** Senior Software Engineer, Game Platform
- **Company:** RedCore (RC Games)
- **Location:** Yerevan, Armenia
- **Dates:** Aug 2026 – Present
- **Description:**

```
RC Research team. Games and the platform under them.

- Built a standalone random-number service for real-money games from design to production: token-verified API, version-pinned algorithm checked against golden vectors, no partial results under overload or interruption, a performance gate in CI, soak tests and deploy smoke checks on every environment.
- Delivered the Plinko game with the team: tech design and test plan, provably fair round verification by round ID, checksummed configurations (8 to 16 rows, three volatilities), "My Bets", and ball paths drawn from the RNG service. Wrote the shared skill other games use to integrate it.
- Game work beyond Plinko: Dice (assets, controls, layout, gated deploy) and the autoplay epic for Mines.
- Set up the bet-history stack on Kubernetes: ClickHouse, per-environment service and client deployment, session-token handoff to the game client.
- Built platform pieces on dev, preprod and prod: greenfield Keycloak, secrets for Consul, Keycloak and Redis, and Helm chart templates promoted with Argo CD.
- Drove the migration off a legacy platform: three games' Kubernetes workloads decommissioned, Cloudflare zones moved, DNS cutover with end-to-end checks on all three environments.
- Tightened delivery for the group: merge trains on every repository, canary and rollback with smoke checks on prod, promotion blocked on missing or failed gates.
- Wrote the engineering handbook and a shared library of AI agent skills, with security scanning of every changed skill in CI.
```

- **Skills to attach to this entry:** C#, .NET, Kubernetes, Argo CD, ClickHouse

### 3.2 Change on the existing Pascal Gaming entry

- **Dates:** Mar 2024 – **Aug 2026** (untick "I am currently working in this role")
- Put the description in the past tense. Replace "Own and ship" with "Shipped", "Built and own" with "Built and ran", "Mentor" with "Mentored".

---

## 4. Skills

**Pin these three at the top:**

1. Game Development
2. TypeScript
3. Kubernetes

**Add if missing (order does not matter):**

C#, .NET, PixiJS, Three.js, WebGL, GLSL, Argo CD, Helm, Terraform, Amazon Web Services (AWS), Keycloak, ClickHouse, PostgreSQL, Redis, GitLab CI, Test-Driven Development, Behavior-Driven Development (BDD), Playwright, SignalR, Unity, Model Context Protocol (MCP), Technical Leadership

---

## 5. Featured section

- Link: https://edgarhovsepyan.github.io (title: "Portfolio: games, platform and tooling")
- Upload: the Designed CV (one dark page)

---

## What I left out, and why

- No merge-request or ticket counts, as you decided.
- No repo paths, hostnames, ticket keys, internal tool names or colleague names.
- The personal AI command center is not in the RedCore entry: it is your own initiative, so it belongs under Projects if you want it on LinkedIn at all.
- The mini-games line is in the About text only as "the mini games". In the experience entry I kept to Dice and Mines, where the brief has specifics.
