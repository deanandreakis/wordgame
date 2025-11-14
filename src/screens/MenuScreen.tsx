import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {GAME_CONFIG} from '@/config/constants';
import {getUserProfile} from '@/utils/storage';
import {UserProfile} from '@/types/game';

interface Props {
  onPlayPress: () => void;
  onLeaderboardPress: () => void;
  onShopPress: () => void;
}

export const MenuScreen: React.FC<Props> = ({
  onPlayPress,
  onLeaderboardPress,
  onShopPress,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const titleScale = new Animated.Value(0);
  const buttonsOpacity = new Animated.Value(0);

  useEffect(() => {
    loadProfile();
    animateEntrance();
  }, []);

  const loadProfile = async () => {
    const userProfile = await getUserProfile();
    setProfile(userProfile);
  };

  const animateEntrance = () => {
    Animated.sequence([
      Animated.spring(titleScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(buttonsOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <LinearGradient
      colors={[GAME_CONFIG.COLORS.background, GAME_CONFIG.COLORS.backgroundLight]}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View
            style={[styles.titleContainer, {transform: [{scale: titleScale}]}]}>
            <Text style={styles.title}>LetterLoom</Text>
            <Text style={styles.subtitle}>Weave Words, Score Big!</Text>
          </Animated.View>

          {profile && (
            <View style={styles.profileCard}>
              <LinearGradient
                colors={[GAME_CONFIG.COLORS.cardBg, GAME_CONFIG.COLORS.tile]}
                style={styles.profileGradient}>
                <Text style={styles.profileName}>{profile.displayName}</Text>
                <View style={styles.profileStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{profile.totalScore}</Text>
                    <Text style={styles.statLabel}>Total Score</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{profile.highestLevel}</Text>
                    <Text style={styles.statLabel}>Highest Level</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {profile.totalWordsFound}
                    </Text>
                    <Text style={styles.statLabel}>Words Found</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}

          <Animated.View style={[styles.buttons, {opacity: buttonsOpacity}]}>
            <TouchableOpacity onPress={onPlayPress} activeOpacity={0.8}>
              <LinearGradient
                colors={[
                  GAME_CONFIG.COLORS.gradient1,
                  GAME_CONFIG.COLORS.gradient2,
                ]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>▶ PLAY</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.secondaryButtons}>
              <TouchableOpacity
                onPress={onLeaderboardPress}
                activeOpacity={0.8}
                style={styles.secondaryButtonWrapper}>
                <LinearGradient
                  colors={[GAME_CONFIG.COLORS.cardBg, GAME_CONFIG.COLORS.tile]}
                  style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>🏆</Text>
                  <Text style={styles.secondaryButtonLabel}>Leaderboard</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onShopPress}
                activeOpacity={0.8}
                style={styles.secondaryButtonWrapper}>
                <LinearGradient
                  colors={[GAME_CONFIG.COLORS.cardBg, GAME_CONFIG.COLORS.tile]}
                  style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>🛒</Text>
                  <Text style={styles.secondaryButtonLabel}>Shop</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Text style={styles.version}>v1.0.0</Text>
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 56,
    fontWeight: 'bold',
    color: GAME_CONFIG.COLORS.text,
    textShadowColor: GAME_CONFIG.COLORS.primary,
    textShadowOffset: {width: 0, height: 4},
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    color: GAME_CONFIG.COLORS.textSecondary,
    marginTop: 8,
  },
  profileCard: {
    width: '100%',
    marginBottom: 32,
  },
  profileGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: GAME_CONFIG.COLORS.text,
    marginBottom: 16,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: GAME_CONFIG.COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: GAME_CONFIG.COLORS.textSecondary,
    marginTop: 4,
  },
  buttons: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: GAME_CONFIG.COLORS.primary,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  primaryButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  secondaryButtonWrapper: {
    flex: 1,
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 32,
    marginBottom: 4,
  },
  secondaryButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: GAME_CONFIG.COLORS.text,
  },
  version: {
    position: 'absolute',
    bottom: 20,
    fontSize: 12,
    color: GAME_CONFIG.COLORS.textSecondary,
  },
});
