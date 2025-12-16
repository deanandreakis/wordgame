import {initializeApp, getApps, FirebaseApp} from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import {UserProfile, LeaderboardEntry, DailyChallenge} from '@/types/game';

// Firebase configuration from secure environment variables
// Secrets are loaded via app.config.js and accessed through expo-constants
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebase?.apiKey,
  authDomain: Constants.expoConfig?.extra?.firebase?.authDomain,
  projectId: Constants.expoConfig?.extra?.firebase?.projectId,
  storageBucket: Constants.expoConfig?.extra?.firebase?.storageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebase?.messagingSenderId,
  appId: Constants.expoConfig?.extra?.firebase?.appId,
};

// Validate that Firebase config is present
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    'Firebase configuration is missing. Please check your environment variables and app.config.js',
  );
}

// Lazy initialization variables
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let isInitialized = false;

/**
 * Initialize Firebase (called lazily on first use)
 */
function ensureInitialized() {
  if (isInitialized) {
    return;
  }

  try {
    if (!getApps().length) {
      // First initialization - create new app and auth with persistence
      app = initializeApp(firebaseConfig);
      try {
        auth = initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });
      } catch (authError: any) {
        // If initializeAuth fails, try getAuth as fallback
        console.warn('initializeAuth failed, falling back to getAuth:', authError.message);
        auth = getAuth(app);
      }
      db = getFirestore(app);
    } else {
      // App already exists (shouldn't happen with our check, but handle it)
      app = getApps()[0];
      auth = getAuth(app);
      db = getFirestore(app);
    }

    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
}

/**
 * Firebase Authentication Service
 */
export const FirebaseAuth = {
  async signInAnonymously(): Promise<string> {
    ensureInitialized();
    try {
      const userCredential = await firebaseSignInAnonymously(auth!);
      return userCredential.user.uid;
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      throw error;
    }
  },

  getCurrentUserId(): string | null {
    ensureInitialized();
    return auth!.currentUser?.uid || null;
  },

  async signOut(): Promise<void> {
    ensureInitialized();
    try {
      await firebaseSignOut(auth!);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  onAuthStateChanged(callback: (userId: string | null) => void) {
    ensureInitialized();
    return onAuthStateChanged(auth!, user => {
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
    ensureInitialized();
    try {
      const userDocRef = doc(db!, 'users', profile.userId);
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
    ensureInitialized();
    try {
      const userDocRef = doc(db!, 'users', userId);
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
    ensureInitialized();
    try {
      const leaderboardDocRef = doc(db!, 'leaderboard', entry.userId);
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
    ensureInitialized();
    try {
      const leaderboardRef = collection(db!, 'leaderboard');
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
    ensureInitialized();
    try {
      const userDocRef = doc(db!, 'leaderboard', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        return -1;
      }

      const userData = userDocSnap.data() as LeaderboardEntry;

      const leaderboardRef = collection(db!, 'leaderboard');
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
    ensureInitialized();
    try {
      const challengeDocRef = doc(db!, 'dailyChallenges', date);
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
    ensureInitialized();
    try {
      const completedChallengeRef = doc(
        db!,
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
