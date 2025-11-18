import {initializeApp, getApps, FirebaseApp} from 'firebase/app';
import {
  getAuth,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Firestore,
  serverTimestamp,
  getCountFromServer,
} from 'firebase/firestore';
import {UserProfile, LeaderboardEntry, DailyChallenge} from '@/types/game';

// Firebase configuration
// Replace with your own Firebase config
const firebaseConfig = {
  apiKey: 'your-api-key',
  authDomain: 'your-auth-domain',
  projectId: 'your-project-id',
  storageBucket: 'your-storage-bucket',
  messagingSenderId: 'your-messaging-sender-id',
  appId: 'your-app-id',
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

/**
 * Firebase Authentication Service
 */
export const FirebaseAuth = {
  async signInAnonymously(): Promise<string> {
    try {
      const userCredential = await firebaseSignInAnonymously(auth);
      return userCredential.user.uid;
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      throw error;
    }
  },

  getCurrentUserId(): string | null {
    return auth.currentUser?.uid || null;
  },

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  onAuthStateChanged(callback: (userId: string | null) => void) {
    return onAuthStateChanged(auth, user => {
      callback(user?.uid || null);
    });
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
      const userDocRef = doc(db, 'users', profile.userId);
      await setDoc(userDocRef, profile, {merge: true});
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
      const userDocRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        return null;
      }

      return docSnap.data() as UserProfile;
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
      const leaderboardDocRef = doc(db, 'leaderboard', entry.userId);
      await setDoc(leaderboardDocRef, entry, {merge: true});
    } catch (error) {
      console.error('Error updating leaderboard:', error);
      throw error;
    }
  },

  /**
   * Get top players from leaderboard
   */
  async getTopPlayers(limitCount: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const leaderboardRef = collection(db, 'leaderboard');
      const q = query(
        leaderboardRef,
        orderBy('score', 'desc'),
        limit(limitCount),
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => doc.data() as LeaderboardEntry);
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
      const userDocRef = doc(db, 'leaderboard', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        return -1;
      }

      const userData = userDocSnap.data() as LeaderboardEntry;

      const leaderboardRef = collection(db, 'leaderboard');
      const q = query(leaderboardRef, where('score', '>', userData.score));
      const snapshot = await getCountFromServer(q);

      return snapshot.data().count + 1;
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
      const challengeDocRef = doc(db, 'dailyChallenges', date);
      const docSnap = await getDoc(challengeDocRef);

      if (!docSnap.exists()) {
        return null;
      }

      return docSnap.data() as DailyChallenge;
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
      const completedChallengeRef = doc(
        db,
        'users',
        userId,
        'completedChallenges',
        challengeId,
      );
      await setDoc(completedChallengeRef, {
        completedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking challenge as completed:', error);
      throw error;
    }
  },
};
