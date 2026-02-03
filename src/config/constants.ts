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
  // Set to true to unlock all levels for testing in Expo Go
  TESTING_MODE: __DEV__,
  // Set to false before production release to hide debug logs button
  SHOW_DEBUG_LOGS: false,
  COLORS: {
    // PRIMARY GREENS - Nature/Forest theme
    primary: '#2D5F3F', // Deep Forest Green (was #6C5CE7 purple)
    secondary: '#5A9E7A', // Sage Green (was #A29BFE light purple)
    accent: '#8FBC8F', // Moss Green (was #FD79A8 pink)

    // FUNCTIONAL COLORS
    success: '#4CAF50', // Vibrant Leaf Green (was #00B894)
    warning: '#FFB74D', // Amber/Golden Hour (was #FDCB6E)
    danger: '#E57373', // Muted Red/Berry (was #FF7675)

    // DARK BACKGROUNDS - Forest night theme
    background: '#0D1F12', // Very Dark Forest Green/Black (was #0F0F1E)
    backgroundLight: '#1A2E1F', // Dark Pine (was #1A1A2E)
    cardBg: '#1E3A24', // Dark Moss (was #16213E)

    // TEXT COLORS
    text: '#F5F5F5', // Soft White (was #FFFFFF)
    textSecondary: '#9DB3A0', // Misty Sage (was #B2BFCC)

    // GRADIENTS - Organic green flows
    gradient1: '#3D7C52', // Emerald (was #667EEA)
    gradient2: '#2D5F3F', // Deep Forest (was #764BA2)

    // TILE COLORS
    tile: '#2C4A33', // Forest Floor (was #2D3561)
    tileSelected: '#3D7C52', // Emerald Highlight (was #6C5CE7)
    tileBonus: '#7CB342', // Fresh Spring Green (was #F093FB)

    // NEW COLORS - Enhanced nature theme
    glowGreen: '#6FD88E', // Firefly Glow - for animations
    earthBrown: '#3E2723', // Rich Earth - optional accents
    dewDrop: '#B3E5C8', // Light Mint - subtle highlights
    shadowGreen: '#0A1810', // Deep Shadow - for depth
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

// Static pricing for all IAP products
export const IAP_PRICING = {
  [IAP_PRODUCTS.LEVEL_PACK_1]: '$2.99',
  [IAP_PRODUCTS.LEVEL_PACK_2]: '$2.99',
  [IAP_PRODUCTS.LEVEL_PACK_3]: '$2.99',
  [IAP_PRODUCTS.COINS_SMALL]: '$0.99',
  [IAP_PRODUCTS.COINS_MEDIUM]: '$2.99',
  [IAP_PRODUCTS.COINS_LARGE]: '$7.99',
  [IAP_PRODUCTS.PREMIUM_UNLOCK]: '$9.99',
};

export const AUDIO_CONFIG = {
  MUSIC_VOLUME: 0.3,
  SFX_VOLUME: 0.7,
  MUSIC_FADE_IN: 1000,
  MUSIC_FADE_OUT: 500,
  SOUNDS: {
    TILE_TAP: 'tile_tap',
    WORD_VALID: 'word_valid',
    WORD_INVALID: 'word_invalid',
    WORD_DUPLICATE: 'word_duplicate',
    LEVEL_COMPLETE: 'level_complete',
    BUTTON_TAP: 'button_tap',
  } as const,
  MUSIC: {
    FOREST_AMBIENT: 'forest_ambient',
  } as const,
};

export const ANIMATIONS = {
  TILE_SELECT_DURATION: 150,
  TILE_DESELECT_DURATION: 100,
  WORD_SUBMIT_DURATION: 300,
  SCORE_INCREMENT_DURATION: 500,
  PARTICLE_LIFETIME: 1000,
};
