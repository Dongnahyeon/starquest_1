import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Switch,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/screen-container';
import { useAchievementsContext } from '@/lib/achievements-context';
import { useListsContext } from '@/lib/lists-context';
import { useThemeContext } from '@/lib/theme-provider';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { achievements } = useAchievementsContext();
  const { lists } = useListsContext();
  const { colorScheme, setColorScheme } = useThemeContext();
  const systemColorScheme = useColorScheme();
  
  const [isExporting, setIsExporting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);

  // 설정 로드
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const pushEnabled = await AsyncStorage.getItem('pushNotificationsEnabled');
      const reminderEnabled = await AsyncStorage.getItem('dailyReminderEnabled');
      
      if (pushEnabled !== null) setPushNotificationsEnabled(JSON.parse(pushEnabled));
      if (reminderEnabled !== null) setDailyReminderEnabled(JSON.parse(reminderEnabled));
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleDarkModeToggle = (value: boolean) => {
    setIsDarkMode(value);
    setColorScheme(value ? 'dark' : 'light');
  };

  const handlePushNotificationsToggle = async (value: boolean) => {
    setPushNotificationsEnabled(value);
    await AsyncStorage.setItem('pushNotificationsEnabled', JSON.stringify(value));
  };

  const handleDailyReminderToggle = async (value: boolean) => {
    setDailyReminderEnabled(value);
    await AsyncStorage.setItem('dailyReminderEnabled', JSON.stringify(value));
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);

      const exportData = {
        exportDate: new Date().toISOString(),
        achievements: achievements,
        lists: lists,
      };

      const jsonString = JSON.stringify(exportData, null, 2);

      if (typeof window !== 'undefined') {
        const element = document.createElement('a');
        element.setAttribute(
          'href',
          'data:text/json;charset=utf-8,' + encodeURIComponent(jsonString)
        );
        element.setAttribute(
          'download',
          `starquest-backup-${new Date().toISOString().split('T')[0]}.json`
        );
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        Alert.alert('성공', '데이터가 내보내기 되었습니다.');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('오류', '데이터 내보내기에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      '모든 데이터 삭제',
      '정말로 모든 별자리와 리스트 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        {
          text: '취소',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: '삭제',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['achievements', 'lists']);
              Alert.alert('완료', '모든 데이터가 삭제되었습니다.');
              // 앱 새로고침을 위해 홈으로 이동
              router.push('/');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('오류', '데이터 삭제에 실패했습니다.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const totalAchievements = (achievements && Array.isArray(achievements)) ? achievements.length : 0;
  const completedAchievements = (achievements && Array.isArray(achievements)) ? achievements.filter(a => a.completionCount > 0).length : 0;
  const totalLists = (lists && Array.isArray(lists)) ? lists.length : 0;

  const isDark = isDarkMode;
  const colors = {
    background: isDark ? '#0F1419' : '#FFFFFF',
    surface: isDark ? '#1A1F26' : '#F5F5F5',
    text: isDark ? '#ECEDEE' : '#11181C',
    textSecondary: isDark ? '#9BA1A6' : '#687076',
    border: isDark ? '#334155' : '#E5E7EB',
    primary: '#0a7ea4',
    success: '#22C55E',
    error: '#EF4444',
  };

  return (
    <ScreenContainer className="flex-1" containerClassName="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>⚙️ 설정</Text>
          </View>

          {/* 디스플레이 섹션 */}
          <View style={[styles.section, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🎨 디스플레이</Text>
            <View style={[styles.settingItem, { backgroundColor: colors.surface }]}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>다크 모드</Text>
              <Switch
                value={isDarkMode}
                onValueChange={handleDarkModeToggle}
                trackColor={{ false: '#ccc', true: '#22C55E' }}
                thumbColor={isDarkMode ? '#22C55E' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* 알림 섹션 */}
          <View style={[styles.section, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>⚠️ 알림</Text>
            <View style={[styles.settingItem, { backgroundColor: colors.surface }]}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>푸시 알림</Text>
              <Switch
                value={pushNotificationsEnabled}
                onValueChange={handlePushNotificationsToggle}
                trackColor={{ false: '#ccc', true: '#22C55E' }}
                thumbColor={pushNotificationsEnabled ? '#22C55E' : '#f4f3f4'}
              />
            </View>
            <View style={[styles.settingItem, { backgroundColor: colors.surface, marginTop: 8 }]}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>알림 리마인더</Text>
              <Switch
                value={dailyReminderEnabled}
                onValueChange={handleDailyReminderToggle}
                trackColor={{ false: '#ccc', true: '#A855F7' }}
                thumbColor={dailyReminderEnabled ? '#A855F7' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* 데이터 섹션 */}
          <View style={[styles.section, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>👤 데이터</Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, { opacity: isExporting ? 0.6 : 1 }]}
              onPress={handleExportData}
              disabled={isExporting}
            >
              <Text style={styles.buttonText}>
                {isExporting ? '내보내는 중...' : '데이터 내보내기'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonDanger]}
              onPress={handleDeleteAllData}
            >
              <Text style={styles.buttonText}>모든 데이터 삭제</Text>
            </TouchableOpacity>
          </View>

          {/* 통계 섹션 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>📊 통계</Text>
            <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>별자리</Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>{totalAchievements}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>완료</Text>
                <Text style={[styles.statValue, { color: colors.success }]}>{completedAchievements}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>리스트</Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>{totalLists}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonPrimary: {
    backgroundColor: '#0a7ea4',
  },
  buttonDanger: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
