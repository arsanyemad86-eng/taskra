import { useCallback } from 'react';
import { useLocalStorage, uid } from './useLocalStorage.ts';
import type { Goal } from '../types/index.ts';

const STORAGE_KEY = 'taskra_goals';

// NewGoalInput: محلي هنا فقط لأنه مش مستخدم في أي ملف تاني
// (مقارنة بـ NewTaskInput اللي وضعناه في types/index.ts لأنه عام).
// مفيش قاعدة "كل الـ types لازم تكون في ملف مشترك" - الـ type المحلي
// يفضل جنب الكود اللي يستخدمه لو مفيش حاجة تانية تحتاجه.
interface NewGoalInput {
  title: string;
  category?: string;
}

export function useGoals() {
  const [goals, setGoals] = useLocalStorage<Goal[]>(STORAGE_KEY, []);

  const addGoal = useCallback(
    ({ title, category = 'Personal' }: NewGoalInput) => {
      if (!title?.trim()) return;
      const newGoal: Goal = {
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
    (id: string) => {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    },
    [setGoals]
  );

  const addMilestone = useCallback(
    (goalId: string, title: string) => {
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
    (goalId: string, milestoneId: string) => {
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
    (goalId: string, milestoneId: string) => {
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

export function goalProgress(goal: Goal) {
  const total = goal.milestones.length;
  const done = goal.milestones.filter((m) => m.completed).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, pct };
}
