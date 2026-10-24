import { GameMeta } from '../types/arcade';

export const ALL_GAMES: GameMeta[] = [
  // ================= CASINO =================
  {
    id: 'slot-machine',
    name: 'Neon Slots 777',
    category: 'casino',
    tagline: 'Match 3 reels to hit jackpot multipliers up to 50x',
    description: 'Classic 3-reel retro arcade slot with lucky 7s, diamonds, bells, cherries, and wild stars.',
    iconName: 'Sparkles',
    badge: 'HOT',
    minBet: 10,
    maxBet: 500,
    rtpDisplay: '96.5% Fair Simulation',
    houseEdgeOrRtp: '3.5%',
    rules: [
      'Select your bet using the chip buttons.',
      'Tap Spin to set all 3 reels in motion.',
      'Reels stop sequentially from left to right.',
      'Match 3 matching symbols on the center payline to win.',
      'Wild Star substitutes for any symbol and doubles the win!'
    ],
    payouts: [
      { label: '3x Lucky 777', multiplier: '50x', chance: '1.2%' },
      { label: '3x Diamond', multiplier: '25x', chance: '2.5%' },
      { label: '3x Golden Bell', multiplier: '15x', chance: '4.8%' },
      { label: '3x BAR', multiplier: '10x', chance: '8.0%' },
      { label: '3x Watermelon', multiplier: '6x', chance: '12.0%' },
      { label: '3x Cherry', multiplier: '3x', chance: '20.0%' },
      { label: 'Any 2 Cherries', multiplier: '1.5x', chance: '35.0%' }
    ]
  },
  {
    id: 'roulette',
    name: 'Arcade Roulette',
    category: 'casino',
    tagline: 'European single-zero wheel with inside and outside bets',
    description: 'Predict where the rolling ball settles on numbers 0 through 36.',
    iconName: 'Disc',
    badge: 'POPULAR',
    minBet: 10,
    maxBet: 500,
    rtpDisplay: '97.3% European Single-Zero',
    houseEdgeOrRtp: '2.7%',
    rules: [
      'Choose your bet type: Red, Black, Even, Odd, 1-18, 19-36, Dozens (1-12, 13-24, 25-36), or Single Number (0-36).',
      'Select your wager amount and tap Spin Wheel.',
      'A true cryptographically random number 0-36 is chosen.',
      'Winning payouts are calculated and credited instantly.'
    ],
    payouts: [
      { label: 'Straight Up (Single Number)', multiplier: '36x (35:1)', chance: '2.7%' },
      { label: 'Dozens (1-12 / 13-24 / 25-36)', multiplier: '3x (2:1)', chance: '32.4%' },
      { label: 'Red / Black', multiplier: '2x (1:1)', chance: '48.6%' },
      { label: 'Even / Odd', multiplier: '2x (1:1)', chance: '48.6%' },
      { label: 'Low (1-18) / High (19-36)', multiplier: '2x (1:1)', chance: '48.6%' }
    ]
  },
  {
    id: 'dice',
    name: 'Over / Under Dice',
    category: 'casino',
    tagline: 'Roll 2 dice: predict if total is Under 7, Over 7, or Lucky 7',
    description: 'Crisp 3D animated dice rolling with mathematically precise payouts.',
    iconName: 'Dices',
    badge: 'FAST',
    minBet: 10,
    maxBet: 500,
    rtpDisplay: '97.2% Theoretical Return',
    houseEdgeOrRtp: '2.8%',
    rules: [
      'Two 6-sided dice are rolled, yielding a sum from 2 to 12.',
      'Pick Under 7 (2 through 6), Lucky 7 (exact sum of 7), or Over 7 (8 through 12).',
      'Lucky 7 has the highest multiplier at 5.8x!',
      'Tap Roll Dice to shake and reveal the outcome.'
    ],
    payouts: [
      { label: 'Exact 7', multiplier: '5.8x', chance: '16.7% (6/36)' },
      { label: 'Under 7 (2 to 6)', multiplier: '2.3x', chance: '41.7% (15/36)' },
      { label: 'Over 7 (8 to 12)', multiplier: '2.3x', chance: '41.7% (15/36)' }
    ]
  },
  {
    id: 'coin-flip',
    name: 'Crypto Gold Coin Flip',
    category: 'casino',
    tagline: 'Predict Heads or Tails with fair 50/50 odds and streak multipliers',
    description: 'Instant thrilling 50/50 flip with smooth 3D coin rotation.',
    iconName: 'Coins',
    badge: 'HOT',
    minBet: 10,
    maxBet: 1000,
    rtpDisplay: '98.0% Fair Coin Flip',
    houseEdgeOrRtp: '2.0%',
    rules: [
      'Select Heads or Tails.',
      'Tap Flip Coin to toss the golden token.',
      '50% true probability using crypto.getRandomValues.',
      'Win 1.96x your bet. Consecutive win streaks boost your XP!'
    ],
    payouts: [
      { label: 'Heads or Tails Win', multiplier: '1.96x', chance: '50.0%' },
      { label: 'Streak of 3 Wins', multiplier: 'XP Bonus +50', chance: '12.5%' },
      { label: 'Streak of 5 Wins', multiplier: 'Achievement Unlocked', chance: '3.125%' }
    ]
  },
  {
    id: 'spin-wheel',
    name: 'Mega Fortune Wheel',
    category: 'casino',
    tagline: 'Spin the 12-segment wheel for multipliers up to 25x Jackpot',
    description: 'Vibrant neon carnival wheel with authentic physics-style deceleration.',
    iconName: 'CircleDot',
    badge: 'POPULAR',
    minBet: 10,
    maxBet: 500,
    rtpDisplay: '96.2% Return to Player',
    houseEdgeOrRtp: '3.8%',
    rules: [
      'Place your bet amount and tap Spin Wheel.',
      'Wheel accelerates and decelerates through 12 distinct prize slices.',
      'Pointer indicates the winning wedge.',
      'Jackpot 25x awards immediate celebration and virtual points!'
    ],
    payouts: [
      { label: 'Mega Jackpot Wedge', multiplier: '25x', chance: '4.0%' },
      { label: 'Super Win Wedge', multiplier: '10x', chance: '6.0%' },
      { label: 'High Wedge', multiplier: '5x', chance: '10.0%' },
      { label: 'Medium Wedge', multiplier: '2x / 3x', chance: '28.0%' },
      { label: 'Safe Return Wedge', multiplier: '1.2x / 1.5x', chance: '32.0%' },
      { label: 'Miss Wedge', multiplier: '0x', chance: '20.0%' }
    ]
  },

  // ================= CARDS =================
  {
    id: 'blackjack',
    name: 'Blackjack 21',
    category: 'cards',
    tagline: 'Beat dealer hand without busting; natural 21 pays 3:2',
    description: 'Authentic casino rules: Hit, Stand, Double Down, and Dealer stands on 17.',
    iconName: 'Layers',
    badge: 'HOT',
    minBet: 10,
    maxBet: 500,
    rtpDisplay: '99.4% Basic Strategy RTP',
    houseEdgeOrRtp: '0.6%',
    rules: [
      'Aces count as 1 or 11; face cards count as 10.',
      'Natural 21 (Ace + 10-value card) on initial deal pays 3:2 (2.5x bet).',
      'Hit to draw another card; Stand to keep your hand.',
      'Double Down doubles your bet and deals exactly one card.',
      'Dealer must hit until cards total 17 or higher.',
      'Bust (hand exceeds 21) results in an automatic loss.'
    ],
    payouts: [
      { label: 'Blackjack (Natural 21)', multiplier: '2.5x (3:2)', chance: '4.8%' },
      { label: 'Standard Win', multiplier: '2.0x (1:1)', chance: '42.4%' },
      { label: 'Push (Tie)', multiplier: '1.0x (Refund)', chance: '8.5%' }
    ]
  },
  {
    id: 'teen-patti',
    name: 'Teen Patti vs Bots',
    category: 'cards',
    tagline: 'Indian 3-card poker showdown against Rahul, Priya & Vikram',
    description: 'Play Blind or Seen, raise Chaal, or Pack your cards in thrilling table poker.',
    iconName: 'Flame',
    badge: 'POPULAR',
    minBet: 20,
    maxBet: 500,
    rtpDisplay: 'Skill & Table Dynamics (97.0%)',
    houseEdgeOrRtp: '3.0%',
    rules: [
      '3 cards are dealt to each player (You + 3 AI bots).',
      'You can play Blind (unseen cards at 1x bet) or Seen (view cards at 2x bet).',
      'Options: Chaal (match/raise bet), Pack (fold and forfeit), or Show (head-to-head reveal).',
      'Hand Rankings: Trail/Trio (3 of a kind) > Pure Sequence (Straight Flush) > Sequence (Straight) > Color (Flush) > Pair > High Card.',
      'Winner of the Showdown takes the virtual pot!'
    ],
    payouts: [
      { label: 'Win the Pot', multiplier: 'Full Table Pot (~3x to 6x)', chance: '28.0%' },
      { label: 'Trail / Trio Win Bonus', multiplier: '+100 XP Bonus', chance: '0.24%' }
    ]
  },
  {
    id: 'andar-bahar',
    name: 'Andar Bahar',
    category: 'cards',
    tagline: 'Predict whether matching card lands on Andar (Inside) or Bahar (Outside)',
    description: 'Fast-paced traditional card game dealt with single 52-card shuffled deck.',
    iconName: 'ArrowLeftRight',
    badge: 'POPULAR',
    minBet: 10,
    maxBet: 500,
    rtpDisplay: '97.8% Balanced RTP',
    houseEdgeOrRtp: '2.2%',
    rules: [
      'A middle Joker card is revealed (e.g. 8 of Spades).',
      'Bet on either Andar (left) or Bahar (right).',
      'Cards are dealt alternately: first to Andar, then Bahar.',
      'The side where a card of matching rank (any 8) appears first wins!',
      'Andar (first dealt) pays 1.9x; Bahar pays 2.0x.'
    ],
    payouts: [
      { label: 'Andar Win (First Card)', multiplier: '1.90x', chance: '51.5%' },
      { label: 'Bahar Win', multiplier: '2.00x', chance: '48.5%' }
    ]
  },
  {
    id: 'high-low',
    name: 'High-Low Card Ladder',
    category: 'cards',
    tagline: 'Guess if next card is higher or lower; streak multiplier builds',
    description: 'Climb the multiplier ladder with consecutive guesses. Cash out anytime!',
    iconName: 'TrendingUp',
    badge: 'HOT',
    minBet: 10,
    maxBet: 500,
    rtpDisplay: '98.0% Dynamic Ladder RTP',
    houseEdgeOrRtp: '2.0%',
    rules: [
      'A base card is dealt (Ace low = 1, King high = 13).',
      'Guess Higher or Lower for the upcoming card.',
      'Each correct guess multiplies your payout ladder (1.35x -> 1.9x -> 2.8x -> 4.2x -> 6.5x -> 12x...).',
      'Equal rank is a safe push (no loss).',
      'Tap Cash Out at any rung to lock in your winnings, or continue for mega multipliers!'
    ],
    payouts: [
      { label: '1 Correct Guess', multiplier: '1.35x', chance: '70%' },
      { label: '2 Correct Guesses', multiplier: '1.90x', chance: '49%' },
      { label: '3 Correct Guesses', multiplier: '2.80x', chance: '34%' },
      { label: '4 Correct Guesses', multiplier: '4.20x', chance: '24%' },
      { label: '5 Correct Guesses', multiplier: '6.50x', chance: '16%' },
      { label: '7 Correct Guesses', multiplier: '15.00x', chance: '8%' }
    ]
  },
  {
    id: 'baccarat',
    name: 'Baccarat Punto Banco',
    category: 'cards',
    tagline: 'Bet on Player, Banker or Tie; hand closest to 9 wins',
    description: 'Classic high-roller table game with genuine 3rd-card drawing tableau.',
    iconName: 'Crown',
    badge: 'NEW',
    minBet: 10,
    maxBet: 500,
    rtpDisplay: '98.94% (Banker) / 98.76% (Player)',
    houseEdgeOrRtp: '1.06%',
    rules: [
      'Cards 2-9 retain face value; 10s and face cards are worth 0; Aces are worth 1.',
      'Hand score is the last digit of the total sum (e.g. 7 + 8 = 15 -> score 5).',
      'Bet on Player (1:1), Banker (0.95:1 after 5% demo house commission), or Tie (8:1).',
      'Hands with 8 or 9 on initial 2 cards are Naturals with no further draw.',
      'Full official Punto Banco drawing rules automatically executed.'
    ],
    payouts: [
      { label: 'Banker Win', multiplier: '1.95x (0.95:1)', chance: '45.8%' },
      { label: 'Player Win', multiplier: '2.00x (1:1)', chance: '44.6%' },
      { label: 'Tie', multiplier: '9.00x (8:1)', chance: '9.6%' }
    ]
  },

  // ================= QUICK WIN =================
  {
    id: 'crash',
    name: 'Rocket Crash',
    category: 'quick',
    tagline: 'Rising multiplier 1.00x upward; cash out before the rocket crashes!',
    description: 'High-adrenaline curve game. Will you take 2x or hold for 50x?',
    iconName: 'Rocket',
    badge: 'HOT',
    minBet: 10,
    maxBet: 500,
    rtpDisplay: '97.0% Provably Fair Curve',
    houseEdgeOrRtp: '3.0%',
    rules: [
      'Set your bet and optional Auto-Cashout multiplier (e.g. 2.00x).',
      'Tap Launch Rocket to start the trajectory.',
      'The multiplier starts at 1.00x and accelerates exponentially upwards.',
      'Tap Cash Out at any moment to claim: Bet × Current Multiplier.',
      'If the rocket crashes before you cash out, the bet is lost.'
    ],
    payouts: [
      { label: 'Cashout at 1.50x', multiplier: '1.50x', chance: '64.6%' },
      { label: 'Cashout at 2.00x', multiplier: '2.00x', chance: '48.5%' },
      { label: 'Cashout at 5.00x', multiplier: '5.00x', chance: '19.4%' },
      { label: 'Cashout at 10.00x', multiplier: '10.00x', chance: '9.7%' },
      { label: 'Mega Spike (50x+)', multiplier: '50.00x+', chance: '1.9%' }
    ]
  },
  {
    id: 'mines',
    name: 'Mines Grid 5x5',
    category: 'quick',
    tagline: 'Pick safe tiles on a 5x5 grid; avoid hidden mines and cash out anytime',
    description: 'Customize mine count from 1 to 24. Uncover diamonds to boost multipliers.',
    iconName: 'Bomb',
    badge: 'POPULAR',
    minBet: 10,
    maxBet: 500,
    rtpDisplay: '98.0% Dynamic Grid RTP',
    houseEdgeOrRtp: '2.0%',
    rules: [
      'The grid has 25 tiles. Choose how many mines to hide (1 to 24).',
      'More mines mean higher multiplier per diamond uncovered!',
      'Tap tiles one by one: Green Diamond increases your accumulated cashout pot.',
      'Tap Cash Out anytime to secure your accumulated virtual points.',
      'Hitting a red Mine detonates the grid and loses the current round.'
    ],
    payouts: [
      { label: '3 Mines: 1st Diamond', multiplier: '1.12x', chance: '88.0%' },
      { label: '3 Mines: 3rd Diamond', multiplier: '1.45x', chance: '67.0%' },
      { label: '3 Mines: 5th Diamond', multiplier: '2.05x', chance: '47.0%' },
      { label: '5 Mines: 4th Diamond', multiplier: '2.85x', chance: '35.0%' },
      { label: '10 Mines: 3 Diamonds', multiplier: '3.60x', chance: '21.0%' }
    ]
  },
  {
    id: 'plinko',
    name: 'Plinko Arcade Drop',
    category: 'quick',
    tagline: 'Drop balls through peg pyramid into bottom payout multipliers',
    description: 'Hypnotic physics ball drops bouncing off pin rows into prize buckets.',
    iconName: 'Grid',
    badge: 'POPULAR',
    minBet: 10,
    maxBet: 500,
    rtpDisplay: '97.5% Symmetrical Binomial RTP',
    houseEdgeOrRtp: '2.5%',
    rules: [
      'Select your bet per ball and row risk level (8 or 12 rows).',
      'Tap Drop Ball to release ball from the top pin pyramid.',
      'Ball deflects 50% left or right at every pin level according to true binomial distribution.',
      'Lands into one of the bottom multiplier bins from 0.2x center to 10x edge pockets!'
    ],
    payouts: [
      { label: 'Outer Edge Pockets', multiplier: '10.0x', chance: '1.5%' },
      { label: 'Mid-Outer Pockets', multiplier: '3.0x', chance: '7.8%' },
      { label: 'Mid Pockets', multiplier: '1.5x', chance: '23.4%' },
      { label: 'Center-Adjacent Pockets', multiplier: '0.7x', chance: '31.2%' },
      { label: 'Dead Center Pocket', multiplier: '0.2x', chance: '36.1%' }
    ]
  },
  {
    id: 'color-prediction',
    name: 'Color Prediction 30s',
    category: 'quick',
    tagline: 'Predict Red, Green, or Violet color rounds with live 30s countdown',
    description: 'Fast round trend chart with color pills and number predictions 0-9.',
    iconName: 'Palette',
    badge: 'HOT',
    minBet: 10,
    maxBet: 500,
    rtpDisplay: '97.0% Transparent Draw',
    houseEdgeOrRtp: '3.0%',
    rules: [
      'A new round starts every 30 seconds with a live ticking countdown timer.',
      'Bet on Red (numbers 2, 4, 6, 8 - pays 2x)',
      'Bet on Green (numbers 1, 3, 7, 9 - pays 2x)',
      'Bet on Violet (numbers 0 and 5 - pays 4.5x)',
      'Or bet directly on a single number 0-9 (pays 9x)!',
      'Numbers 0 and 5 share both colors (half payout for color + violet win).'
    ],
    payouts: [
      { label: 'Exact Number (0-9)', multiplier: '9.0x', chance: '10.0%' },
      { label: 'Violet (0 & 5)', multiplier: '4.5x', chance: '20.0%' },
      { label: 'Red (Pure 2,4,6,8)', multiplier: '2.0x', chance: '40.0%' },
      { label: 'Green (Pure 1,3,7,9)', multiplier: '2.0x', chance: '40.0%' }
    ]
  },
  {
    id: 'scratch-card',
    name: 'Neon Lucky Scratch',
    category: 'quick',
    tagline: 'Scratch 6 silver panels to match 3 prizes and win up to 50x',
    description: 'Tactile scratch-off canvas card. Reveal matching prize symbols to claim.',
    iconName: 'Ticket',
    badge: 'NEW',
    minBet: 10,
    maxBet: 250,
    rtpDisplay: '96.0% Instant Ticket RTP',
    houseEdgeOrRtp: '4.0%',
    rules: [
      'Purchase a demo scratch ticket for your chosen bet.',
      'Drag your finger across the 6 scratch panels or tap "Scratch All".',
      'Each panel conceals a prize multiplier (2x, 5x, 10x, 25x, 50x) or icon.',
      'Reveal 3 matching prize amounts to win that payout instantly!'
    ],
    payouts: [
      { label: 'Match 3x 50X', multiplier: '50.0x', chance: '1.0%' },
      { label: 'Match 3x 25X', multiplier: '25.0x', chance: '2.5%' },
      { label: 'Match 3x 10X', multiplier: '10.0x', chance: '6.0%' },
      { label: 'Match 3x 5X', multiplier: '5.0x', chance: '14.0%' },
      { label: 'Match 3x 2X', multiplier: '2.0x', chance: '28.0%' }
    ]
  },

  // ================= SKILL / ARCADE (NO BETTING) =================
  {
    id: 'memory-match',
    name: 'Memory Match Arcade',
    category: 'skill',
    tagline: 'Zero betting! Flip cards to pair arcade icons; earn virtual points & XP',
    description: 'Mental agility puzzle. Match all 8 pairs with the fewest moves to earn bonus points.',
    iconName: 'Brain',
    badge: 'FREE XP',
    minBet: 0,
    maxBet: 0,
    isSkillNoBet: true,
    rtpDisplay: 'Pure Skill Based',
    houseEdgeOrRtp: '0% (Earn points)',
    rules: [
      '100% FREE - No betting required!',
      'Tap tiles to flip and reveal retro arcade symbols.',
      'Find all 8 matching pairs in as few moves as possible.',
      'Bonus points earned based on your move count and completion speed:',
      '• Under 18 moves: +300 points & +80 XP',
      '• Under 26 moves: +200 points & +50 XP',
      '• Over 26 moves: +100 points & +25 XP'
    ],
    payouts: [
      { label: 'Flawless (<18 moves)', multiplier: '+300 pts & +80 XP' },
      { label: 'Great (<26 moves)', multiplier: '+200 pts & +50 XP' },
      { label: 'Completed', multiplier: '+100 pts & +25 XP' }
    ]
  },
  {
    id: 'tap-speed',
    name: 'Tap Speed Frenzy',
    category: 'skill',
    tagline: 'Zero betting! 10-second tap rush; test your CPS to score points & XP',
    description: 'How fast are your fingers? Tap the glowing arcade orb as many times as possible.',
    iconName: 'Zap',
    badge: 'FREE XP',
    minBet: 0,
    maxBet: 0,
    isSkillNoBet: true,
    rtpDisplay: 'Pure Skill Based',
    houseEdgeOrRtp: '0% (Earn points)',
    rules: [
      '100% FREE - No betting required!',
      'Tap Start, then tap the power target as fast as possible for 10 seconds.',
      'Calculates your CPS (Clicks Per Second) and total score.',
      '• 80+ Taps (8.0+ CPS): +350 points & +100 XP (Arcade God!)',
      '• 60-79 Taps: +250 points & +70 XP',
      '• 40-59 Taps: +150 points & +40 XP',
      '• Under 40 Taps: +75 points & +20 XP'
    ],
    payouts: [
      { label: 'God Tier (80+ taps)', multiplier: '+350 pts & +100 XP' },
      { label: 'Pro Tier (60-79 taps)', multiplier: '+250 pts & +70 XP' },
      { label: 'Fast Tier (40-59 taps)', multiplier: '+150 pts & +40 XP' },
      { label: 'Participant (<40 taps)', multiplier: '+75 pts & +20 XP' }
    ]
  },
  {
    id: 'game-2048',
    name: 'Arcade 2048 Merge',
    category: 'skill',
    tagline: 'Zero betting! Slide and merge numbered tiles; score points for every merge',
    description: 'Legendary sliding block puzzle. Combine matching tiles to reach 2048!',
    iconName: 'Puzzle',
    badge: 'FREE XP',
    minBet: 0,
    maxBet: 0,
    isSkillNoBet: true,
    rtpDisplay: 'Pure Strategy',
    houseEdgeOrRtp: '0% (Earn points)',
    rules: [
      '100% FREE - No betting required!',
      'Use swipe gestures or on-screen directional arrow pads to slide tiles.',
      'When two tiles with the same number touch, they merge into one (2+2=4, 4+4=8... 1024+1024=2048).',
      'Each merged tile adds directly to your score.',
      'Reach milestones (512, 1024, 2048) to claim huge point bonuses and level XP!'
    ],
    payouts: [
      { label: 'Reach 2048 Tile', multiplier: '+1,000 pts & +250 XP' },
      { label: 'Reach 1024 Tile', multiplier: '+500 pts & +120 XP' },
      { label: 'Reach 512 Tile', multiplier: '+250 pts & +60 XP' },
      { label: 'Game Score Reward', multiplier: '10% of game score converted to points' }
    ]
  },
  {
    id: 'number-guess',
    name: 'Hot & Cold Number Guess',
    category: 'skill',
    tagline: 'Zero betting! Guess the hidden number 1-100 with smart clues; earn rewards',
    description: 'Deduction challenge. Find the secret number with fewer guesses for bigger rewards.',
    iconName: 'HelpCircle',
    badge: 'FREE XP',
    minBet: 0,
    maxBet: 0,
    isSkillNoBet: true,
    rtpDisplay: 'Pure Logic & Deduction',
    houseEdgeOrRtp: '0% (Earn points)',
    rules: [
      '100% FREE - No betting required!',
      'The AI selects a random secret number between 1 and 100.',
      'Submit your guess: get feedback whether it is Too High, Too Low, or Getting Warmer!',
      'You have 7 attempts to discover the number.',
      '• 1-3 Guesses: +400 points & +100 XP (Genius)',
      '• 4-5 Guesses: +250 points & +60 XP',
      '• 6-7 Guesses: +150 points & +30 XP'
    ],
    payouts: [
      { label: 'Solved in 1-3 Guesses', multiplier: '+400 pts & +100 XP' },
      { label: 'Solved in 4-5 Guesses', multiplier: '+250 pts & +60 XP' },
      { label: 'Solved in 6-7 Guesses', multiplier: '+150 pts & +30 XP' }
    ]
  },
  {
    id: 'tic-tac-toe',
    name: 'Neon Tic-Tac-Toe',
    category: 'skill',
    tagline: 'Zero betting! Face smart arcade bot on 3x3 grid; win streaks grant points & XP',
    description: 'Classic X vs O challenge against AI with Easy, Medium, and Unbeatable Hard modes.',
    iconName: 'Gamepad2',
    badge: 'FREE XP',
    minBet: 0,
    maxBet: 0,
    isSkillNoBet: true,
    rtpDisplay: 'Tactical Puzzle',
    houseEdgeOrRtp: '0% (Earn points)',
    rules: [
      '100% FREE - No betting required!',
      'Choose your difficulty: Easy, Medium, or Hard (Minimax AI).',
      'Place your neon X on the 3x3 grid; get 3 in a row horizontally, vertically, or diagonally.',
      '• Win on Hard mode: +250 points & +75 XP',
      '• Win on Medium mode: +150 points & +40 XP',
      '• Win on Easy mode: +80 points & +20 XP',
      '• Draw: +30 points & +10 XP'
    ],
    payouts: [
      { label: 'Win on Hard Mode', multiplier: '+250 pts & +75 XP' },
      { label: 'Win on Medium Mode', multiplier: '+150 pts & +40 XP' },
      { label: 'Win on Easy Mode', multiplier: '+80 pts & +20 XP' },
      { label: 'Draw with Bot', multiplier: '+30 pts & +10 XP' }
    ]
  }
];

