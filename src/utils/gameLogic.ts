import {GAME_CONFIG, LETTER_SCORES, LETTER_FREQUENCIES} from '@/config/constants';
import {Letter, Level, Word} from '@/types/game';
import {LEVELS} from '@/data/levels';

/**
 * Validates if the selected letters form a valid word
 * Checks against the level's pre-calculated validWords list instead of global dictionary
 */
export function validateWord(selectedLetters: Letter[], levelId: number): {
  isValid: boolean;
  word: string;
  score: number;
} {
  const word = selectedLetters.map(l => l.letter).join('').toUpperCase();

  if (word.length < GAME_CONFIG.MIN_WORD_LENGTH) {
    return {isValid: false, word, score: 0};
  }

  // Find the level data
  const levelData = LEVELS.find(l => l.id === levelId);
  if (!levelData) {
    console.warn(`Level ${levelId} not found`);
    return {isValid: false, word, score: 0};
  }

  // Check if word is in the level's pre-calculated valid words list
  const isValid = levelData.validWords.includes(word);
  const score = isValid ? calculateScore(selectedLetters) : 0;

  return {isValid, word, score};
}

/**
 * Calculates score for a word based on letter values and multipliers
 */
export function calculateScore(letters: Letter[]): number {
  let baseScore = 0;

  // Calculate base score from letters
  for (const letter of letters) {
    const letterScore = LETTER_SCORES[letter.letter as keyof typeof LETTER_SCORES] || 1;
    const multiplier = letter.multiplier || 1;
    baseScore += letterScore * multiplier;
  }

  // Apply word length bonus
  const wordLength = letters.length;
  const lengthBonus =
    GAME_CONFIG.BONUS_MULTIPLIERS[
      wordLength as keyof typeof GAME_CONFIG.BONUS_MULTIPLIERS
    ] || 1;

  return Math.floor(baseScore * lengthBonus * GAME_CONFIG.BASE_SCORE_PER_LETTER);
}

/**
 * Generates a random letter based on English letter frequencies
 */
export function generateRandomLetter(): string {
  const random = Math.random() * 100;
  let cumulative = 0;

  for (const [letter, frequency] of Object.entries(LETTER_FREQUENCIES)) {
    cumulative += frequency;
    if (random <= cumulative) {
      return letter;
    }
  }

  return 'E'; // Fallback to most common letter
}

/**
 * Converts a pre-calculated level's letter array into Letter objects with positions
 */
export function createLetterGrid(letters: string[], size: number = GAME_CONFIG.GRID_SIZE): Letter[] {
  return letters.map((letter, index) => {
    const row = Math.floor(index / size);
    const col = index % size;

    // Occasionally add multiplier tiles (10% chance)
    const hasMultiplier = Math.random() < 0.1;
    const multiplier = hasMultiplier ? (Math.random() < 0.7 ? 2 : 3) : undefined;

    return {
      id: `${index}`,
      letter,
      position: {x: col, y: row},
      isSelected: false,
      multiplier,
    };
  });
}

/**
 * Loads a pre-calculated level by level number
 * All levels are pre-designed and tested for quality
 */
export function generateLevel(
  levelNumber: number,
  isPremium: boolean = false,
): Level {
  // Find the pre-calculated level data
  const levelData = LEVELS.find(l => l.id === levelNumber);

  if (!levelData) {
    // Fallback: if level doesn't exist, return level 1
    console.warn(`Level ${levelNumber} not found, falling back to level 1`);
    const fallbackData = LEVELS[0];
    return {
      id: levelNumber,
      targetScore: fallbackData.targetScore,
      timeLimit: fallbackData.timeLimit,
      letters: fallbackData.letters,
      difficulty: fallbackData.difficulty,
      isPremium,
    };
  }

  // Return the pre-calculated level
  return {
    id: levelData.id,
    targetScore: levelData.targetScore,
    timeLimit: levelData.timeLimit,
    letters: levelData.letters,
    difficulty: levelData.difficulty,
    isPremium: levelData.isPremium,
  };
}

/**
 * Determines difficulty based on level number
 */
export function getLevelDifficulty(
  levelNumber: number,
): 'easy' | 'medium' | 'hard' | 'expert' {
  if (levelNumber <= 10) return 'easy';
  if (levelNumber <= 30) return 'medium';
  if (levelNumber <= 60) return 'hard';
  return 'expert';
}

/**
 * Checks if letters are adjacent on the grid
 */
export function areLettersAdjacent(letter1: Letter, letter2: Letter): boolean {
  const xDiff = Math.abs(letter1.position.x - letter2.position.x);
  const yDiff = Math.abs(letter1.position.y - letter2.position.y);

  // Adjacent includes diagonals
  return xDiff <= 1 && yDiff <= 1 && (xDiff + yDiff) > 0;
}

/**
 * Validates that selected letters form a valid path (adjacent)
 */
export function isValidLetterPath(letters: Letter[]): boolean {
  for (let i = 1; i < letters.length; i++) {
    if (!areLettersAdjacent(letters[i - 1], letters[i])) {
      return false;
    }
  }
  return true;
}

/**
 * Fisher-Yates shuffle algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Finds all possible words from given letters (for hints)
 */
export function findPossibleWords(
  letters: Letter[],
  minLength: number = GAME_CONFIG.MIN_WORD_LENGTH,
): string[] {
  const possibleWords: Set<string> = new Set();

  // Helper function to generate all combinations
  function generateCombinations(
    current: Letter[],
    remaining: Letter[],
  ): void {
    if (current.length >= minLength) {
      const word = current.map(l => l.letter).join('');
      if (isValidWord(word)) {
        possibleWords.add(word);
      }
    }

    if (current.length >= GAME_CONFIG.MAX_WORD_LENGTH) {
      return;
    }

    for (let i = 0; i < remaining.length; i++) {
      if (
        current.length === 0 ||
        areLettersAdjacent(current[current.length - 1], remaining[i])
      ) {
        generateCombinations(
          [...current, remaining[i]],
          remaining.filter((_, idx) => idx !== i),
        );
      }
    }
  }

  generateCombinations([], letters);
  return Array.from(possibleWords);
}

/**
 * Gets a hint word from the level's pre-calculated valid words
 */
export function getHintWord(
  levelId: number,
  foundWords: string[],
): string | null {
  // Get the level's pre-calculated valid words
  const levelData = LEVELS.find(l => l.id === levelId);
  if (!levelData) {
    console.warn(`Level ${levelId} not found`);
    return null;
  }

  const unusedWords = levelData.validWords.filter(w => !foundWords.includes(w));

  if (unusedWords.length === 0) {
    return null;
  }

  // Return the longest unused word
  unusedWords.sort((a, b) => b.length - a.length);
  return unusedWords[0];
}

/**
 * Calculates stars earned based on score vs target
 */
export function calculateStars(score: number, targetScore: number): number {
  const ratio = score / targetScore;
  if (ratio >= 2) return 3;
  if (ratio >= 1.5) return 2;
  if (ratio >= 1) return 1;
  return 0;
}
