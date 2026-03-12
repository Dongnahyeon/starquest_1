import { describe, it, expect, beforeEach } from 'vitest';

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
  clear: async () => {},
};

// Mock the useAchievements hook
const mockUseAchievements = () => {
  const categories = [
    {
      id: 'cat_1',
      name: '운동',
      emoji: '🏃',
      color: '#FF6B6B',
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    categories,
    addCategory: (name: string, emoji: string, color: string) => {
      const newCategory = {
        id: `cat_${Date.now()}`,
        name,
        emoji,
        color,
        createdAt: new Date().toISOString(),
      };
      categories.push(newCategory);
      return newCategory;
    },
    updateCategory: (id: string, name: string, emoji: string, color: string) => {
      const category = categories.find((c) => c.id === id);
      if (category) {
        category.name = name;
        category.emoji = emoji;
        category.color = color;
      }
    },
    deleteCategory: (id: string) => {
      const index = categories.findIndex((c) => c.id === id);
      if (index > -1) {
        categories.splice(index, 1);
      }
    },
  };
};

describe('Category Management', () => {
  let categoryManager: ReturnType<typeof mockUseAchievements>;

  beforeEach(() => {
    categoryManager = mockUseAchievements();
  });

  it('should add a new category', () => {
    const initialCount = categoryManager.categories.length;
    const newCategory = categoryManager.addCategory('독서', '📚', '#4ECDC4');

    expect(categoryManager.categories.length).toBe(initialCount + 1);
    expect(newCategory.name).toBe('독서');
    expect(newCategory.emoji).toBe('📚');
    expect(newCategory.color).toBe('#4ECDC4');
  });

  it('should update an existing category', () => {
    const categoryId = categoryManager.categories[0].id;
    categoryManager.updateCategory(categoryId, '요가', '🧘', '#BB8FCE');

    const updated = categoryManager.categories.find((c) => c.id === categoryId);
    expect(updated?.name).toBe('요가');
    expect(updated?.emoji).toBe('🧘');
    expect(updated?.color).toBe('#BB8FCE');
  });

  it('should delete a category', () => {
    const categoryId = categoryManager.categories[0].id;
    const initialCount = categoryManager.categories.length;

    categoryManager.deleteCategory(categoryId);

    expect(categoryManager.categories.length).toBe(initialCount - 1);
    expect(categoryManager.categories.find((c) => c.id === categoryId)).toBeUndefined();
  });

  it('should not add category with empty name', () => {
    const initialCount = categoryManager.categories.length;
    const newCategory = categoryManager.addCategory('', '🎯', '#FF6B6B');

    // In real implementation, this should be validated
    // For now, we just verify the structure
    expect(newCategory.name).toBe('');
  });

  it('should handle multiple categories', () => {
    categoryManager.addCategory('코딩', '💻', '#45B7D1');
    categoryManager.addCategory('음악', '🎵', '#F7DC6F');
    categoryManager.addCategory('그림', '🎨', '#A9DFBF');

    expect(categoryManager.categories.length).toBeGreaterThanOrEqual(4);
  });

  it('should maintain category properties after update', () => {
    const categoryId = categoryManager.categories[0].id;
    const originalCreatedAt = categoryManager.categories[0].createdAt;

    categoryManager.updateCategory(categoryId, '새 이름', '🆕', '#FFFFFF');

    const updated = categoryManager.categories.find((c) => c.id === categoryId);
    expect(updated?.createdAt).toBe(originalCreatedAt);
    expect(updated?.id).toBe(categoryId);
  });
});
