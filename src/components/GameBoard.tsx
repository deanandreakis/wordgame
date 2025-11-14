import React from 'react';
import {View, StyleSheet} from 'react-native';
import {LetterTile} from './LetterTile';
import {Letter} from '@/types/game';
import {GAME_CONFIG} from '@/config/constants';

interface Props {
  letters: Letter[];
  onLetterPress: (letter: Letter) => void;
  disabled?: boolean;
}

export const GameBoard: React.FC<Props> = ({
  letters,
  onLetterPress,
  disabled,
}) => {
  const renderRow = (rowIndex: number) => {
    const rowLetters = letters.filter(
      l => l.position.y === rowIndex,
    );

    return (
      <View key={rowIndex} style={styles.row}>
        {rowLetters
          .sort((a, b) => a.position.x - b.position.x)
          .map(letter => (
            <LetterTile
              key={letter.id}
              letter={letter}
              onPress={onLetterPress}
              disabled={disabled}
            />
          ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {Array.from({length: GAME_CONFIG.GRID_SIZE}, (_, i) => i).map(renderRow)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  row: {
    flexDirection: 'row',
  },
});
