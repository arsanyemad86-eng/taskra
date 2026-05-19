import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocalStorage } from './useLocalStorage.js';

const STORAGE_KEY = 'taskra_pomodoro';

export const MODES = {
  focus: { label: 'Focus', minutes: 25 },
  short: { label: 'Short Break', minutes: 5 },
  long: { label: 'Long Break', minutes: 15 },
};

export function usePomodoro() {
  const [sessions, setSessions] = useLocalStorage(STORAGE_KEY, []);
  const [mode, setMode] = useState('focus');
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.minutes * 60);
  const [running, setRunning] = useState(false);
  const [sessionIndex, setSessionIndex] = useState(1); // 1..4 within a cycle
  const [toast, setToast] = useState(null);

  const completionRef = useRef(null);

  // Tick
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          completionRef.current = true;
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // Handle completion
  useEffect(() => {
    if (secondsLeft === 0 && running && completionRef.current) {
      completionRef.current = false;
      setRunning(false);

      if (mode === 'focus') {
        // Save focus session
        setSessions((prev) => [
          ...prev,
          {
            id: Date.now().toString(36),
            durationMinutes: MODES.focus.minutes,
            completedAt: new Date().toISOString(),
          },
        ]);
        setToast('Session complete! 🎉 Take a break.');
        // Decide next mode
        if (sessionIndex >= 4) {
          switchMode('long');
          setSessionIndex(1);
        } else {
          switchMode('short');
          setSessionIndex((i) => i + 1);
        }
      } else {
        setToast('Break over. Back to focus.');
        switchMode('focus');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, running]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const switchMode = useCallback((nextMode) => {
    setMode(nextMode);
    setSecondsLeft(MODES[nextMode].minutes * 60);
    setRunning(false);
  }, []);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setRunning(false);
    setSecondsLeft(MODES[mode].minutes * 60);
  }, [mode]);

  const todayStats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todaySessions = sessions.filter(
      (s) => s.completedAt.slice(0, 10) === today
    );
    const totalMinutes = todaySessions.reduce(
      (sum, s) => sum + s.durationMinutes,
      0
    );
    return { count: todaySessions.length, totalMinutes };
  }, [sessions]);

  const totalSeconds = MODES[mode].minutes * 60;
  const progress = 1 - secondsLeft / totalSeconds;

  return {
    mode,
    switchMode,
    secondsLeft,
    running,
    start,
    pause,
    reset,
    sessionIndex,
    progress,
    sessions,
    todayStats,
    toast,
    dismissToast: () => setToast(null),
  };
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
