import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { List, ListItem } from '@/types/list';

const STORAGE_KEY = 'starquest_lists';

export function useLists() {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLists = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLists(JSON.parse(stored));
      } else {
        setLists([]);
      }
    } catch (e) {
      console.error('Failed to load lists:', e);
      setLists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveToStorage = useCallback(async (newLists: List[]) => {
    try {
      console.log('[LOG] Lists AsyncStorage에 저장:', newLists.length, '개 리스트');
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newLists));
      console.log('[LOG] Lists AsyncStorage 저장 완료');
    } catch (e) {
      console.error('Failed to save lists:', e);
      throw e;
    }
  }, []);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  // 상태 변경 후 저장
  useEffect(() => {
    if (!loading) {
      saveToStorage(lists).catch((e) => console.error('Auto-save failed:', e));
    }
  }, [lists, loading, saveToStorage]);

  const addList = useCallback(
    async (title: string) => {
      const newList: List = {
        id: `list_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        title,
        items: [],
        completionCount: 0,
        totalCount: 0,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLists((prev) => [...prev, newList]);
      return newList;
    },
    []
  );

  const deleteList = useCallback(
    async (listId: string) => {
      console.log('[LOG] deleteList 함수 호출:', listId);
      console.log('[LOG] 현재 리스트 개수:', lists.length);
      
      const deletedList = lists.find((l) => l.id === listId);
      console.log('[LOG] 삭제할 리스트:', deletedList?.title);
      
      if (!deletedList) {
        console.error('[ERROR] 삭제할 리스트를 찾을 수 없음:', listId);
        return;
      }
      
      const newLists = lists.filter((l) => l.id !== listId);
      console.log('[LOG] 삭제 후 남은 리스트:', newLists.length, '개');
      
      setLists(newLists);
      console.log('[LOG] 리스트 상태 업데이트 완료');
    },
    [lists]
  );

  const addListItem = useCallback(
    async (listId: string, title: string) => {
      const newItem: ListItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        listId,
        title,
        completed: false,
        note: '',
        createdAt: new Date().toISOString(),
      };
      setLists((prev) =>
        prev.map((list) => {
          if (list.id === listId) {
            return {
              ...list,
              items: [...list.items, newItem],
              totalCount: list.totalCount + 1,
              updatedAt: new Date().toISOString(),
            };
          }
          return list;
        })
      );
      return newItem;
    },
    []
  );

  const deleteListItem = useCallback(
    async (listId: string, itemId: string) => {
      console.log('[LOG] deleteListItem 함수 호출:', listId, itemId);
      setLists((prev) =>
        prev.map((list) => {
          if (list.id === listId) {
            const itemToDelete = list.items.find((i) => i.id === itemId);
            console.log('[LOG] 삭제할 항목:', itemToDelete?.title);
            const updatedItems = list.items.filter((i) => i.id !== itemId);
            const wasCompleted = itemToDelete?.completed ?? false;
            const completionCount = wasCompleted ? list.completionCount - 1 : list.completionCount;
            const totalCount = list.totalCount - 1;
            const isCompleted = completionCount === totalCount && totalCount > 0;
            console.log('[LOG] 삭제 후 항목:', updatedItems.length, '개');
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
        })
      );
    },
    []
  );

  const toggleListItem = useCallback(
    async (listId: string, itemId: string, note?: string) => {
      setLists((prev) =>
        prev.map((list) => {
          if (list.id === listId) {
            const updatedItems = list.items.map((item) => {
              if (item.id === itemId) {
                const isCompleting = !item.completed;
                return {
                  ...item,
                  completed: isCompleting,
                  completedAt: isCompleting ? new Date().toISOString() : undefined,
                  completionNote: isCompleting && note ? note : item.completionNote,
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
              updatedAt: new Date().toISOString(),
            };
          }
          return list;
        })
      );
    },
    []
  );

  const updateListItemTitle = useCallback(
    async (listId: string, itemId: string, newTitle: string) => {
      setLists((prev) =>
        prev.map((list) => {
          if (list.id === listId) {
            return {
              ...list,
              items: list.items.map((item) =>
                item.id === itemId ? { ...item, title: newTitle } : item
              ),
              updatedAt: new Date().toISOString(),
            };
          }
          return list;
        })
      );
    },
    []
  );

  const updateListItemNote = useCallback(
    async (listId: string, itemId: string, note: string) => {
      setLists((prev) =>
        prev.map((list) => {
          if (list.id === listId) {
            return {
              ...list,
              items: list.items.map((item) =>
                item.id === itemId ? { ...item, note } : item
              ),
              updatedAt: new Date().toISOString(),
            };
          }
          return list;
        })
      );
    },
    []
  );

  const updateListTitle = useCallback(
    async (listId: string, newTitle: string) => {
      setLists((prev) =>
        prev.map((list) =>
          list.id === listId ? { ...list, title: newTitle, updatedAt: new Date().toISOString() } : list
        )
      );
    },
    []
  );

  const reorderLists = useCallback(
    async (fromIndex: number, toIndex: number) => {
      setLists((prev) => {
        const newLists = [...prev];
        const [movedItem] = newLists.splice(fromIndex, 1);
        newLists.splice(toIndex, 0, movedItem);
        return newLists;
      });
    },
    []
  );

  return {
    lists,
    loading,
    addList,
    deleteList,
    addListItem,
    deleteListItem,
    toggleListItem,
    updateListItemTitle,
    updateListItemNote,
    updateListTitle,
    reorderLists,
    reload: loadLists,
  };
}
