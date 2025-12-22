import {Platform} from 'react-native';
import type {UserProfile} from '@/types/game';

/**
 * Check if iCloud Key-Value Storage is available
 * Returns false on Android or in Expo Go
 */
function isCloudStorageAvailable(): boolean {
  if (Platform.OS !== 'ios') {
    return false;
  }

  // TODO: When we have the native module, check for NSUbiquitousKeyValueStore
  // For now, we'll implement this as a placeholder
  return false; // Will be true once we implement the native module
}

/**
 * iCloud Key-Value Storage Service for iOS
 * Syncs user profile data across devices via iCloud
 * Limited to 1MB total storage and 1024 keys
 *
 * Note: Currently a placeholder. Full implementation requires:
 * 1. Native module or Expo config plugin for NSUbiquitousKeyValueStore
 * 2. iCloud capability enabled in App Store Connect
 * 3. com.apple.developer.ubiquity-kvstore-identifier entitlement
 */
export const CloudSyncService = {
  isAvailable: isCloudStorageAvailable(),

  /**
   * Save user profile to iCloud
   * @param profile - The user profile to sync
   * @returns true if save succeeded
   */
  async saveProfile(profile: UserProfile): Promise<boolean> {
    if (!this.isAvailable) {
      console.warn('iCloud sync not available on this platform');
      return false;
    }

    try {
      // TODO: Implement NSUbiquitousKeyValueStore save
      // const key = 'userProfile';
      // const value = JSON.stringify(profile);
      // await NSUbiquitousKeyValueStore.set(key, value);
      // await NSUbiquitousKeyValueStore.synchronize();

      console.log('Profile saved to iCloud (placeholder)');
      return true;
    } catch (error) {
      console.error('Error saving profile to iCloud:', error);
      return false;
    }
  },

  /**
   * Load user profile from iCloud
   * @returns User profile or null if not found
   */
  async loadProfile(): Promise<UserProfile | null> {
    if (!this.isAvailable) {
      console.warn('iCloud sync not available on this platform');
      return null;
    }

    try {
      // TODO: Implement NSUbiquitousKeyValueStore load
      // const key = 'userProfile';
      // const value = await NSUbiquitousKeyValueStore.get(key);
      // if (!value) return null;
      // return JSON.parse(value) as UserProfile;

      console.log('Profile loaded from iCloud (placeholder)');
      return null;
    } catch (error) {
      console.error('Error loading profile from iCloud:', error);
      return null;
    }
  },

  /**
   * Merge local profile with cloud profile
   * Strategy: Take the profile with the most recent lastPlayedDate
   * Then merge specific fields (like purchasedLevels, completedLevels)
   *
   * @param localProfile - Profile from device storage
   * @param cloudProfile - Profile from iCloud
   * @returns Merged profile
   */
  mergeProfiles(
    localProfile: UserProfile,
    cloudProfile: UserProfile,
  ): UserProfile {
    // Determine which profile is newer
    const localDate = new Date(localProfile.lastPlayedDate).getTime();
    const cloudDate = new Date(cloudProfile.lastPlayedDate).getTime();

    // Start with the newer profile as base
    const baseProfile = localDate > cloudDate ? localProfile : cloudProfile;
    const otherProfile = localDate > cloudDate ? cloudProfile : localProfile;

    // Merge arrays (union of both)
    const mergedCompletedLevels = [
      ...new Set([
        ...baseProfile.completedLevels,
        ...otherProfile.completedLevels,
      ]),
    ];

    const mergedPurchasedLevels = [
      ...new Set([
        ...baseProfile.purchasedLevels,
        ...otherProfile.purchasedLevels,
      ]),
    ];

    const mergedAchievements = [
      ...new Set([...baseProfile.achievements, ...otherProfile.achievements]),
    ];

    // Take highest values for numerical stats
    const mergedProfile: UserProfile = {
      ...baseProfile,
      completedLevels: mergedCompletedLevels,
      purchasedLevels: mergedPurchasedLevels,
      achievements: mergedAchievements,
      totalScore: Math.max(baseProfile.totalScore, otherProfile.totalScore),
      highestLevel: Math.max(
        baseProfile.highestLevel,
        otherProfile.highestLevel,
      ),
      totalWordsFound: Math.max(
        baseProfile.totalWordsFound,
        otherProfile.totalWordsFound,
      ),
      longestStreak: Math.max(
        baseProfile.longestStreak,
        otherProfile.longestStreak,
      ),
      coins: Math.max(baseProfile.coins, otherProfile.coins),
      hasPremium: baseProfile.hasPremium || otherProfile.hasPremium,
    };

    return mergedProfile;
  },

  /**
   * Sync local profile with iCloud
   * Loads from cloud, merges with local, saves merged result back
   *
   * @param localProfile - Current profile from device
   * @returns Synced profile
   */
  async syncProfile(localProfile: UserProfile): Promise<UserProfile> {
    if (!this.isAvailable) {
      console.warn('iCloud sync not available - returning local profile');
      return localProfile;
    }

    try {
      // Load cloud profile
      const cloudProfile = await this.loadProfile();

      // If no cloud profile, upload local and return
      if (!cloudProfile) {
        await this.saveProfile(localProfile);
        return localProfile;
      }

      // Merge profiles
      const mergedProfile = this.mergeProfiles(localProfile, cloudProfile);

      // Save merged profile back to cloud
      await this.saveProfile(mergedProfile);

      console.log('Profile synced with iCloud');
      return mergedProfile;
    } catch (error) {
      console.error('Error syncing profile with iCloud:', error);
      return localProfile;
    }
  },

  /**
   * Clear profile from iCloud
   * Useful for testing or account reset
   */
  async clearProfile(): Promise<boolean> {
    if (!this.isAvailable) {
      return false;
    }

    try {
      // TODO: Implement NSUbiquitousKeyValueStore remove
      // const key = 'userProfile';
      // await NSUbiquitousKeyValueStore.remove(key);
      // await NSUbiquitousKeyValueStore.synchronize();

      console.log('Profile cleared from iCloud (placeholder)');
      return true;
    } catch (error) {
      console.error('Error clearing profile from iCloud:', error);
      return false;
    }
  },
};

/**
 * Note on iCloud Key-Value Storage Implementation:
 *
 * To fully implement iCloud sync, you'll need to:
 *
 * 1. Enable iCloud capability in App Store Connect
 * 2. Add iCloud entitlement to app.config.js:
 *    ios: {
 *      entitlements: {
 *        "com.apple.developer.ubiquity-kvstore-identifier":
 *          "$(TeamIdentifierPrefix)$(CFBundleIdentifier)"
 *      }
 *    }
 *
 * 3. Create a native module or use expo-secure-store with iCloud sync enabled
 *    (expo-secure-store doesn't support iCloud KVStore directly)
 *
 * 4. Alternative: Use @react-native-async-storage/async-storage with iCloud backup
 *    or implement a custom native module for NSUbiquitousKeyValueStore
 *
 * For now, this service provides the interface. The actual iCloud integration
 * can be added later via a native module or third-party package.
 */
