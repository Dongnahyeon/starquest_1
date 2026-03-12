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
  const { data, totalCompletions, totalAchievements } = useAchievementsContext();
  const achievements = (data && data.achievements && Array.isArray(data.achievements)) ? data.achievements : [];
  const categories = (data && data.categories && Array.isArray(data.categories)) ? data.categories : [];
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
  const activeCategories = (categories && Array.isArray(categories)) ? categories.filter((cat) =>
    achievements.some((a) => a.categoryId === cat.id)
  ) : [];

  // Include all categories for display
  const displayCategories = (categories && Array.isArray(categories)) ? categories : [];
  
  // Add "전체" option at the beginning
  const allCategoriesOption: Category = {
    id: 'all',
    name: '전체',
    emoji: '⭐',
    color: '#F5C842',
    createdAt: new Date().toISOString(),
  };
  const categoriesWithAll = [allCategoriesOption, ...displayCategories];

  const currentCategoryId = selectedCategoryId ?? 'all';
  const currentCategory = categoriesWithAll.find((c) => c.id === currentCategoryId) ?? categoriesWithAll[0];
  const currentAchievements = currentCategoryId === 'all' 
    ? achievements 
    : achievements.filter((a) => a.categoryId === currentCategoryId);

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
        
        {/* Twinkling stars */}
        {[...Array(30)].map((_, i) => (
          <Animated.View
            key={`star-${i}`}
            style={[
              styles.twinklingStar,
              {
                left: `${(i * 13 + 7) % 100}%`,
                top: `${(i * 17 + 11) % 100}%`,
                opacity: 0.3 + (Math.sin(i * 0.5) * 0.3),
              },
            ]}
          />
        ))}
      </View>

      <ScrollView style={[styles.container, { paddingTop: insets.top + 8 }]} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
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

        {/* Progress bar - REMOVED */}

        {/* Category tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {categoriesWithAll.map((cat) => {
            const catAchievements = cat.id === 'all' 
              ? achievements 
              : achievements.filter((a) => a.categoryId === cat.id);
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
  twinklingStar: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
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
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryScrollContent: {
    gap: 8,
    paddingHorizontal: 20,
    paddingRight: 20,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    backgroundColor: '#111827',
    gap: 6,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A0AEC0',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A0E1A',
  },
  constellationContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  constellationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  constellationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  constellationCount: {
    fontSize: 13,
    color: '#718096',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStarText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyAddButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F5C842',
  },
  emptyAddButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A0E1A',
  },
  listsSection: {
    marginTop: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  listsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  addListButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  listCard: {
    width: 140,
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    marginRight: 8,
    alignItems: 'center',
  },
  listCardEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  listCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
    textAlign: 'center',
    marginBottom: 8,
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
    fontSize: 11,
    color: '#718096',
    textAlign: 'center',
  },
});
