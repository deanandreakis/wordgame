import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {GAME_CONFIG} from '@/config/constants';

interface Props {
  onBack: () => void;
}

export const HelpScreen: React.FC<Props> = ({onBack}) => {
  return (
    <LinearGradient
      colors={[GAME_CONFIG.COLORS.background, GAME_CONFIG.COLORS.backgroundLight]}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>How to Play</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Objective Section */}
          <View style={styles.section}>
            <LinearGradient
              colors={[GAME_CONFIG.COLORS.cardBg, GAME_CONFIG.COLORS.tile]}
              style={styles.card}>
              <Text style={styles.sectionTitle}>🎯 Objective</Text>
              <Text style={styles.text}>
                Form valid words by selecting adjacent letters on the grid. Reach the target
                score to complete each level.
              </Text>
            </LinearGradient>
          </View>

          {/* How to Play Section */}
          <View style={styles.section}>
            <LinearGradient
              colors={[GAME_CONFIG.COLORS.cardBg, GAME_CONFIG.COLORS.tile]}
              style={styles.card}>
              <Text style={styles.sectionTitle}>🎮 How to Play</Text>
              <View style={styles.step}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.stepText}>
                  Tap letters on the grid to select them. Letters must be adjacent
                  (horizontal, vertical, or diagonal).
                </Text>
              </View>
              <View style={styles.step}>
                <Text style={styles.stepNumber}>2</Text>
                <Text style={styles.stepText}>
                  Selected letters will light up and appear in the word display at the bottom.
                </Text>
              </View>
              <View style={styles.step}>
                <Text style={styles.stepNumber}>3</Text>
                <Text style={styles.stepText}>
                  When you've formed a word, tap the checkmark ✓ to submit it.
                </Text>
              </View>
              <View style={styles.step}>
                <Text style={styles.stepNumber}>4</Text>
                <Text style={styles.stepText}>
                  Valid words earn points. Invalid words or duplicates won't count!
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Scoring Section */}
          <View style={styles.section}>
            <LinearGradient
              colors={[GAME_CONFIG.COLORS.cardBg, GAME_CONFIG.COLORS.tile]}
              style={styles.card}>
              <Text style={styles.sectionTitle}>⭐ Scoring</Text>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Longer words = More points!</Text> 3-letter words
                  earn 10 points, 4-letter earn 20, 5-letter earn 40, and so on.
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Bonus multipliers:</Text> Some tiles have 2x or 3x
                  multipliers - use them to boost your score!
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Word streaks:</Text> Find multiple words in a row
                  to build your combo multiplier.
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Special Features Section */}
          <View style={styles.section}>
            <LinearGradient
              colors={[GAME_CONFIG.COLORS.cardBg, GAME_CONFIG.COLORS.tile]}
              style={styles.card}>
              <Text style={styles.sectionTitle}>✨ Special Features</Text>
              <View style={styles.featureRow}>
                <View style={styles.feature}>
                  <Text style={styles.featureIcon}>🔥</Text>
                  <Text style={styles.featureTitle}>Streaks</Text>
                  <Text style={styles.featureDesc}>
                    Find words back-to-back to build a streak bonus.
                  </Text>
                </View>
                <View style={styles.feature}>
                  <Text style={styles.featureIcon}>❤️</Text>
                  <Text style={styles.featureTitle}>Lives</Text>
                  <Text style={styles.featureDesc}>
                    You start with 3 lives. Don't let them run out!
                  </Text>
                </View>
              </View>
              <View style={styles.featureRow}>
                <View style={styles.feature}>
                  <Text style={styles.featureIcon}>💡</Text>
                  <Text style={styles.featureTitle}>Hints</Text>
                  <Text style={styles.featureDesc}>
                    Stuck? Use a hint to reveal a valid word.
                  </Text>
                </View>
                <View style={styles.feature}>
                  <Text style={styles.featureIcon}>🪙</Text>
                  <Text style={styles.featureTitle}>Coins</Text>
                  <Text style={styles.featureDesc}>
                    Earn coins by completing levels with stars!
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Tips Section */}
          <View style={styles.section}>
            <LinearGradient
              colors={[GAME_CONFIG.COLORS.cardBg, GAME_CONFIG.COLORS.tile]}
              style={styles.card}>
              <Text style={styles.sectionTitle}>💡 Pro Tips</Text>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>
                  Look for common prefixes and suffixes (UN-, -ING, -ED, etc.)
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>
                  Use diagonal connections to find longer words
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>
                  Save multiplier tiles for your longest words
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>
                  Clear your selection by tapping the X button or the selected letter again
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Star Ratings */}
          <View style={styles.section}>
            <LinearGradient
              colors={[GAME_CONFIG.COLORS.cardBg, GAME_CONFIG.COLORS.tile]}
              style={styles.card}>
              <Text style={styles.sectionTitle}>⭐ Star Ratings</Text>
              <View style={styles.starRow}>
                <Text style={styles.stars}>⭐</Text>
                <Text style={styles.starText}>Reach the target score</Text>
              </View>
              <View style={styles.starRow}>
                <Text style={styles.stars}>⭐⭐</Text>
                <Text style={styles.starText}>Score 1.5x the target</Text>
              </View>
              <View style={styles.starRow}>
                <Text style={styles.stars}>⭐⭐⭐</Text>
                <Text style={styles.starText}>Score 2x the target (master level!)</Text>
              </View>
              <Text style={styles.coinRewardText}>
                Earn bonus coins based on your star rating!
              </Text>
            </LinearGradient>
          </View>

          <View style={styles.bottomPadding} />
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(111, 216, 142, 0.15)',
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: GAME_CONFIG.COLORS.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: GAME_CONFIG.COLORS.text,
    flex: 1,
    textAlign: 'center',
    marginRight: 60, // Balance the back button
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: GAME_CONFIG.COLORS.shadowGreen,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: GAME_CONFIG.COLORS.text,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: GAME_CONFIG.COLORS.textSecondary,
    lineHeight: 24,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GAME_CONFIG.COLORS.primary,
    color: GAME_CONFIG.COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: GAME_CONFIG.COLORS.textSecondary,
    lineHeight: 22,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 20,
    color: GAME_CONFIG.COLORS.primary,
    marginRight: 12,
    lineHeight: 24,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: GAME_CONFIG.COLORS.textSecondary,
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
    color: GAME_CONFIG.COLORS.text,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  feature: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(45, 95, 63, 0.2)',
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: GAME_CONFIG.COLORS.text,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: GAME_CONFIG.COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(45, 95, 63, 0.2)',
    borderRadius: 8,
  },
  stars: {
    fontSize: 20,
    marginRight: 12,
    minWidth: 80,
  },
  starText: {
    flex: 1,
    fontSize: 15,
    color: GAME_CONFIG.COLORS.textSecondary,
  },
  coinRewardText: {
    fontSize: 14,
    color: GAME_CONFIG.COLORS.warning,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});
