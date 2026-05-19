import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import { todayKey } from './useTasks.js';

const STORAGE_KEY = 'taskra_streak';

/**
 * Streak: increments on the first day a user completes any task.
 * If a day is skipped (no task completed), streak resets to 0.
 */
export function useStreak(tasks) {
  const [streak, setStreak] = useLocalStorage(STORAGE_KEY, {
    count: 0,
    lastActiveDate: null,
  });

  useEffect(() => {
    const today = todayKey();
    const completedToday = tasks.some(
      (t) => t.completed && t.completedAt && t.completedAt.slice(0, 10) === today
    );
    if (!completedToday) return;
    if (streak.lastActiveDate === today) return;

    // Compute new streak count based on lastActiveDate
    let newCount = 1;
    if (streak.lastActiveDate) {
      const last = new Date(streak.lastActiveDate);
      const now = new Date(today);
      const diff = Math.round((now - last) / (1000 * 60 * 60 * 24));
      if (diff === 1) newCount = streak.count + 1;
      else if (diff === 0) newCount = streak.count;
      else newCount = 1;
    }
    setStreak({ count: newCount, lastActiveDate: today });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  return streak.count;
}
