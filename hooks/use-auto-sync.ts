import { useEffect, useRef } from 'react';
import { useAuth } from './use-auth';

export function useAutoSync() {
  const { isAuthenticated } = useAuth();
  const syncInProgressRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || syncInProgressRef.current) {
      return;
    }

    const syncData = async () => {
      try {
        syncInProgressRef.current = true;
        console.log('[useAutoSync] Data sync initiated');
        // 향후 실제 동기화 로직 추가
      } catch (error) {
        console.error('[useAutoSync] Sync failed:', error);
      } finally {
        syncInProgressRef.current = false;
      }
    };

    // 로그인 후 1초 후 동기화 시작
    const timer = setTimeout(syncData, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return {
    isSyncing: syncInProgressRef.current,
  };
}
