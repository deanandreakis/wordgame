export const GAME_CONFIG = {
  GRID_SIZE: 5,
  MIN_WORD_LENGTH: 3,
  MAX_WORD_LENGTH: 12,
  INITIAL_LIVES: 3,
  INITIAL_HINTS: 3,
  BASE_SCORE_PER_LETTER: 10,
  BONUS_MULTIPLIERS: {
    4: 1.5,
    5: 2,
    6: 2.5,
    7: 3,
    8: 4,
  },
  FREE_LEVELS: 20,
  COLORS: {
    primary: '#6C5CE7',
    secondary: '#A29BFE',
    accent: '#FD79A8',
    success: '#00B894',
    warning: '#FDCB6E',
    danger: '#FF7675',
    background: '#0F0F1E',
    backgroundLight: '#1A1A2E',
    text: '#FFFFFF',
    textSecondary: '#B2BFCC',
    cardBg: '#16213E',
    gradient1: '#667EEA',
    gradient2: '#764BA2',
    tile: '#2D3561',
    tileSelected: '#6C5CE7',
    tileBonus: '#F093FB',
  },
};

export const LETTER_FREQUENCIES = {
  A: 8.2,
  B: 1.5,
  C: 2.8,
  D: 4.3,
  E: 12.7,
  F: 2.2,
  G: 2.0,
  H: 6.1,
  I: 7.0,
  J: 0.15,
  K: 0.77,
  L: 4.0,
  M: 2.4,
  N: 6.7,
  O: 7.5,
  P: 1.9,
  Q: 0.095,
  R: 6.0,
  S: 6.3,
  T: 9.1,
  U: 2.8,
  V: 0.98,
  W: 2.4,
  X: 0.15,
  Y: 2.0,
  Z: 0.074,
};

export const LETTER_SCORES = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
};

export const POWER_UPS = [
  {
    id: 'hint',
    type: 'hint' as const,
    name: 'Word Hint',
    description: 'Reveals a valid word from current letters',
    cost: 50,
    icon: '💡',
  },
  {
    id: 'shuffle',
    type: 'shuffle' as const,
    name: 'Shuffle Letters',
    description: 'Rearranges all letters on the board',
    cost: 30,
    icon: '🔄',
  },
  {
    id: 'time-freeze',
    type: 'time-freeze' as const,
    name: 'Time Freeze',
    description: 'Stops the timer for 30 seconds',
    cost: 100,
    icon: '⏸️',
  },
  {
    id: 'double-points',
    type: 'double-points' as const,
    name: 'Double Points',
    description: 'Next word scores double points',
    cost: 75,
    icon: '⚡',
  },
];

export const IAP_PRODUCTS = {
  LEVEL_PACK_1: 'com.letterloom.levels.pack1',
  LEVEL_PACK_2: 'com.letterloom.levels.pack2',
  LEVEL_PACK_3: 'com.letterloom.levels.pack3',
  COINS_SMALL: 'com.letterloom.coins.small',
  COINS_MEDIUM: 'com.letterloom.coins.medium',
  COINS_LARGE: 'com.letterloom.coins.large',
  PREMIUM_UNLOCK: 'com.letterloom.premium.unlock',
};

export const COIN_AMOUNTS = {
  SMALL: 250,
  MEDIUM: 1000,
  LARGE: 3000,
};

export const COIN_REWARDS = {
  BASE: 10, // Base coins per level completion
  PER_STAR: 5, // Additional coins per star (1 star = 15, 2 = 20, 3 = 25)
  PREMIUM_MULTIPLIER: 2, // Premium users get 2x coins
};

export const ANIMATIONS = {
  TILE_SELECT_DURATION: 150,
  TILE_DESELECT_DURATION: 100,
  WORD_SUBMIT_DURATION: 300,
  SCORE_INCREMENT_DURATION: 500,
  PARTICLE_LIFETIME: 1000,
};
