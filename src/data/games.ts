export interface Game {
  name: string;
  type: string;
  /** Fun-mode demo link. Case-study cards (no public demo) omit it. */
  url?: string;
  /** 640×360 webp captured from the live demo. */
  thumb?: string;
  /** One line on my part in the build — engines, Spine, VFX, math, meshes. */
  craft: string;
  featured?: boolean;
  /** Award ribbon for the card (e.g. the SBC shortlist). */
  award?: string;
}

// Official Pascal Gaming fun-mode (demo) launcher. Hitting this endpoint
// self-generates a fresh launchToken and opens the game — so the link stays
// valid (no token to expire). token_155 + this partnerKey are Pascal's public
// demo credentials (the same ones exposed on pascalgaming.com/game-portfolio).
// Every gameId below was verified live in demo mode on 2026-07-09.
const demo = (gameId: number) =>
  `https://pg.pascalgaming.com/launch?gameId=${gameId}&mode=fun&culture=en&token=token_155&partnerKey=9b0b0a92-f1a0-48e7-8fab-71b243140207`;

const thumb = (slug: string) => `/assets/games/${slug}.webp`;

export const games: Game[] = [
  // --- Table line (case studies: real-money titles, demos on request) ------
  {
    name: 'Non-Stop Roulette',
    type: 'Live Roulette',
    craft: 'Co-developed with the game team: 3D wheel integration and continuous live rounds.',
    award: 'SBC Awards Americas 2025 · GotY Shortlist',
    featured: true,
  },
  {
    name: '3D Roulette',
    type: '3D Table',
    craft: 'GLB wheel meshes optimized in Blender; deterministic ball physics on server outcomes.',
  },
  {
    name: 'Non-Stop Blackjack',
    type: 'Blackjack',
    craft: 'Continuous-deal table flow, side-bet math and card-deal win ceremonies.',
  },

  // --- Playable fun-mode demos ---------------------------------------------
  {
    name: 'Multiplier Blackjack',
    type: 'Blackjack',
    url: demo(186),
    thumb: thumb('multiplier-blackjack'),
    craft: 'Full table engine, Perfect-Pair side-bet math, card deal VFX.',
    featured: true,
  },
  {
    name: 'Super Blaize',
    type: 'Multiplier',
    url: demo(282),
    thumb: thumb('super-blaize'),
    craft: 'Custom multiplier engine, three difficulty tiers, shader FX.',
    featured: true,
  },
  {
    name: 'Bet on Poker',
    type: 'Poker',
    url: demo(999),
    thumb: thumb('bet-on-poker'),
    craft: 'Contest lobby and real-time SignalR round flow.',
    featured: true,
  },
  {
    name: 'Mega Plinko',
    type: 'Plinko',
    url: demo(190),
    thumb: thumb('mega-plinko'),
    craft: 'Deterministic Plinko physics landing exactly on server-decided outcomes.',
    featured: true,
  },
  {
    name: 'Flaming Heart',
    type: 'Slot',
    url: demo(232),
    thumb: thumb('flaming-heart'),
    craft: 'Reel engine, Spine win lines, classic-slot math config.',
  },
  {
    name: 'Golden Tree',
    type: 'Slot',
    url: demo(124),
    thumb: thumb('golden-tree'),
    craft: 'Reel engine with Spine wild-expansion choreography.',
  },
  {
    name: 'Sugar Balloon',
    type: 'Crash',
    url: demo(314),
    thumb: thumb('sugar-balloon'),
    craft: 'Grid engine, boosted-bet multiplier math, balloon FX.',
  },
  {
    name: 'Franken Alive',
    type: 'Slot',
    url: demo(268),
    thumb: thumb('franken-alive'),
    craft: 'Reel engine, lab-theme VFX and bonus multipliers.',
  },
  {
    name: 'Juicy Storm',
    type: 'Slot',
    url: demo(273),
    thumb: thumb('juicy-storm'),
    craft: 'Cluster-pays engine, cascade FX, candy-gloss shaders.',
  },
];
