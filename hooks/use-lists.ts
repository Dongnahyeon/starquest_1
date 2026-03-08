import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { List, ListItem } from '@/types/list';

const LISTS_STORAGE_KEY = 'starquest_lists';

export function useLists() {
  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 리스트 불러오기
  const loadLists = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem(LISTS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as List[];
        setLists(parsed);
        console.log('Lists loaded:', parsed.length);
      }
    } catch (error) {
      console.error('Failed to load lists:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 리스트 저장
  const saveLists = useCallback(async (newLists: List[]) => {
    try {
      await AsyncStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(newLists));
      console.log('Lists saved:', newLists.length);
      return true;
    } catch (error) {
      console.error('Failed to save lists:', error);
      throw error;
    }
  }, []);

  // 리스트 생성
  const createList = useCallback(
    async (title: string, description: string | undefined, categoryId: string) => {
      const newList: List = {
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

      try {
        setLists((prev) => {
          const updated = [...prev, newList];
          saveLists(updated).catch((error) => {
            console.error('Failed to create list:', error);
          });
          return updated;
        });
        return newList;
      } catch (error) {
        console.error('Error in createList:', error);
        throw error;
      }
    },
    [saveLists]
  );

  // 리스트 아이템 추가
  const addListItem = useCallback(
    async (listId: string, itemTitle: string) => {
      try {
        setLists((prev) => {
          const updated = prev.map((list) => {
            if (list.id === listId) {
              const newItem: ListItem = {
                id: `item_${Date.now()}`,
                listId,
                title: itemTitle,
                completed: false,
                createdAt: new Date().toISOString(),
              };
              return {
                ...list,
                items: [...list.items, newItem],
                totalCount: list.totalCount + 1,
                updatedAt: new Date().toISOString(),
              };
            }
            return list;
          });
          saveLists(updated).catch((error) => {
            console.error('Failed to add list item:', error);
          });
          return updated;
        });
      } catch (error) {
        console.error('Error in addListItem:', error);
        throw error;
      }
    },
    [saveLists]
  );

  // 리스트 아이템 토글 (완료/미완료)
  const toggleListItem = useCallback(
    async (listId: string, itemId: string) => {
      try {
        setLists((prev) => {
          const updated = prev.map((list) => {
            if (list.id === listId) {
              const updatedItems = list.items.map((item) => {
                if (item.id === itemId) {
                  return {
                    ...item,
                    completed: !item.completed,
                    completedAt: !item.completed ? new Date().toISOString() : undefined,
                  };
                }
                return item;
              });

              const completionCount = updatedItems.filter((i) => i.completed).length;
              const isCompleted = completionCount === list.totalCount && list.totalCount > 0;

              return {
                ...list,
                items: updatedItems,
                completionCount,
                isCompleted,
                completedAt: isCompleted ? new Date().toISOString() : list.completedAt,
                updatedAt: new Date().toISOString(),
              };
            }
            return list;
          });
          saveLists(updated).catch((error) => {
            console.error('Failed to toggle list item:', error);
          });
          return updated;
        });
      } catch (error) {
        console.error('Error in toggleListItem:', error);
        throw error;
      }
    },
    [saveLists]
  );

  // 리스트 아이템 삭제
  const deleteListItem = useCallback(
    async (listId: string, itemId: string) => {
      try {
        setLists((prev) => {
          const updated = prev.map((list) => {
            if (list.id === listId) {
              const updatedItems = list.items.filter((i) => i.id !== itemId);
              const wasCompleted = list.items.find((i) => i.id === itemId)?.completed ?? false;
              const completionCount = wasCompleted ? list.completionCount - 1 : list.completionCount;
              const totalCount = list.totalCount - 1;
              const isCompleted = completionCount === totalCount && totalCount > 0;

              return {
                ...list,
                items: updatedItems,
                completionCount,
                totalCount,
                isCompleted,
                updatedAt: new Date().toISOString(),
              };
            }
            return list;
          });
          saveLists(updated).catch((error) => {
            console.error('Failed to delete list item:', error);
          });
          return updated;
        });
      } catch (error) {
        console.error('Error in deleteListItem:', error);
        throw error;
      }
    },
    [saveLists]
  );

  // 리스트 삭제
  const deleteList = useCallback(
    async (listId: string) => {
      try {
        setLists((prev) => {
          const updated = prev.filter((l) => l.id !== listId);
          saveLists(updated).catch((error) => {
            console.error('Failed to delete list:', error);
          });
          return updated;
        });
      } catch (error) {
        console.error('Error in deleteList:', error);
        throw error;
      }
    },
    [saveLists]
  );

  // 리스트 조회
  const getListById = useCallback(
    (listId: string) => {
      return lists.find((l) => l.id === listId);
    },
    [lists]
  );

  // 카테고리별 리스트 조회
  const getListsByCategory = useCallback(
    (categoryId: string) => {
      return lists.filter((l) => l.categoryId === categoryId);
    },
    [lists]
  );

  // 초기 로드
  useEffect(() => {
    loadLists();
  }, [loadLists]);

  // 디버깅용: 리스트 상태 확인
  useEffect(() => {
    console.log('Lists state updated:', lists.length, 'lists');
  }, [lists]);

  return {
    lists,
    isLoading,
    createList,
    addListItem,
    toggleListItem,
    deleteListItem,
    deleteList,
    getListById,
    getListsByCategory,
  };
}
