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
import { BadgeDisplay, BadgeGrid, BadgeDetailModal } from '@/components/BadgeDisplay';
import { useListsContext } from '@/lib/lists-context';
import { useAchievementsContext } from '@/lib/achievements-context';
import { useStats } from '@/hooks/use-stats';
import { BADGE_DEFINITIONS, BadgeType } from '@/types/badge';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CompletionChart } from '@/components/CompletionChart';

export default function StatsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lists } = useListsContext();
  const { achievements } = useAchievementsContext();
  const { stats } = useStats(lists);
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
  const [showBadgeDetail, setShowBadgeDetail] = useState(false);
  const [chartType, setChartType] = useState<'weekly' | 'monthly'>('weekly');

  const completedLists = lists.filter((l) => l.isCompleted);

  const handleBadgePress = (badgeId: BadgeType) => {
    setSelectedBadge(badgeId);
    setShowBadgeDetail(true);
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
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
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statValue}>{stats.totalItemsAdded}</Text>
            <Text style={styles.statLabel}>추가한 항목</Text>
          </View>

          {/* Completed Items */}
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statValue}>{stats.totalItemsCompleted}</Text>
            <Text style={styles.statLabel}>완료한 항목</Text>
          </View>
        </View>

        {/* Completion Time Stats */}
        {stats.totalListsCompleted > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏱️ 완료 시간 통계</Text>
            <View style={styles.timeStatsContainer}>
              <View style={styles.timeStat}>
                <Text style={styles.timeStatLabel}>평균 완료 시간</Text>
                <Text style={styles.timeStatValue}>{stats.averageCompletionDays}일</Text>
              </View>
              <View style={styles.timeStat}>
                <Text style={styles.timeStatLabel}>가장 빠른 완료</Text>
                <Text style={styles.timeStatValue}>{stats.fastestCompletionDays}일</Text>
              </View>
              <View style={styles.timeStat}>
                <Text style={styles.timeStatLabel}>가장 긴 완료</Text>
                <Text style={styles.timeStatValue}>{stats.slowestCompletionDays}일</Text>
              </View>
            </View>
          </View>
        )}

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

        {/* Completion Trend Chart */}
        {achievements.length > 0 && (
          <View style={styles.section}>
            <View style={styles.chartHeaderContainer}>
              <Text style={styles.sectionTitle}>📊 완료 추이</Text>
              <View style={styles.chartTypeButtons}>
                <TouchableOpacity
                  style={[styles.chartTypeButton, chartType === 'weekly' && styles.chartTypeButtonActive]}
                  onPress={() => setChartType('weekly')}
                >
                  <Text style={[styles.chartTypeButtonText, chartType === 'weekly' && styles.chartTypeButtonTextActive]}>주별</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.chartTypeButton, chartType === 'monthly' && styles.chartTypeButtonActive]}
                  onPress={() => setChartType('monthly')}
                >
                  <Text style={[styles.chartTypeButtonText, chartType === 'monthly' && styles.chartTypeButtonTextActive]}>월별</Text>
                </TouchableOpacity>
              </View>
            </View>
            <CompletionChart achievements={achievements} chartType={chartType} />
          </View>
        )}

        {/* Badges Section */}
        <View style={styles.section}>
          <View style={styles.badgesSectionHeader}>
            <Text style={styles.sectionTitle}>🏆 배지 ({stats.unlockedBadges.length}/{Object.keys(BADGE_DEFINITIONS).length})</Text>
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
              <Text style={styles.noBadgesSubtext}>리스트를 완료해서 배지를 획득해보세요!</Text>
            </View>
          )}

          <Text style={styles.badgesSubtitle}>모든 배지</Text>
          <BadgeGrid
            unlockedBadges={stats.unlockedBadges}
            onPress={handleBadgePress}
          />
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 팁</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              • 다양한 배지를 획득해보세요{'\n'}
              • 리스트를 빠르게 완료하면 ⚡ 배지를 얻을 수 있어요{'\n'}
              • 오래 진행한 리스트는 🏃 배지를 줍니다{'\n'}
              • 완벽하게 완료한 리스트 5개로 💎 배지를 획득하세요
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
              <BadgeDetailModal
                badge={BADGE_DEFINITIONS[selectedBadge]}
                isUnlocked={stats.unlockedBadges.includes(selectedBadge)}
              />
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
  chartHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTypeButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  chartTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    backgroundColor: '#111827',
  },
  chartTypeButtonActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  chartTypeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#718096',
  },
  chartTypeButtonTextActive: {
    color: '#0A0E1A',
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
});
