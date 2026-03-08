import { View, Text, Animated } from 'react-native';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useRef } from 'react';
import { useColors } from '@/hooks/use-colors';

/**
 * 앱 상단에 동기화 상태를 표시하는 컴포넌트
 */
export function SyncStatusBar() {
  const { isAuthenticated } = useAuth();
  const colors = useColors();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // 동기화 중 상태 애니메이션
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  if (!isAuthenticated) {
    return (
      <View
        style={{
          backgroundColor: colors.warning,
          paddingVertical: 8,
          paddingHorizontal: 12,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 12, color: '#000', fontWeight: '600' }}>
          🔓 로그인이 필요합니다
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: colors.success,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <Animated.Text
        style={{
          fontSize: 14,
          transform: [{ scale: pulseAnim }],
        }}
      >
        ✓
      </Animated.Text>
      <Text style={{ fontSize: 12, color: '#000', fontWeight: '600' }}>
        ☁️ 클라우드 동기화 활성화
      </Text>
    </View>
  );
}
