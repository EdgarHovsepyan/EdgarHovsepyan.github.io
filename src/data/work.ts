import type { WorkProject } from './types.ts';

export const work: WorkProject[] = [
  {
    id: 'A1',
    title: 'VFX Tooling',
    description:
      'A Spine + particle web editor and an AI animation-benchmark / QA tool, used daily by 15 people across a 21-animator art team.',
    tags: ['Spine', 'Particles', 'AI QA'],
  },
  {
    id: 'A2',
    title: 'AI Build Pipelines',
    description:
      'Claude Code + MCP tooling the team uses daily: asset generation, atlas packing, game scaffolding and prototyping.',
    tags: ['Claude Code', 'MCP', 'Pipelines'],
  },
  {
    id: 'A3',
    title: '3D Bet-on Tables',
    description:
      '3D Roulette, 3D Hi-Lo, 3D Baccarat, Blackjack and Deal-or-No-Deal. Outcomes are deterministic and every round can be replayed.',
    tags: ['WebGL', 'Physics', 'Casino Math'],
  },
  {
    id: 'A4',
    title: 'Fair Play Services',
    description:
      'A random-number service for real-money games, Plinko rounds a player can verify by round ID, and the bet history behind them.',
    tags: ['RNG', 'Provably fair', 'ClickHouse'],
  },
  {
    id: 'A5',
    title: 'Worlds & XR',
    description:
      'A metaverse aggregator taken from no code to production: live events and ticketing, an in-world casino, VR, AR and WebXR worlds, wallets and on-chain payments.',
    tags: ['Unity', 'WebXR', 'Web3'],
  },
  {
    id: 'A6',
    title: 'Gallery Commerce',
    description:
      'SART Gallery: an English and Arabic commerce platform for a contemporary art gallery in Doha. Timed viewing rooms, 72-hour reservations with one winner per work, and a canvas placed on a photo of your own wall at true scale.',
    tags: ['Next.js', 'TypeScript', 'EN / AR'],
  },
  {
    id: 'A7',
    title: 'Indie & Ventures',
    description:
      'EV-charging platform (NestJS/OCPP), a WhatsApp AI sales agent (RAG), and an indie slot studio on Stake Engine.',
    tags: ['NestJS', 'RAG', 'Stake Engine'],
  },
];
