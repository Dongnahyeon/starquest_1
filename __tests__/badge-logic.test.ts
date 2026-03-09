import { describe, it, expect } from 'vitest';
import { BADGE_DEFINITIONS, BadgeType } from '@/types/badge';
import { List } from '@/types/list';

/**
 * 배지 획득 로직을 테스트하는 유틸리티 함수들
 */

function checkFirstListBadge(lists: List[]): boolean {
  const completedLists = lists.filter((l) => l.isCompleted);
  return completedLists.length >= 1;
}

function checkListCollectorBadge(lists: List[]): boolean {
  const completedLists = lists.filter((l) => l.isCompleted);
  return completedLists.length >= 3;
}

function checkListMasterBadge(lists: List[]): boolean {
  const completedLists = lists.filter((l) => l.isCompleted);
  return completedLists.length >= 10;
}

function checkSpeedRunnerBadge(lists: List[]): boolean {
  return lists.some((list) => {
    if (list.createdAt && list.completedAt) {
      const created = new Date(list.createdAt).getTime();
      const completed = new Date(list.completedAt).getTime();
      const days = Math.ceil((completed - created) / (1000 * 60 * 60 * 24));
      return days <= 1;
    }
    return false;
  });
}

function checkPatientOneBadge(lists: List[]): boolean {
  return lists.some((list) => {
    if (list.createdAt && list.completedAt) {
      const created = new Date(list.createdAt).getTime();
      const completed = new Date(list.completedAt).getTime();
      const days = Math.ceil((completed - created) / (1000 * 60 * 60 * 24));
      return days >= 30;
    }
    return false;
  });
}

function checkBulkAdderBadge(lists: List[]): boolean {
  return lists.some((list) => list.totalCount >= 50);
}

function checkPerfectionistBadge(lists: List[]): boolean {
  const completedLists = lists.filter((l) => l.isCompleted);
  const perfectLists = completedLists.filter((l) => l.completionCount === l.totalCount && l.totalCount > 0);
  return perfectLists.length >= 5;
}

