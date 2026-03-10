import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Achievement, AppData, Category, DEFAULT_CATEGORIES } from '@/types/achievement';

const STORAGE_KEY = 'starquest_data';

const defaultData: AppData = {
  achievements: [],
  categories: DEFAULT_CATEGORIES,
};

export function useAchievements() {
  const [data, setData] = useState<AppData>(defaultData);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: AppData = JSON.parse(stored);
        // Merge with default categories if missing
        const existingCategoryIds = new Set(parsed.categories.map((c) => c.id));
        const missingDefaults = DEFAULT_CATEGORIES.filter((c) => !existingCategoryIds.has(c.id));
        setData({
          ...parsed,
          categories: [...parsed.categories, ...missingDefaults],
        });
      } else {
        setData(defaultData);
      }
    } catch (e) {
      console.error('Failed to load data:', e);
      setData(defaultData);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveData = useCallback(async (newData: AppData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      setData(newData);
    } catch (e) {
      console.error('Failed to save data:', e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addAchievement = useCallback(
    async (title: string, categoryId: string) => {
      const newAchievement: Achievement = {
        id: `ach_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        title,
        categoryId,
        completionCount: 0,
        createdAt: new Date().toISOString(),
        completionHistory: [],
      };
      const newData = {
        ...data,
        achievements: [...data.achievements, newAchievement],
      };
      await saveData(newData);
      return newAchievement;
    },
    [data, saveData]
  );

  const completeAchievement = useCallback(
    async (id: string) => {
      const now = new Date().toISOString();
      const newData = {
        ...data,
        achievements: data.achievements.map((a) =>
          a.id === id
            ? {
                ...a,
                completionCount: a.completionCount + 1,
                lastCompletedAt: now,
                completionHistory: [...a.completionHistory, now],
              }
            : a
        ),
      };
      await saveData(newData);
    },
    [data, saveData]
  );

  const uncompleteAchievement = useCallback(
    async (id: string) => {
      const newData = {
        ...data,
        achievements: data.achievements.map((a) =>
          a.id === id && a.completionCount > 0
            ? {
                ...a,
                completionCount: a.completionCount - 1,
                completionHistory: a.completionHistory.slice(0, -1),
                lastCompletedAt:
                  a.completionHistory.length > 1
                    ? a.completionHistory[a.completionHistory.length - 2]
                    : undefined,
              }
            : a
        ),
      };
      await saveData(newData);
    },
    [data, saveData]
  );

  const deleteAchievement = useCallback(
    async (id: string) => {
      try {
        const deletedTitle = data.achievements.find((a) => a.id === id)?.title || 'Unknown';
        const newData = {
          ...data,
          achievements: data.achievements.filter((a) => a.id !== id),
        };
        await saveData(newData);
        console.log('[LOG] 별 삭제 완료:', deletedTitle, '남은 별:', newData.achievements.length);
      } catch (error) {
        console.error('Error in deleteAchievement:', error);
        throw error;
      }
    },
    [data, saveData]
  );

  const addCategory = useCallback(
    async (name: string, emoji: string, color: string) => {
      const newCategory: Category = {
        id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name,
        emoji,
        color,
        createdAt: new Date().toISOString(),
      };
      const newData = {
        ...data,
        categories: [...data.categories, newCategory],
      };
      await saveData(newData);
      return newCategory;
    },
    [data, saveData]
  );

  const getAchievementsByCategory = useCallback(
    (categoryId: string) => {
      return data.achievements.filter((a) => a.categoryId === categoryId);
    },
    [data.achievements]
  );

  const getCategoryById = useCallback(
    (categoryId: string) => {
      return data.categories.find((c) => c.id === categoryId);
    },
    [data.categories]
  );

  const getAchievementById = useCallback(
    (id: string) => {
      return data.achievements.find((a) => a.id === id);
    },
    [data.achievements]
  );

  const reorderAchievements = useCallback(
    async (fromIndex: number, toIndex: number) => {
      const newAchievements = [...data.achievements];
      const [movedItem] = newAchievements.splice(fromIndex, 1);
      newAchievements.splice(toIndex, 0, movedItem);
      const newData = {
        ...data,
        achievements: newAchievements,
      };
      await saveData(newData);
    },
    [data, saveData]
  );

  const totalCompletions = data.achievements.reduce((sum, a) => sum + a.completionCount, 0);
  const totalAchievements = data.achievements.length;

  return {
    achievements: data.achievements,
    categories: data.categories,
    loading,
    addAchievement,
    completeAchievement,
    uncompleteAchievement,
    deleteAchievement,
    addCategory,
    getAchievementsByCategory,
    getCategoryById,
    getAchievementById,
    reorderAchievements,
    totalCompletions,
    totalAchievements,
    reload: loadData,
  };
}
