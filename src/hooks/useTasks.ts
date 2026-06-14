import { useCallback, useEffect, useMemo } from 'react';
import { useLocalStorage, uid } from './useLocalStorage.ts';
import type { NewTaskInput, Task } from '../types/index.ts';

const STORAGE_KEY = 'taskra_tasks';

export function useTasks() {
  // <Task[]> هنا بيحدد نوع T في useLocalStorage<T> = Task[]، فـ `tasks`
  // وكل دوال setTasks بقت تعرف إنها بتتعامل مع array من Task بالضبط.
  const [tasks, setTasks] = useLocalStorage<Task[]>(STORAGE_KEY, []);

  // NewTaskInput بدل تكرار كل الحقول كـ params منفصلة. القيم الافتراضية
  // (priority = 'medium', ...) تفضل شغالة بالظبط كزمان لأن الحقول
  // اختيارية في NewTaskInput.
  const addTask = useCallback(
    ({
      title,
      priority = 'medium',
      dueDate = '',
      notes = '',
      category = 'Work',
      recurrence = 'none',
    }: NewTaskInput) => {
      if (!title?.trim()) return;
      const newTask: Task = {
        id: uid(),
        title: title.trim(),
        priority,
        dueDate,
        notes,
        category,
        recurrence,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      };
      setTasks((prev) => [newTask, ...prev]);
    },
    [setTasks]
  );

  const toggleTask = useCallback(
    (id: string) => {
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
    (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [setTasks]
  );

  // Partial<Task>: نوع جاهز من TypeScript بيخلي كل خصائص Task اختيارية.
  // مناسب جدًا هنا لأن saveTask بتستقبل "تعديلات جزئية" فقط (مثلاً
  // { title: 'new title' } بس)، لا الـ Task كاملة.
  const saveTask = useCallback(
    (id: string, updatedFields: Partial<Task>) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t))
      );
    },
    [setTasks]
  );

  const checkRecurring = useCallback(() => {
    const today = todayKey();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.recurrence === 'none' || !t.completed || !t.dueDate) return t;
        if (t.dueDate >= today) return t;
        const nextDue =
          t.recurrence === 'daily' ? today : addDays(t.dueDate, 7);
        return { ...t, completed: false, completedAt: null, dueDate: nextDue };
      })
    );
  }, [setTasks]);

  useEffect(() => {
    checkRecurring();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return { tasks, addTask, toggleTask, deleteTask, saveTask, checkRecurring, stats };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isThisWeek(dateStr: string): boolean {
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
