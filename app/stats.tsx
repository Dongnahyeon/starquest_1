import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/screen-container';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import { useListsContext } from '@/lib/lists-context';
import { useAchievementsContext } from '@/lib/achievements-context';
import { useStats } from '@/hooks/use-stats';
import { ALL_BADGES, Badge } from '@/types/badge';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function StatsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lists } = useListsContext();
  const { achievements } = useAchievementsContext();
  const { stats } = useStats(lists, achievements);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showBadgeDetail, setShowBadgeDetail] = useState(false);

  const completedLists = lists.filter((l) => l.isCompleted);

  const handleBadgePress = (badge: Badge) => {
    setSelectedBadge(badge);
    setShowBadgeDetail(true);
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View>
            <Text style={styles.headerTitle}>📊 나의 성과</Text>
            <Text style={styles.headerSubtitle}>리스트 통계 및 배지</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="xmark" size={20} color="#718096" />
          </TouchableOpacity>
        </View>

        {/* Main Stats Cards */}
        <View style={styles.statsGrid}>
          {/* Total Lists */}
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📋</Text>
            <Text style={styles.statValue}>{stats.totalListsCreated}</Text>
            <Text style={styles.statLabel}>생성한 리스트</Text>
          </View>

          {/* Completed Lists */}
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={styles.statValue}>{stats.totalListsCompleted}</Text>
            <Text style={styles.statLabel}>완료한 리스트</Text>
          </View>

          {/* Total Items */}
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>➕</Text>
            <Text style={styles.statValue}>{stats.totalItemsAdded}</Text>
            <Text style={styles.statLabel}>추가한 항목</Text>
          </View>

          {/* Completed Items */}
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>✔️</Text>
            <Text style={styles.statValue}>{stats.totalItemsCompleted}</Text>
            <Text style={styles.statLabel}>완료한 항목</Text>
          </View>
        </View>

        {/* Time & Streak Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏱️ 활동 통계</Text>
          <View style={styles.timeStatsContainer}>
            <View style={styles.timeStat}>
              <Text style={styles.timeStatLabel}>앱 사용 기간</Text>
              <Text style={styles.timeStatValue}>{stats.appUsageDays}일</Text>
            </View>
            <View style={styles.timeStat}>
              <Text style={styles.timeStatLabel}>최장 연속</Text>
              <Text style={styles.timeStatValue}>{stats.longestStreak}일</Text>
            </View>
            <View style={styles.timeStat}>
              <Text style={styles.timeStatLabel}>별 완료</Text>
              <Text style={styles.timeStatValue}>{stats.totalAchievementsCompleted}</Text>
            </View>
          </View>
        </View>

        {/* Completion Rate */}
        {stats.totalListsCreated > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 완료율</Text>
            <View style={styles.completionRateContainer}>
              <View style={styles.completionRateBar}>
                <View
                  style={[
                    styles.completionRateFill,
                    {
                      width: `${(stats.totalListsCompleted / stats.totalListsCreated) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.completionRateText}>
                {Math.round((stats.totalListsCompleted / stats.totalListsCreated) * 100)}% ({stats.totalListsCompleted}/{stats.totalListsCreated})
              </Text>
            </View>
          </View>
        )}

        {/* Badges Section */}
        <View style={styles.section}>
          <View style={styles.badgesSectionHeader}>
            <Text style={styles.sectionTitle}>🏆 배지 ({stats.unlockedBadges.length}/{ALL_BADGES.length})</Text>
          </View>

          {stats.unlockedBadges.length > 0 ? (
            <>
              <Text style={styles.badgesSubtitle}>획득한 배지</Text>
              <BadgeDisplay
                unlockedBadges={stats.unlockedBadges}
                size="medium"
                onPress={handleBadgePress}
              />
            </>
          ) : (
            <View style={styles.noBadgesContainer}>
              <Text style={styles.noBadgesText}>아직 배지가 없어요</Text>
              <Text style={styles.noBadgesSubtext}>계속 활동해서 배지를 획득해보세요!</Text>
            </View>
          )}

          <Text style={styles.badgesSubtitle}>다음 배지 목표</Text>
          <View style={styles.nextBadgesContainer}>
            {ALL_BADGES.slice(0, 3).map((badge) => {
              const isUnlocked = stats.unlockedBadges.some((b) => b.id === badge.id);
              return (
                <View key={badge.id} style={[styles.nextBadge, isUnlocked && styles.nextBadgeUnlocked]}>
                  <Text style={styles.nextBadgeEmoji}>{badge.emoji}</Text>
                  <Text style={styles.nextBadgeName} numberOfLines={1}>{badge.name}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 팁</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              • 30-50년 장기 사용을 목표로 배지를 설계했어요{'\n'}
              • 누적 횟수로 배지가 해금되므로 꾸준히 활동하세요{'\n'}
              • 시간 경과 배지로 장기 헌신을 인정합니다{'\n'}
              • 특별 이정표 배지로 특정 순간을 기념해요
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Badge Detail Modal */}
      <Modal
        visible={showBadgeDetail}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBadgeDetail(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable
              style={styles.modalClose}
              onPress={() => setShowBadgeDetail(false)}
            >
              <IconSymbol name="xmark" size={24} color="#718096" />
            </Pressable>

            {selectedBadge && (
              <View style={styles.badgeDetailContainer}>
                <Text style={styles.badgeDetailEmoji}>{selectedBadge.emoji}</Text>
                <Text style={styles.badgeDetailName}>{selectedBadge.name}</Text>
                <Text style={styles.badgeDetailDescription}>{selectedBadge.description}</Text>
                <View style={styles.badgeDetailMeta}>
                  <Text style={styles.badgeDetailMetaText}>
                    {selectedBadge.thresholdType === 'count' && `${selectedBadge.threshold}회 달성`}
                    {selectedBadge.thresholdType === 'days' && `${selectedBadge.threshold}일 경과`}
                    {selectedBadge.thresholdType === 'event' && '특별 이벤트'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F5C842',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    padding: 16,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F5C842',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 12,
  },
  badgesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeStatsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  timeStat: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    padding: 12,
    alignItems: 'center',
  },
  timeStatLabel: {
    fontSize: 11,
    color: '#718096',
    marginBottom: 6,
  },
  timeStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4ECDC4',
  },
  completionRateContainer: {
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    padding: 16,
  },
  completionRateBar: {
    height: 8,
    backgroundColor: '#1E2A3A',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  completionRateFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  completionRateText: {
    fontSize: 13,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  badgesSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#718096',
    marginBottom: 12,
  },
  nextBadgesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  nextBadge: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    padding: 12,
    alignItems: 'center',
    opacity: 0.6,
  },
  nextBadgeUnlocked: {
    opacity: 1,
    borderColor: '#4ECDC4',
  },
  nextBadgeEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  nextBadgeName: {
    fontSize: 11,
    color: '#718096',
    textAlign: 'center',
  },
  noBadgesContainer: {
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  noBadgesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  noBadgesSubtext: {
    fontSize: 12,
    color: '#718096',
  },
  tipCard: {
    backgroundColor: '#1E2A3A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D3748',
    padding: 16,
  },
  tipText: {
    fontSize: 12,
    color: '#CBD5E0',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#0A0E1A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    padding: 24,
    width: '85%',
    maxWidth: 320,
  },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDetailContainer: {
    alignItems: 'center',
  },
  badgeDetailEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  badgeDetailName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  badgeDetailDescription: {
    fontSize: 13,
    color: '#CBD5E0',
    textAlign: 'center',
    marginBottom: 16,
  },
  badgeDetailMeta: {
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeDetailMetaText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
  },
});
