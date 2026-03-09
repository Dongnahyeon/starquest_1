import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useICloudSync } from '@/hooks/use-icloud-sync';

export default function SettingsScreen() {
  const colors = useColors();
  const { saveToICloud, restoreFromICloud, isSyncing, lastSyncTime, syncError } = useICloudSync();

  const handleSaveToICloud = async () => {
    try {
      const success = await saveToICloud();
      if (success) {
        Alert.alert('성공', 'iCloud에 데이터가 저장되었습니다!');
      } else {
        Alert.alert('오류', 'iCloud 저장에 실패했습니다');
      }
    } catch (error) {
      Alert.alert('오류', error instanceof Error ? error.message : '알 수 없는 오류');
    }
  };

  const handleRestoreFromICloud = async () => {
    Alert.alert(
      '복구 확인',
      'iCloud에서 데이터를 복구하시겠습니까? 기존 로컬 데이터와 병합됩니다.',
      [
        { text: '취소', onPress: () => {}, style: 'cancel' },
        {
          text: '복구',
          onPress: async () => {
            try {
              const success = await restoreFromICloud();
              if (success) {
                Alert.alert('성공', 'iCloud에서 데이터가 복구되었습니다!');
              } else {
                Alert.alert('오류', 'iCloud 복구에 실패했습니다');
              }
            } catch (error) {
              Alert.alert('오류', error instanceof Error ? error.message : '알 수 없는 오류');
            }
          },
          style: 'default',
        },
      ]
    );
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>⚙️ 설정</Text>
          </View>

          {/* iCloud Backup Section */}
          <View style={[styles.section, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>☁️ iCloud 백업</Text>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleSaveToICloud}
              disabled={isSyncing}
            >
              <IconSymbol name="arrow.up.circle" size={20} color="#fff" />
              <Text style={styles.buttonText}>{isSyncing ? '저장 중...' : 'iCloud에 저장'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleRestoreFromICloud}
              disabled={isSyncing}
            >
              <IconSymbol name="arrow.down.circle" size={20} color="#fff" />
              <Text style={styles.buttonText}>{isSyncing ? '복구 중...' : 'iCloud에서 복구'}</Text>
            </TouchableOpacity>

            {lastSyncTime && (
              <Text style={[styles.note, { color: colors.muted }]}>
                마지막 동기화: {lastSyncTime.toLocaleString('ko-KR')}
              </Text>
            )}

            {syncError && (
              <Text style={[styles.note, { color: colors.error }]}>
                오류: {syncError}
              </Text>
            )}
          </View>

          {/* Info Section */}
          <View style={[styles.section, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>앱 정보</Text>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.muted }]}>버전</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>1.0.0</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.muted }]}>저장소</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>iCloud + 로컬</Text>
            </View>
          </View>

          {/* Help Section */}
          <View style={[styles.section, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>💡 도움말</Text>
            <Text style={[styles.helpText, { color: colors.muted }]}>
              • 데이터는 자동으로 로컬에 저장됩니다.{"\n"}
              • 정기적으로 "iCloud에 저장"을 눌러 백업하세요.{"\n"}
              • 새 기기에서 앱을 설치한 후 "iCloud에서 복구"를 누르면 데이터를 복구할 수 있습니다.{"\n"}
              • iCloud 백업은 5년 이상 안전하게 보관됩니다.
            </Text>
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
    gap: 24,
  },
  header: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  note: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
