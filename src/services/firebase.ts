import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {UserProfile, LeaderboardEntry, DailyChallenge} from '@/types/game';

/**
 * Firebase Authentication Service
 */
export const FirebaseAuth = {
  async signInAnonymously(): Promise<string> {
    try {
      const userCredential = await auth().signInAnonymously();
      return userCredential.user.uid;
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      throw error;
    }
  },

  getCurrentUserId(): string | null {
    return auth().currentUser?.uid || null;
  },

  async signOut(): Promise<void> {
    try {
      await auth().signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },
};

/**
 * Firebase Firestore Service
 */
export const FirebaseFirestore = {
  /**
   * Save user profile to Firestore
   */
  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await firestore()
        .collection('users')
        .doc(profile.userId)
        .set(profile, {merge: true});
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  },

  /**
   * Get user profile from Firestore
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const doc = await firestore().collection('users').doc(userId).get();

      if (!doc.exists) {
        return null;
      }

      return doc.data() as UserProfile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },

  /**
   * Update user score in leaderboard
   */
  async updateLeaderboard(entry: LeaderboardEntry): Promise<void> {
    try {
      await firestore()
        .collection('leaderboard')
        .doc(entry.userId)
        .set(entry, {merge: true});
    } catch (error) {
      console.error('Error updating leaderboard:', error);
      throw error;
    }
  },

  /**
   * Get top players from leaderboard
   */
  async getTopPlayers(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const snapshot = await firestore()
        .collection('leaderboard')
        .orderBy('score', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => doc.data() as LeaderboardEntry);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  },

  /**
   * Get user rank on leaderboard
   */
  async getUserRank(userId: string): Promise<number> {
    try {
      const userDoc = await firestore()
        .collection('leaderboard')
        .doc(userId)
        .get();

      if (!userDoc.exists) {
        return -1;
      }

      const userData = userDoc.data() as LeaderboardEntry;

      const higherScoresCount = await firestore()
        .collection('leaderboard')
        .where('score', '>', userData.score)
        .count()
        .get();

      return higherScoresCount.data().count + 1;
    } catch (error) {
      console.error('Error getting user rank:', error);
      return -1;
    }
  },

  /**
   * Get daily challenge
   */
  async getDailyChallenge(date: string): Promise<DailyChallenge | null> {
    try {
      const doc = await firestore()
        .collection('dailyChallenges')
        .doc(date)
        .get();

      if (!doc.exists) {
        return null;
      }

      return doc.data() as DailyChallenge;
    } catch (error) {
      console.error('Error getting daily challenge:', error);
      return null;
    }
  },

  /**
   * Mark daily challenge as completed
   */
  async completeDailyChallenge(
    userId: string,
    challengeId: string,
  ): Promise<void> {
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('completedChallenges')
        .doc(challengeId)
        .set({
          completedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Error marking challenge as completed:', error);
      throw error;
    }
  },
};
