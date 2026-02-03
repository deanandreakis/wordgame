import React, {useEffect, useRef} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {GAME_CONFIG, ANIMATIONS, AUDIO_CONFIG} from '@/config/constants';
import {Letter} from '@/types/game';
import * as Haptics from 'expo-haptics';
import {AudioService} from '@/services/audio';

interface Props {
  letter: Letter;
  onPress: (letter: Letter) => void;
  disabled?: boolean;
}

const {width} = Dimensions.get('window');
const tileSize = (width - 60) / GAME_CONFIG.GRID_SIZE;

export const LetterTile: React.FC<Props> = ({letter, onPress, disabled}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const glowAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    // Stop any running glow animation
    if (glowAnimationRef.current) {
      glowAnimationRef.current.stop();
      glowAnimationRef.current = null;
    }

    if (letter.isSelected) {
      // Pulsing glow animation - slower, meditative breathing effect
      glowAnimationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1200,  // Slower for organic feel
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1200,  // Matches inhale/exhale rhythm
            useNativeDriver: true,
          }),
        ]),
      );
      glowAnimationRef.current.start();

      // Pop animation - smoother, more fluid
      Animated.spring(scaleAnim, {
        toValue: 1.15,  // Slightly larger bounce
        friction: 4,    // Smoother deceleration
        tension: 60,    // Snappier response
        useNativeDriver: true,
      }).start();
    } else {
      glowAnim.setValue(0);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }

    // Cleanup function
    return () => {
      if (glowAnimationRef.current) {
        glowAnimationRef.current.stop();
        glowAnimationRef.current = null;
      }
    };
  }, [letter.isSelected]);

  const handlePress = () => {
    if (!disabled) {
      if (AudioService.isHapticsEnabled()) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      AudioService.playSFX(AUDIO_CONFIG.SOUNDS.TILE_TAP);

      // Enhanced bounce animation - deeper press, bouncier release
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.85,  // Deeper press for more satisfaction
          duration: 60,   // Slightly longer for smoothness
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: letter.isSelected ? 1 : 1.15,
          friction: 2,    // More bouncy release
          useNativeDriver: true,
        }),
      ]).start();

      onPress(letter);
    }
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const colors = letter.isSelected
    ? [GAME_CONFIG.COLORS.tileSelected, GAME_CONFIG.COLORS.primary]
    : letter.multiplier
    ? [GAME_CONFIG.COLORS.tileBonus, GAME_CONFIG.COLORS.accent]
    : [GAME_CONFIG.COLORS.tile, GAME_CONFIG.COLORS.backgroundLight];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{scale: scaleAnim}],
          opacity: disabled ? 0.5 : 1,
        },
      ]}>
      {letter.isSelected && (
        <Animated.View
          style={[
            styles.glow,
            {
              opacity: glowOpacity,
            },
          ]}
        />
      )}
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}>
        <LinearGradient
          colors={colors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[
            styles.tile,
            letter.isSelected && styles.tileSelected,
            {width: tileSize, height: tileSize},
          ]}>
          <Text style={[styles.letter, letter.isSelected && styles.letterSelected]}>
            {letter.letter}
          </Text>
          {letter.multiplier && (
            <Text style={styles.multiplier}>{letter.multiplier}x</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 4,
  },
  glow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: GAME_CONFIG.COLORS.glowGreen,  // Firefly glow effect
    borderRadius: 18,  // Slightly larger for softer glow
    zIndex: -1,
  },
  tile: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: GAME_CONFIG.COLORS.shadowGreen,  // Green-tinted shadow
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  tileSelected: {
    shadowColor: GAME_CONFIG.COLORS.glowGreen,  // Firefly glow on selected
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 14,
  },
  letter: {
    fontSize: 32,
    fontWeight: 'bold',
    color: GAME_CONFIG.COLORS.text,
  },
  letterSelected: {
    color: GAME_CONFIG.COLORS.text,  // Use consistent text color
  },
  multiplier: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: GAME_CONFIG.COLORS.warning,
    backgroundColor: 'rgba(13, 31, 18, 0.7)',  // Dark green overlay
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
});
