import { useCallback, useMemo } from 'react';
import { List } from '@/types/list';
import { Achievement } from '@/types/achievement';
import { Badge, ALL_BADGES } from '@/types/badge';

export interface UserStats {
  totalListsCreated: number;
  totalListsCompleted: number;
  totalItemsAdded: number;
  totalItemsCompleted: number;
  totalAchievementsCreated: number;
  totalAchievementsCompleted: number;
  appUsageDays: number;
  longestStreak: number;
  unlockedBadges: Badge[];
}

export function useStats(lists: List[], achievements: Achievement[], appCreatedAt?: string) {
  // 통계 계산
  const stats = useMemo<UserStats>(() => {
    const completedLists = lists.filter((l) => l.isCompleted);
    const totalListsCreated = lists.length;
    const totalListsCompleted = completedLists.length;

    // 총 항목 수 계산
    const totalItemsAdded = lists.reduce((sum, l) => sum + l.totalCount, 0);
    const totalItemsCompleted = lists.reduce((sum, l) => sum + l.completionCount, 0);

    // 별 통계
    const totalAchievementsCreated = achievements.length;
    const totalAchievementsCompleted = achievements.filter((a) => a.completionCount > 0).length;

    // 앱 사용 일수 계산
    let appUsageDays = 0;
    if (appCreatedAt) {
      const created = new Date(appCreatedAt).getTime();
      const now = new Date().getTime();
      appUsageDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    }

    // 연속 완료 일수 계산 (간단한 버전: 최근 완료 리스트 기준)
    const sortedCompleted = completedLists.sort(
      (a, b) => new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime()
    );

    let longestStreak = 0;
    if (sortedCompleted.length > 0) {
      let currentStreak = 1;
      for (let i = 1; i < sortedCompleted.length; i++) {
        const prevDate = new Date(sortedCompleted[i - 1].completedAt || '').getTime();
        const currDate = new Date(sortedCompleted[i].completedAt || '').getTime();
        const daysDiff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));

        if (daysDiff <= 1) {
          currentStreak++;
          longestStreak = Math.max(longestStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }
    }

    return {
      totalListsCreated,
      totalListsCompleted,
      totalItemsAdded,
      totalItemsCompleted,
      totalAchievementsCreated,
      totalAchievementsCompleted,
      appUsageDays,
      longestStreak,
      unlockedBadges: [],
    };
  }, [lists, achievements, appCreatedAt]);

  // 배지 획득 로직
  const checkBadges = useCallback((): Badge[] => {
    const unlockedBadges: Badge[] = [];

    // 누적 리스트 생성 배지
    if (stats.totalListsCreated >= 1) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'list_created_1')!);
    }
    if (stats.totalListsCreated >= 10) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'list_created_10')!);
    }
    if (stats.totalListsCreated >= 100) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'list_created_100')!);
    }
    if (stats.totalListsCreated >= 1000) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'list_created_1000')!);
    }

    // 누적 리스트 완료 배지
    if (stats.totalListsCompleted >= 1) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'list_completed_1')!);
    }
    if (stats.totalListsCompleted >= 10) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'list_completed_10')!);
    }
    if (stats.totalListsCompleted >= 100) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'list_completed_100')!);
    }
    if (stats.totalListsCompleted >= 1000) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'list_completed_1000')!);
    }

    // 누적 항목 추가 배지
    if (stats.totalItemsAdded >= 10) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'item_added_10')!);
    }
    if (stats.totalItemsAdded >= 100) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'item_added_100')!);
    }
    if (stats.totalItemsAdded >= 1000) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'item_added_1000')!);
    }
    if (stats.totalItemsAdded >= 10000) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'item_added_10000')!);
    }

    // 누적 항목 완료 배지
    if (stats.totalItemsCompleted >= 10) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'item_completed_10')!);
    }
    if (stats.totalItemsCompleted >= 100) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'item_completed_100')!);
    }
    if (stats.totalItemsCompleted >= 1000) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'item_completed_1000')!);
    }
    if (stats.totalItemsCompleted >= 10000) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'item_completed_10000')!);
    }

    // 시간 경과 배지
    if (stats.appUsageDays >= 365) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'time_1year')!);
    }
    if (stats.appUsageDays >= 1825) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'time_5years')!);
    }
    if (stats.appUsageDays >= 3650) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'time_10years')!);
    }
    if (stats.appUsageDays >= 7300) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'time_20years')!);
    }

    // 연속 활동 배지
    if (stats.longestStreak >= 100) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'streak_100days')!);
    }
    if (stats.longestStreak >= 365) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'streak_1year')!);
    }
    if (stats.longestStreak >= 1825) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'streak_5years')!);
    }

    // 특별 이벤트 배지
    if (stats.totalAchievementsCompleted >= 1) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'special_first_achievement')!);
    }
    if (stats.appUsageDays >= 1000) {
      unlockedBadges.push(ALL_BADGES.find((b) => b.id === 'special_1000days')!);
    }

    // 활동 패턴 배지 (간단한 버전 - 실제로는 시간대별 활동 분석 필요)
    // TODO: 시간대별 활동 분석 로직 추가

    // 중복 제거
    return Array.from(new Map(unlockedBadges.map((b) => [b.id, b])).values());
  }, [stats]);

  const unlockedBadges = checkBadges();

  return {
    stats: { ...stats, unlockedBadges },
    checkBadges,
  };
}
