import { useState, useEffect, useCallback } from 'react';

/**
 * Generic localStorage-synced state hook.
 * Reads once on mount, writes whenever value changes.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initialValue;
      return JSON.parse(raw);
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
