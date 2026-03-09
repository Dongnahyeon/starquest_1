import { useEffect } from 'react';
import { useICloudSync } from './use-icloud-sync';

/**
 * 앱 시작 시 iCloud에서 자동 복구
 * - 앱 초기화 시 한 번만 실행
 * - iCloud에 백업이 있으면 자동 복구
 */
export function useICloudAutoRestore() {
  const { autoRestore, hasBackup } = useICloudSync();

  useEffect(() => {
    const initializeRestore = async () => {
      try {
        // iCloud에 백업이 있는지 확인
        const backupExists = await hasBackup();
        
        if (backupExists) {
          console.log('[iCloud] Backup found, attempting auto-restore...');
          await autoRestore();
        } else {
          console.log('[iCloud] No backup found');
        }
      } catch (error) {
        console.error('[iCloud] Auto-restore initialization failed:', error);
      }
    };

    initializeRestore();
  }, [autoRestore, hasBackup]);
}
