import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import LinearGradient from 'expo-linear-gradient';
import {GAME_CONFIG, IAP_PRODUCTS} from '@/config/constants';
import {generateLevel} from '@/utils/gameLogic';
import {Level, UserProfile} from '@/types/game';
import {getPurchasedLevels} from '@/utils/storage';
import {IAPService, getLevelPackProductId} from '@/services/iap';

interface Props {
  onLevelSelect: (level: Level) => void;
  onBack: () => void;
  userProfile: UserProfile | null;
}

export const LevelSelectScreen: React.FC<Props> = ({
  onLevelSelect,
  onBack,
  userProfile,
}) => {
  const [purchasedLevels, setPurchasedLevels] = useState<number[]>([]);
  const [selectedPack, setSelectedPack] = useState(1);

  useEffect(() => {
    loadPurchasedLevels();
  }, []);

  const loadPurchasedLevels = async () => {
    const purchased = await getPurchasedLevels();
    setPurchasedLevels(purchased);
  };

  const getLevelsForPack = (pack: number) => {
    const start = (pack - 1) * 20 + 1;
    const end = pack * 20;
    return Array.from({length: 20}, (_, i) => start + i);
  };

  const isLevelUnlocked = (levelNumber: number) => {
    // Free levels are always unlocked
    if (levelNumber <= GAME_CONFIG.FREE_LEVELS) {
      return true;
    }
    // Premium users get all levels unlocked
    if (userProfile?.hasPremium) {
      return true;
    }
    // Otherwise check if specific level was purchased
    return purchasedLevels.includes(levelNumber);
  };

  const handleLevelPress = (levelNumber: number) => {
    if (!isLevelUnlocked(levelNumber)) {
      Alert.alert(
        'Level Locked',
        'Purchase this level pack to unlock!',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Purchase',
            onPress: () => handlePurchasePack(selectedPack),
          },
        ],
      );
      return;
    }

    const level = generateLevel(
      levelNumber,
      levelNumber > GAME_CONFIG.FREE_LEVELS,
    );
    onLevelSelect(level);
  };

  const handlePurchasePack = async (packNumber: number) => {
    const productId = getLevelPackProductId(packNumber);
    try {
      await IAPService.purchaseProduct(productId);
      Alert.alert('Success', 'Level pack purchased successfully!');
      loadPurchasedLevels();
    } catch (error) {
      Alert.alert('Error', 'Failed to purchase level pack');
    }
  };

  const renderLevel = (levelNumber: number) => {
    const isUnlocked = isLevelUnlocked(levelNumber);
    const level = generateLevel(levelNumber, !isUnlocked);

    return (
      <TouchableOpacity
        key={levelNumber}
        onPress={() => handleLevelPress(levelNumber)}
        activeOpacity={0.8}
        style={styles.levelButtonWrapper}>
        <LinearGradient
          colors={
            isUnlocked
              ? [GAME_CONFIG.COLORS.cardBg, GAME_CONFIG.COLORS.tile]
              : [GAME_CONFIG.COLORS.backgroundLight, GAME_CONFIG.COLORS.background]
          }
          style={styles.levelButton}>
          <View style={styles.levelNumber}>
            <Text style={[styles.levelNumberText, !isUnlocked && styles.lockedText]}>
              {isUnlocked ? levelNumber : '🔒'}
            </Text>
          </View>
          <View style={styles.levelInfo}>
            <Text style={[styles.difficultyText, !isUnlocked && styles.lockedText]}>
              {level.difficulty.toUpperCase()}
            </Text>
            <Text style={[styles.targetText, !isUnlocked && styles.lockedText]}>
              Target: {level.targetScore}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={[GAME_CONFIG.COLORS.background, GAME_CONFIG.COLORS.backgroundLight]}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Select Level</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.packSelector}>
          {[1, 2, 3, 4, 5].map(pack => (
            <TouchableOpacity
              key={pack}
              onPress={() => setSelectedPack(pack)}
              style={[
                styles.packButton,
                selectedPack === pack && styles.packButtonActive,
              ]}>
              <Text
                style={[
                  styles.packButtonText,
                  selectedPack === pack && styles.packButtonTextActive,
                ]}>
                Pack {pack}
              </Text>
              {pack > 1 && (
                <Text style={styles.packPrice}>$2.99</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.levelsGrid}>
            {getLevelsForPack(selectedPack).map(renderLevel)}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GAME_CONFIG.COLORS.tile,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 24,
    color: GAME_CONFIG.COLORS.text,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: GAME_CONFIG.COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  packSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  packButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: GAME_CONFIG.COLORS.tile,
    alignItems: 'center',
  },
  packButtonActive: {
    backgroundColor: GAME_CONFIG.COLORS.primary,
  },
  packButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: GAME_CONFIG.COLORS.textSecondary,
  },
  packButtonTextActive: {
    color: '#FFFFFF',
  },
  packPrice: {
    fontSize: 10,
    color: GAME_CONFIG.COLORS.warning,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
  },
  levelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  levelButtonWrapper: {
    width: '48%',
  },
  levelButton: {
    padding: 16,
    borderRadius: 16,
    minHeight: 100,
  },
  levelNumber: {
    marginBottom: 8,
  },
  levelNumberText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: GAME_CONFIG.COLORS.text,
  },
  levelInfo: {
    gap: 4,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: GAME_CONFIG.COLORS.primary,
  },
  targetText: {
    fontSize: 12,
    color: GAME_CONFIG.COLORS.textSecondary,
  },
  lockedText: {
    opacity: 0.5,
  },
});
