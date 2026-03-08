/**
 * 배지 타입 정의
 */

export type BadgeType =
  | 'first_list' // 첫 번째 리스트 완료
  | 'list_collector' // 3개 리스트 완료
  | 'list_master' // 10개 리스트 완료
  | 'speed_runner' // 1일 내에 리스트 완료
  | 'patient_one' // 30일 이상 걸려 리스트 완료
  | 'bulk_adder' // 한 리스트에 50개 이상 항목 추가
  | 'perfectionist' // 모든 항목을 정확히 완료한 리스트 5개
  | 'comeback_kid' // 7일 이상 중단 후 리스트 완료
  | 'marathon_runner'; // 100일 이상 걸려 리스트 완료

export interface Badge {
  id: BadgeType;
  name: string;
  description: string;
  emoji: string;
  color: string;
  unlockedAt?: string; // ISO 날짜 문자열
}

export interface UserStats {
  totalListsCreated: number;
  totalListsCompleted: number;
  totalItemsAdded: number;
  totalItemsCompleted: number;
  averageCompletionDays: number;
  fastestCompletionDays: number;
  slowestCompletionDays: number;
  longestStreak: number; // 연속 완료 일수
  unlockedBadges: BadgeType[];
}

export const BADGE_DEFINITIONS: Record<BadgeType, Badge> = {
  first_list: {
    id: 'first_list',
    name: '첫 발걸음',
    description: '첫 번째 리스트를 완료했어요',
    emoji: '🌟',
    color: '#F5C842',
  },
  list_collector: {
    id: 'list_collector',
    name: '수집가',
    description: '3개의 리스트를 완료했어요',
    emoji: '📚',
    color: '#4ECDC4',
  },
  list_master: {
    id: 'list_master',
    name: '마스터',
    description: '10개의 리스트를 완료했어요',
    emoji: '👑',
    color: '#FFD700',
  },
  speed_runner: {
    id: 'speed_runner',
    name: '번개',
    description: '1일 내에 리스트를 완료했어요',
    emoji: '⚡',
    color: '#FF6B6B',
  },
  patient_one: {
    id: 'patient_one',
    name: '인내심',
    description: '30일 이상 걸려 리스트를 완료했어요',
    emoji: '🐢',
    color: '#95E1D3',
  },
  bulk_adder: {
    id: 'bulk_adder',
    name: '야심가',
    description: '한 리스트에 50개 이상의 항목을 추가했어요',
    emoji: '🎯',
    color: '#A29BFE',
  },
  perfectionist: {
    id: 'perfectionist',
    name: '완벽주의자',
    description: '완벽하게 완료한 리스트 5개를 달성했어요',
    emoji: '💎',
    color: '#74B9FF',
  },
  comeback_kid: {
    id: 'comeback_kid',
    name: '복귀자',
    description: '7일 이상 중단 후 리스트를 완료했어요',
    emoji: '🔄',
    color: '#55EFC4',
  },
  marathon_runner: {
    id: 'marathon_runner',
    name: '마라토너',
    description: '100일 이상 걸려 리스트를 완료했어요',
    emoji: '🏃',
    color: '#FD79A8',
  },
};
