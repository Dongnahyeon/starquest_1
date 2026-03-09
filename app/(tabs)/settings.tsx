import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, TextInput } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/hooks/use-auth';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { trpc } from '@/lib/trpc';
import { useRouter } from 'expo-router';
import { useICloudSync } from '@/hooks/use-icloud-sync';

export default function SettingsScreen() {
  const { isAuthenticated, user, logout, loading, refresh } = useAuth();
  const colors = useColors();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { saveToICloud, restoreFromICloud, isSyncing, lastSyncTime, syncError } = useICloudSync();

  const loginMutation = trpc.auth.login.useMutation();
  const signupMutation = trpc.auth.signup.useMutation();

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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 입력해주세요');
      return;
    }

    try {
      setIsLoggingIn(true);
      const result = await loginMutation.mutateAsync({
        email,
        password,
      });

      if (result.success) {
        Alert.alert('성공', '로그인되었습니다!');
        setEmail('');
        setPassword('');
        await refresh();
      }
    } catch (error) {
      Alert.alert('로그인 실패', error instanceof Error ? error.message : '알 수 없는 오류');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignup = () => {
    router.push('/(modal)/signup');
  };

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
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.foreground }]}>이메일</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { borderColor: colors.border, backgroundColor: colors.surface, color: colors.foreground },
                    ]}
                    placeholder="이메일을 입력하세요"
                    placeholderTextColor={colors.muted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoggingIn}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.foreground }]}>비밀번호</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { borderColor: colors.border, backgroundColor: colors.surface, color: colors.foreground },
                    ]}
                    placeholder="비밀번호를 입력하세요"
                    placeholderTextColor={colors.muted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!isLoggingIn}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, styles.loginButton, { backgroundColor: colors.primary }]}
                  onPress={handleLogin}
                  disabled={isLoggingIn}
                >
                  <IconSymbol name="arrow.right.circle" size={20} color="#fff" />
                  <Text style={styles.buttonText}>{isLoggingIn ? '로그인 중...' : '로그인'}</Text>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                  <Text style={[styles.dividerText, { color: colors.muted }]}>또는</Text>
                  <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                </View>

                <TouchableOpacity
                  style={[styles.button, styles.signupButton, { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 1 }]}
                  onPress={handleSignup}
                  disabled={isLoggingIn}
                >
                  <IconSymbol name="person.badge.plus" size={20} color={colors.primary} />
                  <Text style={[styles.buttonText, { color: colors.primary }]}>회원가입</Text>
                </TouchableOpacity>

                <Text style={[styles.note, { color: colors.muted }]}>
                  💡 테스트 계정: test@example.com / password123
                </Text>
              </View>
            )}
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
  inputGroup: {
    gap: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    fontSize: 14,
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
  loginButton: {
    marginBottom: 12,
  },
  logoutButton: {},
  signupButton: {
    marginTop: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
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
});
