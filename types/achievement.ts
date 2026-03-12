export type StarBrightness = 'dim' | 'faint' | 'bright' | 'supernova';

export interface Achievement {
  id: string;
  title: string;
  categoryId: string;
  completionCount: number;
  createdAt: string;
  lastCompletedAt?: string;
  completionHistory: string[]; // ISO date strings
  dynamicName?: string; // 별 색상에 따라 동적으로 변경되는 이름
  isArchived?: boolean; // 숨김 상태
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: string;
}

export interface AppData {
  achievements: Achievement[];
  categories: Category[];
}

export function getStarBrightness(completionCount: number): StarBrightness {
  if (completionCount === 0) return 'dim';
  if (completionCount <= 2) return 'faint';
  if (completionCount <= 5) return 'bright';
  return 'supernova';
}

// Color progression based on completion count thresholds
// 0: 회색, 1: 주황색, 4: 붉은색, 16: 청색, 64: 백색, 256: 노랑, 1024: 보라, 4096+: 샛노랑
// 부드럽고 눈에 편한 색상으로 조정
export function getStarColor(completionCount: number): string {
  // 9단계 진화 시스템 (4배씩 증가: 0, 1, 4, 16, 64, 256, 1024, 4096, 16384+)
  if (completionCount === 0) return '#6B7280'; // 1. 희미한 점 (어두운 회색)
  if (completionCount === 1) return '#D1D5DB'; // 2. 가느다란 반짝임 (밝은 회색)
  if (completionCount < 16) return '#93C5FD'; // 3. 작은 빛의 맥박 (밝은 파란색) - 4~15회
  if (completionCount < 64) return '#3B82F6'; // 4. 은은한 별빛 (파란색) - 16~63회
  if (completionCount < 256) return '#FCD34D'; // 5. 또렷해지는 광채 (밝은 노란색) - 64~255회
  if (completionCount < 1024) return '#FBBF24'; // 6. 부드럽게 퍼지는 빛 (노란색) - 256~1023회
  if (completionCount < 4096) return '#FB923C'; // 7. 선명하게 타오르는 별빛 (주황색) - 1024~4095회
  if (completionCount < 16384) return '#EF4444'; // 8. 눈부시게 빛나는 순간 (밝은 빨간색) - 4096~16383회
  return '#FCD34D'; // 9. 찬란하게 빛나는 별 (밝은 황금색) - 16384회 이상
}

export function getStarGlowIntensity(completionCount: number): number {
  if (completionCount === 0) return 0;
  if (completionCount === 1) return 0.2;
  if (completionCount < 16) return 0.4;
  if (completionCount < 64) return 0.5;
  if (completionCount < 256) return 0.7;
  if (completionCount < 1024) return 0.85;
  if (completionCount < 4096) return 0.9;
  return 1.0;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'exercise', name: '운동', emoji: '🏃', color: '#68D391', createdAt: new Date().toISOString() },
  { id: 'reading', name: '독서', emoji: '📚', color: '#76E4F7', createdAt: new Date().toISOString() },
  { id: 'study', name: '학습', emoji: '🎓', color: '#F6AD55', createdAt: new Date().toISOString() },
  { id: 'health', name: '건강', emoji: '💊', color: '#FC8181', createdAt: new Date().toISOString() },
  { id: 'creative', name: '창작', emoji: '🎨', color: '#B794F4', createdAt: new Date().toISOString() },
  { id: 'social', name: '소통', emoji: '💬', color: '#F6E05E', createdAt: new Date().toISOString() },
  { id: 'other', name: '기타', emoji: '⭐', color: '#A0AEC0', createdAt: new Date().toISOString() },
];

// 별 색상에 따른 동적 이름 반환 - 9단계 진화 시스템 (4배씩 증가)
export function getStarDynamicName(completionCount: number): string {
  if (completionCount === 0) return '희미한 점';
  if (completionCount === 1) return '가느다란 반짝임';
  if (completionCount < 16) return '작은 빛의 맥박';
  if (completionCount < 64) return '은은한 별빛';
  if (completionCount < 256) return '또렷해지는 광채';
  if (completionCount < 1024) return '부드럽게 퍼지는 빛';
  if (completionCount < 4096) return '선명하게 타오르는 별빛';
  if (completionCount < 16384) return '눈부시게 빛나는 순간';
  return '찬란하게 빛나는 별';
}
