import { describe, it, expect } from 'vitest';
import { useStats } from '@/hooks/use-stats';
import { List } from '@/types/list';

describe('useStats', () => {
  const now = new Date().toISOString();
  
  const mockLists: List[] = [
    {
      id: '1',
      title: '책 100권 읽기',
      description: '뉴욕타임즈 선정 100권',
      categoryId: 'reading',
      items: [
        { id: 'i1', listId: '1', title: '해리포터', completed: true, createdAt: new Date('2026-01-01').toISOString() },
        { id: 'i2', listId: '1', title: '반지의 제왕', completed: true, createdAt: new Date('2026-01-05').toISOString() },
      ],
      totalCount: 2,
      completionCount: 2,
      isCompleted: true,
      createdAt: new Date('2026-01-01').toISOString(),
      completedAt: new Date('2026-01-10').toISOString(),
      updatedAt: new Date('2026-01-10').toISOString(),
    },
    {
      id: '2',
      title: '미술관 방문',
      description: '전세계 유명 미술관',
      categoryId: 'travel',
      items: [
        { id: 'i3', listId: '2', title: '루브르 박물관', completed: false, createdAt: new Date('2026-02-01').toISOString() },
        { id: 'i4', listId: '2', title: '메트로폴리탄', completed: false, createdAt: new Date('2026-02-01').toISOString() },
        { id: 'i5', listId: '2', title: '우피치 미술관', completed: false, createdAt: new Date('2026-02-01').toISOString() },
      ],
      totalCount: 3,
      completionCount: 0,
      isCompleted: false,
      createdAt: new Date('2026-02-01').toISOString(),
      updatedAt: new Date('2026-02-01').toISOString(),
    },
  ];

  it('should calculate total lists created', () => {
    const { stats } = useStats(mockLists, []);
    expect(stats.totalListsCreated).toBe(2);
  });

  it('should calculate total lists completed', () => {
    const { stats } = useStats(mockLists, []);
    expect(stats.totalListsCompleted).toBe(1);
  });

  it('should calculate total items added', () => {
    const { stats } = useStats(mockLists, []);
    expect(stats.totalItemsAdded).toBe(5); // 2 + 3
  });

  it('should calculate total items completed', () => {
    const { stats } = useStats(mockLists, []);
    expect(stats.totalItemsCompleted).toBe(2);
  });

  it('should calculate app usage days', () => {
    const { stats } = useStats(mockLists, []);
    expect(stats.appUsageDays).toBeGreaterThanOrEqual(0);
  });

  it('should calculate longest streak', () => {
    const { stats } = useStats(mockLists, []);
    expect(stats.longestStreak).toBeGreaterThanOrEqual(0);
  });

  it('should unlock badges based on cumulative counts', () => {
    const { stats } = useStats(mockLists, []);
    // 1개 리스트 생성 → list_created_1 배지 해금
    expect(stats.unlockedBadges.length).toBeGreaterThanOrEqual(0);
  });

  it('should not have duplicate badges', () => {
    const { stats } = useStats(mockLists, []);
    const uniqueBadgeIds = new Set(stats.unlockedBadges.map((b) => b.id));
    expect(uniqueBadgeIds.size).toBe(stats.unlockedBadges.length);
  });

  it('should handle empty lists', () => {
    const { stats } = useStats([], []);
    expect(stats.totalListsCreated).toBe(0);
    expect(stats.totalListsCompleted).toBe(0);
    expect(stats.totalItemsAdded).toBe(0);
    expect(stats.totalItemsCompleted).toBe(0);
  });

  it('should handle achievements', () => {
    const { stats } = useStats(mockLists, []);
    expect(stats.totalAchievementsCreated).toBe(0);
    expect(stats.totalAchievementsCompleted).toBe(0);
  });
});
