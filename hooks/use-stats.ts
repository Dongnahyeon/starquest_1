import { useCallback, useMemo } from 'react';
import { List } from '@/types/list';
import { UserStats, BadgeType, BADGE_DEFINITIONS } from '@/types/badge';

export function useStats(lists: List[]) {
  // 통계 계산
  const stats = useMemo<UserStats>(() => {
    const completedLists = lists.filter((l) => l.isCompleted);
    const totalListsCreated = lists.length;
    const totalListsCompleted = completedLists.length;

    // 총 항목 수 계산
    const totalItemsAdded = lists.reduce((sum, l) => sum + l.totalCount, 0);
    const totalItemsCompleted = lists.reduce((sum, l) => sum + l.completionCount, 0);

    // 완료 시간 계산 (일 단위)
    let completionDays: number[] = [];
    completedLists.forEach((list) => {
      if (list.createdAt && list.completedAt) {
        const created = new Date(list.createdAt).getTime();
        const completed = new Date(list.completedAt).getTime();
        const days = Math.ceil((completed - created) / (1000 * 60 * 60 * 24));
        completionDays.push(Math.max(days, 1)); // 최소 1일
      }
    });

    const averageCompletionDays =
      completionDays.length > 0 ? Math.round(completionDays.reduce((a, b) => a + b, 0) / completionDays.length) : 0;
    const fastestCompletionDays = completionDays.length > 0 ? Math.min(...completionDays) : 0;
    const slowestCompletionDays = completionDays.length > 0 ? Math.max(...completionDays) : 0;

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
      averageCompletionDays,
      fastestCompletionDays,
      slowestCompletionDays,
      longestStreak,
      unlockedBadges: [],
    };
  }, [lists]);

  // 배지 획득 로직
  const checkBadges = useCallback((): BadgeType[] => {
    const unlockedBadges: BadgeType[] = [];
    const completedLists = lists.filter((l) => l.isCompleted);

    // first_list: 첫 번째 리스트 완료
    if (completedLists.length >= 1) {
      unlockedBadges.push('first_list');
    }

    // list_collector: 3개 리스트 완료
    if (completedLists.length >= 3) {
      unlockedBadges.push('list_collector');
    }

    // list_master: 10개 리스트 완료
    if (completedLists.length >= 10) {
      unlockedBadges.push('list_master');
    }

    // speed_runner: 1일 내에 리스트 완료
    completedLists.forEach((list) => {
      if (list.createdAt && list.completedAt) {
        const created = new Date(list.createdAt).getTime();
        const completed = new Date(list.completedAt).getTime();
        const days = Math.ceil((completed - created) / (1000 * 60 * 60 * 24));
        if (days <= 1) {
          unlockedBadges.push('speed_runner');
        }
      }
    });

    // patient_one: 30일 이상 걸려 리스트 완료
    completedLists.forEach((list) => {
      if (list.createdAt && list.completedAt) {
        const created = new Date(list.createdAt).getTime();
        const completed = new Date(list.completedAt).getTime();
        const days = Math.ceil((completed - created) / (1000 * 60 * 60 * 24));
        if (days >= 30) {
          unlockedBadges.push('patient_one');
        }
      }
    });

    // bulk_adder: 한 리스트에 50개 이상 항목 추가
    lists.forEach((list) => {
      if (list.totalCount >= 50) {
        unlockedBadges.push('bulk_adder');
      }
    });

    // perfectionist: 완벽하게 완료한 리스트 5개
    const perfectLists = completedLists.filter((l) => l.completionCount === l.totalCount && l.totalCount > 0);
    if (perfectLists.length >= 5) {
      unlockedBadges.push('perfectionist');
    }

    // comeback_kid: 7일 이상 중단 후 리스트 완료
    lists.forEach((list) => {
      if (list.items.length > 0) {
        const sortedItems = [...list.items].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        if (sortedItems.length >= 2) {
          const firstItemDate = new Date(sortedItems[sortedItems.length - 1].createdAt).getTime();
          const lastItemDate = new Date(sortedItems[0].createdAt).getTime();
          const daysDiff = Math.floor((lastItemDate - firstItemDate) / (1000 * 60 * 60 * 24));
          if (daysDiff >= 7 && list.isCompleted) {
            unlockedBadges.push('comeback_kid');
          }
        }
      }
    });

    // marathon_runner: 100일 이상 걸려 리스트 완료
    completedLists.forEach((list) => {
      if (list.createdAt && list.completedAt) {
        const created = new Date(list.createdAt).getTime();
        const completed = new Date(list.completedAt).getTime();
        const days = Math.ceil((completed - created) / (1000 * 60 * 60 * 24));
        if (days >= 100) {
          unlockedBadges.push('marathon_runner');
        }
      }
    });

    // 중복 제거
    return Array.from(new Set(unlockedBadges));
  }, [lists]);

  const unlockedBadges = checkBadges();

  return {
    stats: { ...stats, unlockedBadges },
    checkBadges,
  };
}
