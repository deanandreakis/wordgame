import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Text,
  ScrollView,
  AppState,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {GameBoard} from '@/components/GameBoard';
import {WordInput} from '@/components/WordInput';
import {ScoreDisplay} from '@/components/ScoreDisplay';
import {ParticleEffect} from '@/components/ParticleEffect';
import {GAME_CONFIG, ANIMATIONS} from '@/config/constants';
import {Letter, GameState, Level, Word} from '@/types/game';
import {
  validateWord,
  createLetterGrid,
  isValidLetterPath,
  calculateStars,
  getHintWord,
} from '@/utils/gameLogic';
import {saveGameState, getUserProfile, saveUserProfile} from '@/utils/storage';

interface Props {
  level: Level;
  onLevelComplete: (stars: number, score: number) => void;
  onQuit: () => void;
}

export const GameScreen: React.FC<Props> = ({
  level,
  onLevelComplete,
  onQuit,
}) => {
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: level.id,
    score: 0,
    foundWords: [],
    selectedLetters: [],
    timeRemaining: level.timeLimit,
    lives: GAME_CONFIG.INITIAL_LIVES,
    streak: 0,
    hints: GAME_CONFIG.INITIAL_HINTS,
    isPaused: false,
  });

  const [letters, setLetters] = useState<Letter[]>(() =>
    createLetterGrid(level.letters, level.multiplierPositions || [], GAME_CONFIG.GRID_SIZE),
  );

  const [particles, setParticles] = useState<
    {x: number; y: number; id: number}[]
  >([]);

  const [isValidWord, setIsValidWord] = useState<boolean | undefined>(
    undefined,
  );

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const particleTimeoutsRef = React.useRef<NodeJS.Timeout[]>([]);

  // Timer effect - only set up once, not on every timeRemaining change
  useEffect(() => {
    if (level.timeLimit && !gameState.isPaused) {
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Start new timer
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          const newTime = prev.timeRemaining ? prev.timeRemaining - 1 : 0;
          // Check if time is up
          if (newTime <= 0) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          }
          return {
            ...prev,
            timeRemaining: newTime,
          };
        });
      }, 1000);
    } else if (gameState.isPaused && timerRef.current) {
      // Pause timer
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [level.timeLimit, gameState.isPaused]);

  // Check for game end when time runs out
  useEffect(() => {
    if (level.timeLimit && gameState.timeRemaining !== undefined && gameState.timeRemaining <= 0) {
      handleGameEnd();
    }
  }, [gameState.timeRemaining]);

  // Check for level completion
  useEffect(() => {
    if (gameState.score >= level.targetScore) {
      handleLevelComplete();
    }
  }, [gameState.score]);

  // Handle app backgrounding/foregrounding
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        // App came back to foreground - reset selected letters and force re-render
        setGameState(prev => ({...prev, selectedLetters: []}));
        setLetters(prev => prev.map(letter => ({...letter, isSelected: false})));
      } else if (nextAppState === 'background') {
        // App went to background - pause game and clear selections
        setGameState(prev => ({
          ...prev,
          isPaused: true,
          selectedLetters: [],
        }));
        setLetters(prev => prev.map(letter => ({...letter, isSelected: false})));
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Save game state
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  // Cleanup particle timeouts on unmount
  useEffect(() => {
    return () => {
      particleTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      particleTimeoutsRef.current = [];
    };
  }, []);

  const handleLetterPress = useCallback((letter: Letter) => {
    setGameState(prev => {
      const isAlreadySelected = prev.selectedLetters.some(
        l => l.id === letter.id,
      );

      let newSelectedLetters: Letter[];

      if (isAlreadySelected) {
        // Deselect letter
        newSelectedLetters = prev.selectedLetters.filter(
          l => l.id !== letter.id,
        );
      } else {
        // Check if letter is adjacent to last selected
        if (
          prev.selectedLetters.length > 0 &&
          !isValidLetterPath([
            ...prev.selectedLetters,
            {...letter, isSelected: true},
          ])
        ) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return prev;
        }

        newSelectedLetters = [
          ...prev.selectedLetters,
          {...letter, isSelected: true},
        ];
      }

      // Update letters selection state
      setLetters(prevLetters =>
        prevLetters.map(l => ({
          ...l,
          isSelected: newSelectedLetters.some(sl => sl.id === l.id),
        })),
      );

      // Validate word in real-time
      if (newSelectedLetters.length >= GAME_CONFIG.MIN_WORD_LENGTH) {
        const validation = validateWord(newSelectedLetters, level.id);
        setIsValidWord(validation.isValid);
      } else {
        setIsValidWord(undefined);
      }

      return {
        ...prev,
        selectedLetters: newSelectedLetters,
      };
    });
  }, []);

  const handleSubmitWord = useCallback(() => {
    const validation = validateWord(gameState.selectedLetters, level.id);

    if (validation.isValid) {
      // Check if word was already found
      const alreadyFound = gameState.foundWords.some(
        w => w.word === validation.word,
      );

      if (alreadyFound) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert('Already Found', 'You already found this word!');
        handleClearSelection();
        return;
      }

      // Success!
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Add particles
      const centerX = 200;
      const centerY = 400;
      setParticles(prev => [
        ...prev,
        {x: centerX, y: centerY, id: Date.now()},
      ]);
      const particleTimeout = setTimeout(
        () => setParticles(prev => prev.slice(1)),
        ANIMATIONS.PARTICLE_LIFETIME,
      );
      particleTimeoutsRef.current.push(particleTimeout);

      // Update game state
      const newWord: Word = {
        word: validation.word,
        score: validation.score,
        letters: gameState.selectedLetters,
      };

      setGameState(prev => ({
        ...prev,
        score: prev.score + validation.score,
        foundWords: [...prev.foundWords, newWord],
        selectedLetters: [],
        streak: prev.streak + 1,
      }));

      setLetters(prevLetters =>
        prevLetters.map(l => ({...l, isSelected: false})),
      );
      setIsValidWord(undefined);
    } else {
      // Invalid word
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsValidWord(false);

      setTimeout(() => {
        setIsValidWord(undefined);
      }, 1000);
    }
  }, [gameState.selectedLetters, gameState.foundWords]);

  const handleClearSelection = useCallback(() => {
    setGameState(prev => ({...prev, selectedLetters: []}));
    setLetters(prevLetters =>
      prevLetters.map(l => ({...l, isSelected: false})),
    );
    setIsValidWord(undefined);
  }, []);

  const handleHint = useCallback(() => {
    if (gameState.hints <= 0) {
      Alert.alert('No Hints', 'You have no hints remaining!');
      return;
    }

    const hint = getHintWord(
      level.id,
      gameState.foundWords.map(w => w.word),
    );

    if (hint) {
      Alert.alert('Hint', `Try finding: ${hint.toUpperCase()}`);
      setGameState(prev => ({...prev, hints: prev.hints - 1}));
    } else {
      Alert.alert('No Hints', 'No more words available!');
    }
  }, [level.id, gameState.foundWords, gameState.hints]);

  const handleLevelComplete = () => {
    const stars = calculateStars(gameState.score, level.targetScore);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setTimeout(() => {
      Alert.alert(
        '🎉 Level Complete!',
        `Score: ${gameState.score}\nStars: ${'⭐'.repeat(stars)}`,
        [
          {
            text: 'Continue',
            onPress: () => onLevelComplete(stars, gameState.score),
          },
        ],
      );
    }, 500);
  };

  const handleGameEnd = () => {
    Alert.alert(
      'Game Over',
      `Final Score: ${gameState.score}\nWords Found: ${gameState.foundWords.length}`,
      [{text: 'OK', onPress: onQuit}],
    );
  };

  return (
    <LinearGradient
      colors={[GAME_CONFIG.COLORS.background, GAME_CONFIG.COLORS.backgroundLight]}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onQuit} style={styles.quitButton}>
            <Text style={styles.quitText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.stats}>
            {level.timeLimit && (
              <Text style={styles.statText}>⏱ {gameState.timeRemaining}s</Text>
            )}
            <Text style={styles.statText}>💡 {gameState.hints}</Text>
            <Text style={styles.statText}>🔥 {gameState.streak}</Text>
          </View>

          <TouchableOpacity onPress={handleHint} style={styles.hintButton}>
            <Text style={styles.hintText}>💡</Text>
          </TouchableOpacity>
        </View>

        <ScoreDisplay
          score={gameState.score}
          targetScore={level.targetScore}
          level={level.id}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <GameBoard
            letters={letters}
            onLetterPress={handleLetterPress}
            disabled={gameState.isPaused}
          />

          <WordInput
            selectedLetters={gameState.selectedLetters}
            onSubmit={handleSubmitWord}
            onClear={handleClearSelection}
            isValid={isValidWord}
          />

          <View style={styles.foundWords}>
            <Text style={styles.foundWordsTitle}>
              Found Words ({gameState.foundWords.length})
            </Text>
            <View style={styles.wordList}>
              {gameState.foundWords.map((word, index) => (
                <View key={index} style={styles.wordChip}>
                  <Text style={styles.wordChipText}>{word.word}</Text>
                  <Text style={styles.wordChipScore}>+{word.score}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {particles.map(particle => (
          <ParticleEffect
            key={particle.id}
            x={particle.x}
            y={particle.y}
            count={20}
          />
        ))}
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
  },
  quitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GAME_CONFIG.COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quitText: {
    fontSize: 24,
    color: GAME_CONFIG.COLORS.text,
    fontWeight: 'bold',
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontSize: 18,
    fontWeight: '600',
    color: GAME_CONFIG.COLORS.text,
  },
  hintButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GAME_CONFIG.COLORS.warning,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintText: {
    fontSize: 20,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  foundWords: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    backgroundColor: GAME_CONFIG.COLORS.backgroundLight,
    borderRadius: 16,
  },
  foundWordsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: GAME_CONFIG.COLORS.text,
    marginBottom: 12,
  },
  wordList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GAME_CONFIG.COLORS.tile,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  wordChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: GAME_CONFIG.COLORS.text,
  },
  wordChipScore: {
    fontSize: 12,
    color: GAME_CONFIG.COLORS.success,
  },
});
