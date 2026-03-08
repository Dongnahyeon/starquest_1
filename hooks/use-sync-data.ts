import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useAchievements } from './use-achievements';
import { useLists } from './use-lists';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export function useSyncData() {
  const { isAuthenticated } = useAuth();
  const { achievements } = useAchievements();
  const { lists } = useLists();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  // 로컬 데이터를 서버에 업로드
  const uploadLocalData = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setSyncStatus('syncing');
      setSyncMessage('로컬 데이터 업로드 중...');

      // 성취 목표 업로드
      for (const achievement of achievements) {
        try {
          const response = await fetch('/api/trpc/sync.achievements.update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: achievement.id,
              title: achievement.title,
              categoryId: achievement.categoryId,
              completionCount: achievement.completionCount,
            }),
          });
          if (!response.ok) {
            throw new Error(`Failed to upload achievement: ${response.statusText}`);
          }
        } catch (error) {
          console.error('Failed to upload achievement:', achievement.id, error);
        }
      }

      // 리스트 업로드
      for (const list of lists) {
        try {
          const response = await fetch('/api/trpc/sync.lists.update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: list.id,
              title: list.title,
              description: list.description,
              categoryId: list.categoryId,
              totalCount: list.totalCount,
              completionCount: list.completionCount,
              isCompleted: list.isCompleted,
              completedAt: list.completedAt ? new Date(list.completedAt) : undefined,
            }),
          });
          if (!response.ok) {
            throw new Error(`Failed to upload list: ${response.statusText}`);
          }
        } catch (error) {
          console.error('Failed to upload list:', list.id, error);
        }
      }

      setSyncStatus('success');
      setSyncMessage('데이터 동기화 완료!');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      setSyncMessage('동기화 실패. 다시 시도해주세요.');
    }
  }, [isAuthenticated, achievements, lists]);

  // 로그인 후 자동 동기화
  useEffect(() => {
    if (isAuthenticated && syncStatus === 'idle') {
      const timer = setTimeout(() => {
        uploadLocalData();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, uploadLocalData, syncStatus]);

  return {
    syncStatus,
    syncMessage,
    uploadLocalData,
  };
}
