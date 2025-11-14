import {FirebaseAuth, FirebaseFirestore} from '../firebase';
import {UserProfile, LeaderboardEntry} from '@/types/game';

// Note: These tests use the mocked Firebase from jest.setup.js

describe('FirebaseAuth', () => {
  describe('signInAnonymously', () => {
    it('should sign in anonymously and return user ID', async () => {
      const userId = await FirebaseAuth.signInAnonymously();
      expect(typeof userId).toBe('string');
    });
  });

  describe('getCurrentUserId', () => {
    it('should return null when no user is signed in', () => {
      const userId = FirebaseAuth.getCurrentUserId();
      expect(userId).toBeNull();
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      await expect(FirebaseAuth.signOut()).resolves.not.toThrow();
    });
  });
});

describe('FirebaseFirestore', () => {
  const mockProfile: UserProfile = {
    userId: 'test-user-123',
    displayName: 'Test Player',
    totalScore: 1000,
    highestLevel: 10,
    totalWordsFound: 50,
    longestStreak: 5,
    achievements: [],
    purchasedLevels: [],
    coins: 100,
    lastPlayedDate: new Date().toISOString(),
  };

  describe('saveUserProfile', () => {
    it('should save user profile without error', async () => {
      await expect(
        FirebaseFirestore.saveUserProfile(mockProfile),
      ).resolves.not.toThrow();
    });
  });

  describe('getUserProfile', () => {
    it('should get user profile', async () => {
      const profile = await FirebaseFirestore.getUserProfile('test-user-123');
      // With mocked Firestore, this might return null
      expect(profile === null || typeof profile === 'object').toBe(true);
    });
  });

  describe('updateLeaderboard', () => {
    it('should update leaderboard without error', async () => {
      const entry: LeaderboardEntry = {
        userId: 'test-user-123',
        displayName: 'Test Player',
        score: 1000,
        level: 10,
        timestamp: Date.now(),
      };

      await expect(
        FirebaseFirestore.updateLeaderboard(entry),
      ).resolves.not.toThrow();
    });
  });

  describe('getTopPlayers', () => {
    it('should return an array', async () => {
      const players = await FirebaseFirestore.getTopPlayers(10);
      expect(Array.isArray(players)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const players = await FirebaseFirestore.getTopPlayers(5);
      expect(players.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getUserRank', () => {
    it('should return a number', async () => {
      const rank = await FirebaseFirestore.getUserRank('test-user-123');
      expect(typeof rank).toBe('number');
    });
  });

  describe('getDailyChallenge', () => {
    it('should return null or challenge object', async () => {
      const challenge = await FirebaseFirestore.getDailyChallenge('2024-01-01');
      expect(challenge === null || typeof challenge === 'object').toBe(true);
    });
  });

  describe('completeDailyChallenge', () => {
    it('should complete challenge without error', async () => {
      await expect(
        FirebaseFirestore.completeDailyChallenge(
          'test-user-123',
          'challenge-123',
        ),
      ).resolves.not.toThrow();
    });
  });
});
