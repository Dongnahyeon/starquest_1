import React, { createContext, useContext } from 'react';
import { useAchievements } from '@/hooks/use-achievements';

type AchievementsContextType = ReturnType<typeof useAchievements>;

const AchievementsContext = createContext<AchievementsContextType | null>(null);

export function AchievementsProvider({ children }: { children: React.ReactNode }) {
  const achievements = useAchievements();
  return (
    <AchievementsContext.Provider value={achievements}>
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievementsContext() {
  const ctx = useContext(AchievementsContext);
  if (!ctx) throw new Error('useAchievementsContext must be used within AchievementsProvider');
  return ctx;
}
