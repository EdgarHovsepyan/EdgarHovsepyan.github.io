import type { ExperienceEntry } from './types.ts';

export const experience: ExperienceEntry[] = [
  {
    period: '2026 to now',
    role: 'Senior Software Engineer · Games & Platform',
    org: 'RedCore (RC Games) · RC Research team',
    description:
      'I work on both sides of the game: Plinko, Dice, Mines and the mini games on the front, and underneath them the random-number service, bet history, sign-in and the release pipeline.',
    tags: ['TypeScript', 'C# / .NET', 'Kubernetes', 'Argo CD', 'ClickHouse'],
    highlights: [
      'Games: Plinko with provably fair rounds a player can verify by round ID, Dice from assets to gated release, autoplay for Mines, and the mini games line',
      'A random-number service for real-money play, from design to production: a pinned algorithm checked against golden vectors, no partial results under overload, a performance gate in CI and soak runs before release',
      'Bet history on ClickHouse, Keycloak sign-in on dev, preprod and prod, and the move of three live games off the old platform, DNS cutover included',
      'The release pipeline for the whole group: merge trains on every repository, canary and rollback on prod, and no promotion past a failed gate',
      'Shared tools: the engineering handbook, the merge-request template and a library of AI agent skills that six other engineers contribute to, with every change scanned in CI',
    ],
  },
  {
    period: '2024 to 2026',
    role: 'Senior Game Developer',
    org: 'Pascal Gaming · BetConstruct',
    description:
      'PixiJS v8 and TypeScript across the whole floor: slots, poker and Hold’em, blackjack, roulette and 3D roulette, baccarat, Hi-Lo, crash, Plinko, Mines, Penalty, Deal-or-No-Deal, arcade and branded titles.',
    tags: ['PixiJS v8', 'TypeScript', 'Spine VFX', 'Claude Code · MCP'],
    highlights: [
      'Part of the team behind Non-Stop Roulette, shortlisted for Game of the Year at SBC Awards Americas 2025 and certified in Colombia, Peru and Brazil',
      'Built the studio’s Spine and particle VFX editor for the web; 15 people on the 21-animator art team used it daily',
      'Shipped an AI tool that benchmarks and QA-checks animations for the artists',
      'Ran the Claude Code and MCP build pipeline and mentored mid and junior developers',
    ],
  },
  {
    period: '2020 to 2024',
    role: 'Team Lead · Metaverse Platform Engineer',
    org: 'Fastexverse · PandaMR',
    description:
      'Joined when there was no code and took the platform to production. Led 10 Unity developers plus front-end, back-end and QA on a metaverse aggregator.',
    tags: ['Unity', 'WebXR', 'Web3 / NFT'],
    highlights: [
      'Live events and ticketing, performance venues, an in-world casino and iGaming integrations',
      '3D worlds for VR, AR and WebXR',
      'Wallet integrations and on-chain transactions',
      'Brought in the team’s first AI tooling',
    ],
  },
  {
    period: '2019 to 2023',
    role: 'Game Developer · Freelance',
    org: 'Extra Studio LLC · alongside the Fastexverse role',
    description:
      'Mini games, mini table games and playable ads, the studio’s biggest output, from concept to art integration.',
    tags: ['Three.js', 'PlayCanvas', 'Playable Ads'],
    highlights: ['Built and tuned gameplay for desktop and mobile', 'Mentored the junior developers'],
  },
  {
    period: '2018 to 2019',
    role: 'Three.js Developer',
    org: 'Arakssys',
    description:
      'Virtual rooms and computer-vision measurements for apartment renovation and visualization.',
    tags: ['Three.js', 'React', 'Computer Vision'],
    highlights: ['Rendering accuracy', 'Cross-browser performance'],
  },
  {
    period: '2017 to 2018',
    role: 'Front-End Developer',
    org: 'WebApricot',
    description:
      'My first WebGL work: responsive cross-browser pages and early Three.js builds. The custom-shader habit started here.',
    tags: ['WebGL', 'Three.js', 'Responsive'],
    highlights: ['Early custom-shader work', 'Cross-browser responsive builds'],
  },
];