export const INITIAL_ACHIEVEMENTS: {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardPoints: number;
  rewardXp: number;
  maxProgress: number;
}[] = [
  { id: 'first-game', title: 'Arcade Rookie', description: 'Play your first game in PlayZone Arcade', icon: 'Gamepad2', rewardPoints: 100, rewardXp: 30, maxProgress: 1 },
  { id: 'win-streak-3', title: 'Lucky Streak', description: 'Win 3 rounds in a row across any game', icon: 'Flame', rewardPoints: 250, rewardXp: 50, maxProgress: 3 },
  { id: 'big-win-500', title: 'High Roller', description: 'Win 500+ virtual points in a single round', icon: 'Sparkles', rewardPoints: 400, rewardXp: 80, maxProgress: 500 },
  { id: 'rocket-rider', title: 'To the Moon!', description: 'Cash out at 5.00x or higher in Rocket Crash', icon: 'Rocket', rewardPoints: 300, rewardXp: 60, maxProgress: 1 },
  { id: 'mine-hunter', title: 'Diamond Hands', description: 'Uncover 5 diamonds without hitting a mine', icon: 'Diamond', rewardPoints: 350, rewardXp: 70, maxProgress: 5 },
  { id: 'slot-jackpot', title: 'Triple Seven', description: 'Hit any 3-symbol line in Neon Slots', icon: 'Trophy', rewardPoints: 500, rewardXp: 100, maxProgress: 1 },
  { id: 'card-shark', title: 'Card Shark', description: 'Win a hand in Blackjack with natural 21', icon: 'Crown', rewardPoints: 300, rewardXp: 60, maxProgress: 1 },
  { id: 'skill-master', title: 'Arcade Virtuoso', description: 'Score 50+ taps in Tap Speed Frenzy', icon: 'Zap', rewardPoints: 200, rewardXp: 50, maxProgress: 50 },
  { id: 'play-10-games', title: 'Dedicated Gamer', description: 'Play a total of 10 rounds in any games', icon: 'Award', rewardPoints: 300, rewardXp: 60, maxProgress: 10 },
  { id: 'daily-loyalty', title: 'Daily Regular', description: 'Claim the Daily Bonus streak', icon: 'Calendar', rewardPoints: 200, rewardXp: 40, maxProgress: 1 },
  { id: 'puzzle-pro', title: 'Mind Over Matter', description: 'Solve Memory Match in under 22 moves', icon: 'Brain', rewardPoints: 250, rewardXp: 50, maxProgress: 1 },
  { id: 'grand-champion', title: 'Virtual Tycoon', description: 'Reach a balance of 5,000 virtual points', icon: 'Coins', rewardPoints: 1000, rewardXp: 200, maxProgress: 5000 }
];

