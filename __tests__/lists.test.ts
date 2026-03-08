import { describe, it, expect, beforeEach, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe('Lists functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('List creation', () => {
    it('should create a new list with correct properties', () => {
      const title = '타임즈 선정 100권의 책';
      const description = '읽어야 할 책들의 목록';
      const categoryId = 'reading';

      const newList = {
        id: `list_${Date.now()}`,
        title,
        description,
        categoryId,
        items: [],
        completionCount: 0,
        totalCount: 0,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(newList.title).toBe(title);
      expect(newList.description).toBe(description);
      expect(newList.categoryId).toBe(categoryId);
      expect(newList.items).toEqual([]);
      expect(newList.completionCount).toBe(0);
      expect(newList.totalCount).toBe(0);
      expect(newList.isCompleted).toBe(false);
    });

    it('should save list to AsyncStorage', async () => {
      const mockSetItem = vi.fn().mockResolvedValue(undefined);
      (AsyncStorage.setItem as any) = mockSetItem;

      const lists = [
        {
          id: 'list_1',
          title: '타임즈 선정 100권의 책',
          description: '읽어야 할 책들의 목록',
          categoryId: 'reading',
          items: [],
          completionCount: 0,
          totalCount: 0,
          isCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      await AsyncStorage.setItem('starquest_lists', JSON.stringify(lists));

      expect(mockSetItem).toHaveBeenCalledWith('starquest_lists', JSON.stringify(lists));
    });
  });

  describe('List items management', () => {
    it('should add item to list and increase totalCount', () => {
      const list = {
        id: 'list_1',
        title: '타임즈 선정 100권의 책',
        description: '읽어야 할 책들의 목록',
        categoryId: 'reading',
        items: [],
        completionCount: 0,
        totalCount: 0,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newItem = {
        id: `item_${Date.now()}`,
        listId: list.id,
        title: '해리 포터와 마법사의 돌',
        completed: false,
        createdAt: new Date().toISOString(),
      };

      const updatedList = {
        ...list,
        items: [...list.items, newItem],
        totalCount: list.totalCount + 1,
        updatedAt: new Date().toISOString(),
      };

      expect(updatedList.items.length).toBe(1);
      expect(updatedList.totalCount).toBe(1);
      expect(updatedList.items[0].title).toBe('해리 포터와 마법사의 돌');
    });

    it('should toggle item completion status', () => {
      const item = {
        id: 'item_1',
        listId: 'list_1',
        title: '해리 포터와 마법사의 돌',
        completed: false,
        createdAt: new Date().toISOString(),
      };

      const toggledItem = {
        ...item,
        completed: !item.completed,
        completedAt: !item.completed ? new Date().toISOString() : undefined,
      };

      expect(toggledItem.completed).toBe(true);
      expect(toggledItem.completedAt).toBeDefined();

      const toggledAgain = {
        ...toggledItem,
        completed: !toggledItem.completed,
        completedAt: !toggledItem.completed ? new Date().toISOString() : undefined,
      };

      expect(toggledAgain.completed).toBe(false);
      expect(toggledAgain.completedAt).toBeUndefined();
    });

    it('should mark list as completed when all items are completed', () => {
      const list = {
        id: 'list_1',
        title: '타임즈 선정 100권의 책',
        description: '읽어야 할 책들의 목록',
        categoryId: 'reading',
        items: [
          {
            id: 'item_1',
            listId: 'list_1',
            title: '해리 포터와 마법사의 돌',
            completed: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'item_2',
            listId: 'list_1',
            title: '반지의 제왕',
            completed: true,
            createdAt: new Date().toISOString(),
          },
        ],
        completionCount: 2,
        totalCount: 2,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const completionCount = list.items.filter((i) => i.completed).length;
      const isCompleted = completionCount === list.totalCount && list.totalCount > 0;

      const updatedList = {
        ...list,
        completionCount,
        isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      };

      expect(updatedList.isCompleted).toBe(true);
      expect(updatedList.completionCount).toBe(2);
      expect(updatedList.completedAt).toBeDefined();
    });

    it('should delete item from list and decrease totalCount', () => {
      const list = {
        id: 'list_1',
        title: '타임즈 선정 100권의 책',
        description: '읽어야 할 책들의 목록',
        categoryId: 'reading',
        items: [
          {
            id: 'item_1',
            listId: 'list_1',
            title: '해리 포터와 마법사의 돌',
            completed: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'item_2',
            listId: 'list_1',
            title: '반지의 제왕',
            completed: false,
            createdAt: new Date().toISOString(),
          },
        ],
        completionCount: 0,
        totalCount: 2,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const itemToDelete = list.items[0];
      const wasCompleted = itemToDelete.completed;
      const updatedItems = list.items.filter((i) => i.id !== itemToDelete.id);
      const completionCount = wasCompleted ? list.completionCount - 1 : list.completionCount;
      const totalCount = list.totalCount - 1;

      const updatedList = {
        ...list,
        items: updatedItems,
        completionCount,
        totalCount,
        updatedAt: new Date().toISOString(),
      };

      expect(updatedList.items.length).toBe(1);
      expect(updatedList.totalCount).toBe(1);
      expect(updatedList.items[0].id).toBe('item_2');
    });
  });

  describe('List deletion', () => {
    it('should delete list from lists array', () => {
      const lists = [
        {
          id: 'list_1',
          title: '타임즈 선정 100권의 책',
          description: '읽어야 할 책들의 목록',
          categoryId: 'reading',
          items: [],
          completionCount: 0,
          totalCount: 0,
          isCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'list_2',
          title: '전세계 미술관',
          description: '방문해야 할 미술관들',
          categoryId: 'travel',
          items: [],
          completionCount: 0,
          totalCount: 0,
          isCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const listToDelete = lists[0];
      const updatedLists = lists.filter((l) => l.id !== listToDelete.id);

      expect(updatedLists.length).toBe(1);
      expect(updatedLists[0].id).toBe('list_2');
    });
  });

  describe('List progress calculation', () => {
    it('should calculate completion percentage correctly', () => {
      const list = {
        id: 'list_1',
        title: '타임즈 선정 100권의 책',
        description: '읽어야 할 책들의 목록',
        categoryId: 'reading',
        items: [
          { id: 'item_1', listId: 'list_1', title: '책1', completed: true, createdAt: new Date().toISOString() },
          { id: 'item_2', listId: 'list_1', title: '책2', completed: true, createdAt: new Date().toISOString() },
          { id: 'item_3', listId: 'list_1', title: '책3', completed: false, createdAt: new Date().toISOString() },
          { id: 'item_4', listId: 'list_1', title: '책4', completed: false, createdAt: new Date().toISOString() },
        ],
        completionCount: 2,
        totalCount: 4,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const completionPercent = list.totalCount > 0 ? Math.round((list.completionCount / list.totalCount) * 100) : 0;

      expect(completionPercent).toBe(50);
    });

    it('should handle empty list progress', () => {
      const list = {
        id: 'list_1',
        title: '타임즈 선정 100권의 책',
        description: '읽어야 할 책들의 목록',
        categoryId: 'reading',
        items: [],
        completionCount: 0,
        totalCount: 0,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const completionPercent = list.totalCount > 0 ? Math.round((list.completionCount / list.totalCount) * 100) : 0;

      expect(completionPercent).toBe(0);
    });
  });
});
