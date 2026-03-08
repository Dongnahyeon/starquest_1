export type StarBrightness = 'dim' | 'faint' | 'bright' | 'supernova';

export interface Achievement {
  id: string;
  title: string;
  categoryId: string;
  completionCount: number;
  createdAt: string;
  lastCompletedAt?: string;
  completionHistory: string[]; // ISO date strings
  completionNotes?: Record<string, string>; // 완료 날짜별 메모 { "2026-03-08": "메모 내용" }
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

export function getStarColor(completionCount: number): string {
  const brightness = getStarBrightness(completionCount);
  switch (brightness) {
    case 'dim': return '#2D3748';
    case 'faint': return '#F6AD55';
    case 'bright': return '#F5C842';
    case 'supernova': return '#FFF176';
  }
}

export function getStarGlowIntensity(completionCount: number): number {
  const brightness = getStarBrightness(completionCount);
  switch (brightness) {
    case 'dim': return 0;
    case 'faint': return 0.3;
    case 'bright': return 0.6;
    case 'supernova': return 1.0;
  }
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
