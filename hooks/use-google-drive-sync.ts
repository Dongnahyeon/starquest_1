import { useCallback } from 'react';
import { Achievement } from '@/types/achievement';
import { List } from '@/types/list';

interface SyncData {
  achievements: Achievement[];
  lists: List[];
  syncedAt: string;
  userEmail: string;
}

interface GoogleDriveSyncResult {
  success: boolean;
  message: string;
  data?: SyncData;
}

/**
 * Hook for Google Drive synchronization
 * Handles saving and loading data from Google Drive
 */
export function useGoogleDriveSync() {

  /**
   * Save data to Google Drive
   */
  const saveToGoogleDrive = useCallback(
    async (
      achievements: Achievement[],
      lists: List[],
      userEmail: string
    ): Promise<GoogleDriveSyncResult> => {
      try {
        const dataToSync: SyncData = {
          achievements,
          lists,
          syncedAt: new Date().toISOString(),
          userEmail,
        };

        // Get access token from Google Sign-In
        const accessToken = (window as any).google?.accounts?.oauth2?.getAccessToken?.();
        if (!accessToken) {
          console.warn('No access token available for Google Drive sync');
          return {
            success: false,
            message: 'Access token not available',
          };
        }

        // Store token for later use if needed

        // Check if backup file already exists
        const listResponse = await fetch(
          'https://www.googleapis.com/drive/v3/files?q=name="starquest-backup.json" and trashed=false&spaces=drive&pageSize=1',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!listResponse.ok) {
          throw new Error('Failed to check existing backup');
        }

        const listData = await listResponse.json();
        const existingFileId = listData.files?.[0]?.id;

        // Upload or update file
        const uploadUrl = existingFileId
          ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`
          : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

        const uploadMethod = existingFileId ? 'PATCH' : 'POST';

        // Prepare metadata for new file
        const metadata = {
          name: 'starquest-backup.json',
          mimeType: 'application/json',
          description: 'StarQuest achievements and lists backup',
        };

        let uploadBody: any;
        let uploadHeaders: any;

        if (existingFileId) {
          // Update existing file - just send JSON data
          uploadBody = JSON.stringify(dataToSync);
          uploadHeaders = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          };
        } else {
          // Create new file - use multipart
          const boundary = '===============7330845974216740156==';
          const metadataPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
          const dataPart = `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(dataToSync)}\r\n--${boundary}--`;

          uploadBody = metadataPart + dataPart;
          uploadHeaders = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary="${boundary}"`,
          };
        }

        const uploadResponse = await fetch(uploadUrl, {
          method: uploadMethod,
          headers: uploadHeaders,
          body: uploadBody,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Failed to sync to Google Drive: ${errorText}`);
        }

        return {
          success: true,
          message: 'Data synced to Google Drive successfully',
          data: dataToSync,
        };
      } catch (error) {
        console.error('Google Drive sync error:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    },
    []
  );

  /**
   * Load data from Google Drive
   */
  const loadFromGoogleDrive = useCallback(
    async (accessToken: string): Promise<GoogleDriveSyncResult> => {
      try {
        // Find backup file
        const listResponse = await fetch(
          'https://www.googleapis.com/drive/v3/files?q=name="starquest-backup.json" and trashed=false&spaces=drive&pageSize=1&fields=files(id,webContentLink)',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!listResponse.ok) {
          throw new Error('Failed to list files from Google Drive');
        }

        const listData = await listResponse.json();
        const fileId = listData.files?.[0]?.id;

        if (!fileId) {
          return {
            success: false,
            message: 'No backup file found on Google Drive',
          };
        }

        // Download file content
        const downloadResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!downloadResponse.ok) {
          throw new Error('Failed to download backup file');
        }

        const syncData: SyncData = await downloadResponse.json();

        return {
          success: true,
          message: 'Data loaded from Google Drive successfully',
          data: syncData,
        };
      } catch (error) {
        console.error('Google Drive load error:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    },
    []
  );

  /**
   * Delete backup from Google Drive
   */
  const deleteFromGoogleDrive = useCallback(
    async (accessToken: string): Promise<GoogleDriveSyncResult> => {
      try {
        // Find backup file
        const listResponse = await fetch(
          'https://www.googleapis.com/drive/v3/files?q=name="starquest-backup.json" and trashed=false&spaces=drive&pageSize=1&fields=files(id)',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!listResponse.ok) {
          throw new Error('Failed to list files from Google Drive');
        }

        const listData = await listResponse.json();
        const fileId = listData.files?.[0]?.id;

        if (!fileId) {
          return {
            success: false,
            message: 'No backup file found to delete',
          };
        }

        // Delete file
        const deleteResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!deleteResponse.ok) {
          throw new Error('Failed to delete backup file');
        }

        return {
          success: true,
          message: 'Backup deleted from Google Drive successfully',
        };
      } catch (error) {
        console.error('Google Drive delete error:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    },
    []
  );

  return {
    saveToGoogleDrive,
    loadFromGoogleDrive,
    deleteFromGoogleDrive,
  };
}
