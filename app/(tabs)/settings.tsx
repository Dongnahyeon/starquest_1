import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/hooks/use-auth';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function SettingsScreen() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const colors = useColors();

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('성공', '로그아웃되었습니다!');
    } catch (error) {
      Alert.alert('로그아웃 실패', error instanceof Error ? error.message : '알 수 없는 오류');
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>⚙️ 설정</Text>
          </View>

          {/* Auth Section */}
          <View style={[styles.section, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>계정 관리</Text>

            {isAuthenticated ? (
              <View>
                <View style={styles.userInfo}>
                  <Text style={[styles.userLabel, { color: colors.muted }]}>로그인된 계정:</Text>
                  <Text style={[styles.userEmail, { color: colors.foreground }]}>
                    {user?.email || user?.name || '사용자'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.button, styles.logoutButton, { backgroundColor: colors.error }]}
                  onPress={handleLogout}
                  disabled={loading}
                >
                  <IconSymbol name="arrow.right.circle" size={20} color="#fff" />
                  <Text style={styles.buttonText}>{loading ? '로그아웃 중...' : '로그아웃'}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={[styles.note, { color: colors.muted }]}>
                  🔓 현재 로그인되지 않았습니다. 클라우드 동기화를 사용하려면 로그인이 필요합니다.
                </Text>
                <Text style={[styles.note, { color: colors.muted, marginTop: 12 }]}>
                  💡 팁: 현재는 로컬 저장소에만 데이터가 저장됩니다.
                </Text>
              </View>
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
              <Text style={[styles.infoLabel, { color: colors.muted }]}>동기화 상태</Text>
              <Text style={[styles.infoValue, { color: isAuthenticated ? colors.success : colors.warning }]}>
                {isAuthenticated ? '활성화' : '비활성화'}
              </Text>
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
  userInfo: {
    gap: 8,
    marginBottom: 16,
  },
  userLabel: {
    fontSize: 12,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '600',
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
  logoutButton: {},
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 13,
    lineHeight: 20,
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
});
