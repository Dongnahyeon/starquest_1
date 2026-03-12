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

  const saveToStorage = useCallback(async (newData: AppData) => {
    try {
      console.log('[LOG] AsyncStorage에 저장 시작:', newData.achievements.length, '개 별');
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      console.log('[LOG] AsyncStorage 저장 완료');
    } catch (e) {
      console.error('Failed to save data:', e);
      throw e;
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 상태 변경 후 저장하는 헬퍼 함수
  useEffect(() => {
    if (!loading) {
      saveToStorage(data).catch((e) => console.error('Auto-save failed:', e));
    }
  }, [data, loading, saveToStorage]);

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
      setData((prev) => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement],
      }));
      return newAchievement;
    },
    []
  );

  const completeAchievement = useCallback(
    async (id: string) => {
      const now = new Date().toISOString();
      setData((prev) => ({
        ...prev,
        achievements: prev.achievements.map((a) =>
          a.id === id
            ? {
                ...a,
                completionCount: a.completionCount + 1,
                lastCompletedAt: now,
                completionHistory: [...a.completionHistory, now],
              }
            : a
        ),
      }));
    },
    []
  );

  const uncompleteAchievement = useCallback(
    async (id: string) => {
      setData((prev) => ({
        ...prev,
        achievements: prev.achievements.map((a) =>
          a.id === id
            ? {
                ...a,
                completionCount: Math.max(0, a.completionCount - 1),
                completionHistory: a.completionHistory.slice(0, -1),
              }
            : a
        ),
      }));
    },
    []
  );

  const deleteAchievement = useCallback(
    async (id: string) => {
      console.log('[LOG] deleteAchievement 함수 호출:', id);
      setData((prev) => {
        const deletedTitle = prev.achievements.find((a) => a.id === id)?.title || 'Unknown';
        console.log('[LOG] 삭제할 별:', deletedTitle);
        const newAchievements = prev.achievements.filter((a) => a.id !== id);
        console.log('[LOG] 삭제 후 남은 별:', newAchievements.length, '개');
        console.log('[LOG] 삭제 완료');
        return {
          ...prev,
          achievements: newAchievements,
        };
      });
    },
    []
  );

  const archiveAchievement = useCallback(
    async (id: string) => {
      console.log('[LOG] archiveAchievement 함수 호출:', id);
      setData((prev) => {
        const archivedTitle = prev.achievements.find((a) => a.id === id)?.title || 'Unknown';
        console.log('[LOG] 숨길 별:', archivedTitle);
        return {
          ...prev,
          achievements: prev.achievements.map((a) =>
            a.id === id ? { ...a, isArchived: true } : a
          ),
        };
      });
    },
    []
  );

  const reorderAchievements = useCallback(
    (fromIndex: number, toIndex: number) => {
      setData((prev) => {
        const newAchievements = [...prev.achievements];
        const [movedItem] = newAchievements.splice(fromIndex, 1);
        newAchievements.splice(toIndex, 0, movedItem);
        return {
          ...prev,
          achievements: newAchievements,
        };
      });
    },
    []
  );

  const updateAchievementTitle = useCallback(
    (id: string, newTitle: string) => {
      setData((prev) => ({
        ...prev,
        achievements: prev.achievements.map((ach) =>
          ach.id === id ? { ...ach, title: newTitle } : ach
        ),
      }));
    },
    []
  );

  const addCategory = useCallback(
    (name: string, emoji: string, color: string) => {
      const newCategory: Category = {
        id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name,
        emoji,
        color,
        createdAt: new Date().toISOString(),
      };
      setData((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory],
      }));
      return newCategory;
    },
    []
  );

  const getAchievementById = useCallback(
    (id: string | string[]) => {
      const idStr = Array.isArray(id) ? id[0] : id;
      return data.achievements.find((a) => a.id === idStr);
    },
    [data.achievements]
  );

  const getCategoryById = useCallback(
    (id: string) => {
      return data.categories.find((c) => c.id === id);
    },
    [data.categories]
  );

  const getCategoryByName = useCallback(
    (name: string) => {
      return data.categories.find((c) => c.name === name);
    },
    [data.categories]
  );

  const updateCategory = useCallback(
    (id: string, name: string, emoji: string, color: string) => {
      setData((prev) => ({
        ...prev,
        categories: prev.categories.map((cat) =>
          cat.id === id ? { ...cat, name, emoji, color } : cat
        ),
      }));
    },
    []
  );

  const deleteCategory = useCallback(
    (id: string) => {
      setData((prev) => ({
        ...prev,
        categories: prev.categories.filter((cat) => cat.id !== id),
      }));
    },
    []
  );

  const totalCompletions = data.achievements.reduce((sum, a) => sum + a.completionCount, 0);
  const totalAchievements = data.achievements.length;

  return {
    data,
    loading,
    achievements: data.achievements.filter((a) => !a.isArchived),
    categories: data.categories,
    totalCompletions,
    totalAchievements,
    addAchievement,
    completeAchievement,
    uncompleteAchievement,
    deleteAchievement,
    archiveAchievement,
    reorderAchievements,
    updateAchievementTitle,
    addCategory,
    updateCategory,
    deleteCategory,
    getAchievementById,
    getCategoryById,
    getCategoryByName,
  };
}
