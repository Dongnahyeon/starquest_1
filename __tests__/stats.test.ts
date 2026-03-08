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
    const { stats } = useStats(mockLists);
    expect(stats.totalListsCreated).toBe(2);
  });

  it('should calculate total lists completed', () => {
    const { stats } = useStats(mockLists);
    expect(stats.totalListsCompleted).toBe(1);
  });

  it('should calculate total items added', () => {
    const { stats } = useStats(mockLists);
    expect(stats.totalItemsAdded).toBe(5); // 2 + 3
  });

  it('should calculate total items completed', () => {
    const { stats } = useStats(mockLists);
    expect(stats.totalItemsCompleted).toBe(2);
  });

  it('should calculate average completion days', () => {
    const { stats } = useStats(mockLists);
    // 첫 번째 리스트: 2026-01-01 ~ 2026-01-10 = 9일
    expect(stats.averageCompletionDays).toBe(9);
  });

  it('should unlock first_list badge when 1 list is completed', () => {
    const { stats } = useStats(mockLists);
    expect(stats.unlockedBadges).toContain('first_list');
  });

  it('should not unlock list_collector badge when less than 3 lists are completed', () => {
    const { stats } = useStats(mockLists);
    expect(stats.unlockedBadges).not.toContain('list_collector');
  });

  it('should unlock list_collector badge when 3 lists are completed', () => {
    const completedLists: List[] = [
      ...mockLists,
      {
        id: '3',
        title: '영화 50편 보기',
        description: 'IMDb 상위 50편',
        categoryId: 'entertainment',
        items: [],
        totalCount: 50,
        completionCount: 50,
        isCompleted: true,
        createdAt: new Date('2026-03-01').toISOString(),
        completedAt: new Date('2026-03-15').toISOString(),
        updatedAt: new Date('2026-03-15').toISOString(),
      },
    ];
    const { stats } = useStats(completedLists);
    expect(stats.unlockedBadges).toContain('list_collector');
  });

  it('should unlock speed_runner badge for lists completed in 1 day', () => {
    const fastLists: List[] = [
      {
        id: '1',
        title: '빠른 리스트',
        description: '1일 안에 완료',
        categoryId: 'test',
        items: [],
        totalCount: 5,
        completionCount: 5,
        isCompleted: true,
        createdAt: new Date('2026-01-01').toISOString(),
        completedAt: new Date('2026-01-01').toISOString(),
        updatedAt: new Date('2026-01-01').toISOString(),
      },
    ];
    const { stats } = useStats(fastLists);
    expect(stats.unlockedBadges).toContain('speed_runner');
  });

  it('should unlock patient_one badge for lists taking 30+ days', () => {
    const slowLists: List[] = [
      {
        id: '1',
        title: '오래된 리스트',
        description: '30일 이상 소요',
        categoryId: 'test',
        items: [],
        totalCount: 10,
        completionCount: 10,
        isCompleted: true,
        createdAt: new Date('2026-01-01').toISOString(),
        completedAt: new Date('2026-02-01').toISOString(),
        updatedAt: new Date('2026-02-01').toISOString(),
      },
    ];
    const { stats } = useStats(slowLists);
    expect(stats.unlockedBadges).toContain('patient_one');
  });

  it('should unlock bulk_adder badge for lists with 50+ items', () => {
    const bulkLists: List[] = [
      {
        id: '1',
        title: '많은 항목',
        description: '50개 이상 항목',
        categoryId: 'test',
        items: Array.from({ length: 50 }, (_, i) => ({
          id: `i${i}`,
          listId: '1',
          title: `항목 ${i}`,
          completed: false,
          createdAt: new Date().toISOString(),
        })),
        totalCount: 50,
        completionCount: 0,
        isCompleted: false,
        createdAt: new Date('2026-01-01').toISOString(),
        updatedAt: new Date('2026-01-01').toISOString(),
      },
    ];
    const { stats } = useStats(bulkLists);
    expect(stats.unlockedBadges).toContain('bulk_adder');
  });

  it('should unlock perfectionist badge for 5 perfectly completed lists', () => {
    const perfectLists: List[] = Array.from({ length: 5 }, (_, i) => ({
      id: `${i}`,
      title: `완벽한 리스트 ${i}`,
      description: '',
      categoryId: 'test',
      items: Array.from({ length: 3 }, (_, j) => ({
        id: `i${j}`,
        listId: `${i}`,
        title: `항목 ${j}`,
        completed: true,
        createdAt: new Date().toISOString(),
      })),
      totalCount: 3,
      completionCount: 3,
      isCompleted: true,
      createdAt: new Date(`2026-0${i + 1}-01`).toISOString(),
      completedAt: new Date(`2026-0${i + 1}-10`).toISOString(),
      updatedAt: new Date(`2026-0${i + 1}-10`).toISOString(),
    }));
    const { stats } = useStats(perfectLists);
    expect(stats.unlockedBadges).toContain('perfectionist');
  });

  it('should not have duplicate badges', () => {
    const { stats } = useStats(mockLists);
    const uniqueBadges = new Set(stats.unlockedBadges);
    expect(uniqueBadges.size).toBe(stats.unlockedBadges.length);
  });

  it('should calculate fastest completion days', () => {
    const { stats } = useStats(mockLists);
    expect(stats.fastestCompletionDays).toBe(9);
  });

  it('should calculate slowest completion days', () => {
    const { stats } = useStats(mockLists);
    expect(stats.slowestCompletionDays).toBe(9);
  });
});
