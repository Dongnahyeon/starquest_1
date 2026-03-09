import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StarIcon } from '@/components/StarIcon';
import { useAchievementsContext } from '@/lib/achievements-context';
import { useListsContext } from '@/lib/lists-context';
import { Achievement, Category } from '@/types/achievement';
import { ScreenContainer } from '@/components/screen-container';

export default function ListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { achievements, categories, completeAchievement, deleteAchievement } = useAchievementsContext();
  const { lists, deleteList } = useListsContext();
  const [selectedTab, setSelectedTab] = useState<'achievements' | 'lists'>('achievements');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'all'>('all');
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  const filteredAchievements =
    selectedCategoryId === 'all'
      ? achievements
      : achievements.filter((a) => a.categoryId === selectedCategoryId);

  // Group by category
  const grouped = categories
    .map((cat) => ({
      category: cat,
      items: filteredAchievements.filter((a) => a.categoryId === cat.id),
    }))
    .filter((g) => g.items.length > 0);

  const handleComplete = async (achievement: Achievement) => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setJustCompleted(achievement.id);
    await completeAchievement(achievement.id);
    setTimeout(() => setJustCompleted(null), 800);
  };

  const handleDelete = (achievement: Achievement) => {
    Alert.alert(
      '별 삭제',
      `"${achievement.title}" 별을 삭제할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => deleteAchievement(achievement.id),
        },
      ]
    );
  };

  const handleDeleteList = (listId: string, listTitle: string) => {
    Alert.alert(
      '리스트 삭제',
      `"${listTitle}" 리스트를 삭제할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => deleteList(listId),
        },
      ]
    );
  };

  const renderAchievementItem = ({ item }: { item: Achievement }) => {
    const isJustCompleted = justCompleted === item.id;
    const category = categories.find((c) => c.id === item.categoryId);

    return (
      <TouchableOpacity
        style={styles.achievementCard}
        onPress={() => router.push(`/detail/${item.id}` as any)}
        activeOpacity={0.7}
      >
        <View style={styles.achievementLeft}>
          <StarIcon
            completionCount={item.completionCount}
            size={22}
            animated={isJustCompleted}
          />
        </View>
        <View style={styles.achievementContent}>
          <Text style={styles.achievementTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.achievementCategory}>{category?.emoji} {category?.name}</Text>
        </View>
        <View style={styles.achievementRight}>
          <Text style={styles.achievementCount}>{item.completionCount}회</Text>
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconSymbol name="trash" size={18} color="#718096" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderListItem = ({ item }: { item: any }) => {
    const completionPercent = item.totalCount > 0 ? Math.round((item.completionCount / item.totalCount) * 100) : 0;

    return (
      <TouchableOpacity
        style={styles.listCard}
        onPress={() => router.push(`/list/${item.id}` as any)}
        activeOpacity={0.7}
      >
        <View style={styles.listCardHeader}>
          <Text style={styles.listCardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <TouchableOpacity
            onPress={() => handleDeleteList(item.id, item.title)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconSymbol name="trash" size={16} color="#718096" />
          </TouchableOpacity>
        </View>
        <View style={styles.listCardProgress}>
          <View style={styles.listCardProgressBg}>
            <View
              style={[
                styles.listCardProgressFill,
                { width: `${completionPercent}%`, backgroundColor: item.isCompleted ? '#22C55E' : '#4ECDC4' },
              ]}
            />
          </View>
          <Text style={styles.listCardProgressText}>
            {item.completionCount}/{item.totalCount}
          </Text>
        </View>
        {item.isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>✓ 완료</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer className="bg-background">
      {/* Tab selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'achievements' && styles.tabActive]}
          onPress={() => setSelectedTab('achievements')}
        >
          <IconSymbol name="sparkles" size={18} color={selectedTab === 'achievements' ? '#F5C842' : '#718096'} />
          <Text style={[styles.tabText, selectedTab === 'achievements' && styles.tabTextActive]}>
            별 목록
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'lists' && styles.tabActive]}
          onPress={() => setSelectedTab('lists')}
        >
          <IconSymbol name="list.bullet" size={18} color={selectedTab === 'lists' ? '#F5C842' : '#718096'} />
          <Text style={[styles.tabText, selectedTab === 'lists' && styles.tabTextActive]}>
            리스트
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {selectedTab === 'achievements' ? (
        <View style={styles.content}>
          {/* Category filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryScrollContent}
          >
            <TouchableOpacity
              style={[styles.categoryTab, selectedCategoryId === 'all' && styles.categoryTabActive]}
              onPress={() => setSelectedCategoryId('all')}
            >
              <Text style={[styles.categoryName, selectedCategoryId === 'all' && styles.categoryNameActive]}>
                전체
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => {
              const catAchievements = achievements.filter((a) => a.categoryId === cat.id);
              const isSelected = cat.id === selectedCategoryId;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryTab, isSelected && styles.categoryTabActive]}
                  onPress={() => setSelectedCategoryId(cat.id)}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.categoryName, isSelected && styles.categoryNameActive]}>
                    {cat.name}
                  </Text>
                  {catAchievements.length > 0 && (
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{catAchievements.length}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Achievements list */}
          {filteredAchievements.length > 0 ? (
            <FlatList
              data={filteredAchievements}
              keyExtractor={(item) => item.id}
              renderItem={renderAchievementItem}
              scrollEnabled={true}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>✦</Text>
              <Text style={styles.emptyStateTitle}>별이 없어요</Text>
              <Text style={styles.emptyStateSubtitle}>새로운 성취 목표를 추가해보세요</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.content}>
          {/* Lists */}
          {lists.length > 0 ? (
            <FlatList
              data={lists}
              keyExtractor={(item) => item.id}
              renderItem={renderListItem}
              scrollEnabled={true}
              contentContainerStyle={styles.listContent}
              numColumns={2}
              columnWrapperStyle={styles.listGrid}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>📋</Text>
              <Text style={styles.emptyStateTitle}>리스트가 없어요</Text>
              <Text style={styles.emptyStateSubtitle}>새로운 리스트를 추가해보세요</Text>
              <TouchableOpacity
                style={styles.emptyAddButton}
                onPress={() => router.push('/add-list' as any)}
              >
                <Text style={styles.emptyAddButtonText}>+ 리스트 추가</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* FAB for adding */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (selectedTab === 'achievements') {
            router.push('/add' as any);
          } else {
            router.push('/add-list' as any);
          }
        }}
      >
        <IconSymbol name="plus" size={24} color="#0A0E1A" />
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tabSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2A3A',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    backgroundColor: '#111827',
  },
  tabActive: {
    backgroundColor: '#1E2A3A',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#718096',
  },
  tabTextActive: {
    color: '#F5C842',
  },
  content: {
    flex: 1,
    paddingTop: 12,
  },
  categoryScroll: {
    maxHeight: 50,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  categoryScrollContent: {
    gap: 8,
    alignItems: 'center',
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    backgroundColor: '#111827',
    gap: 4,
  },
  categoryTabActive: {
    borderColor: '#F5C842',
    backgroundColor: '#F5C84220',
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryName: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  categoryNameActive: {
    color: '#F5C842',
  },
  categoryBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    backgroundColor: '#F5C842',
  },
  categoryBadgeText: {
    fontSize: 10,
    color: '#0A0E1A',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  listGrid: {
    gap: 12,
    marginBottom: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  achievementLeft: {
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 2,
  },
  achievementCategory: {
    fontSize: 12,
    color: '#718096',
  },
  achievementRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  achievementCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F5C842',
  },
  listCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    padding: 12,
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  listCardTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
    lineHeight: 18,
  },
  listCardProgress: {
    gap: 4,
    marginBottom: 8,
  },
  listCardProgressBg: {
    height: 4,
    backgroundColor: '#1E2A3A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  listCardProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  listCardProgressText: {
    fontSize: 10,
    color: '#718096',
    textAlign: 'right',
  },
  completedBadge: {
    backgroundColor: '#22C55E20',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  completedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#22C55E',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 6,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyAddButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  emptyAddButtonText: {
    color: '#0A0E1A',
    fontSize: 13,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5C842',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F5C842',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
});
