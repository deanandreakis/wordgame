export interface Letter {
  id: string;
  letter: string;
  position: {x: number; y: number};
  isSelected: boolean;
  multiplier?: number; // For special tiles (2x, 3x points)
}

export interface Word {
  word: string;
  score: number;
  letters: Letter[];
}

export interface MultiplierPosition {
  position: number; // Index in the 25-tile grid (0-24)
  value: 2 | 3;     // Multiplier value (2x or 3x)
}

export interface Level {
  id: number;
  targetScore: number;
  timeLimit?: number;
  letters: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  isPremium: boolean;
  validWords?: string[]; // Pre-calculated valid words for this level
  multiplierPositions?: MultiplierPosition[]; // Pre-calculated multiplier positions
  bonusWords?: string[]; // Special words for extra points (legacy)
}

export interface GameState {
  currentLevel: number;
  score: number;
  foundWords: Word[];
  selectedLetters: Letter[];
  timeRemaining?: number;
  lives: number;
  streak: number;
  hints: number;
  isPaused: boolean;
}

export interface PowerUp {
  id: string;
  type: 'hint' | 'shuffle' | 'time-freeze' | 'double-points';
  name: string;
  description: string;
  cost: number;
  icon: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  requirement: number;
  progress: number;
  unlocked: boolean;
  reward: number; // Coins or points
}

export interface UserProfile {
  userId: string;
  displayName: string;
  totalScore: number;
  highestLevel: number;
  totalWordsFound: number;
  longestStreak: number;
  achievements: Achievement[];
  purchasedLevels: number[];
  completedLevels: number[]; // Track which levels have been completed
  coins: number;
  hasPremium: boolean;
  lastPlayedDate: string;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  score: number;
  level: number;
  timestamp: number;
}

export interface DailyChallenge {
  id: string;
  date: string;
  letters: string[];
  targetWords: string[];
  minimumScore: number;
  reward: number;
  completed: boolean;
}
