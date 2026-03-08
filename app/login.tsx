import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

export default function LoginScreen() {
  const { isAuthenticated, loading, refresh } = useAuth();
  const router = useRouter();
  const colors = useColors();

  // 이미 로그인되어 있으면 홈으로 이동
  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, loading]);

  const handleLogin = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // OAuth 로그인 URL로 이동
      const authUrl = 'https://api.manus.im/oauth/authorize?response_type=code&client_id=starquest';
      await WebBrowser.openBrowserAsync(authUrl);
      // 로그인 후 다시 확인
      setTimeout(() => refresh(), 1000);
    } catch (error) {
      console.error('Login failed:', error);
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
    <ScreenContainer className="flex-1 justify-center items-center p-6 gap-8">
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

      {/* 로그인 버튼 */}
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

      {/* 하단 텍스트 */}
      <View className="items-center gap-2">
        <Text className="text-sm text-muted">
          로그인하면 모든 기기에서 데이터가 동기화됩니다
        </Text>
        <Text className="text-xs text-muted">
          Manus OAuth로 안전하게 보호됩니다
        </Text>
      </View>
    </ScreenContainer>
  );
}
