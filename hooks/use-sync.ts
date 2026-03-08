import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from './use-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 클라우드 동기화 훅
 * 로컬 데이터와 서버 데이터를 동기화합니다
 */
export function useSync() {
  const { isAuthenticated } = useAuth();
  const syncInProgressRef = useRef(false);
  const lastSyncTimeRef = useRef<number>(0);

  // 서버에 데이터 업로드 (나중에 구현)
  const syncToServer = useCallback(async () => {
    if (!isAuthenticated || syncInProgressRef.current) return;

    try {
      syncInProgressRef.current = true;
      // TODO: 서버에 데이터 업로드
      lastSyncTimeRef.current = Date.now();
    } catch (error) {
      console.error('Failed to sync to server:', error);
    } finally {
      syncInProgressRef.current = false;
    }
  }, [isAuthenticated]);

  // 서버에서 데이터 다운로드 (나중에 구현)
  const syncFromServer = useCallback(async () => {
    if (!isAuthenticated || syncInProgressRef.current) return;

    try {
      syncInProgressRef.current = true;
      // TODO: 서버에서 데이터 다운로드
      lastSyncTimeRef.current = Date.now();
    } catch (error) {
      console.error('Failed to sync from server:', error);
    } finally {
      syncInProgressRef.current = false;
    }
  }, [isAuthenticated]);

  // 양방향 동기화
  const sync = useCallback(async () => {
    await syncFromServer();
    await syncToServer();
  }, [syncFromServer, syncToServer]);

  // 사용자 로그인 시 동기화
  useEffect(() => {
    if (isAuthenticated) {
      sync();
    }
  }, [isAuthenticated, sync]);

  return {
    sync,
    syncFromServer,
    syncToServer,
    isAuthenticated,
    lastSyncTime: lastSyncTimeRef.current,
  };
}
