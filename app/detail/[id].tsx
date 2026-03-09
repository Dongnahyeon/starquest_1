import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAchievementsContext } from '@/lib/achievements-context';
import { getStarBrightness, getStarColor, getStarGlowIntensity } from '@/types/achievement';

const BRIGHTNESS_LABELS: Record<string, string> = {
  dim: '미완성 별',
  faint: '희미한 별',
  bright: '빛나는 별',
  supernova: '초신성',
};

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getAchievementById, getCategoryById, completeAchievement, uncompleteAchievement, deleteAchievement } =
    useAchievementsContext();

  const achievement = getAchievementById(id);
  const category = achievement ? getCategoryById(achievement.categoryId) : null;

  const starScale = useRef(new Animated.Value(1)).current;
  const starGlow = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (achievement) {
      Animated.timing(starGlow, {
        toValue: getStarGlowIntensity(achievement.completionCount),
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [achievement?.completionCount]);

  const handleComplete = async () => {
    if (!achievement || isAnimating) return;
    setIsAnimating(true);

    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Star burst animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(starScale, {
          toValue: 1.5,
          friction: 3,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.timing(starGlow, {
          toValue: Math.min(getStarGlowIntensity(achievement.completionCount + 1), 1),
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(starScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start(() => setIsAnimating(false));

    await completeAchievement(achievement.id);
  };

  const handleUncomplete = async () => {
    if (!achievement) return;
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await uncompleteAchievement(achievement.id);
  };

  const handleDelete = () => {
    Alert.alert(
      '별 삭제',
      `"${achievement?.title}" 별을 삭제할까요?\n모든 완료 기록이 사라집니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            if (achievement) {
              await deleteAchievement(achievement.id);
              router.back();
            }
          },
        },
      ]
    );
  };

  if (!achievement) {
    return (
      <View style={styles.root}>
        <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="arrow.left" size={24} color="#E2E8F0" />
          </TouchableOpacity>
          <View style={styles.notFound}>
            <Text style={styles.notFoundText}>별을 찾을 수 없어요</Text>
          </View>
        </View>
      </View>
    );
  }

  const starColor = getStarColor(achievement.completionCount);
  const brightness = getStarBrightness(achievement.completionCount);
  const glowIntensity = getStarGlowIntensity(achievement.completionCount);

  return (
    <View style={styles.root}>
      {/* Background */}
      <View style={styles.background}>
        <Animated.View
          style={[
            styles.bgGlow,
            {
              backgroundColor: starColor,
              opacity: Animated.multiply(starGlow, 0.08),
            },
          ]}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 8 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="arrow.left" size={24} color="#E2E8F0" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <IconSymbol name="trash.fill" size={20} color="#FC8181" />
          </TouchableOpacity>
        </View>

        {/* Category badge */}
        {category && (
          <View style={[styles.categoryBadge, { backgroundColor: `${category.color}25`, borderColor: `${category.color}50` }]}>
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <Text style={[styles.categoryName, { color: category.color }]}>{category.name}</Text>
          </View>
        )}

        {/* Star visualization */}
        <View style={styles.starSection}>
          {/* Outer glow rings */}
          {glowIntensity > 0 && (
            <>
              <Animated.View
                style={[
                  styles.glowRing,
                  {
                    width: 200,
                    height: 200,
                    borderRadius: 100,
                    backgroundColor: starColor,
                    opacity: Animated.multiply(starGlow, 0.08),
                    transform: [{ scale: starScale }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.glowRing,
                  {
                    width: 140,
                    height: 140,
                    borderRadius: 70,
                    backgroundColor: starColor,
                    opacity: Animated.multiply(starGlow, 0.15),
                    transform: [{ scale: starScale }],
                  },
                ]}
              />
            </>
          )}
          <Animated.Text
            style={[
              styles.starEmoji,
              {
                color: starColor,
                textShadowColor: starColor,
                textShadowRadius: glowIntensity * 30,
                transform: [{ scale: starScale }],
              },
            ]}
          >
            ★
          </Animated.Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{achievement.title}</Text>

        {/* Brightness status */}
        <View style={[styles.statusBadge, { backgroundColor: `${starColor}20`, borderColor: `${starColor}40` }]}>
          <Text style={[styles.statusText, { color: starColor }]}>
            {BRIGHTNESS_LABELS[brightness]}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{achievement.completionCount}</Text>
            <Text style={styles.statLabel}>총 완료 횟수</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {achievement.lastCompletedAt ? formatDate(achievement.lastCompletedAt) : '-'}
            </Text>
            <Text style={styles.statLabel}>마지막 완료</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          {achievement.completionCount > 0 && (
            <TouchableOpacity
              style={styles.uncompleteButton}
              onPress={handleUncomplete}
              activeOpacity={0.7}
            >
              <IconSymbol name="xmark" size={18} color="#718096" />
              <Text style={styles.uncompleteButtonText}>취소</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.completeButton, { backgroundColor: starColor, shadowColor: starColor }]}
            onPress={handleComplete}
            activeOpacity={0.8}
          >
            <IconSymbol name="checkmark.circle.fill" size={22} color="#0A0E1A" />
            <Text style={styles.completeButtonText}>완료하기</Text>
          </TouchableOpacity>
        </View>

        {/* Completion history */}
        {achievement.completionHistory.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>완료 기록</Text>
            {achievement.completionHistory
              .slice()
              .reverse()
              .slice(0, 10)
              .map((date, i) => (
                <View key={i} style={styles.historyItem}>
                  <View style={[styles.historyDot, { backgroundColor: starColor }]} />
                  <Text style={styles.historyDate}>{formatFullDate(date)}</Text>
                </View>
              ))}
          </View>
        )}

        {/* Bottom padding */}
        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>
    </View>
  );
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatFullDate(isoString: string): string {
  const date = new Date(isoString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bgGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E2A3A',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E2A3A',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    marginBottom: 24,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  starSection: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginBottom: 20,
  },
  glowRing: {
    position: 'absolute',
  },
  starEmoji: {
    fontSize: 80,
    textShadowOffset: { width: 0, height: 0 },
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E2E8F0',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 32,
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 28,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    padding: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#1E2A3A',
    marginHorizontal: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  uncompleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    backgroundColor: '#111827',
    gap: 6,
  },
  uncompleteButtonText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '600',
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 5,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0E1A',
  },
  historySection: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    padding: 16,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#718096',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2A3A',
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  historyDate: {
    fontSize: 13,
    color: '#A0AEC0',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#718096',
  },
});
