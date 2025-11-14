import React, {useEffect, useRef} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {GAME_CONFIG, ANIMATIONS} from '@/config/constants';
import {Letter} from '@/types/game';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

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

  useEffect(() => {
    if (letter.isSelected) {
      // Pulsing glow animation for selected tiles
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Pop animation
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        friction: 3,
        tension: 40,
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
  }, [letter.isSelected]);

  const handlePress = () => {
    if (!disabled) {
      ReactNativeHapticFeedback.trigger('impactLight');

      // Quick bounce animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: letter.isSelected ? 1 : 1.1,
          friction: 3,
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
    backgroundColor: GAME_CONFIG.COLORS.primary,
    borderRadius: 16,
    zIndex: -1,
  },
  tile: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  tileSelected: {
    shadowColor: GAME_CONFIG.COLORS.primary,
    shadowOpacity: 0.8,
    elevation: 12,
  },
  letter: {
    fontSize: 32,
    fontWeight: 'bold',
    color: GAME_CONFIG.COLORS.text,
  },
  letterSelected: {
    color: '#FFFFFF',
  },
  multiplier: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: GAME_CONFIG.COLORS.warning,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
});
