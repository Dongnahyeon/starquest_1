import { View, Text, Pressable, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

export default function LoginScreen() {
  const { isAuthenticated, loading, refresh } = useAuth();
  const router = useRouter();
  const colors = useColors();
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  // 이미 로그인되어 있으면 홈으로 이동
  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, loading]);

  const handleLogin = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // 웹 플랫폼: 직접 리다이렉트
      if (Platform.OS === 'web') {
        // 로그인 후 돌아올 URL
        const redirectUrl = window.location.origin;
        const authUrl = `https://api.manus.im/oauth/authorize?response_type=code&client_id=starquest&redirect_uri=${encodeURIComponent(redirectUrl)}`;
        window.location.href = authUrl;
      } else {
        // 네이티브 플랫폼: WebBrowser 사용
        const authUrl = 'https://api.manus.im/oauth/authorize?response_type=code&client_id=starquest';
        await WebBrowser.openBrowserAsync(authUrl);
        // 로그인 후 다시 확인
        setTimeout(() => refresh(), 1000);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleTestLogin = async () => {
    if (!testEmail || !testPassword) {
      alert('이메일과 비밀번호를 입력해주세요');
      return;
    }

    try {
      setTestLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const response = await fetch('https://starquest.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Test login successful:', data);
        // 로그인 성공 후 새로고침
        setTimeout(() => refresh(), 500);
      } else {
        const error = await response.text();
        console.error('Test login failed:', error);
        alert('로그인 실패: ' + error);
      }
    } catch (error) {
      console.error('Test login error:', error);
      alert('로그인 중 오류 발생: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1 p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="gap-8">
        {/* 헤더 */}
        <View className="items-center gap-4">
          <Text className="text-6xl">✦</Text>
          <Text className="text-4xl font-bold text-foreground">StarQuest</Text>
          <Text className="text-lg text-muted text-center">
            별자리처럼 성취를 기록하고 추적하세요
          </Text>
        </View>

        {/* 설명 */}
        <View className="bg-surface rounded-2xl p-6 gap-4">
          <View className="flex-row gap-3">
            <Text className="text-2xl">🌟</Text>
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">성취 목표 추적</Text>
              <Text className="text-sm text-muted">
                개인 목표를 등록하고 완료 시 별이 밝아집니다
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <Text className="text-2xl">📋</Text>
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">리스트 관리</Text>
              <Text className="text-sm text-muted">
                책 100권 읽기, 미술관 방문 등 큰 목표를 관리하세요
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <Text className="text-2xl">🏆</Text>
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">배지 획득</Text>
              <Text className="text-sm text-muted">
                성취를 이루면서 특별한 배지를 수집하세요
              </Text>
            </View>
          </View>
        </View>

        {/* OAuth 로그인 버튼 */}
        <View className="gap-3">
          <Pressable
            onPress={handleLogin}
            style={({ pressed }) => [
              {
                backgroundColor: colors.primary,
                paddingVertical: 16,
                paddingHorizontal: 32,
                borderRadius: 12,
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Text className="text-base font-semibold text-background text-center">
              로그인하기
            </Text>
          </Pressable>

          {/* 테스트 로그인 섹션 */}
          <View className="border-t border-border pt-4 mt-4">
            <Text className="text-xs text-muted text-center mb-3">
              테스트 로그인 (개발용)
            </Text>
            
            <View className="gap-2 mb-3">
              <Text className="text-xs text-muted">이메일:</Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <Text
                  onPress={() => setTestEmail('test@example.com')}
                  className="text-sm text-foreground"
                >
                  test@example.com
                </Text>
              </View>
            </View>

            <View className="gap-2 mb-4">
              <Text className="text-xs text-muted">비밀번호:</Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <Text
                  onPress={() => setTestPassword('password123')}
                  className="text-sm text-foreground"
                >
                  password123
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleTestLogin}
              disabled={testLoading}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.surface,
                  paddingVertical: 12,
                  paddingHorizontal: 32,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: pressed || testLoading ? 0.7 : 1,
                },
              ]}
            >
              {testLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text className="text-sm font-semibold text-foreground text-center">
                  테스트 로그인
                </Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* 하단 텍스트 */}
        <View className="items-center gap-2">
          <Text className="text-sm text-muted">
            로그인하면 모든 기기에서 데이터가 동기화됩니다
          </Text>
          <Text className="text-xs text-muted">
            Manus OAuth로 안전하게 보호됩니다
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
