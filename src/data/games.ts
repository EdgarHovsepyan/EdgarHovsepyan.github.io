export interface Game {
  name: string;
  type: string;
  url: string;
  featured?: boolean;
}

const base = (slug: string, gameId: number, gameTypeId: number) =>
  `https://pg.vbet.am/${slug}/?partnerId=1&currency=FUN&currencySymbol=FUN&culture=en&gameId=${gameId}&gameTypeId=${gameTypeId}&mode=fun&theme=Standart`;

export const games: Game[] = [
  { name: 'Multiplier Blackjack', type: 'Blackjack', url: base('multiplierblackjack', 186, 289), featured: true },
  { name: 'Super Blaize', type: 'Slot', url: base('superblaize', 282, 409), featured: true },
  { name: 'Bet on Poker', type: 'Poker', url: base('betonpoker', 999, 184), featured: true },
  { name: 'Mega Plinko', type: 'Plinko', url: base('megaplinko', 190, 347), featured: true },
  { name: 'Flaming Heart', type: 'Slot', url: base('flaming-heart', 232, 351) },
  { name: 'Golden Tree', type: 'Slot', url: base('goldentree', 124, 181) },
  { name: 'Sugar Balloon', type: 'Crash', url: base('sugarballoon', 314, 434) },
  { name: 'Franken Alive', type: 'Slot', url: base('frankenalive', 268, 378) },
  { name: 'Juicy Storm', type: 'Slot', url: base('juicystorm', 273, 383) },
];
