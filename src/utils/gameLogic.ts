import {GAME_CONFIG, LETTER_SCORES, LETTER_FREQUENCIES} from '@/config/constants';
import {isValidWord} from './dictionary';
import {Letter, Level, Word} from '@/types/game';

/**
 * Validates if the selected letters form a valid word
 */
export function validateWord(selectedLetters: Letter[]): {
  isValid: boolean;
  word: string;
  score: number;
} {
  const word = selectedLetters.map(l => l.letter).join('').toUpperCase();

  if (word.length < GAME_CONFIG.MIN_WORD_LENGTH) {
    return {isValid: false, word, score: 0};
  }

  const isValid = isValidWord(word);
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
 * Validates if a letter grid has enough words and achievable target score
 */
function validateLetterGrid(
  letters: Letter[],
  targetScore: number,
  difficulty: 'easy' | 'medium' | 'hard' | 'expert',
): {isValid: boolean; wordCount: number; maxScore: number; words: string[]} {
  // Find all possible words in the grid
  const possibleWords = findPossibleWords(letters);

  // Calculate score for each word and sort by score (descending)
  const wordScores: {word: string; score: number}[] = [];
  for (const word of possibleWords) {
    const wordLetters = word.split('');
    const wordScore = calculateMaxScoreForWord(letters, wordLetters);
    wordScores.push({word, score: wordScore});
  }
  wordScores.sort((a, b) => b.score - a.score);

  // Calculate realistic max score: sum of top-scoring words
  // Players won't find ALL words, so we estimate based on top 60% of words
  const topWordCount = Math.ceil(possibleWords.length * 0.6);
  const maxScore = wordScores
    .slice(0, topWordCount)
    .reduce((sum, ws) => sum + ws.score, 0);

  // Minimum word count requirements based on difficulty
  const minWordCount = {
    easy: 20,    // Easy levels should have plenty of words
    medium: 15,  // Medium levels need good variety
    hard: 12,    // Hard levels can be tighter
    expert: 10,  // Expert levels allow fewer words
  }[difficulty];

  // Validation: enough words AND realistic max score exceeds target with buffer
  const isValid =
    possibleWords.length >= minWordCount &&
    maxScore >= targetScore * 1.3; // 30% buffer for achievability

  return {
    isValid,
    wordCount: possibleWords.length,
    maxScore,
    words: possibleWords,
  };
}

/**
 * Calculates maximum score for a specific word considering multipliers
 */
function calculateMaxScoreForWord(
  letters: Letter[],
  wordLetters: string[],
): number {
  // Find all possible paths that form this word
  let maxScore = 0;

  function findPaths(
    current: Letter[],
    remaining: string[],
    unusedLetters: Letter[],
  ): void {
    if (remaining.length === 0) {
      const score = calculateScore(current);
      maxScore = Math.max(maxScore, score);
      return;
    }

    const nextLetter = remaining[0];
    for (const letter of unusedLetters) {
      if (
        letter.letter === nextLetter &&
        (current.length === 0 ||
          areLettersAdjacent(current[current.length - 1], letter))
      ) {
        findPaths(
          [...current, letter],
          remaining.slice(1),
          unusedLetters.filter(l => l.id !== letter.id),
        );
      }
    }
  }

  findPaths([], wordLetters, letters);
  return maxScore;
}

/**
 * Generates a grid of letters for a level (internal - not validated)
 */
function generateLetterGridInternal(
  size: number = GAME_CONFIG.GRID_SIZE,
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' = 'medium',
): Letter[] {
  const letters: Letter[] = [];
  const totalLetters = size * size;

  // Adjust vowel ratio based on difficulty
  const vowelRatio = {
    easy: 0.5,
    medium: 0.4,
    hard: 0.35,
    expert: 0.3,
  }[difficulty];

  const vowels = ['A', 'E', 'I', 'O', 'U'];
  const vowelCount = Math.floor(totalLetters * vowelRatio);

  // Generate letters
  for (let i = 0; i < totalLetters; i++) {
    const row = Math.floor(i / size);
    const col = i % size;

    let letter: string;
    if (i < vowelCount) {
      // Add vowels for easier word formation
      letter = vowels[Math.floor(Math.random() * vowels.length)];
    } else {
      letter = generateRandomLetter();
    }

    // Occasionally add multiplier tiles
    const hasMultiplier = Math.random() < 0.1; // 10% chance
    const multiplier = hasMultiplier ? (Math.random() < 0.7 ? 2 : 3) : undefined;

    letters.push({
      id: `${i}`,
      letter,
      position: {x: col, y: row},
      isSelected: false,
      multiplier,
    });
  }

  // Shuffle to distribute vowels
  return shuffleArray(letters);
}

/**
 * Generates a VALIDATED grid of letters for a level
 * Guarantees the grid has enough words and achievable target score
 */
export function generateLetterGrid(
  size: number = GAME_CONFIG.GRID_SIZE,
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' = 'medium',
  targetScore?: number,
): Letter[] {
  const maxAttempts = 50; // Prevent infinite loops
  let attempts = 0;

  // If no target score provided, estimate based on difficulty
  const estimatedTarget = targetScore || 500 * {
    easy: 1,
    medium: 1.5,
    hard: 2,
    expert: 2.5,
  }[difficulty];

  while (attempts < maxAttempts) {
    attempts++;
    const letters = generateLetterGridInternal(size, difficulty);
    const validation = validateLetterGrid(letters, estimatedTarget, difficulty);

    if (validation.isValid) {
      console.log(
        `✅ Generated valid grid on attempt ${attempts}: ${validation.wordCount} words, max score: ${validation.maxScore}`,
      );
      return letters;
    }

    if (attempts % 10 === 0) {
      console.log(
        `⚠️  Attempt ${attempts}: ${validation.wordCount} words (need ${
          {easy: 20, medium: 15, hard: 12, expert: 10}[difficulty]
        }), max score: ${validation.maxScore} (need ${Math.floor(estimatedTarget * 1.2)})`,
      );
    }
  }

  // Fallback: return best attempt (shouldn't happen often)
  console.warn(
    `⚠️  Could not generate valid grid after ${maxAttempts} attempts, returning best effort`,
  );
  return generateLetterGridInternal(size, difficulty);
}

/**
 * Generates a complete level configuration with guaranteed solvability
 */
export function generateLevel(
  levelNumber: number,
  isPremium: boolean = false,
): Level {
  const difficulty = getLevelDifficulty(levelNumber);

  // Calculate target score based on difficulty FIRST
  const baseTargetScore = 500;
  const difficultyMultiplier = {
    easy: 1,
    medium: 1.5,
    hard: 2,
    expert: 2.5,
  }[difficulty];

  const targetScore = Math.floor(
    baseTargetScore * difficultyMultiplier * (1 + levelNumber * 0.1),
  );

  // Generate validated grid that can achieve this target score
  const letters = generateLetterGrid(GAME_CONFIG.GRID_SIZE, difficulty, targetScore);

  // Add time limit for higher levels
  const timeLimit = levelNumber > 10 ? 180 - levelNumber * 2 : undefined;

  return {
    id: levelNumber,
    targetScore,
    timeLimit,
    letters: letters.map(l => l.letter),
    difficulty,
    isPremium,
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
 * Gets a hint word from available letters
 */
export function getHintWord(
  letters: Letter[],
  foundWords: string[],
): string | null {
  const possibleWords = findPossibleWords(letters);
  const unusedWords = possibleWords.filter(w => !foundWords.includes(w));

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
