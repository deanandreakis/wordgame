import React, {useState, useEffect} from 'react';
import {StatusBar} from 'react-native';
import {MenuScreen} from './screens/MenuScreen';
import {LevelSelectScreen} from './screens/LevelSelectScreen';
import {GameScreen} from './screens/GameScreen';
import {Level, UserProfile} from './types/game';
import {FirebaseAuth, FirebaseFirestore} from './services/firebase';
import {IAPService} from './services/iap';
import {
  getUserProfile,
  saveUserProfile,
  getPurchasedLevels,
} from './utils/storage';

type Screen = 'menu' | 'levelSelect' | 'game' | 'leaderboard' | 'shop';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeApp();

    return () => {
      IAPService.cleanup();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize Firebase Auth
      let userId = FirebaseAuth.getCurrentUserId();
      if (!userId) {
        userId = await FirebaseAuth.signInAnonymously();
      }

      // Load or create user profile
      let profile = await getUserProfile();
      if (!profile) {
        // Create new profile
        profile = {
          userId,
          displayName: `Player${Math.floor(Math.random() * 10000)}`,
          totalScore: 0,
          highestLevel: 1,
          totalWordsFound: 0,
          longestStreak: 0,
          achievements: [],
          purchasedLevels: [],
          coins: 100, // Starting coins
          lastPlayedDate: new Date().toISOString(),
        };
        await saveUserProfile(profile);
        await FirebaseFirestore.saveUserProfile(profile);
      }

      setUserProfile(profile);

      // Initialize IAP
      await IAPService.initialize();

      // Set up IAP callbacks
      IAPService.onPurchaseSuccess = async (productId: string) => {
        console.log('Purchase successful:', productId);
        // Handle purchase - unlock levels, add coins, etc.
        // This would update the user profile with purchased items
      };

      IAPService.onPurchaseError = (error: any) => {
        console.error('Purchase error:', error);
      };

      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsInitialized(true); // Still show UI even if initialization fails
    }
  };

  const handleLevelSelect = (level: Level) => {
    setCurrentLevel(level);
    setCurrentScreen('game');
  };

  const handleLevelComplete = async (stars: number, score: number) => {
    if (userProfile) {
      const updatedProfile: UserProfile = {
        ...userProfile,
        totalScore: userProfile.totalScore + score,
        highestLevel: Math.max(userProfile.highestLevel, currentLevel!.id + 1),
        lastPlayedDate: new Date().toISOString(),
      };

      setUserProfile(updatedProfile);
      await saveUserProfile(updatedProfile);
      await FirebaseFirestore.saveUserProfile(updatedProfile);

      // Update leaderboard
      await FirebaseFirestore.updateLeaderboard({
        userId: userProfile.userId,
        displayName: userProfile.displayName,
        score: updatedProfile.totalScore,
        level: updatedProfile.highestLevel,
        timestamp: Date.now(),
      });
    }

    // Go back to level select
    setCurrentScreen('levelSelect');
  };

  const handleQuitGame = () => {
    setCurrentScreen('levelSelect');
  };

  const handlePlayPress = () => {
    setCurrentScreen('levelSelect');
  };

  const handleLeaderboardPress = () => {
    setCurrentScreen('leaderboard');
    // TODO: Implement leaderboard screen
    console.log('Leaderboard coming soon!');
  };

  const handleShopPress = () => {
    setCurrentScreen('shop');
    // TODO: Implement shop screen
    console.log('Shop coming soon!');
  };

  const handleBackToMenu = () => {
    setCurrentScreen('menu');
  };

  if (!isInitialized) {
    return null; // Or a loading screen
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1E" />
      {currentScreen === 'menu' && (
        <MenuScreen
          onPlayPress={handlePlayPress}
          onLeaderboardPress={handleLeaderboardPress}
          onShopPress={handleShopPress}
        />
      )}
      {currentScreen === 'levelSelect' && (
        <LevelSelectScreen
          onLevelSelect={handleLevelSelect}
          onBack={handleBackToMenu}
        />
      )}
      {currentScreen === 'game' && currentLevel && (
        <GameScreen
          level={currentLevel}
          onLevelComplete={handleLevelComplete}
          onQuit={handleQuitGame}
        />
      )}
    </>
  );
};

export default App;
