/**
 * 배지 타입 정의
 * 30-50년 장기 사용을 고려한 배지 시스템
 */

export type BadgeCategory = 
  | 'cumulative_list' // 누적 리스트 생성
  | 'cumulative_list_completed' // 누적 리스트 완료
  | 'cumulative_item_added' // 누적 항목 추가
  | 'cumulative_item_completed' // 누적 항목 완료
  | 'time_milestone' // 시간 경과 이정표
  | 'streak' // 연속 활동
  | 'special_event'; // 특별 이벤트

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: BadgeCategory;
  threshold: number; // 달성 조건 (수치 기반)
  thresholdType: 'count' | 'days' | 'event'; // 조건 유형
  unlockedAt?: string; // 달성 시간 (ISO 8601)
  progress?: number; // 진행도 (0-100)
}

export interface BadgeProgress {
  badgeId: string;
  currentValue: number;
  targetValue: number;
  percentage: number;
  unlockedAt?: string;
}

/**
 * 모든 배지 정의 (20-25개)
 */
export const ALL_BADGES: Badge[] = [
  // 누적 리스트 생성 (4개)
  {
    id: 'list_created_1',
    name: '첫 리스트 생성',
    description: '첫 번째 리스트를 생성했습니다',
    emoji: '📋',
    category: 'cumulative_list',
    threshold: 1,
    thresholdType: 'count',
  },
  {
    id: 'list_created_10',
    name: '리스트 수집가',
    description: '10개의 리스트를 생성했습니다',
    emoji: '📚',
    category: 'cumulative_list',
    threshold: 10,
    thresholdType: 'count',
  },
  {
    id: 'list_created_100',
    name: '리스트 마스터',
    description: '100개의 리스트를 생성했습니다',
    emoji: '🏛️',
    category: 'cumulative_list',
    threshold: 100,
    thresholdType: 'count',
  },
  {
    id: 'list_created_1000',
    name: '리스트 전설',
    description: '1000개의 리스트를 생성했습니다',
    emoji: '👑',
    category: 'cumulative_list',
    threshold: 1000,
    thresholdType: 'count',
  },

  // 누적 리스트 완료 (4개)
  {
    id: 'list_completed_1',
    name: '첫 리스트 완료',
    description: '첫 번째 리스트를 완료했습니다',
    emoji: '✅',
    category: 'cumulative_list_completed',
    threshold: 1,
    thresholdType: 'count',
  },
  {
    id: 'list_completed_10',
    name: '완료의 습관',
    description: '10개의 리스트를 완료했습니다',
    emoji: '🎯',
    category: 'cumulative_list_completed',
    threshold: 10,
    thresholdType: 'count',
  },
  {
    id: 'list_completed_100',
    name: '완료의 장인',
    description: '100개의 리스트를 완료했습니다',
    emoji: '🏆',
    category: 'cumulative_list_completed',
    threshold: 100,
    thresholdType: 'count',
  },
  {
    id: 'list_completed_1000',
    name: '완료의 신',
    description: '1000개의 리스트를 완료했습니다',
    emoji: '⚡',
    category: 'cumulative_list_completed',
    threshold: 1000,
    thresholdType: 'count',
  },

  // 누적 항목 추가 (4개)
  {
    id: 'item_added_10',
    name: '항목 추가 시작',
    description: '10개의 항목을 추가했습니다',
    emoji: '➕',
    category: 'cumulative_item_added',
    threshold: 10,
    thresholdType: 'count',
  },
  {
    id: 'item_added_100',
    name: '항목 수집가',
    description: '100개의 항목을 추가했습니다',
    emoji: '📝',
    category: 'cumulative_item_added',
    threshold: 100,
    thresholdType: 'count',
  },
  {
    id: 'item_added_1000',
    name: '항목 마스터',
    description: '1000개의 항목을 추가했습니다',
    emoji: '📖',
    category: 'cumulative_item_added',
    threshold: 1000,
    thresholdType: 'count',
  },
  {
    id: 'item_added_10000',
    name: '항목 전설',
    description: '10000개의 항목을 추가했습니다',
    emoji: '🌟',
    category: 'cumulative_item_added',
    threshold: 10000,
    thresholdType: 'count',
  },

  // 누적 항목 완료 (4개)
  {
    id: 'item_completed_10',
    name: '항목 완료 시작',
    description: '10개의 항목을 완료했습니다',
    emoji: '✔️',
    category: 'cumulative_item_completed',
    threshold: 10,
    thresholdType: 'count',
  },
  {
    id: 'item_completed_100',
    name: '항목 완료 수집가',
    description: '100개의 항목을 완료했습니다',
    emoji: '💯',
    category: 'cumulative_item_completed',
    threshold: 100,
    thresholdType: 'count',
  },
  {
    id: 'item_completed_1000',
    name: '항목 완료 마스터',
    description: '1000개의 항목을 완료했습니다',
    emoji: '🎖️',
    category: 'cumulative_item_completed',
    threshold: 1000,
    thresholdType: 'count',
  },
  {
    id: 'item_completed_10000',
    name: '항목 완료 전설',
    description: '10000개의 항목을 완료했습니다',
    emoji: '💎',
    category: 'cumulative_item_completed',
    threshold: 10000,
    thresholdType: 'count',
  },

  // 시간 경과 이정표 (4개)
  {
    id: 'time_1year',
    name: '1년 여정',
    description: '앱을 1년 동안 사용했습니다',
    emoji: '📅',
    category: 'time_milestone',
    threshold: 365,
    thresholdType: 'days',
  },
  {
    id: 'time_5years',
    name: '5년 동반자',
    description: '앱을 5년 동안 사용했습니다',
    emoji: '🌍',
    category: 'time_milestone',
    threshold: 1825,
    thresholdType: 'days',
  },
  {
    id: 'time_10years',
    name: '10년 신화',
    description: '앱을 10년 동안 사용했습니다',
    emoji: '🏔️',
    category: 'time_milestone',
    threshold: 3650,
    thresholdType: 'days',
  },
  {
    id: 'time_20years',
    name: '20년 전설',
    description: '앱을 20년 동안 사용했습니다',
    emoji: '👨‍🦳',
    category: 'time_milestone',
    threshold: 7300,
    thresholdType: 'days',
  },

  // 연속 활동 (3개)
  {
    id: 'streak_100days',
    name: '100일 연속',
    description: '100일 연속으로 활동했습니다',
    emoji: '🔥',
    category: 'streak',
    threshold: 100,
    thresholdType: 'days',
  },
  {
    id: 'streak_1year',
    name: '1년 연속',
    description: '1년 연속으로 활동했습니다',
    emoji: '✨',
    category: 'streak',
    threshold: 365,
    thresholdType: 'days',
  },
  {
    id: 'streak_5years',
    name: '5년 연속',
    description: '5년 연속으로 활동했습니다',
    emoji: '💫',
    category: 'streak',
    threshold: 1825,
    thresholdType: 'days',
  },

  // 특별 이벤트 (3개)
  {
    id: 'special_first_achievement',
    name: '첫 별 완료',
    description: '첫 번째 별을 완료했습니다',
    emoji: '⭐',
    category: 'special_event',
    threshold: 1,
    thresholdType: 'event',
  },
  {
    id: 'special_1000days',
    name: '1000일 이정표',
    description: '앱 사용 1000일을 달성했습니다',
    emoji: '🎉',
    category: 'special_event',
    threshold: 1000,
    thresholdType: 'days',
  },
  {
    id: 'special_night_owl',
    name: '야행형',
    description: '밤에 주로 활동합니다',
    emoji: '🌙',
    category: 'special_event',
    threshold: 1,
    thresholdType: 'event',
  },
];

export const BADGE_MAP = new Map(ALL_BADGES.map(badge => [badge.id, badge]));
