import {Platform} from 'react-native';

/**
 * GameCenter Player Interface
 */
export interface GameCenterPlayer {
  playerID: string;
  displayName: string;
  alias: string;
}

/**
 * Leaderboard Entry Interface
 */
export interface LeaderboardEntry {
  playerID: string;
  displayName: string;
  score: number;
  rank: number;
}

/**
 * Check if GameCenter native module is available
 * Returns false when running in Expo Go or on Android
 */
function isNativeModuleAvailable(): boolean {
  if (Platform.OS !== 'ios') {
    console.log('[GameCenter] Not iOS');
    return false;
  }

  try {
    require('expo-game-center');
    console.log('[GameCenter] Native module available');
    return true;
  } catch (error) {
    console.warn('[GameCenter] Native module not available:', error);
    return false;
  }
}

/**
 * Get GameCenter module (lazy loaded)
 */
function getGameCenter() {
  try {
    // Try to get from expo-game-center
    const module = require('expo-game-center');
    console.log('[GameCenter] Module loaded:', typeof module);
    return module;
  } catch (error) {
    console.warn('[GameCenter] Failed to load expo-game-center:', error);

    // Try to access native module directly
    try {
      const { NativeModules } = require('react-native');
      if (NativeModules.ExpoGameCenter) {
        console.log('[GameCenter] Found native module directly');
        return NativeModules.ExpoGameCenter;
      }
    } catch (e) {
      console.warn('[GameCenter] No native module found');
    }

    return null;
  }
}

/**
 * GameCenter Service for iOS
 * Provides authentication, leaderboards, and achievements via Apple's Game Center
 * Gracefully handles non-iOS platforms and Expo Go
 */
