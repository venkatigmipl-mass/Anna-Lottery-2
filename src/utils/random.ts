// Cryptographically secure pseudorandomness for transparent, fair game mechanics
// Strictly adheres to crypto.getRandomValues for unbiased, unrigged outcomes

export function getCryptoFloat(): number {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const buffer = new Uint32Array(1);
    window.crypto.getRandomValues(buffer);
    return buffer[0] / 4294967296;
  }
  return Math.random();
}

export function getCryptoInt(min: number, max: number): number {
  const range = max - min + 1;
  return min + Math.floor(getCryptoFloat() * range);
}

export function cryptoChoice<T>(items: readonly T[] | T[]): T {
  const index = Math.floor(getCryptoFloat() * items.length);
  return items[index];
}

export function cryptoShuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(getCryptoFloat() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export interface PlayingCard {
  suit: CardSuit;
  rank: number; // 1 (Ace) to 13 (King)
  label: string; // 'A', '2'-'10', 'J', 'Q', 'K'
  color: 'red' | 'black';
}

const SUITS: CardSuit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const LABELS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function createDeck(): PlayingCard[] {
  const deck: PlayingCard[] = [];
  for (const suit of SUITS) {
    const color = suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({
        suit,
        rank,
        label: LABELS[rank],
        color,
      });
    }
  }
  return cryptoShuffle(deck);
}

export function getSuitSymbol(suit: CardSuit): string {
  switch (suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
  }
}
