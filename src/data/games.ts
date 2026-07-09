export interface Game {
  name: string;
  type: string;
  url: string;
  featured?: boolean;
}

// Official Pascal Gaming fun-mode (demo) launcher. Hitting this endpoint
// self-generates a fresh launchToken and opens the game — so the link stays
// valid (no token to expire). token_155 + this partnerKey are Pascal's public
// demo credentials (the same ones exposed on pascalgaming.com/game-portfolio).
// Every gameId below was verified live in demo mode on 2026-07-09.
const demo = (gameId: number) =>
  `https://pg.pascalgaming.com/launch?gameId=${gameId}&mode=fun&culture=en&token=token_155&partnerKey=9b0b0a92-f1a0-48e7-8fab-71b243140207`;

export const games: Game[] = [
  { name: 'Multiplier Blackjack', type: 'Blackjack', url: demo(186), featured: true },
  { name: 'Super Blaize', type: 'Slot', url: demo(282), featured: true },
  { name: 'Bet on Poker', type: 'Poker', url: demo(999), featured: true },
  { name: 'Mega Plinko', type: 'Plinko', url: demo(190), featured: true },
  { name: 'Flaming Heart', type: 'Slot', url: demo(232) },
  { name: 'Golden Tree', type: 'Slot', url: demo(124) },
  { name: 'Sugar Balloon', type: 'Crash', url: demo(314) },
  { name: 'Franken Alive', type: 'Slot', url: demo(268) },
  { name: 'Juicy Storm', type: 'Slot', url: demo(273) },
];
