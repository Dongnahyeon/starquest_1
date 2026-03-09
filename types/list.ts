/**
 * 리스트 아이템 타입
 * 리스트 내의 개별 항목
 */
export interface ListItem {
  id: string;
  listId: string;
  title: string;
  completed: boolean;
  completedAt?: string; // ISO 8601 format
  createdAt: string;
}

/**
 * 리스트 타입
 * 여러 아이템을 그룹화한 리스트 (예: "타임즈 선정 100권의 책")
 */
export interface List {
  id: string;
  title: string;
  description?: string;
  categoryId: string; // 같은 카테고리 시스템 사용
  items: ListItem[];
  completionCount: number; // 완료된 아이템 수
  totalCount: number; // 전체 아이템 수
  isCompleted: boolean; // 모든 아이템이 완료되었는가?
  completedAt?: string; // 리스트 완료 시간
  createdAt: string;
  updatedAt: string;
}

/**
 * 리스트 밝기 상태 계산
 */
export function getListBrightness(completionCount: number, totalCount: number): string {
  if (totalCount === 0) return 'dim';
  const percentage = completionCount / totalCount;
  if (percentage === 0) return 'dim';
  if (percentage < 0.33) return 'faint';
  if (percentage < 0.66) return 'bright';
  if (percentage < 1) return 'bright';
  return 'supernova';
}

/**
 * 리스트 별 색상 계산 (카테고리별)
 */
export function getListStarColor(categoryId: string): string {
  const colorMap: Record<string, string> = {
    exercise: '#FF6B6B', // 운동 - 빨강
    reading: '#4ECDC4', // 독서 - 청록
    study: '#45B7D1', // 학습 - 파랑
    health: '#96CEB4', // 건강 - 초록
    creative: '#FFEAA7', // 창작 - 노랑
    social: '#DDA0DD', // 소통 - 자주
    other: '#A0AEC0', // 기타 - 회색
  };
  return colorMap[categoryId] || '#A0AEC0';
}

/**
 * 리스트 별 글로우 강도 계산
 */
export function getListStarGlowIntensity(completionCount: number, totalCount: number): number {
  if (totalCount === 0) return 0;
  const percentage = completionCount / totalCount;
  return Math.min(percentage, 1);
}
