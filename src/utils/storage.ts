import AsyncStorage from '@react-native-async-storage/async-storage';
import {UserProfile, GameState} from '@/types/game';

const KEYS = {
  USER_PROFILE: '@letterloom_user_profile',
  GAME_STATE: '@letterloom_game_state',
  SETTINGS: '@letterloom_settings',
  PURCHASED_LEVELS: '@letterloom_purchased_levels',
  DAILY_CHALLENGE: '@letterloom_daily_challenge',
};

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

export async function saveGameState(state: GameState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.GAME_STATE, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving game state:', error);
  }
}

export async function getGameState(): Promise<GameState | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.GAME_STATE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting game state:', error);
    return null;
  }
}

export async function clearGameState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.GAME_STATE);
  } catch (error) {
    console.error('Error clearing game state:', error);
  }
}

export async function savePurchasedLevels(levelIds: number[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.PURCHASED_LEVELS, JSON.stringify(levelIds));
  } catch (error) {
    console.error('Error saving purchased levels:', error);
  }
}

export async function getPurchasedLevels(): Promise<number[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.PURCHASED_LEVELS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting purchased levels:', error);
    return [];
  }
}