describe('Badge Logic', () => {
  describe('first_list badge', () => {
    it('should unlock when 1 list is completed', () => {
      const lists: List[] = [
        {
          id: '1',
          title: '첫 리스트',
          categoryId: 'test',
          items: [],
          totalCount: 1,
          completionCount: 1,
          isCompleted: true,
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      expect(checkFirstListBadge(lists)).toBe(true);
    });

    it('should not unlock when no lists are completed', () => {
      const lists: List[] = [];
      expect(checkFirstListBadge(lists)).toBe(false);
    });
  });

  describe('list_collector badge', () => {
    it('should unlock when 3 lists are completed', () => {
      const lists: List[] = Array.from({ length: 3 }, (_, i) => ({
        id: `${i}`,
        title: `리스트 ${i}`,
        categoryId: 'test',
        items: [],
        totalCount: 1,
        completionCount: 1,
        isCompleted: true,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      expect(checkListCollectorBadge(lists)).toBe(true);
    });

    it('should not unlock when less than 3 lists are completed', () => {
      const lists: List[] = Array.from({ length: 2 }, (_, i) => ({
        id: `${i}`,
        title: `리스트 ${i}`,
        categoryId: 'test',
        items: [],
        totalCount: 1,
        completionCount: 1,
        isCompleted: true,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      expect(checkListCollectorBadge(lists)).toBe(false);
    });
  });

  describe('list_master badge', () => {
    it('should unlock when 10 lists are completed', () => {
      const lists: List[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        title: `리스트 ${i}`,
        categoryId: 'test',
        items: [],
        totalCount: 1,
        completionCount: 1,
        isCompleted: true,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      expect(checkListMasterBadge(lists)).toBe(true);
    });
  });

  describe('speed_runner badge', () => {
    it('should unlock for lists completed in 1 day', () => {
      const lists: List[] = [
        {
          id: '1',
          title: '빠른 리스트',
          categoryId: 'test',
          items: [],
          totalCount: 5,
          completionCount: 5,
          isCompleted: true,
          createdAt: new Date('2026-01-01').toISOString(),
          completedAt: new Date('2026-01-01').toISOString(),
          updatedAt: new Date('2026-01-01').toISOString(),
        },
      ];
      expect(checkSpeedRunnerBadge(lists)).toBe(true);
    });

    it('should not unlock for lists taking more than 1 day', () => {
      const lists: List[] = [
        {
          id: '1',
          title: '느린 리스트',
          categoryId: 'test',
          items: [],
          totalCount: 5,
          completionCount: 5,
          isCompleted: true,
          createdAt: new Date('2026-01-01').toISOString(),
          completedAt: new Date('2026-01-03').toISOString(),
          updatedAt: new Date('2026-01-03').toISOString(),
        },
      ];
      expect(checkSpeedRunnerBadge(lists)).toBe(false);
    });
  });

  describe('patient_one badge', () => {
    it('should unlock for lists taking 30+ days', () => {
      const lists: List[] = [
        {
          id: '1',
          title: '오래된 리스트',
          categoryId: 'test',
          items: [],
          totalCount: 10,
          completionCount: 10,
          isCompleted: true,
          createdAt: new Date('2026-01-01').toISOString(),
          completedAt: new Date('2026-02-01').toISOString(),
          updatedAt: new Date('2026-02-01').toISOString(),
        },
      ];
      expect(checkPatientOneBadge(lists)).toBe(true);
    });

    it('should not unlock for lists taking less than 30 days', () => {
      const lists: List[] = [
        {
          id: '1',
          title: '짧은 리스트',
          categoryId: 'test',
          items: [],
          totalCount: 10,
          completionCount: 10,
          isCompleted: true,
          createdAt: new Date('2026-01-01').toISOString(),
          completedAt: new Date('2026-01-15').toISOString(),
          updatedAt: new Date('2026-01-15').toISOString(),
        },
      ];
      expect(checkPatientOneBadge(lists)).toBe(false);
    });
  });

  describe('bulk_adder badge', () => {
    it('should unlock for lists with 50+ items', () => {
      const lists: List[] = [
        {
          id: '1',
          title: '많은 항목',
          categoryId: 'test',
          items: Array.from({ length: 50 }, (_, i) => ({
            id: `i${i}`,
            listId: '1',
            title: `항목 ${i}`,
            completed: false,
            createdAt: new Date().toISOString(),
          })),
          totalCount: 50,
          completionCount: 0,
          isCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      expect(checkBulkAdderBadge(lists)).toBe(true);
    });

    it('should not unlock for lists with less than 50 items', () => {
      const lists: List[] = [
        {
          id: '1',
          title: '적은 항목',
          categoryId: 'test',
          items: Array.from({ length: 30 }, (_, i) => ({
            id: `i${i}`,
            listId: '1',
            title: `항목 ${i}`,
            completed: false,
            createdAt: new Date().toISOString(),
          })),
          totalCount: 30,
          completionCount: 0,
          isCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      expect(checkBulkAdderBadge(lists)).toBe(false);
    });
  });

  describe('perfectionist badge', () => {
    it('should unlock for 5 perfectly completed lists', () => {
      const lists: List[] = Array.from({ length: 5 }, (_, i) => ({
        id: `${i}`,
        title: `완벽한 리스트 ${i}`,
        categoryId: 'test',
        items: Array.from({ length: 3 }, (_, j) => ({
          id: `i${j}`,
          listId: `${i}`,
          title: `항목 ${j}`,
          completed: true,
          createdAt: new Date().toISOString(),
        })),
        totalCount: 3,
        completionCount: 3,
        isCompleted: true,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      expect(checkPerfectionistBadge(lists)).toBe(true);
    });

    it('should not unlock for less than 5 perfectly completed lists', () => {
      const lists: List[] = Array.from({ length: 3 }, (_, i) => ({
        id: `${i}`,
        title: `완벽한 리스트 ${i}`,
        categoryId: 'test',
        items: Array.from({ length: 3 }, (_, j) => ({
          id: `i${j}`,
          listId: `${i}`,
          title: `항목 ${j}`,
          completed: true,
          createdAt: new Date().toISOString(),
        })),
        totalCount: 3,
        completionCount: 3,
        isCompleted: true,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      expect(checkPerfectionistBadge(lists)).toBe(false);
    });
  });

  describe('badge definitions', () => {
    it('should have all badge definitions', () => {
      const badgeIds: BadgeType[] = [
        'first_list',
        'list_collector',
        'list_master',
        'speed_runner',
        'patient_one',
        'bulk_adder',
        'perfectionist',
        'comeback_kid',
        'marathon_runner',
      ];

      badgeIds.forEach((badgeId) => {
        expect(BADGE_DEFINITIONS[badgeId]).toBeDefined();
        expect(BADGE_DEFINITIONS[badgeId].name).toBeTruthy();
        expect(BADGE_DEFINITIONS[badgeId].description).toBeTruthy();
        expect(BADGE_DEFINITIONS[badgeId].emoji).toBeTruthy();
        expect(BADGE_DEFINITIONS[badgeId].color).toBeTruthy();
      });
    });
  });
});
