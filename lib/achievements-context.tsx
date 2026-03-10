import React, { createContext, useContext, useMemo } from 'react';
import { useAchievements } from '@/hooks/use-achievements';

type AchievementsContextType = ReturnType<typeof useAchievements>;

const AchievementsContext = createContext<AchievementsContextType | null>(null);

export function AchievementsProvider({ children }: { children: React.ReactNode }) {
  const achievements = useAchievements();
  const value = useMemo(() => achievements, [achievements]);
  return (
    <AchievementsContext.Provider value={value}>
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievementsContext() {
  const ctx = useContext(AchievementsContext);
  if (!ctx) throw new Error('useAchievementsContext must be used within AchievementsProvider');
  return ctx;
}
