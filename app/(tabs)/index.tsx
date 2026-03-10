import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
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
  const { achievements, categories, totalCompletions, totalAchievements, deleteAchievement } = useAchievementsContext();
  const { lists } = useListsContext();
  const [showIntro, setShowIntro] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedAchievementNote, setSelectedAchievementNote] = useState('');
  const [selectedAchievementTitle, setSelectedAchievementTitle] = useState('');
  const [draggedStarId, setDraggedStarId] = useState<string | null>(null);

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

  const handleViewNote = (title: string, note: string) => {
    setSelectedAchievementTitle(title);
    setSelectedAchievementNote(note);
    setShowNoteModal(true);
  };

  const handleDeleteStar = (achievementId: string, title: string) => {
    Alert.alert('별 삭제', `"${title}" 별을 삭제할까요?\n모든 완료 기록이 사라집니다.`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await deleteAchievement(achievementId);
        },
      },
    ]);
  };

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

      <FlatList
        data={currentAchievements}
        keyExtractor={(item) => item.id}
        scrollEnabled={true}
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 40 },
        ]}
        ListHeaderComponent={
          <>
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

            {/* Stars list title */}
            {currentAchievements.length > 0 && (
              <View style={styles.starsListHeader}>
                <Text style={styles.starsListTitle}>별 목록 - 롱프레스로 순서 변경</Text>
              </View>
            )}
          </>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.starCard,
              draggedStarId === item.id && styles.starCardDragging,
            ]}
            onLongPress={() => setDraggedStarId(item.id)}
            onPress={() => draggedStarId && setDraggedStarId(null)}
            activeOpacity={0.7}
          >
            <TouchableOpacity
              style={styles.starCardContent}
              onPress={() => router.push(`/detail/${item.id}` as any)}
              activeOpacity={0.8}
            >
              <View style={styles.starCardLeft}>
                <Text style={styles.starCardEmoji}>★</Text>
                <View style={styles.starCardInfo}>
                  <Text style={styles.starCardTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.starCardCount}>완료: {item.completionCount}회</Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.starCardActions}>
              {item.completionHistory && item.completionHistory.length > 0 && (
                <TouchableOpacity
                  style={styles.starCardNoteButton}
                  onPress={() => {
                    const lastNote = item.completionHistory[item.completionHistory.length - 1];
                    if (lastNote) {
                      handleViewNote(item.title, `완료 기록: ${lastNote}`);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <IconSymbol name="note.text" size={16} color="#A0AEC0" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.starCardDeleteButton}
                onPress={() => handleDeleteStar(item.id, item.title)}
                activeOpacity={0.7}
              >
                <IconSymbol name="xmark" size={16} color="#FC8181" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
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
        }
        ListFooterComponent={
          <>
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
          </>
        }
      />

      {/* Note View Modal */}
      {showNoteModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedAchievementTitle}</Text>
            <Text style={styles.modalSubtitle}>완료 기록</Text>
            
            <View style={styles.noteViewBox}>
              <Text style={styles.noteViewText}>{selectedAchievementNote}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowNoteModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  constellationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 0,
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
  starsListHeader: {
    marginBottom: 12,
  },
  starsListTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  starCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#111827',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    gap: 10,
  },
  starCardDragging: {
    backgroundColor: '#1E2A3A',
    borderColor: '#F5C842',
    opacity: 0.8,
  },
  starCardContent: {
    flex: 1,
  },
  starCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  starCardEmoji: {
    fontSize: 20,
  },
  starCardInfo: {
    flex: 1,
  },
  starCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 2,
  },
  starCardCount: {
    fontSize: 11,
    color: '#718096',
  },
  starCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starCardNoteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starCardDeleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1A1F26',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 16,
  },
  noteViewBox: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E2A3A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 20,
    minHeight: 80,
  },
  noteViewText: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 22,
  },
  modalCloseButton: {
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F5C842',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0E1A',
  },
});
