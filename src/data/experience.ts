import type { ExperienceEntry } from './types.ts';

export const experience: ExperienceEntry[] = [
  {
    period: '2026 — Now',
    role: 'Senior Software Engineer · Game Platform',
    org: 'RedCore (RC Games) · RC Research team',
    description:
      'The platform under real-money games and the games on top of it: a standalone RNG service with verifiable fairness, the Plinko MVP, bet history on ClickHouse, Keycloak auth and GitOps delivery on Kubernetes across dev, preprod and prod.',
    tags: ['C# / .NET', 'TypeScript', 'Kubernetes', 'Argo CD · GitOps', 'ClickHouse'],
    highlights: [
      'Built a standalone random-number service from design to production: token-verified API, version-pinned algorithm with golden-vector parity, no partial results under overload, CI performance gate, soak tests and deploy smoke checks on every environment',
      'Delivered the Plinko MVP with the team: tech design and test plan, provably fair round verification by round ID, checksummed configurations, ball paths drawn from the RNG service',
      'Stood up the bet-history stack on Kubernetes: ClickHouse, per-environment service and client deployment, session-token handoff to the game client',
      'Hardened delivery for the group: merge trains on every repository, canary and rollback with smoke checks on prod, promotion blocked on missing or failed gates',
      'Wrote the engineering handbook and a shared library of AI agent skills with security scanning in CI',
    ],
  },
  {
    period: '2024 — 2026',
    role: 'Senior Game Developer',
    org: 'Pascal Gaming · BetConstruct',
    description:
      'Full-cycle PixiJS v8 / TypeScript across the whole floor — slots, poker & Hold’em, blackjack, roulette & 3D roulette, baccarat, Hi-Lo, crash, Plinko, Mines, Penalty, Deal-or-No-Deal, arcade & branded.',
    tags: ['PixiJS v8', 'TypeScript', 'Spine VFX', 'Claude Code · MCP'],
    highlights: [
      'Part of the team behind Non-Stop Roulette — SBC Awards Americas 2025 Game of the Year shortlist (certified across Colombia, Peru & Brazil)',
      'Built the studio’s Spine + particle VFX web editor, used daily by 15 people across the 21-animator art team',
      'Shipped an AI animation-benchmark / QA tool for the artists',
      'Own the Claude Code + MCP build pipeline; mentor mid & junior devs',
    ],
  },
  {
    period: '2020 — 2024',
    role: 'Team Lead · Metaverse Platform Engineer',
    org: 'Fastexverse · PandaMR',
    description:
      'Joined at zero and built the platform to production. Led 10 Unity developers plus front-end, back-end and QA on a metaverse aggregator.',
    tags: ['Unity', 'WebXR', 'Web3 / NFT'],
    highlights: [
      'Shipped live events & ticketing, performance venues, in-world casino & iGaming integrations',
      'Immersive 3D worlds with VR/AR/WebXR',
      'Wallet integrations and on-chain transactions',
      'Brought in the team’s first AI tooling',
    ],
  },
  {
    period: '2019 — 2023',
    role: 'Game Developer · Freelance',
    org: 'Extra Studio LLC · alongside the Fastexverse role',
    description:
      'Owned mini games, mini table games and playable ads — the studio’s biggest output — from concept to art integration.',
    tags: ['Three.js', 'PlayCanvas', 'Playable Ads'],
    highlights: [
      'Built & optimized gameplay for desktop and mobile',
      'Helped juniors level up',
    ],
  },
  {
    period: '2018 — 2019',
    role: 'Three.js Developer',
    org: 'Arakssys',
    description:
      'Built virtual rooms and computer-vision calcs for apartment renovation & visualization.',
    tags: ['Three.js', 'React', 'Computer Vision'],
    highlights: ['Focused on rendering accuracy', 'Cross-browser performance'],
  },
  {
    period: '2017 — 2018',
    role: 'Front-End Developer',
    org: 'WebApricot',
    description:
      'First step into WebGL — responsive cross-browser pages and early Three.js / WebGL builds, where the custom-shader habit started.',
    tags: ['WebGL', 'Three.js', 'Responsive'],
    highlights: ['Early custom-shader work', 'Cross-browser responsive builds'],
  },
];
