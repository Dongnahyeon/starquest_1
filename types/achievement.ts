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
  if (completionCount === 0) return '#9CA3AF'; // 회색 (밝은 회색)
  if (completionCount === 1) return '#FB923C'; // 주황색 (부드러운 주황)
  if (completionCount < 16) return '#F87171'; // 붉은색 (부드러운 빨강)
  if (completionCount < 64) return '#60A5FA'; // 청색 (부드러운 파랑)
  if (completionCount < 256) return '#F3F4F6'; // 백색 (밝은 회색)
  if (completionCount < 1024) return '#FBBF24'; // 노랑 (부드러운 노랑)
  if (completionCount < 4096) return '#C084FC'; // 보라 (부드러운 보라)
  return '#A78BFA'; // 샛노랑 대신 밝은 보라
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

// 별 색상에 따른 동적 이름 반환
export function getStarDynamicName(completionCount: number): string {
  const names = [
    '미완성 별',           // 0: 회색
    '희미한 별',           // 1: 주황색
    '가느다란 반짝임',     // 2-15: 빨강색
    '조그만 빛',           // 16-63: 파랑색
    '은은한 별빛',         // 64-255: 사백색
    '또렷해지는 광채',     // 256-1023: 노랑색
    '부드럽게 퍼지는 빛',  // 1024-4095: 보라색
    '선명하게 타오르는 별빛', // 4096+: 밝은 보라
  ];
  
  if (completionCount === 0) return names[0];
  if (completionCount === 1) return names[1];
  if (completionCount < 16) return names[2];
  if (completionCount < 64) return names[3];
  if (completionCount < 256) return names[4];
  if (completionCount < 1024) return names[5];
  if (completionCount < 4096) return names[6];
  return names[7];
}
