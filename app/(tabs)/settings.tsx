import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/screen-container';
import { useAchievementsContext } from '@/lib/achievements-context';
import { useListsContext } from '@/lib/lists-context';
import { useState } from 'react';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { achievements } = useAchievementsContext();
  const { lists } = useListsContext();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    try {
      setIsExporting(true);

      // 데이터를 JSON 형식으로 준비
      const exportData = {
        exportDate: new Date().toISOString(),
        achievements: achievements,
        lists: lists,
      };

      // JSON 문자열로 변환
      const jsonString = JSON.stringify(exportData, null, 2);

      // 웹 환경에서 다운로드
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

  const totalAchievements = achievements.length;
  const completedAchievements = achievements.filter(a => a.completed).length;
  const totalLists = lists.length;

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>설정</Text>
          </View>

          {/* 통계 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>통계</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>별자리</Text>
                <Text style={styles.statValue}>{totalAchievements}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>완료</Text>
                <Text style={styles.statValue}>{completedAchievements}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>리스트</Text>
                <Text style={styles.statValue}>{totalLists}</Text>
              </View>
            </View>
          </View>

          {/* 데이터 내보내기 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>데이터</Text>
            <TouchableOpacity
              style={[styles.button, isExporting && styles.buttonDisabled]}
              onPress={handleExportData}
              disabled={isExporting}
            >
              <Text style={styles.buttonText}>
                {isExporting ? '내보내는 중...' : '데이터 내보내기'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.description}>
              현재 모든 별자리와 리스트 데이터를 JSON 파일로 내보냅니다.
            </Text>
          </View>

          {/* 정보 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>정보</Text>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>앱 버전</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
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
    color: '#11181C',
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#687076',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  button: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    color: '#687076',
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#11181C',
  },
  infoValue: {
    fontSize: 14,
    color: '#687076',
  },
});
