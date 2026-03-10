import React, { createContext, useContext, useMemo } from 'react';
import { useLists } from '@/hooks/use-lists';
import { List } from '@/types/list';

interface ListsContextType {
  lists: List[];
  isLoading: boolean;
  createList: (title: string, description: string | undefined, categoryId: string) => Promise<List>;
  addListItem: (listId: string, itemTitle: string) => Promise<void>;
  toggleListItem: (listId: string, itemId: string, completionNote?: string) => Promise<void>;
  deleteListItem: (listId: string, itemId: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  updateListTitle: (listId: string, newTitle: string) => Promise<void>;
  updateListItemTitle: (listId: string, itemId: string, newTitle: string) => Promise<void>;
  updateListItemNote: (listId: string, itemId: string, newNote: string) => Promise<void>;
  reorderListItems: (listId: string, fromIndex: number, toIndex: number) => Promise<void>;
  reorderLists: (fromIndex: number, toIndex: number) => Promise<void>;
  getListById: (listId: string) => List | undefined;
  getListsByCategory: (categoryId: string) => List[];
}

const ListsContext = createContext<ListsContextType | undefined>(undefined);

export function ListsProvider({ children }: { children: React.ReactNode }) {
  const listsHook = useLists();
  const value = useMemo(() => listsHook, [listsHook]);

  return <ListsContext.Provider value={value}>{children}</ListsContext.Provider>;
}

export function useListsContext() {
  const context = useContext(ListsContext);
  if (!context) {
    throw new Error('useListsContext must be used within ListsProvider');
  }
  return context;
}