export const INITIAL_LEADERBOARD = [
  { id: 'bot-1', rank: 1, name: 'CyberPhoenix', avatar: '🎮', points: 14250, level: 18, badge: 'Grand Master' },
  { id: 'bot-2', rank: 2, name: 'NeonViper', avatar: '⚡', points: 11800, level: 15, badge: 'Pro' },
  { id: 'bot-3', rank: 3, name: 'PixelSamurai', avatar: '🗡️', points: 9400, level: 12, badge: 'Expert' },
  { id: 'bot-4', rank: 4, name: 'StarRanger', avatar: '🚀', points: 7950, level: 10, badge: 'Adept' },
  { id: 'bot-5', rank: 5, name: 'RetroQueen', avatar: '👑', points: 6600, level: 9, badge: 'Adept' },
  { id: 'bot-6', rank: 6, name: 'ShadowAce', avatar: '🃏', points: 5350, level: 8, badge: 'Regular' },
  { id: 'bot-7', rank: 7, name: 'LuckyFox', avatar: '🦊', points: 4200, level: 6, badge: 'Regular' },
  { id: 'bot-8', rank: 8, name: 'TurboDrifter', avatar: '🏎️', points: 3100, level: 5, badge: 'Rookie' },
  { id: 'bot-9', rank: 9, name: 'CosmicNova', avatar: '✨', points: 2450, level: 4, badge: 'Rookie' },
  { id: 'bot-10', rank: 10, name: 'ArcadePilot', avatar: '🕹️', points: 1850, level: 3, badge: 'Rookie' },
];

export const AVATAR_OPTIONS = [
  { id: 'avatar-1', emoji: '🕹️', label: 'Joystick' },
  { id: 'avatar-2', emoji: '🎮', label: 'Console' },
  { id: 'avatar-3', emoji: '⚡', label: 'Thunder' },
  { id: 'avatar-4', emoji: '🚀', label: 'Rocket' },
  { id: 'avatar-5', emoji: '👑', label: 'Crown' },
  { id: 'avatar-6', emoji: '🦊', label: 'Fox' },
  { id: 'avatar-7', emoji: '👾', label: 'Alien' },
  { id: 'avatar-8', emoji: '🃏', label: 'Joker' },
  { id: 'avatar-9', emoji: '💎', label: 'Diamond' },
  { id: 'avatar-10', emoji: '🔥', label: 'Fire' },
  { id: 'avatar-11', emoji: '🏆', label: 'Trophy' },
  { id: 'avatar-12', emoji: '🤖', label: 'Robot' }
];
