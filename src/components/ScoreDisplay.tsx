import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import LinearGradient from 'expo-linear-gradient';
import {GAME_CONFIG} from '@/config/constants';

interface Props {
  score: number;
  targetScore: number;
  level: number;
}

export const ScoreDisplay: React.FC<Props> = ({score, targetScore, level}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevScore = useRef(score);

  useEffect(() => {
    if (score > prevScore.current) {
      // Animate score increase
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevScore.current = score;
  }, [score]);

  const progress = Math.min((score / targetScore) * 100, 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.levelText}>Level {level}</Text>
        <Animated.Text
          style={[styles.scoreText, {transform: [{scale: scaleAnim}]}]}>
          {score}
        </Animated.Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <LinearGradient
            colors={[
              GAME_CONFIG.COLORS.gradient1,
              GAME_CONFIG.COLORS.gradient2,
            ]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={[styles.progressBar, {width: `${progress}%`}]}
          />
        </View>
        <Text style={styles.targetText}>Goal: {targetScore}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: GAME_CONFIG.COLORS.backgroundLight,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelText: {
    fontSize: 18,
    fontWeight: '600',
    color: GAME_CONFIG.COLORS.textSecondary,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: GAME_CONFIG.COLORS.text,
  },
  progressContainer: {
    gap: 8,
  },
  progressBackground: {
    height: 12,
    backgroundColor: GAME_CONFIG.COLORS.background,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  targetText: {
    fontSize: 14,
    color: GAME_CONFIG.COLORS.textSecondary,
    textAlign: 'center',
  },
});
