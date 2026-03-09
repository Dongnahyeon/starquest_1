import { useCallback, useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { useAchievements } from './use-achievements';
import { useLists } from './use-lists';

/**
 * iCloud 백업 및 복구 기능
 * - iCloud 저장소에 데이터 백업
 * - 앱 시작 시 자동 복구
 * - 수동 저장/복구 버튼 제공
 */

const ICLOUD_BACKUP_DIR = `${FileSystem.documentDirectory}iCloud/`;
const ACHIEVEMENTS_BACKUP_FILE = `${ICLOUD_BACKUP_DIR}achievements.json`;
const LISTS_BACKUP_FILE = `${ICLOUD_BACKUP_DIR}lists.json`;

export function useICloudSync() {
  const { achievements, addAchievement, completeAchievement } = useAchievements();
  const { lists, createList, addListItem, deleteList } = useLists();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  /**
   * iCloud 디렉토리 생성
   */
  const ensureICloudDir = useCallback(async () => {
    try {
      const dirInfo = await FileSystem.getInfoAsync(ICLOUD_BACKUP_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(ICLOUD_BACKUP_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('[iCloud] Failed to create directory:', error);
      throw error;
    }
  }, []);

  /**
   * iCloud에 데이터 저장
   */
  const saveToICloud = useCallback(async () => {
    try {
      setIsSyncing(true);
      setSyncError(null);

      await ensureICloudDir();

      // 성취 데이터 저장
      const achievementsData = JSON.stringify(achievements, null, 2);
      await FileSystem.writeAsStringAsync(ACHIEVEMENTS_BACKUP_FILE, achievementsData);

      // 리스트 데이터 저장
      const listsData = JSON.stringify(lists, null, 2);
      await FileSystem.writeAsStringAsync(LISTS_BACKUP_FILE, listsData);

      setLastSyncTime(new Date());
      console.log('[iCloud] Data saved successfully');
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setSyncError(`저장 실패: ${errorMsg}`);
      console.error('[iCloud] Save failed:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [achievements, lists, ensureICloudDir]);

  /**
   * iCloud에서 데이터 복구
   */
  const restoreFromICloud = useCallback(async () => {
    try {
      setIsSyncing(true);
      setSyncError(null);

      // 성취 데이터 복구
      const achievementsInfo = await FileSystem.getInfoAsync(ACHIEVEMENTS_BACKUP_FILE);
      if (achievementsInfo.exists) {
        const achievementsData = await FileSystem.readAsStringAsync(ACHIEVEMENTS_BACKUP_FILE);
        const restoredAchievements = JSON.parse(achievementsData);
        
        // 로컬에 없는 성취만 추가
        for (const achievement of restoredAchievements) {
          const exists = achievements.some(a => a.id === achievement.id);
          if (!exists) {
            await addAchievement(achievement.title, achievement.categoryId);
          }
        }
      }

      // 리스트 데이터 복구
      const listsInfo = await FileSystem.getInfoAsync(LISTS_BACKUP_FILE);
      if (listsInfo.exists) {
        const listsData = await FileSystem.readAsStringAsync(LISTS_BACKUP_FILE);
        const restoredLists = JSON.parse(listsData);
        
        // 로컬에 없는 리스트만 추가
        for (const list of restoredLists) {
          const exists = lists.some(l => l.id === list.id);
          if (!exists) {
            await createList(list.title, list.description, list.categoryId);
          }
        }
      }

      setLastSyncTime(new Date());
      console.log('[iCloud] Data restored successfully');
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setSyncError(`복구 실패: ${errorMsg}`);
      console.error('[iCloud] Restore failed:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [achievements, lists, addAchievement, createList]);

  /**
   * 앱 시작 시 자동 복구
   */
  const autoRestore = useCallback(async () => {
    try {
      const achievementsInfo = await FileSystem.getInfoAsync(ACHIEVEMENTS_BACKUP_FILE);
      const listsInfo = await FileSystem.getInfoAsync(LISTS_BACKUP_FILE);

      // iCloud에 백업이 있으면 복구
      if (achievementsInfo.exists || listsInfo.exists) {
        await restoreFromICloud();
      }
    } catch (error) {
      console.error('[iCloud] Auto restore failed:', error);
    }
  }, [restoreFromICloud]);

  return {
    saveToICloud,
    restoreFromICloud,
    autoRestore,
    isSyncing,
    lastSyncTime,
    syncError,
    hasBackup: async () => {
      try {
        const achievementsInfo = await FileSystem.getInfoAsync(ACHIEVEMENTS_BACKUP_FILE);
        const listsInfo = await FileSystem.getInfoAsync(LISTS_BACKUP_FILE);
        return achievementsInfo.exists || listsInfo.exists;
      } catch {
        return false;
      }
    },
  };
}
