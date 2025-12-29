import React, {useState, useEffect} from 'react';
import {StatusBar, View, Text, TouchableOpacity} from 'react-native';
import {MenuScreen} from './screens/MenuScreen';
import {LevelSelectScreen} from './screens/LevelSelectScreen';
import {GameScreen} from './screens/GameScreen';
import {ShopScreen} from './screens/ShopScreen';
import {HelpScreen} from './screens/HelpScreen';
import {LogScreen} from './screens/LogScreen';
import {Level, UserProfile} from './types/game';
import {
  GameCenterService,
  GAMECENTER_LEADERBOARDS,
  GAMECENTER_ACHIEVEMENTS,
} from './services/gamecenter';
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
// Import log capture to initialize it early
import './utils/logCapture';

type Screen = 'menu' | 'levelSelect' | 'game' | 'leaderboard' | 'shop' | 'help' | 'logs';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Safety timeout: force initialization after 5 seconds
    const timeout = setTimeout(() => {
      console.warn('[App] Initialization timeout - forcing app to show');
      setIsInitialized(true);
    }, 5000);

    initializeApp().finally(() => {
      clearTimeout(timeout);
    });

    return () => {
      clearTimeout(timeout);
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

      console.log('Profile updated after purchase');
    };

    IAPService.onPurchaseError = (error: any) => {
      console.error('Purchase error:', error);
    };
  }, [userProfile]);

  const initializeApp = async () => {
    try {
      // Initialize GameCenter Authentication
      let userId: string;
      let displayName: string;

      // Don't authenticate at startup - do it when user requests leaderboard instead
      // Just generate a local user ID for now
      userId = `local_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      displayName = `Player${Math.floor(Math.random() * 10000)}`;
      console.log('[App] Using local mode (GameCenter authentication deferred to user action)');

      // Load or create user profile
      let profile = await getUserProfile();
      if (!profile) {
        // Create new profile
        profile = {
          userId,
          displayName,
          totalScore: 0,
          highestLevel: 1,
          totalWordsFound: 0,
          longestStreak: 0,
          achievements: [],
          purchasedLevels: [],
          completedLevels: [],
          coins: 100, // Starting coins
          hasPremium: false,
          lastPlayedDate: new Date().toISOString(),
        };
        await saveUserProfile(profile);
        console.log('Created new user profile');
      } else if (profile.userId !== userId) {
        // User ID changed (e.g., switched GameCenter account)
        // Update profile with new GameCenter identity
        profile.userId = userId;
        profile.displayName = displayName;
        await saveUserProfile(profile);
        console.log('Updated profile with new GameCenter identity');
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

      // Add current level to completedLevels if not already completed
      const completedLevels = userProfile.completedLevels || [];
      if (!completedLevels.includes(currentLevel!.id)) {
        completedLevels.push(currentLevel!.id);
      }

      // Calculate which pack this level belongs to (0=Free, 1=Pack1, 2=Pack2, 3=Pack3)
      const lastPackPlayed = Math.floor((currentLevel!.id - 1) / 20);

      const updatedProfile: UserProfile = {
        ...userProfile,
        totalScore: userProfile.totalScore + score,
        coins: userProfile.coins + coinReward,
        completedLevels: completedLevels,
        lastPackPlayed: lastPackPlayed,
        highestLevel: Math.max(userProfile.highestLevel, currentLevel!.id + 1),
        lastPlayedDate: new Date().toISOString(),
      };

      setUserProfile(updatedProfile);
      await saveUserProfile(updatedProfile);

      // Submit scores to GameCenter leaderboards
      try {
        await GameCenterService.submitScore(
          updatedProfile.totalScore,
          GAMECENTER_LEADERBOARDS.ALL_TIME_SCORE,
        );
        await GameCenterService.submitScore(
          updatedProfile.highestLevel,
          GAMECENTER_LEADERBOARDS.HIGHEST_LEVEL,
        );
        await GameCenterService.submitScore(
          updatedProfile.totalWordsFound,
          GAMECENTER_LEADERBOARDS.TOTAL_WORDS,
        );
      } catch (error) {
        console.warn('Could not submit scores to GameCenter:', error);
      }

      // Check and report achievements
      try {
        const completedCount = updatedProfile.completedLevels.length;
        if (completedCount >= 10) {
          await GameCenterService.reportAchievement(
            GAMECENTER_ACHIEVEMENTS.COMPLETE_10_LEVELS,
            100,
          );
        }
        if (completedCount >= 20) {
          await GameCenterService.reportAchievement(
            GAMECENTER_ACHIEVEMENTS.COMPLETE_20_LEVELS,
            100,
          );
        }
        if (completedCount >= 40) {
          await GameCenterService.reportAchievement(
            GAMECENTER_ACHIEVEMENTS.COMPLETE_40_LEVELS,
            100,
          );
        }
        if (completedCount >= 60) {
          await GameCenterService.reportAchievement(
            GAMECENTER_ACHIEVEMENTS.COMPLETE_60_LEVELS,
            100,
          );
        }
        if (completedCount >= 80) {
          await GameCenterService.reportAchievement(
            GAMECENTER_ACHIEVEMENTS.COMPLETE_80_LEVELS,
            100,
          );
        }

        // Score-based achievements
        if (updatedProfile.totalScore >= 10000) {
          await GameCenterService.reportAchievement(
            GAMECENTER_ACHIEVEMENTS.SCORE_10000,
            100,
          );
        }
        if (updatedProfile.totalScore >= 50000) {
          await GameCenterService.reportAchievement(
            GAMECENTER_ACHIEVEMENTS.SCORE_50000,
            100,
          );
        }
        if (updatedProfile.totalScore >= 100000) {
          await GameCenterService.reportAchievement(
            GAMECENTER_ACHIEVEMENTS.SCORE_100000,
            100,
          );
        }

        // Word count achievements
        if (updatedProfile.totalWordsFound >= 100) {
          await GameCenterService.reportAchievement(
            GAMECENTER_ACHIEVEMENTS.FIND_100_WORDS,
            100,
          );
        }
        if (updatedProfile.totalWordsFound >= 500) {
          await GameCenterService.reportAchievement(
            GAMECENTER_ACHIEVEMENTS.FIND_500_WORDS,
            100,
          );
        }
        if (updatedProfile.totalWordsFound >= 1000) {
          await GameCenterService.reportAchievement(
            GAMECENTER_ACHIEVEMENTS.FIND_1000_WORDS,
            100,
          );
        }
      } catch (error) {
        console.warn('Could not report achievements to GameCenter:', error);
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

  const handleLeaderboardPress = async () => {
    console.log('[App] Leaderboard button pressed');

    if (!GameCenterService.isAvailable) {
      console.warn('[App] GameCenter not available');
      Alert.alert('GameCenter Not Available', 'GameCenter is not available on this device.', [{text: 'OK'}]);
      return;
    }

    try {
      // Try authenticating when user presses the button instead of at startup
      console.log('[App] Authenticating on user action...');
      const isAuthenticated = await GameCenterService.authenticatePlayer();
      console.log('[App] Authentication result:', isAuthenticated);

      if (!isAuthenticated) {
        Alert.alert(
          'GameCenter Authentication Failed',
          'Could not authenticate with GameCenter. Check debug logs.',
          [{text: 'OK'}]
        );
        return;
      }

      console.log('[App] Showing leaderboard...');
      await GameCenterService.showLeaderboard(
        GAMECENTER_LEADERBOARDS.ALL_TIME_SCORE,
      );
      console.log('[App] Leaderboard shown successfully');
    } catch (error) {
      console.error('[App] Error in leaderboard flow:', error);
      Alert.alert('Error', 'Failed to show leaderboard. Check debug logs.', [{text: 'OK'}]);
    }
  };

  const handleShopPress = () => {
    setCurrentScreen('shop');
  };

  const handleHelpPress = () => {
    setCurrentScreen('help');
  };

  const handleLogsPress = () => {
    setCurrentScreen('logs');
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
          onLogsPress={handleLogsPress}
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
      {currentScreen === 'logs' && (
        <LogScreen onBack={handleBackToMenu} />
      )}
    </>
  );
};

export default App;
