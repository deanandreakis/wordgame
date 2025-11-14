import {isValidWord, getWordCount, VALID_WORDS} from '../dictionary';

describe('dictionary', () => {
  describe('isValidWord', () => {
    it('should validate common 3-letter words', () => {
      expect(isValidWord('cat')).toBe(true);
      expect(isValidWord('dog')).toBe(true);
      expect(isValidWord('the')).toBe(true);
    });

    it('should validate common 4-letter words', () => {
      expect(isValidWord('game')).toBe(true);
      expect(isValidWord('word')).toBe(true);
      expect(isValidWord('play')).toBe(true);
    });

    it('should validate long words', () => {
      expect(isValidWord('puzzle')).toBe(true);
      expect(isValidWord('challenge')).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(isValidWord('CAT')).toBe(true);
      expect(isValidWord('Cat')).toBe(true);
      expect(isValidWord('cat')).toBe(true);
    });

    it('should reject invalid words', () => {
      expect(isValidWord('xyz')).toBe(false);
      expect(isValidWord('zzz')).toBe(false);
      expect(isValidWord('asdfgh')).toBe(false);
    });

    it('should reject empty strings', () => {
      expect(isValidWord('')).toBe(false);
    });

    it('should validate game-related words', () => {
      expect(isValidWord('puzzle')).toBe(true);
      expect(isValidWord('score')).toBe(true);
      expect(isValidWord('level')).toBe(true);
    });
  });

  describe('getWordCount', () => {
    it('should return a positive number', () => {
      const count = getWordCount();
      expect(count).toBeGreaterThan(0);
    });

    it('should match the VALID_WORDS set size', () => {
      expect(getWordCount()).toBe(VALID_WORDS.size);
    });
  });

  describe('VALID_WORDS', () => {
    it('should contain a substantial dictionary', () => {
      expect(VALID_WORDS.size).toBeGreaterThan(1000);
    });

    it('should contain words of various lengths', () => {
      const lengths = new Set<number>();
      VALID_WORDS.forEach(word => lengths.add(word.length));
      expect(lengths.size).toBeGreaterThan(5);
    });

    it('should only contain lowercase words', () => {
      VALID_WORDS.forEach(word => {
        expect(word).toBe(word.toLowerCase());
      });
    });
  });
});
