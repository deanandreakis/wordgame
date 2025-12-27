import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Clipboard,
  Alert,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {GAME_CONFIG} from '@/config/constants';
import {logCapture, LogEntry} from '@/utils/logCapture';

interface Props {
  onBack: () => void;
}

export const LogScreen: React.FC<Props> = ({onBack}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    // Initial load
    setLogs(logCapture.getLogs());

    // Auto-refresh every second
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        setLogs(logCapture.getLogs());
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleCopyAll = () => {
    const text = logCapture.getLogsAsText();
    Clipboard.setString(text);
    Alert.alert('Copied!', 'All logs copied to clipboard', [{text: 'OK'}]);
  };

  const handleClearLogs = () => {
    Alert.alert(
      'Clear Logs?',
      'Are you sure you want to clear all logs?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            logCapture.clearLogs();
            setLogs([]);
          },
        },
      ]
    );
  };

  const handleRefresh = () => {
    setLogs(logCapture.getLogs());
  };

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return '#ff4444';
      case 'warn':
        return '#ffaa00';
      case 'info':
        return '#44aaff';
      default:
        return GAME_CONFIG.COLORS.textSecondary;
    }
  };

  return (
    <LinearGradient
      colors={[GAME_CONFIG.COLORS.background, GAME_CONFIG.COLORS.backgroundLight]}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Debug Logs</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={handleRefresh} style={styles.controlButton}>
            <Text style={styles.controlButtonText}>🔄 Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setAutoRefresh(!autoRefresh)}
            style={[styles.controlButton, autoRefresh && styles.controlButtonActive]}>
            <Text style={styles.controlButtonText}>
              {autoRefresh ? '⏸️ Pause' : '▶️ Auto'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCopyAll} style={styles.controlButton}>
            <Text style={styles.controlButtonText}>📋 Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClearLogs} style={styles.controlButton}>
            <Text style={styles.controlButtonText}>🗑️ Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Log count */}
        <View style={styles.logCount}>
          <Text style={styles.logCountText}>
            {logs.length} log{logs.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Logs */}
        <ScrollView style={styles.logsContainer} contentContainerStyle={styles.logsContent}>
          {logs.length === 0 ? (
            <Text style={styles.emptyText}>No logs yet</Text>
          ) : (
            logs.map((log, index) => (
              <View key={index} style={styles.logEntry}>
                <Text style={styles.logTimestamp}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </Text>
                <Text style={[styles.logLevel, {color: getLogColor(log.level)}]}>
                  [{log.level.toUpperCase()}]
                </Text>
                <Text style={styles.logMessage}>{log.message}</Text>
              </View>
            ))
          )}
        </ScrollView>
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
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: GAME_CONFIG.COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: GAME_CONFIG.COLORS.text,
  },
  headerSpacer: {
    width: 60,
  },
  controls: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  controlButton: {
    flex: 1,
    backgroundColor: GAME_CONFIG.COLORS.cardBg,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: GAME_CONFIG.COLORS.primary,
  },
  controlButtonText: {
    color: GAME_CONFIG.COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  logCount: {
    padding: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  logCountText: {
    color: GAME_CONFIG.COLORS.textSecondary,
    fontSize: 12,
  },
  logsContainer: {
    flex: 1,
  },
  logsContent: {
    padding: 12,
  },
  emptyText: {
    color: GAME_CONFIG.COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },
  logEntry: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: GAME_CONFIG.COLORS.primary,
  },
  logTimestamp: {
    color: GAME_CONFIG.COLORS.textSecondary,
    fontSize: 10,
    marginBottom: 4,
  },
  logLevel: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  logMessage: {
    color: GAME_CONFIG.COLORS.text,
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
