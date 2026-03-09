import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGoogleDriveSync } from '@/hooks/use-google-drive-sync';
import { Achievement } from '@/types/achievement';
import { List } from '@/types/list';

// Mock data
const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: '첫 번째 별',
    categoryId: 'exercise',
    completionCount: 5,
    createdAt: '2026-01-01',
    lastCompletedAt: '2026-01-05',
    completionHistory: ['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05'],
  },
  {
    id: '2',
    title: '두 번째 별',
    categoryId: 'reading',
    completionCount: 3,
    createdAt: '2026-01-10',
    lastCompletedAt: '2026-01-12',
    completionHistory: ['2026-01-10', '2026-01-11', '2026-01-12'],
  },
];

const mockLists: List[] = [
  {
    id: '1',
    title: '첫 번째 리스트',
    categoryId: 'reading',
    items: [
      { id: '1', listId: '1', title: '항목 1', completed: true, createdAt: '2026-01-01' },
      { id: '2', listId: '1', title: '항목 2', completed: false, createdAt: '2026-01-02' },
    ],
    completionCount: 1,
    totalCount: 2,
    isCompleted: false,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
];

describe('useGoogleDriveSync', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('should return sync functions', () => {
    const { saveToGoogleDrive, loadFromGoogleDrive, deleteFromGoogleDrive } = useGoogleDriveSync();

    expect(saveToGoogleDrive).toBeDefined();
    expect(loadFromGoogleDrive).toBeDefined();
    expect(deleteFromGoogleDrive).toBeDefined();
  });

  it('should handle save without access token', async () => {
    const { saveToGoogleDrive } = useGoogleDriveSync();

    const response = await saveToGoogleDrive(
      mockAchievements,
      mockLists,
      'test@example.com'
    );

    expect(response.success).toBe(false);
    expect(response.message).toContain('Access token');
  });

  it('should format sync data correctly', async () => {
    const { saveToGoogleDrive } = useGoogleDriveSync();

    // Mock the window.google object
    (window as any).google = {
      accounts: {
        oauth2: {
          getAccessToken: () => 'mock-token',
        },
      },
    };

    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ files: [] }),
      })
    ) as any;

    const response = await saveToGoogleDrive(
      mockAchievements,
      mockLists,
      'test@example.com'
    );

    // Verify data structure
    if (response.data) {
      expect(response.data.achievements).toEqual(mockAchievements);
      expect(response.data.lists).toEqual(mockLists);
      expect(response.data.userEmail).toBe('test@example.com');
      expect(response.data.syncedAt).toBeDefined();
    }
  });

  it('should handle load without access token', async () => {
    const { loadFromGoogleDrive } = useGoogleDriveSync();

    const response = await loadFromGoogleDrive('');

    expect(response.success).toBe(false);
  });

  it('should handle delete without access token', async () => {
    const { deleteFromGoogleDrive } = useGoogleDriveSync();

    const response = await deleteFromGoogleDrive('');

    expect(response.success).toBe(false);
  });

  it('should return error message on failed save', async () => {
    const { saveToGoogleDrive } = useGoogleDriveSync();

    // Mock the window.google object
    (window as any).google = {
      accounts: {
        oauth2: {
          getAccessToken: () => 'mock-token',
        },
      },
    };

    // Mock fetch to fail
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve('Network error'),
      })
    ) as any;

    const response = await saveToGoogleDrive(
      mockAchievements,
      mockLists,
      'test@example.com'
    );

    expect(response.success).toBe(false);
    expect(response.message).toBeDefined();
  });

  it('should handle achievements with multiple completions', async () => {
    const { saveToGoogleDrive } = useGoogleDriveSync();

    const completionDates = Array.from({ length: 50 }, (_, i) =>
      new Date(2026, 0, i + 1).toISOString().split('T')[0]
    );

    const achievementWithManyCompletions: Achievement = {
      id: '3',
      title: '많은 완료 기록',
      categoryId: 'health',
      completionCount: 50,
      createdAt: '2026-01-01',
      lastCompletedAt: completionDates[completionDates.length - 1],
      completionHistory: completionDates,
    };

    (window as any).google = {
      accounts: {
        oauth2: {
          getAccessToken: () => 'mock-token',
        },
      },
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ files: [] }),
      })
    ) as any;

    const response = await saveToGoogleDrive(
      [achievementWithManyCompletions],
      [],
      'test@example.com'
    );

    if (response.data) {
      expect(response.data.achievements[0].completionCount).toBe(50);
      expect(response.data.achievements[0].completionHistory.length).toBe(50);
    }
  });

  it('should handle empty achievements and lists', async () => {
    const { saveToGoogleDrive } = useGoogleDriveSync();

    // Mock the window.google object
    (window as any).google = {
      accounts: {
        oauth2: {
          getAccessToken: () => 'mock-token',
        },
      },
    };

    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ files: [] }),
      })
    ) as any;

    const response = await saveToGoogleDrive([], [], 'test@example.com');

    expect(response.success).toBe(true);
    if (response.data) {
      expect(response.data.achievements.length).toBe(0);
      expect(response.data.lists.length).toBe(0);
    }
  });
});
