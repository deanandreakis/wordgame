import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {LetterTile} from '../LetterTile';
import {Letter} from '@/types/game';

describe('LetterTile', () => {
  const mockLetter: Letter = {
    id: '1',
    letter: 'A',
    position: {x: 0, y: 0},
    isSelected: false,
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the letter', () => {
    const {getByText} = render(
      <LetterTile letter={mockLetter} onPress={mockOnPress} />,
    );

    expect(getByText('A')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const {getByText} = render(
      <LetterTile letter={mockLetter} onPress={mockOnPress} />,
    );

    fireEvent.press(getByText('A'));
    expect(mockOnPress).toHaveBeenCalledWith(mockLetter);
  });

  it('should not call onPress when disabled', () => {
    const {getByText} = render(
      <LetterTile letter={mockLetter} onPress={mockOnPress} disabled />,
    );

    fireEvent.press(getByText('A'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should display multiplier when present', () => {
    const letterWithMultiplier: Letter = {
      ...mockLetter,
      multiplier: 2,
    };

    const {getByText} = render(
      <LetterTile letter={letterWithMultiplier} onPress={mockOnPress} />,
    );

    expect(getByText('2x')).toBeTruthy();
  });

  it('should not display multiplier when not present', () => {
    const {queryByText} = render(
      <LetterTile letter={mockLetter} onPress={mockOnPress} />,
    );

    expect(queryByText(/\dx/)).toBeNull();
  });

  it('should render selected state', () => {
    const selectedLetter: Letter = {
      ...mockLetter,
      isSelected: true,
    };

    const {container} = render(
      <LetterTile letter={selectedLetter} onPress={mockOnPress} />,
    );

    expect(container).toBeTruthy();
  });
});
