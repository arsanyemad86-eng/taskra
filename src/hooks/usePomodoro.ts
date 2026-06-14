import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocalStorage } from './useLocalStorage.ts';
import type { PomodoroMode, PomodoroSession } from '../types/index.ts';

const STORAGE_KEY = 'taskra_pomodoro';

// Record<PomodoroMode, ...>: Record نوع جاهز معناه "object فيه مفتاح من
// نوع PomodoroMode وقيمة من النوع المحدد". هنا بيضمن إن MODES فيها
// بالضبط مفاتيح 'focus' | 'short' | 'long' - مش أكتر ومش أقل، وإن كل
// واحدة فيها label و minutes.
export const MODES: Record<PomodoroMode, { label: string; minutes: number }> = {
  focus: { label: 'Focus', minutes: 25 },
  short: { label: 'Short Break', minutes: 5 },
  long: { label: 'Long Break', minutes: 15 },
};

export function usePomodoro() {
  const [sessions, setSessions] = useLocalStorage<PomodoroSession[]>(STORAGE_KEY, []);
  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.minutes * 60);
  const [running, setRunning] = useState(false);
  const [sessionIndex, setSessionIndex] = useState(1); // 1..4 within a cycle
  const [toast, setToast] = useState<string | null>(null);

  // useRef<boolean>(false): الكود الأصلي بدأ بـ useRef(null) واستخدمه
  // كـ flag بقيمتين بس (true/false)، فـ boolean أدق من null وأوضح للقارئ.
  const completionRef = useRef(false);

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
      playDone();

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

  const playDone = useCallback(() => {
    try {
      // window.webkitAudioContext مش موجود في تعريفات TypeScript الرسمية
      // لـ DOM (بادئة `webkit` كانت اجتهاد متصفحات قديمة). بنستخدم
      // `as any` هنا فقط لقراءة هذا الحقل القديم - حل موضعي مقصود
      // بدل تعديل تعريفات DOM كلها من أجل API قديم لمتصفح واحد.
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          ctx.currentTime + startTime + duration
        );
        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
      };
      playTone(880, 0, 0.15);
      playTone(660, 0.2, 0.15);
    } catch {
      // Web Audio API unavailable — fail silently
    }
  }, []);

  const switchMode = useCallback((nextMode: PomodoroMode) => {
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

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
