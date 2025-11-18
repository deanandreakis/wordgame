import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated, TouchableOpacity} from 'react-native';
import LinearGradient from 'expo-linear-gradient';
import {GAME_CONFIG} from '@/config/constants';
import {Letter} from '@/types/game';

interface Props {
  selectedLetters: Letter[];
  onSubmit: () => void;
  onClear: () => void;
  isValid?: boolean;
}

export const WordInput: React.FC<Props> = ({
  selectedLetters,
  onSubmit,
  onClear,
  isValid,
}) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const word = selectedLetters.map(l => l.letter).join('');

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (isValid === false && word.length >= GAME_CONFIG.MIN_WORD_LENGTH) {
      shake();
    }
  }, [isValid]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{translateX: shakeAnim}],
        },
      ]}>
      <LinearGradient
        colors={[GAME_CONFIG.COLORS.cardBg, GAME_CONFIG.COLORS.backgroundLight]}
        style={styles.wordContainer}>
        <Text style={styles.word}>{word || 'Select letters...'}</Text>
        {word.length > 0 && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClear} style={styles.clearButton}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
            {word.length >= GAME_CONFIG.MIN_WORD_LENGTH && (
              <TouchableOpacity onPress={onSubmit}>
                <LinearGradient
                  colors={[
                    GAME_CONFIG.COLORS.success,
                    GAME_CONFIG.COLORS.primary,
                  ]}
                  style={styles.submitButton}>
                  <Text style={styles.submitText}>✓</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    minHeight: 60,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  word: {
    fontSize: 24,
    fontWeight: 'bold',
    color: GAME_CONFIG.COLORS.text,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GAME_CONFIG.COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  submitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
