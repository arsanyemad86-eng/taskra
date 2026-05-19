import { useCallback } from 'react';
import { useLocalStorage, uid } from './useLocalStorage.js';

const STORAGE_KEY = 'taskra_goals';

export function useGoals() {
  const [goals, setGoals] = useLocalStorage(STORAGE_KEY, []);

  const addGoal = useCallback(
    ({ title, category = 'Personal' }) => {
      if (!title?.trim()) return;
      const newGoal = {
        id: uid(),
        title: title.trim(),
        category,
        milestones: [],
        createdAt: new Date().toISOString(),
      };
      setGoals((prev) => [newGoal, ...prev]);
    },
    [setGoals]
  );

  const deleteGoal = useCallback(
    (id) => {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    },
    [setGoals]
  );

  const addMilestone = useCallback(
    (goalId, title) => {
      if (!title?.trim()) return;
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? {
                ...g,
                milestones: [
                  ...g.milestones,
                  { id: uid(), title: title.trim(), completed: false },
                ],
              }
            : g
        )
      );
    },
    [setGoals]
  );

  const toggleMilestone = useCallback(
    (goalId, milestoneId) => {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? {
                ...g,
                milestones: g.milestones.map((m) =>
                  m.id === milestoneId ? { ...m, completed: !m.completed } : m
                ),
              }
            : g
        )
      );
    },
    [setGoals]
  );

  const deleteMilestone = useCallback(
    (goalId, milestoneId) => {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? {
                ...g,
                milestones: g.milestones.filter((m) => m.id !== milestoneId),
              }
            : g
        )
      );
    },
    [setGoals]
  );

  return {
    goals,
    addGoal,
    deleteGoal,
    addMilestone,
    toggleMilestone,
    deleteMilestone,
  };
}

export function goalProgress(goal) {
  const total = goal.milestones.length;
  const done = goal.milestones.filter((m) => m.completed).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, pct };
}
