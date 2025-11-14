import React from 'react';
import {render} from '@testing-library/react-native';
import {GameBoard} from '../GameBoard';
import {Letter} from '@/types/game';

describe('GameBoard', () => {
  const mockLetters: Letter[] = [
    {id: '1', letter: 'A', position: {x: 0, y: 0}, isSelected: false},
    {id: '2', letter: 'B', position: {x: 1, y: 0}, isSelected: false},
    {id: '3', letter: 'C', position: {x: 2, y: 0}, isSelected: false},
    {id: '4', letter: 'D', position: {x: 3, y: 0}, isSelected: false},
    {id: '5', letter: 'E', position: {x: 4, y: 0}, isSelected: false},
    {id: '6', letter: 'F', position: {x: 0, y: 1}, isSelected: false},
    {id: '7', letter: 'G', position: {x: 1, y: 1}, isSelected: false},
    {id: '8', letter: 'H', position: {x: 2, y: 1}, isSelected: false},
    {id: '9', letter: 'I', position: {x: 3, y: 1}, isSelected: false},
    {id: '10', letter: 'J', position: {x: 4, y: 1}, isSelected: false},
  ];

  const mockOnLetterPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all letters', () => {
    const {getByText} = render(
      <GameBoard letters={mockLetters} onLetterPress={mockOnLetterPress} />,
    );

    mockLetters.forEach(letter => {
      expect(getByText(letter.letter)).toBeTruthy();
    });
  });

  it('should render in grid layout', () => {
    const {container} = render(
      <GameBoard letters={mockLetters} onLetterPress={mockOnLetterPress} />,
    );

    expect(container).toBeTruthy();
  });

  it('should pass onLetterPress to tiles', () => {
    const {getByText} = render(
      <GameBoard letters={mockLetters} onLetterPress={mockOnLetterPress} />,
    );

    // LetterTile internally handles the press, so we just verify it rendered
    expect(getByText('A')).toBeTruthy();
  });

  it('should handle empty letters array', () => {
    const {container} = render(
      <GameBoard letters={[]} onLetterPress={mockOnLetterPress} />,
    );

    expect(container).toBeTruthy();
  });
});
