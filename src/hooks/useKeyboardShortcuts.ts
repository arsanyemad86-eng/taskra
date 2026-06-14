import { useEffect } from 'react';
import type { NavigateFunction } from 'react-router-dom';

// UseKeyboardShortcutsOptions: الـ object الثاني اختياري بالكامل
// (= {} في الكود الأصلي)، وكل خصائصه كذلك. onHelp بترجع void.
interface UseKeyboardShortcutsOptions {
  onHelp?: () => void;
}

// navigate: NavigateFunction - النوع الرسمي من react-router-dom لدالة
// التنقل اللي بترجعها useNavigate(). استخدام النوع الجاهز من المكتبة
// (بدل `(path: string) => void` يدوي) بيضمن التوافق مع أي تحديث مستقبلي
// لتوقيع الدالة دي في المكتبة نفسها.
export function useKeyboardShortcuts(
  navigate: NavigateFunction,
  { onHelp }: UseKeyboardShortcutsOptions = {}
) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // e.target نوعه EventTarget | null بشكل عام، فمحتاجين نأكد
      // لـ TypeScript إنه HTMLElement عشان نقدر نقرا tagName و
      // isContentEditable - الـ `as HTMLElement` هنا type assertion.
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if (e.key === 'Escape') {
        window.dispatchEvent(new CustomEvent('taskra:escape'));
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        window.dispatchEvent(new CustomEvent('taskra:submit'));
        return;
      }

      if (isTyping) return;

      switch (e.key) {
        case 'n':
          if (window.location.pathname === '/tasks') {
            window.dispatchEvent(new CustomEvent('taskra:new-task'));
          } else if (window.location.pathname === '/notes') {
            window.dispatchEvent(new CustomEvent('taskra:new-note'));
          }
          break;
        case 'g':
          navigate('/goals');
          break;
        case 'p':
          navigate('/pomodoro');
          break;
        case 'd':
          navigate('/');
          break;
        case '?':
          onHelp?.();
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, onHelp]);
}

export const SHORTCUTS = [
  { keys: 'n', description: 'New task (Tasks page) or new note (Notes page)' },
  { keys: 'g', description: 'Go to Goals' },
  { keys: 'p', description: 'Go to Pomodoro' },
  { keys: 'd', description: 'Go to Dashboard' },
  { keys: 'Esc', description: 'Close any open form or modal' },
  { keys: 'Ctrl + Enter', description: 'Submit the currently open form' },
  { keys: '?', description: 'Show this help dialog' },
];
