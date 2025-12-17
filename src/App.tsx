import React, {useState, useEffect} from 'react';
import {StatusBar, View, Text, TouchableOpacity} from 'react-native';
import {MenuScreen} from './screens/MenuScreen';
import {LevelSelectScreen} from './screens/LevelSelectScreen';
import {GameScreen} from './screens/GameScreen';
import {ShopScreen} from './screens/ShopScreen';
import {HelpScreen} from './screens/HelpScreen';
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
import {IAP_PRODUCTS, COIN_REWARDS, GAME_CONFIG} from './config/constants';
import type {CustomerInfo} from 'react-native-purchases';

type Screen = 'menu' | 'levelSelect' | 'game' | 'leaderboard' | 'shop' | 'help';

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

  // Set up IAP purchase callbacks - updates when userProfile changes
  useEffect(() => {
    if (!userProfile) return;

    IAPService.onPurchaseSuccess = async (customerInfo: CustomerInfo) => {
      console.log('Purchase successful:', customerInfo);

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

      // Try to save to Firebase, but don't fail if it doesn't work
      try {
        await FirebaseFirestore.saveUserProfile(updatedProfile);
      } catch (error) {
        console.warn('Could not save updated profile to Firebase:', error);
      }

      console.log('Profile updated after purchase');
    };

    IAPService.onPurchaseError = (error: any) => {
      console.error('Purchase error:', error);
    };
  }, [userProfile]);

  const initializeApp = async () => {
    try {
      // Initialize Firebase Auth
      let userId: string;
      try {
        userId = FirebaseAuth.getCurrentUserId() || '';
        if (!userId) {
          userId = await FirebaseAuth.signInAnonymously();
        }
      } catch (firebaseError) {
        console.error('Firebase initialization failed:', firebaseError);
        // Generate a temporary local user ID for offline use
        userId = `offline_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        console.log('Using offline mode with temporary user ID');
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

        // Try to save to Firebase, but don't fail if it doesn't work
        try {
          await FirebaseFirestore.saveUserProfile(profile);
        } catch (error) {
          console.warn('Could not save profile to Firebase:', error);
        }
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

      // Try to save to Firebase, but don't fail if it doesn't work
      try {
        await FirebaseFirestore.saveUserProfile(updatedProfile);

        // Update leaderboard
        await FirebaseFirestore.updateLeaderboard({
          userId: userProfile.userId,
          displayName: userProfile.displayName,
          score: updatedProfile.totalScore,
          level: updatedProfile.highestLevel,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.warn('Could not sync with Firebase:', error);
      }

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

  const handleHelpPress = () => {
    setCurrentScreen('help');
  };

  const handleBackToMenu = () => {
    setCurrentScreen('menu');
  };

  if (!isInitialized) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: GAME_CONFIG.COLORS.background}}>
        <Text style={{color: GAME_CONFIG.COLORS.text, fontSize: 24}}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={GAME_CONFIG.COLORS.background} />
      {currentScreen === 'menu' && (
        <MenuScreen
          onPlayPress={handlePlayPress}
          onLeaderboardPress={handleLeaderboardPress}
          onShopPress={handleShopPress}
          onHelpPress={handleHelpPress}
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
      {currentScreen === 'leaderboard' && (
        <View style={{flex: 1, backgroundColor: GAME_CONFIG.COLORS.background, justifyContent: 'center', alignItems: 'center', padding: 20}}>
          <Text style={{color: GAME_CONFIG.COLORS.text, fontSize: 32, fontWeight: 'bold', marginBottom: 20}}>🏆 Leaderboard</Text>
          <Text style={{color: GAME_CONFIG.COLORS.textSecondary, fontSize: 16, marginBottom: 40, textAlign: 'center'}}>Coming Soon!</Text>
          <TouchableOpacity
            onPress={handleBackToMenu}
            style={{backgroundColor: GAME_CONFIG.COLORS.primary, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12}}>
            <Text style={{color: GAME_CONFIG.COLORS.text, fontSize: 18, fontWeight: 'bold'}}>← Back to Menu</Text>
          </TouchableOpacity>
        </View>
      )}
      {currentScreen === 'help' && (
        <HelpScreen onBack={handleBackToMenu} />
      )}
    </>
  );
};

export default App;
