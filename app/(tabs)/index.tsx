import React, { useState, useEffect } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StarryIntro } from '@/components/StarryIntro';
import { ConstellationView } from '@/components/ConstellationView';
import { useAchievementsContext } from '@/lib/achievements-context';
import { useListsContext } from '@/lib/lists-context';
import { Category } from '@/types/achievement';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { achievements, categories, totalCompletions, totalAchievements } = useAchievementsContext();
  const { lists } = useListsContext();
  const [showIntro, setShowIntro] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // 인트로 타임아웃 폴백 (5초 후 자동으로 인트로 종료)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Get categories that have achievements
  const activeCategories = categories.filter((cat) =>
    achievements.some((a) => a.categoryId === cat.id)
  );

  // Include all categories for display
  const displayCategories = categories;

  const currentCategoryId = selectedCategoryId ?? (displayCategories[0]?.id ?? null);
  const currentCategory = displayCategories.find((c) => c.id === currentCategoryId) ?? displayCategories[0];
  const currentAchievements = achievements.filter((a) => a.categoryId === currentCategoryId);

  const totalStars = achievements.length;
  const completedStars = achievements.filter((a) => a.completionCount > 0).length;
  const progressPercent = totalStars > 0 ? (completedStars / totalStars) * 100 : 0;

  return (
    <View style={styles.root}>
      {/* Intro animation */}
      {showIntro && <StarryIntro onFinish={() => setShowIntro(false)} />}

      {/* Background */}
      <View style={styles.background}>
        {/* Nebula effects */}
        <View style={[styles.nebula, styles.nebula1]} />
        <View style={[styles.nebula, styles.nebula2]} />
      </View>

      <ScrollView style={[styles.container, { paddingTop: insets.top + 8 }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>✦ StarQuest</Text>
            <Text style={styles.headerSubtitle}>나의 별자리 성취</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.statsButton}
              onPress={() => router.push('/stats' as any)}
              activeOpacity={0.8}
            >
              <IconSymbol name="chart.bar" size={20} color="#F5C842" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/add' as any)}
              activeOpacity={0.8}
            >
              <IconSymbol name="plus" size={22} color="#0A0E1A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress bar */}
        {totalStars > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>전체 진행률</Text>
              <Text style={styles.progressCount}>
                {completedStars} / {totalStars} 별
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>
        )}

        {/* Category tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {displayCategories.map((cat) => {
            const catAchievements = achievements.filter((a) => a.categoryId === cat.id);
            const isSelected = cat.id === currentCategoryId;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryTab,
                  isSelected && { borderColor: cat.color, backgroundColor: `${cat.color}20` },
                ]}
                onPress={() => setSelectedCategoryId(cat.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={[styles.categoryName, isSelected && { color: cat.color }]}>
                  {cat.name}
                </Text>
                {catAchievements.length > 0 && (
                  <View style={[styles.categoryBadge, { backgroundColor: cat.color }]}>
                    <Text style={styles.categoryBadgeText}>{catAchievements.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Constellation view */}
        <View style={styles.constellationContainer}>
          {currentCategory && (
            <>
              <View style={styles.constellationHeader}>
                <Text style={styles.constellationTitle}>
                  {currentCategory.emoji} {currentCategory.name} 별자리
                </Text>
                <Text style={styles.constellationCount}>
                  {currentAchievements.length}개의 별
                </Text>
              </View>
              <ConstellationView
                category={currentCategory}
                achievements={currentAchievements}
              />
            </>
          )}
        </View>

        {/* Lists section */}
        {lists.length > 0 && (
          <View style={styles.listsSection}>
            <View style={styles.listsSectionHeader}>
              <Text style={styles.listsSectionTitle}>📋 나의 리스트</Text>
              <TouchableOpacity
                style={styles.addListButton}
                onPress={() => router.push('/add-list' as any)}
                activeOpacity={0.8}
              >
                <IconSymbol name="plus" size={16} color="#0A0E1A" />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.listsScroll}>
              {lists.slice(0, 6).map((list) => {
                const completionPercent = list.totalCount > 0 ? Math.round((list.completionCount / list.totalCount) * 100) : 0;
                return (
                  <TouchableOpacity
                    key={list.id}
                    style={styles.listCard}
                    onPress={() => router.push(`/list/${list.id}` as any)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.listCardEmoji}>📋</Text>
                    <Text style={styles.listCardTitle} numberOfLines={2}>
                      {list.title}
                    </Text>
                    <View style={styles.listCardProgress}>
                      <View style={styles.listCardProgressBg}>
                        <View
                          style={[
                            styles.listCardProgressFill,
                            { width: `${completionPercent}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.listCardProgressText}>
                        {list.completionCount}/{list.totalCount}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Empty state */}
        {totalStars === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStarText}>✦</Text>
            <Text style={styles.emptyTitle}>아직 별이 없어요</Text>
            <Text style={styles.emptySubtitle}>
              성취 목표를 추가하면{'\n'}나만의 별자리가 만들어져요
            </Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={() => router.push('/add' as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyAddButtonText}>첫 번째 별 추가하기</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
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
  nebula: {
    position: 'absolute',
    borderRadius: 999,
  },
  nebula1: {
    width: 350,
    height: 350,
    backgroundColor: '#553C9A',
    opacity: 0.04,
    top: -80,
    left: -100,
  },
  nebula2: {
    width: 280,
    height: 280,
    backgroundColor: '#2B6CB0',
    opacity: 0.05,
    bottom: 100,
    right: -80,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F5C842',
    letterSpacing: 1,
    textShadowColor: '#F5C842',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  statsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E2A3A',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5C842',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F5C842',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#718096',
  },
  progressCount: {
    fontSize: 12,
    color: '#F5C842',
    fontWeight: '600',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#1E2A3A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F5C842',
    borderRadius: 2,
    shadowColor: '#F5C842',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  categoryScroll: {
    maxHeight: 60,
    marginBottom: 8,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    backgroundColor: '#111827',
    gap: 5,
    position: 'relative',
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryName: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '500',
  },
  categoryBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    marginLeft: 2,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: '#0A0E1A',
    fontWeight: '700',
  },
  constellationContainer: {
    flex: 1,
  },
  constellationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  constellationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  constellationCount: {
    fontSize: 12,
    color: '#718096',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: -60,
  },
  emptyStarText: {
    fontSize: 60,
    color: '#2D3748',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A5568',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#2D3748',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  emptyAddButton: {
    backgroundColor: '#F5C842',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#F5C842',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyAddButtonText: {
    color: '#0A0E1A',
    fontSize: 15,
    fontWeight: '700',
  },
  listsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  listsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listsSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  addListButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  listsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  listCard: {
    width: 140,
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  listCardEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  listCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 16,
  },
  listCardProgress: {
    width: '100%',
    gap: 4,
  },
  listCardProgressBg: {
    height: 4,
    backgroundColor: '#1E2A3A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  listCardProgressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 2,
  },
  listCardProgressText: {
    fontSize: 10,
    color: '#718096',
    textAlign: 'center',
  },
});
