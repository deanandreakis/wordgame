import {
  validateWord,
  calculateScore,
  generateRandomLetter,
  generateLetterGrid,
  areLettersAdjacent,
  isValidLetterPath,
  calculateStars,
  getLevelDifficulty,
} from '../gameLogic';
import {Letter} from '@/types/game';

describe('gameLogic', () => {
  describe('validateWord', () => {
    it('should validate a correct word', () => {
      const letters: Letter[] = [
        {id: '1', letter: 'C', position: {x: 0, y: 0}, isSelected: true},
        {id: '2', letter: 'A', position: {x: 1, y: 0}, isSelected: true},
        {id: '3', letter: 'T', position: {x: 2, y: 0}, isSelected: true},
      ];

      const result = validateWord(letters);
      expect(result.isValid).toBe(true);
      expect(result.word).toBe('CAT');
      expect(result.score).toBeGreaterThan(0);
    });

    it('should reject an invalid word', () => {
      const letters: Letter[] = [
        {id: '1', letter: 'X', position: {x: 0, y: 0}, isSelected: true},
        {id: '2', letter: 'Y', position: {x: 1, y: 0}, isSelected: true},
        {id: '3', letter: 'Z', position: {x: 2, y: 0}, isSelected: true},
      ];

      const result = validateWord(letters);
      expect(result.isValid).toBe(false);
      expect(result.score).toBe(0);
    });

    it('should reject words that are too short', () => {
      const letters: Letter[] = [
        {id: '1', letter: 'A', position: {x: 0, y: 0}, isSelected: true},
        {id: '2', letter: 'T', position: {x: 1, y: 0}, isSelected: true},
      ];

      const result = validateWord(letters);
      expect(result.isValid).toBe(false);
    });

    it('should validate long words', () => {
      const letters: Letter[] = [
        {id: '1', letter: 'P', position: {x: 0, y: 0}, isSelected: true},
        {id: '2', letter: 'U', position: {x: 1, y: 0}, isSelected: true},
        {id: '3', letter: 'Z', position: {x: 2, y: 0}, isSelected: true},
        {id: '4', letter: 'Z', position: {x: 3, y: 0}, isSelected: true},
        {id: '5', letter: 'L', position: {x: 4, y: 0}, isSelected: true},
        {id: '6', letter: 'E', position: {x: 0, y: 1}, isSelected: true},
      ];

      const result = validateWord(letters);
      expect(result.word).toBe('PUZZLE');
      expect(result.isValid).toBe(true);
    });
  });

  describe('calculateScore', () => {
    it('should calculate basic score', () => {
      const letters: Letter[] = [
        {id: '1', letter: 'A', position: {x: 0, y: 0}, isSelected: true},
        {id: '2', letter: 'B', position: {x: 1, y: 0}, isSelected: true},
        {id: '3', letter: 'C', position: {x: 2, y: 0}, isSelected: true},
      ];

      const score = calculateScore(letters);
      expect(score).toBeGreaterThan(0);
    });

    it('should apply multipliers', () => {
      const lettersWithMultiplier: Letter[] = [
        {
          id: '1',
          letter: 'A',
          position: {x: 0, y: 0},
          isSelected: true,
          multiplier: 2,
        },
        {id: '2', letter: 'B', position: {x: 1, y: 0}, isSelected: true},
        {id: '3', letter: 'C', position: {x: 2, y: 0}, isSelected: true},
      ];

      const lettersWithoutMultiplier: Letter[] = [
        {id: '1', letter: 'A', position: {x: 0, y: 0}, isSelected: true},
        {id: '2', letter: 'B', position: {x: 1, y: 0}, isSelected: true},
        {id: '3', letter: 'C', position: {x: 2, y: 0}, isSelected: true},
      ];

      const scoreWith = calculateScore(lettersWithMultiplier);
      const scoreWithout = calculateScore(lettersWithoutMultiplier);

      expect(scoreWith).toBeGreaterThan(scoreWithout);
    });

    it('should apply length bonuses', () => {
      const shortWord: Letter[] = [
        {id: '1', letter: 'C', position: {x: 0, y: 0}, isSelected: true},
        {id: '2', letter: 'A', position: {x: 1, y: 0}, isSelected: true},
        {id: '3', letter: 'T', position: {x: 2, y: 0}, isSelected: true},
      ];

      const longWord: Letter[] = [
        {id: '1', letter: 'C', position: {x: 0, y: 0}, isSelected: true},
        {id: '2', letter: 'H', position: {x: 1, y: 0}, isSelected: true},
        {id: '3', letter: 'A', position: {x: 2, y: 0}, isSelected: true},
        {id: '4', letter: 'L', position: {x: 3, y: 0}, isSelected: true},
        {id: '5', letter: 'L', position: {x: 4, y: 0}, isSelected: true},
        {id: '6', letter: 'E', position: {x: 0, y: 1}, isSelected: true},
        {id: '7', letter: 'N', position: {x: 1, y: 1}, isSelected: true},
        {id: '8', letter: 'G', position: {x: 2, y: 1}, isSelected: true},
        {id: '9', letter: 'E', position: {x: 3, y: 1}, isSelected: true},
      ];

      const shortScore = calculateScore(shortWord);
      const longScore = calculateScore(longWord);

      expect(longScore).toBeGreaterThan(shortScore);
    });
  });

  describe('generateRandomLetter', () => {
    it('should generate a valid letter', () => {
      const letter = generateRandomLetter();
      expect(letter).toMatch(/^[A-Z]$/);
    });

    it('should generate different letters', () => {
      const letters = new Set();
      for (let i = 0; i < 100; i++) {
        letters.add(generateRandomLetter());
      }
      expect(letters.size).toBeGreaterThan(10);
    });
  });

  describe('generateLetterGrid', () => {
    it('should generate correct number of letters', () => {
      const grid = generateLetterGrid(5);
      expect(grid.length).toBe(25);
    });

    it('should assign positions correctly', () => {
      const grid = generateLetterGrid(5);
      grid.forEach(letter => {
        expect(letter.position.x).toBeGreaterThanOrEqual(0);
        expect(letter.position.x).toBeLessThan(5);
        expect(letter.position.y).toBeGreaterThanOrEqual(0);
        expect(letter.position.y).toBeLessThan(5);
      });
    });

    it('should include multiplier tiles', () => {
      const grid = generateLetterGrid(5);
      const hasMultipliers = grid.some(letter => letter.multiplier);
      expect(hasMultipliers).toBe(true);
    });

    it('should adjust vowel ratio by difficulty', () => {
      const easyGrid = generateLetterGrid(5, 'easy');
      const hardGrid = generateLetterGrid(5, 'hard');

      const vowels = ['A', 'E', 'I', 'O', 'U'];
      const easyVowelCount = easyGrid.filter(l => vowels.includes(l.letter)).length;
      const hardVowelCount = hardGrid.filter(l => vowels.includes(l.letter)).length;

      // Easy should have more vowels than hard
      expect(easyVowelCount).toBeGreaterThanOrEqual(hardVowelCount);
    });
  });

  describe('areLettersAdjacent', () => {
    it('should detect horizontal adjacency', () => {
      const letter1: Letter = {
        id: '1',
        letter: 'A',
        position: {x: 0, y: 0},
        isSelected: false,
      };
      const letter2: Letter = {
        id: '2',
        letter: 'B',
        position: {x: 1, y: 0},
        isSelected: false,
      };

      expect(areLettersAdjacent(letter1, letter2)).toBe(true);
    });

    it('should detect vertical adjacency', () => {
      const letter1: Letter = {
        id: '1',
        letter: 'A',
        position: {x: 0, y: 0},
        isSelected: false,
      };
      const letter2: Letter = {
        id: '2',
        letter: 'B',
        position: {x: 0, y: 1},
        isSelected: false,
      };

      expect(areLettersAdjacent(letter1, letter2)).toBe(true);
    });

    it('should detect diagonal adjacency', () => {
      const letter1: Letter = {
        id: '1',
        letter: 'A',
        position: {x: 0, y: 0},
        isSelected: false,
      };
      const letter2: Letter = {
        id: '2',
        letter: 'B',
        position: {x: 1, y: 1},
        isSelected: false,
      };

      expect(areLettersAdjacent(letter1, letter2)).toBe(true);
    });

    it('should reject non-adjacent letters', () => {
      const letter1: Letter = {
        id: '1',
        letter: 'A',
        position: {x: 0, y: 0},
        isSelected: false,
      };
      const letter2: Letter = {
        id: '2',
        letter: 'B',
        position: {x: 2, y: 2},
        isSelected: false,
      };

      expect(areLettersAdjacent(letter1, letter2)).toBe(false);
    });
  });

  describe('isValidLetterPath', () => {
    it('should validate a valid path', () => {
      const letters: Letter[] = [
        {id: '1', letter: 'A', position: {x: 0, y: 0}, isSelected: true},
        {id: '2', letter: 'B', position: {x: 1, y: 0}, isSelected: true},
        {id: '3', letter: 'C', position: {x: 2, y: 0}, isSelected: true},
      ];

      expect(isValidLetterPath(letters)).toBe(true);
    });

    it('should reject an invalid path', () => {
      const letters: Letter[] = [
        {id: '1', letter: 'A', position: {x: 0, y: 0}, isSelected: true},
        {id: '2', letter: 'B', position: {x: 2, y: 2}, isSelected: true},
      ];

      expect(isValidLetterPath(letters)).toBe(false);
    });
  });

  describe('calculateStars', () => {
    it('should award 1 star for meeting target', () => {
      expect(calculateStars(100, 100)).toBe(1);
    });

    it('should award 2 stars for 1.5x target', () => {
      expect(calculateStars(150, 100)).toBe(2);
    });

    it('should award 3 stars for 2x target', () => {
      expect(calculateStars(200, 100)).toBe(3);
    });

    it('should award 0 stars for not meeting target', () => {
      expect(calculateStars(50, 100)).toBe(0);
    });
  });

  describe('getLevelDifficulty', () => {
    it('should return easy for levels 1-10', () => {
      expect(getLevelDifficulty(1)).toBe('easy');
      expect(getLevelDifficulty(10)).toBe('easy');
    });

    it('should return medium for levels 11-30', () => {
      expect(getLevelDifficulty(11)).toBe('medium');
      expect(getLevelDifficulty(30)).toBe('medium');
    });

    it('should return hard for levels 31-60', () => {
      expect(getLevelDifficulty(31)).toBe('hard');
      expect(getLevelDifficulty(60)).toBe('hard');
    });

    it('should return expert for levels 61+', () => {
      expect(getLevelDifficulty(61)).toBe('expert');
      expect(getLevelDifficulty(100)).toBe('expert');
    });
  });
});
