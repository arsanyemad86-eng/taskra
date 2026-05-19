import { useCallback, useMemo } from 'react';
import { useLocalStorage, uid } from './useLocalStorage.js';

const STORAGE_KEY = 'taskra_tasks';

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage(STORAGE_KEY, []);

  const addTask = useCallback(
    ({ title, priority = 'medium', dueDate = '', notes = '' }) => {
      if (!title?.trim()) return;
      const newTask = {
        id: uid(),
        title: title.trim(),
        priority,
        dueDate,
        notes,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      };
      setTasks((prev) => [newTask, ...prev]);
    },
    [setTasks]
  );

  const toggleTask = useCallback(
    (id) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                completed: !t.completed,
                completedAt: !t.completed ? new Date().toISOString() : null,
              }
            : t
        )
      );
    },
    [setTasks]
  );

  const deleteTask = useCallback(
    (id) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [setTasks]
  );

  const stats = useMemo(() => {
    const today = todayKey();
    const tasksToday = tasks.filter(
      (t) => t.dueDate && t.dueDate === today && !t.completed
    );
    const completed = tasks.filter((t) => t.completed);
    const completedToday = completed.filter(
      (t) => t.completedAt && t.completedAt.slice(0, 10) === today
    );
    return {
      tasksToday,
      completed,
      completedToday,
      totalToday: tasks.filter((t) => t.dueDate === today),
    };
  }, [tasks]);

  return { tasks, addTask, toggleTask, deleteTask, stats };
}

export function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isThisWeek(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return d >= start && d < end;
}
