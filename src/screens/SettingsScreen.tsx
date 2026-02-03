import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {GAME_CONFIG} from '@/config/constants';
import {AudioService} from '@/services/audio';

interface Props {
  onBack: () => void;
}

export const SettingsScreen: React.FC<Props> = ({onBack}) => {
  const [musicEnabled, setMusicEnabled] = useState(AudioService.isMusicEnabled());
  const [sfxEnabled, setSfxEnabled] = useState(AudioService.isSFXEnabled());
  const [hapticsEnabled, setHapticsEnabled] = useState(AudioService.isHapticsEnabled());

  const handleMusicToggle = async (value: boolean) => {
    setMusicEnabled(value);
    await AudioService.setMusicEnabled(value);
  };

  const handleSfxToggle = async (value: boolean) => {
    setSfxEnabled(value);
    await AudioService.setSFXEnabled(value);
  };

  const handleHapticsToggle = async (value: boolean) => {
    setHapticsEnabled(value);
    await AudioService.setHapticsEnabled(value);
  };

  return (
    <LinearGradient
      colors={[GAME_CONFIG.COLORS.background, GAME_CONFIG.COLORS.backgroundLight]}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <LinearGradient
            colors={[GAME_CONFIG.COLORS.cardBg, GAME_CONFIG.COLORS.tile]}
            style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Music</Text>
                <Text style={styles.settingDescription}>Background music</Text>
              </View>
              <Switch
                value={musicEnabled}
                onValueChange={handleMusicToggle}
                trackColor={{
                  false: GAME_CONFIG.COLORS.backgroundLight,
                  true: GAME_CONFIG.COLORS.primary,
                }}
                thumbColor={musicEnabled ? GAME_CONFIG.COLORS.glowGreen : GAME_CONFIG.COLORS.textSecondary}
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Sound Effects</Text>
                <Text style={styles.settingDescription}>Tile taps, word validation, level complete</Text>
              </View>
              <Switch
                value={sfxEnabled}
                onValueChange={handleSfxToggle}
                trackColor={{
                  false: GAME_CONFIG.COLORS.backgroundLight,
                  true: GAME_CONFIG.COLORS.primary,
                }}
                thumbColor={sfxEnabled ? GAME_CONFIG.COLORS.glowGreen : GAME_CONFIG.COLORS.textSecondary}
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Haptics</Text>
                <Text style={styles.settingDescription}>Vibration feedback</Text>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={handleHapticsToggle}
                trackColor={{
                  false: GAME_CONFIG.COLORS.backgroundLight,
                  true: GAME_CONFIG.COLORS.primary,
                }}
                thumbColor={hapticsEnabled ? GAME_CONFIG.COLORS.glowGreen : GAME_CONFIG.COLORS.textSecondary}
              />
            </View>
          </LinearGradient>
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(111, 216, 142, 0.15)',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: GAME_CONFIG.COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: GAME_CONFIG.COLORS.text,
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: GAME_CONFIG.COLORS.text,
  },
  settingDescription: {
    fontSize: 13,
    color: GAME_CONFIG.COLORS.textSecondary,
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(111, 216, 142, 0.1)',
    marginHorizontal: 16,
  },
});
