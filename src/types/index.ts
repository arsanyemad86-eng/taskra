// هذا الملف بيجمع أنواع البيانات (domain types) المشتركة بين أكتر من
// hook وأكتر من صفحة (Task يُستخدم في useTasks و useStreak و Tasks.jsx
// و Dashboard.jsx و Analytics.jsx مثلاً). تجميعها هنا بمكان واحد بيمنع
// تكرار نفس الـ interface في كل ملف، ويضمن إن أي تعديل على شكل الـ Task
// (إضافة حقل جديد مثلاً) ينعكس تلقائيًا على كل الملفات اللي تستخدمه.

export type Priority = 'low' | 'medium' | 'high';
export type Recurrence = 'none' | 'daily' | 'weekly';

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  dueDate: string;
  notes: string;
  category: string;
  recurrence: Recurrence;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
}

// NewTaskInput: شكل البيانات اللي addTask بتستقبلها - مش نفس Task بالضبط.
// كل الحقول هنا اختيارية (`?`) ما عدا title، لأن الكود الأصلي بيعطيها
// قيم افتراضية (priority = 'medium', category = 'Work'...). الفرق بين
// "شكل البيانات المُخزّنة" (Task) و"شكل البيانات المُدخلة" (NewTaskInput)
// نمط شائع جدًا في TypeScript.
export interface NewTaskInput {
  title: string;
  priority?: Priority;
  dueDate?: string;
  notes?: string;
  category?: string;
  recurrence?: Recurrence;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  category: string;
  milestones: Milestone[];
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type PomodoroMode = 'focus' | 'short' | 'long';

export interface PomodoroSession {
  id: string;
  durationMinutes: number;
  completedAt: string;
}

export interface StreakData {
  count: number;
  lastActiveDate: string | null;
}
