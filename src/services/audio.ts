import {AppState, AppStateStatus} from 'react-native';
import {Audio, AVPlaybackSource} from 'expo-av';
import {AUDIO_CONFIG} from '@/config/constants';
import {getSettings, saveSettings, AppSettings} from '@/utils/storage';

type SoundName = (typeof AUDIO_CONFIG.SOUNDS)[keyof typeof AUDIO_CONFIG.SOUNDS];
type MusicName = (typeof AUDIO_CONFIG.MUSIC)[keyof typeof AUDIO_CONFIG.MUSIC];

const SFX_SOURCES: Record<SoundName, AVPlaybackSource> = {
  tile_tap: require('../../assets/audio/sfx_tile_tap.mp3'),
  word_valid: require('../../assets/audio/sfx_word_valid.mp3'),
  word_invalid: require('../../assets/audio/sfx_word_invalid.mp3'),
  word_duplicate: require('../../assets/audio/sfx_word_duplicate.mp3'),
  level_complete: require('../../assets/audio/sfx_level_complete.mp3'),
  button_tap: require('../../assets/audio/sfx_button_tap.mp3'),
};

const MUSIC_SOURCES: Record<MusicName, AVPlaybackSource> = {
  forest_ambient: require('../../assets/audio/music_forest_ambient.mp3'),
};

interface LoadedSound {
  sound: Audio.Sound;
}

export const AudioService = {
  _sfxSounds: {} as Record<string, LoadedSound>,
  _musicSound: null as Audio.Sound | null,
  _settings: {
    musicEnabled: true,
    sfxEnabled: true,
    hapticsEnabled: true,
  } as AppSettings,
  _initialized: false,
  _appStateSubscription: null as ReturnType<
    typeof AppState.addEventListener
  > | null,
  _musicPlaying: false,

  async initialize(): Promise<void> {
    if (this._initialized) return;

    try {
      // Load persisted settings
      this._settings = await getSettings();

      // Configure audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Preload all SFX
      await this._preloadSFX();

      // Listen for app state changes to pause/resume music
      this._appStateSubscription = AppState.addEventListener(
        'change',
        this._handleAppStateChange.bind(this),
      );

      this._initialized = true;
      console.log('[AudioService] Initialized successfully');
    } catch (error) {
      console.warn('[AudioService] Initialization error:', error);
    }
  },

  async _preloadSFX(): Promise<void> {
    const entries = Object.entries(SFX_SOURCES) as [SoundName, AVPlaybackSource][];
    for (const [name, source] of entries) {
      try {
        const {sound} = await Audio.Sound.createAsync(source, {
          volume: AUDIO_CONFIG.SFX_VOLUME,
          shouldPlay: false,
        });
        this._sfxSounds[name] = {sound};
      } catch (error) {
        console.warn(`[AudioService] Failed to preload SFX: ${name}`, error);
      }
    }
  },

  async playSFX(name: SoundName): Promise<void> {
    if (!this._settings.sfxEnabled) return;

    const loaded = this._sfxSounds[name];
    if (!loaded) return;

    try {
      await loaded.sound.setPositionAsync(0);
      await loaded.sound.playAsync();
    } catch (error) {
      console.warn(`[AudioService] Error playing SFX: ${name}`, error);
    }
  },

  async startMusic(name: MusicName = AUDIO_CONFIG.MUSIC.FOREST_AMBIENT): Promise<void> {
    if (!this._settings.musicEnabled) return;

    try {
      // Stop existing music if playing
      if (this._musicSound) {
        await this._musicSound.unloadAsync();
        this._musicSound = null;
      }

      const source = MUSIC_SOURCES[name];
      if (!source) return;

      const {sound} = await Audio.Sound.createAsync(source, {
        volume: 0,
        isLooping: true,
        shouldPlay: true,
      });

      this._musicSound = sound;
      this._musicPlaying = true;

      // Fade in
      await this._fadeMusic(0, AUDIO_CONFIG.MUSIC_VOLUME, AUDIO_CONFIG.MUSIC_FADE_IN);
    } catch (error) {
      console.warn('[AudioService] Error starting music:', error);
    }
  },

  async stopMusic(): Promise<void> {
    if (!this._musicSound) return;

    try {
      // Fade out
      await this._fadeMusic(AUDIO_CONFIG.MUSIC_VOLUME, 0, AUDIO_CONFIG.MUSIC_FADE_OUT);
      await this._musicSound.stopAsync();
      this._musicPlaying = false;
    } catch (error) {
      console.warn('[AudioService] Error stopping music:', error);
    }
  },

  async pauseMusic(): Promise<void> {
    if (!this._musicSound || !this._musicPlaying) return;

    try {
      await this._musicSound.pauseAsync();
    } catch (error) {
      console.warn('[AudioService] Error pausing music:', error);
    }
  },

  async resumeMusic(): Promise<void> {
    if (!this._musicSound || !this._musicPlaying) return;
    if (!this._settings.musicEnabled) return;

    try {
      await this._musicSound.playAsync();
    } catch (error) {
      console.warn('[AudioService] Error resuming music:', error);
    }
  },

  async _fadeMusic(from: number, to: number, duration: number): Promise<void> {
    if (!this._musicSound) return;

    const steps = 10;
    const stepDuration = duration / steps;
    const volumeStep = (to - from) / steps;

    for (let i = 0; i <= steps; i++) {
      const volume = from + volumeStep * i;
      try {
        await this._musicSound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
      } catch {
        break;
      }
      if (i < steps) {
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }
    }
  },

  _handleAppStateChange(nextAppState: AppStateStatus): void {
    if (nextAppState === 'active') {
      this.resumeMusic();
    } else if (nextAppState === 'background' || nextAppState === 'inactive') {
      this.pauseMusic();
    }
  },

  // Settings API

  async setMusicEnabled(enabled: boolean): Promise<void> {
    this._settings.musicEnabled = enabled;
    await saveSettings(this._settings);

    if (enabled) {
      await this.startMusic();
    } else {
      await this.stopMusic();
    }
  },

  async setSFXEnabled(enabled: boolean): Promise<void> {
    this._settings.sfxEnabled = enabled;
    await saveSettings(this._settings);
  },

  async setHapticsEnabled(enabled: boolean): Promise<void> {
    this._settings.hapticsEnabled = enabled;
    await saveSettings(this._settings);
  },

  isMusicEnabled(): boolean {
    return this._settings.musicEnabled;
  },

  isSFXEnabled(): boolean {
    return this._settings.sfxEnabled;
  },

  isHapticsEnabled(): boolean {
    return this._settings.hapticsEnabled;
  },

  async cleanup(): Promise<void> {
    // Unload all SFX
    for (const loaded of Object.values(this._sfxSounds)) {
      try {
        await loaded.sound.unloadAsync();
      } catch {
        // ignore cleanup errors
      }
    }
    this._sfxSounds = {};

    // Unload music
    if (this._musicSound) {
      try {
        await this._musicSound.unloadAsync();
      } catch {
        // ignore cleanup errors
      }
      this._musicSound = null;
    }

    // Remove app state listener
    if (this._appStateSubscription) {
      this._appStateSubscription.remove();
      this._appStateSubscription = null;
    }

    this._initialized = false;
    this._musicPlaying = false;
  },
};
