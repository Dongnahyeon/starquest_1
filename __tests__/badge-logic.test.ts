import { describe, it, expect } from 'vitest';
import { ALL_BADGES } from '@/types/badge';
import { List } from '@/types/list';

/**
 * 배지 획득 로직을 테스트하는 유틸리티 함수들
 */

function checkListCreatedBadge(lists: List[], threshold: number): boolean {
  return lists.length >= threshold;
}

function checkListCompletedBadge(lists: List[], threshold: number): boolean {
  const completedLists = lists.filter((l) => l.isCompleted);
  return completedLists.length >= threshold;
}

function checkItemAddedBadge(lists: List[], threshold: number): boolean {
  const totalItems = lists.reduce((sum, l) => sum + l.totalCount, 0);
  return totalItems >= threshold;
}

function checkItemCompletedBadge(lists: List[], threshold: number): boolean {
  const totalCompleted = lists.reduce((sum, l) => sum + l.completionCount, 0);
  return totalCompleted >= threshold;
}

describe('Badge Logic', () => {
  describe('list_created badges', () => {
    it('should unlock list_created_1 badge when 1 list is created', () => {
      const lists: List[] = [
        {
          id: '1',
          title: '첫 리스트',
          categoryId: 'test',
          items: [],
          totalCount: 1,
          completionCount: 0,
          isCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      expect(checkListCreatedBadge(lists, 1)).toBe(true);
    });

    it('should unlock list_created_10 badge when 10 lists are created', () => {
      const lists: List[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        title: `리스트 ${i}`,
        categoryId: 'test',
        items: [],
        totalCount: 1,
        completionCount: 0,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      expect(checkListCreatedBadge(lists, 10)).toBe(true);
    });
  });

  describe('list_completed badges', () => {
    it('should unlock list_completed_1 badge when 1 list is completed', () => {
      const lists: List[] = [
        {
          id: '1',
          title: '완료된 리스트',
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
      expect(checkListCompletedBadge(lists, 1)).toBe(true);
    });

    it('should unlock list_completed_10 badge when 10 lists are completed', () => {
      const lists: List[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        title: `완료된 리스트 ${i}`,
        categoryId: 'test',
        items: [],
        totalCount: 1,
        completionCount: 1,
        isCompleted: true,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      expect(checkListCompletedBadge(lists, 10)).toBe(true);
    });
  });

  describe('item_added badges', () => {
    it('should unlock item_added_10 badge when 10 items are added', () => {
      const lists: List[] = [
        {
          id: '1',
          title: '많은 항목',
          categoryId: 'test',
          items: Array.from({ length: 10 }, (_, i) => ({
            id: `i${i}`,
            listId: '1',
            title: `항목 ${i}`,
            completed: false,
            createdAt: new Date().toISOString(),
          })),
          totalCount: 10,
          completionCount: 0,
          isCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      expect(checkItemAddedBadge(lists, 10)).toBe(true);
    });

    it('should unlock item_added_100 badge when 100 items are added', () => {
      const lists: List[] = [
        {
          id: '1',
          title: '매우 많은 항목',
          categoryId: 'test',
          items: Array.from({ length: 100 }, (_, i) => ({
            id: `i${i}`,
            listId: '1',
            title: `항목 ${i}`,
            completed: false,
            createdAt: new Date().toISOString(),
          })),
          totalCount: 100,
          completionCount: 0,
          isCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      expect(checkItemAddedBadge(lists, 100)).toBe(true);
    });
  });

  describe('item_completed badges', () => {
    it('should unlock item_completed_10 badge when 10 items are completed', () => {
      const lists: List[] = [
        {
          id: '1',
          title: '완료된 항목',
          categoryId: 'test',
          items: Array.from({ length: 10 }, (_, i) => ({
            id: `i${i}`,
            listId: '1',
            title: `항목 ${i}`,
            completed: true,
            createdAt: new Date().toISOString(),
          })),
          totalCount: 10,
          completionCount: 10,
          isCompleted: true,
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      expect(checkItemCompletedBadge(lists, 10)).toBe(true);
    });

    it('should unlock item_completed_100 badge when 100 items are completed', () => {
      const lists: List[] = [
        {
          id: '1',
          title: '매우 많은 완료 항목',
          categoryId: 'test',
          items: Array.from({ length: 100 }, (_, i) => ({
            id: `i${i}`,
            listId: '1',
            title: `항목 ${i}`,
            completed: true,
            createdAt: new Date().toISOString(),
          })),
          totalCount: 100,
          completionCount: 100,
          isCompleted: true,
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      expect(checkItemCompletedBadge(lists, 100)).toBe(true);
    });
  });

  describe('badge definitions', () => {
    it('should have all badge definitions', () => {
      expect(ALL_BADGES.length).toBeGreaterThan(0);
      
      ALL_BADGES.forEach((badge) => {
        expect(badge.id).toBeTruthy();
        expect(badge.name).toBeTruthy();
        expect(badge.description).toBeTruthy();
        expect(badge.emoji).toBeTruthy();
        expect(badge.category).toBeTruthy();
        expect(badge.thresholdType).toBeTruthy();
        expect(badge.threshold).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have 20-26 badges', () => {
      expect(ALL_BADGES.length).toBeGreaterThanOrEqual(20);
      expect(ALL_BADGES.length).toBeLessThanOrEqual(26);
    });
  });
});
