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
import { Achievement, Category } from '@/types/achievement';

export default function ListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { achievements, categories, completeAchievement, deleteAchievement } = useAchievementsContext();
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
          <Text style={styles.achievementMeta}>
            완료 {item.completionCount}회
            {item.lastCompletedAt && ` · 최근 ${formatDate(item.lastCompletedAt)}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => handleComplete(item)}
          activeOpacity={0.7}
        >
          <IconSymbol
            name="checkmark.circle.fill"
            size={28}
            color={item.completionCount > 0 ? '#F5C842' : '#2D3748'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      {/* Background */}
      <View style={styles.background}>
        <View style={[styles.nebula, styles.nebula1]} />
      </View>

      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>성취 목록</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add' as any)}
            activeOpacity={0.8}
          >
            <IconSymbol name="plus" size={22} color="#0A0E1A" />
          </TouchableOpacity>
        </View>

        {/* Category filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedCategoryId === 'all' && styles.filterTabActive,
            ]}
            onPress={() => setSelectedCategoryId('all')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedCategoryId === 'all' && styles.filterTabTextActive,
              ]}
            >
              전체
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.filterTab,
                selectedCategoryId === cat.id && {
                  borderColor: cat.color,
                  backgroundColor: `${cat.color}20`,
                },
              ]}
              onPress={() => setSelectedCategoryId(cat.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.filterEmoji}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.filterTabText,
                  selectedCategoryId === cat.id && { color: cat.color },
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Achievement list */}
        {achievements.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✦</Text>
            <Text style={styles.emptyTitle}>아직 성취 목록이 없어요</Text>
            <Text style={styles.emptySubtitle}>+ 버튼을 눌러 첫 번째 별을 추가해보세요</Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={() => router.push('/add' as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyAddButtonText}>성취 추가하기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={grouped}
            keyExtractor={(item) => item.category.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: group }) => (
              <View style={styles.groupSection}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupEmoji}>{group.category.emoji}</Text>
                  <Text style={[styles.groupTitle, { color: group.category.color }]}>
                    {group.category.name}
                  </Text>
                  <View style={[styles.groupBadge, { backgroundColor: group.category.color }]}>
                    <Text style={styles.groupBadgeText}>{group.items.length}</Text>
                  </View>
                </View>
                {group.items.map((item) => (
                  <View key={item.id}>
                    {renderAchievementItem({ item })}
                  </View>
                ))}
              </View>
            )}
          />
        )}
      </View>
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
    width: 300,
    height: 300,
    backgroundColor: '#2B6CB0',
    opacity: 0.04,
    top: 50,
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
    color: '#E2E8F0',
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
  filterScroll: {
    maxHeight: 50,
    marginBottom: 12,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  filterTab: {
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
  filterTabActive: {
    borderColor: '#F5C842',
    backgroundColor: '#F5C84220',
  },
  filterEmoji: {
    fontSize: 13,
  },
  filterTabText: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#F5C842',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  groupSection: {
    marginBottom: 20,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  groupEmoji: {
    fontSize: 16,
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  groupBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  groupBadgeText: {
    fontSize: 11,
    color: '#0A0E1A',
    fontWeight: '700',
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1E2A3A',
  },
  achievementLeft: {
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 3,
  },
  achievementMeta: {
    fontSize: 12,
    color: '#718096',
  },
  completeButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 56,
    color: '#2D3748',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
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
});