export const GameCenterService = {
  isAvailable: isNativeModuleAvailable(),

  /**
   * Check if Game Center is available on this device
   */
  async isGameCenterAvailable(): Promise<boolean> {
    if (!this.isAvailable) {
      return false;
    }

    const GameCenter = getGameCenter();
    if (!GameCenter) return false;

    try {
      return await GameCenter.isGameCenterAvailable();
    } catch (error) {
      console.warn('Error checking Game Center availability:', error);
      return false;
    }
  },

  /**
   * Authenticate the local player with Game Center
   * Must be called before using other Game Center features
   * @returns true if authentication succeeded
   */
  async authenticatePlayer(): Promise<boolean> {
    if (!this.isAvailable) {
      console.warn(
        'GameCenter not available - running on Android or in Expo Go. Build an iOS development client to test GameCenter.',
      );
      return false;
    }

    const GameCenter = getGameCenter();
    if (!GameCenter) {
      console.warn('GameCenter module not found');
      return false;
    }

    try {
      const isAuthenticated = await GameCenter.authenticateLocalPlayer();
      if (isAuthenticated) {
        console.log('GameCenter player authenticated successfully');
      } else {
        console.warn('GameCenter authentication failed or was cancelled');
      }
      return isAuthenticated;
    } catch (error) {
      console.error('Error authenticating GameCenter player:', error);
      return false;
    }
  },

  /**
   * Get the authenticated local player's information
   * @returns Player info or null if not authenticated
   */
  async getLocalPlayer(): Promise<GameCenterPlayer | null> {
    if (!this.isAvailable) {
      console.warn('GameCenter not available');
      return null;
    }

    const GameCenter = getGameCenter();
    if (!GameCenter) return null;

    try {
      const player = await GameCenter.getLocalPlayer();
      return player as GameCenterPlayer;
    } catch (error) {
      console.error('Error getting local player:', error);
      return null;
    }
  },

  /**
   * Get the authenticated player's profile image
   * @returns Base64-encoded image data URI or null
   */
  async getPlayerImage(): Promise<string | null> {
    if (!this.isAvailable) {
      return null;
    }

    const GameCenter = getGameCenter();
    if (!GameCenter) return null;

    try {
      const imageDataUri = await GameCenter.getPlayerImage();
      return imageDataUri;
    } catch (error) {
      console.error('Error getting player image:', error);
      return null;
    }
  },

  /**
   * Submit a score to a Game Center leaderboard
   * @param score - The score value to submit
   * @param leaderboardID - The identifier for the leaderboard (configured in App Store Connect)
   * @returns true if submission succeeded
   */
  async submitScore(score: number, leaderboardID: string): Promise<boolean> {
    if (!this.isAvailable) {
      console.warn('GameCenter not available - score not submitted');
      return false;
    }

    const GameCenter = getGameCenter();
    if (!GameCenter) return false;

    try {
      const success = await GameCenter.submitScore(score, leaderboardID);
      if (success) {
        console.log(`Score ${score} submitted to leaderboard ${leaderboardID}`);
      }
      return success;
    } catch (error) {
      console.error('Error submitting score to GameCenter:', error);
      return false;
    }
  },

  /**
   * Present the native Game Center leaderboard UI
   * @param leaderboardID - The identifier for the leaderboard to display
   */
  async showLeaderboard(leaderboardID: string): Promise<void> {
    if (!this.isAvailable) {
      console.warn('GameCenter not available - cannot show leaderboard');
      return;
    }

    const GameCenter = getGameCenter();
    if (!GameCenter) return;

    try {
      await GameCenter.presentLeaderboard(leaderboardID);
    } catch (error) {
      console.error('Error presenting leaderboard:', error);
    }
  },

  /**
   * Report achievement progress to Game Center
   * @param achievementID - The identifier for the achievement (configured in App Store Connect)
   * @param percentComplete - Progress as percentage (0-100)
   * @returns true if report succeeded
   */
  async reportAchievement(
    achievementID: string,
    percentComplete: number,
  ): Promise<boolean> {
    if (!this.isAvailable) {
      console.warn('GameCenter not available - achievement not reported');
      return false;
    }

    const GameCenter = getGameCenter();
    if (!GameCenter) return false;

    try {
      // Ensure percent is in valid range
      const validPercent = Math.max(0, Math.min(100, percentComplete));
      const success = await GameCenter.reportAchievement(
        achievementID,
        validPercent,
      );
      if (success) {
        console.log(
          `Achievement ${achievementID} reported: ${validPercent}% complete`,
        );
      }
      return success;
    } catch (error) {
      console.error('Error reporting achievement to GameCenter:', error);
      return false;
    }
  },

  /**
   * Present the native Game Center achievements UI
   */
  async showAchievements(): Promise<void> {
    if (!this.isAvailable) {
      console.warn('GameCenter not available - cannot show achievements');
      return;
    }

    const GameCenter = getGameCenter();
    if (!GameCenter) return;

    try {
      await GameCenter.presentAchievements();
    } catch (error) {
      console.error('Error presenting achievements:', error);
    }
  },

  /**
   * Unlock an achievement (equivalent to reporting 100% progress)
   * @param achievementID - The identifier for the achievement
   * @returns true if unlock succeeded
   */
  async unlockAchievement(achievementID: string): Promise<boolean> {
    return this.reportAchievement(achievementID, 100);
  },
};

/**
 * GameCenter Achievement IDs
 * These must match the achievement IDs configured in App Store Connect
 */
export const GAMECENTER_ACHIEVEMENTS = {
  COMPLETE_10_LEVELS: 'com.letterloom.achievement.complete10',
  COMPLETE_20_LEVELS: 'com.letterloom.achievement.complete20',
  COMPLETE_40_LEVELS: 'com.letterloom.achievement.complete40',
  COMPLETE_60_LEVELS: 'com.letterloom.achievement.complete60',
  COMPLETE_80_LEVELS: 'com.letterloom.achievement.complete80',
  SCORE_10000: 'com.letterloom.achievement.score10000',
  SCORE_50000: 'com.letterloom.achievement.score50000',
  SCORE_100000: 'com.letterloom.achievement.score100000',
  FIND_100_WORDS: 'com.letterloom.achievement.words100',
  FIND_500_WORDS: 'com.letterloom.achievement.words500',
  FIND_1000_WORDS: 'com.letterloom.achievement.words1000',
};

/**
 * GameCenter Leaderboard IDs
 * These must match the leaderboard IDs configured in App Store Connect
 */
export const GAMECENTER_LEADERBOARDS = {
  ALL_TIME_SCORE: 'com.letterloom.leaderboard.alltime',
  HIGHEST_LEVEL: 'com.letterloom.leaderboard.level',
  TOTAL_WORDS: 'com.letterloom.leaderboard.words',
};
