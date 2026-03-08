import { useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';

export function useDownloadSync() {
  const { isAuthenticated } = useAuth();

  // 로컬과 서버 데이터 병합
  const mergeData = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      // 서버에서 데이터 가져오기
      const achievementsResponse = await fetch('/api/trpc/sync.achievements.getAll');
      const listsResponse = await fetch('/api/trpc/sync.lists.getAll');

      if (achievementsResponse.ok) {
        const serverAchievements = await achievementsResponse.json();
        console.log('[useDownloadSync] Server achievements:', serverAchievements);
      }

      if (listsResponse.ok) {
        const serverLists = await listsResponse.json();
        console.log('[useDownloadSync] Server lists:', serverLists);
      }
    } catch (error) {
      console.error('[useDownloadSync] Merge failed:', error);
    }
  }, [isAuthenticated]);

  // 로그인 후 자동 다운로드
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        mergeData();
      }, 2000); // 업로드 후 2초 후 다운로드
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, mergeData]);

  return {
    mergeData,
  };
}
