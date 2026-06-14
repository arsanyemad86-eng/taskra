import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from 'react';

/**
 * Generic localStorage-synced state hook.
 * Reads once on mount, writes whenever value changes.
 */
// <T> هنا generic type parameter: ده اللي بيخلي الـ hook ده "عام"
// (generic) ويصلح لأي نوع بيانات - array من tasks، object للـ streak،
// أو أي شيء تاني - من غير ما نكتب نسخة مختلفة لكل نوع.
//
// initialValue: T -> القيمة الابتدائية بتحدد نوع T تلقائيًا
// (مثلاً لو استدعيت useLocalStorage('tasks', []) هيكون T = any[]،
// ولو استدعيت useLocalStorage('streak', { count: 0 }) هيكون T = { count: number }).
//
// قيمة الرجوع: [T, Dispatch<SetStateAction<T>>, () => void]
// - T: القيمة الحالية.
// - Dispatch<SetStateAction<T>>: نفس نوع setter اللي بيرجعه useState
//   نفسه (بيقبل T مباشرة أو دالة (prev: T) => T).
// - () => void: دالة reset، بدون params وبدون قيمة رجوع.
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initialValue;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`useLocalStorage: failed to parse "${key}"`, err);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`useLocalStorage: failed to save "${key}"`, err);
    }
  }, [key, value]);

  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return [value, setValue, reset];
}

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
