import React, {useState, useEffect} from 'react';
import {StatusBar} from 'react-native';
import {MenuScreen} from './screens/MenuScreen';
import {LevelSelectScreen} from './screens/LevelSelectScreen';
import {GameScreen} from './screens/GameScreen';
import {ShopScreen} from './screens/ShopScreen';
import {Level, UserProfile} from './types/game';
import {FirebaseAuth, FirebaseFirestore} from './services/firebase';
import {
  IAPService,
  isPremiumActive,
  getCoinAmountForProduct,
  syncPurchasesWithRevenueCat,
} from './services/iap';
import {
  getUserProfile,
  saveUserProfile,
  getPurchasedLevels,
} from './utils/storage';
import {IAP_PRODUCTS, COIN_REWARDS} from './config/constants';
import type {CustomerInfo} from 'react-native-purchases';

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
          hasPremium: false,
          lastPlayedDate: new Date().toISOString(),
        };
        await saveUserProfile(profile);
        await FirebaseFirestore.saveUserProfile(profile);
      }

      setUserProfile(profile);

      // Initialize IAP
      await IAPService.initialize();

      // Sync purchases with RevenueCat
      try {
        const syncedProfile = await syncPurchasesWithRevenueCat(profile);
        if (
          syncedProfile.purchasedLevels.length !==
            profile.purchasedLevels.length ||
          syncedProfile.hasPremium !== profile.hasPremium
        ) {
          // Profile was updated, save and update state
          setUserProfile(syncedProfile);
          await saveUserProfile(syncedProfile);
          await FirebaseFirestore.saveUserProfile(syncedProfile);
          console.log('Profile synced with RevenueCat purchases');
        }
      } catch (error) {
        console.error('Failed to sync purchases:', error);
        // Continue anyway - user can manually restore purchases
      }

      // Set up IAP callbacks
      IAPService.onPurchaseSuccess = async (customerInfo: CustomerInfo) => {
        console.log('Purchase successful:', customerInfo);

        if (!userProfile) return;

        let updatedProfile = {...userProfile};

        // Check for level pack purchases
        const levelPackEntitlements = {
          level_pack_2: IAP_PRODUCTS.LEVEL_PACK_2,
          level_pack_3: IAP_PRODUCTS.LEVEL_PACK_3,
        };

        Object.entries(levelPackEntitlements).forEach(
          ([entitlement, productId]) => {
            if (customerInfo.entitlements.active[entitlement]) {
              // Add levels for this pack
              const packNumber =
                productId === IAP_PRODUCTS.LEVEL_PACK_2 ? 2 : 3;
              const startLevel = (packNumber - 1) * 20 + 1;
              const endLevel = packNumber * 20;
              const newLevels = Array.from(
                {length: 20},
                (_, i) => startLevel + i,
              );

              // Merge with existing purchased levels
              updatedProfile.purchasedLevels = [
                ...new Set([
                  ...updatedProfile.purchasedLevels,
                  ...newLevels,
                ]),
              ];
            }
          },
        );

        // Check for premium purchase
        if (isPremiumActive(customerInfo)) {
          updatedProfile.hasPremium = true;
        }

        // Check for coin purchases (consumables - use last transaction)
        const latestTransaction = Object.values(
          customerInfo.nonSubscriptionTransactions,
        )[0];
        if (latestTransaction) {
          const coinAmount = getCoinAmountForProduct(
            latestTransaction.productIdentifier,
          );
          if (coinAmount > 0) {
            updatedProfile.coins += coinAmount;
            console.log(`Added ${coinAmount} coins`);
          }
        }

        // Save updated profile
        setUserProfile(updatedProfile);
        await saveUserProfile(updatedProfile);
        await FirebaseFirestore.saveUserProfile(updatedProfile);

        console.log('Profile updated after purchase');
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
      // Calculate coin reward
      const baseReward = COIN_REWARDS.BASE + stars * COIN_REWARDS.PER_STAR;
      const multiplier = userProfile.hasPremium
        ? COIN_REWARDS.PREMIUM_MULTIPLIER
        : 1;
      const coinReward = baseReward * multiplier;

      const updatedProfile: UserProfile = {
        ...userProfile,
        totalScore: userProfile.totalScore + score,
        coins: userProfile.coins + coinReward,
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

      console.log(
        `Level complete! Earned ${coinReward} coins (${baseReward} base ${userProfile.hasPremium ? '× 2 premium' : ''})`,
      );
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
          userProfile={userProfile}
        />
      )}
      {currentScreen === 'game' && currentLevel && (
        <GameScreen
          level={currentLevel}
          onLevelComplete={handleLevelComplete}
          onQuit={handleQuitGame}
        />
      )}
      {currentScreen === 'shop' && (
        <ShopScreen onBack={handleBackToMenu} userProfile={userProfile} />
      )}
    </>
  );
};

export default App;
