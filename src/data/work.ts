import type { WorkProject } from './types.ts';

export const work: WorkProject[] = [
  {
    id: 'A1',
    title: 'VFX Tooling',
    description:
      'A Spine + particle web editor/viewer and an AI animation-benchmark / QA tool built for the art team.',
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
      '3D Roulette, 3D Hi-Lo, 3D Baccarat, Blackjack and Deal-or-No-Deal — deterministic, replay-verified.',
    tags: ['WebGL', 'Physics', 'Casino Math'],
  },
  {
    id: 'A4',
    title: 'Indie & Ventures',
    description:
      'EV-charging platform (NestJS/OCPP), a WhatsApp AI sales agent (RAG), and an indie slot studio on Stake Engine.',
    tags: ['NestJS', 'RAG', 'Stake Engine'],
  },
];
