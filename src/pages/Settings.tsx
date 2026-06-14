import { useEffect, useState, type ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext.tsx';
import './Settings.css';

const KEYS: Record<string, string> = {
  tasks: 'taskra_tasks',
  notes: 'taskra_notes',
  goals: 'taskra_goals',
  pomodoro: 'taskra_pomodoro',
};

// BeforeInstallPromptEvent مش جزء من تعريفات DOM الرسمية في TypeScript
// (API مخصوص لمتصفحات تدعم PWA install). بنعرّف interface محلي بسيط
// فيه فقط الحقول اللي بنستخدمها (prompt, userChoice) بدل ما نعتمد
// على `any` في كل مكان نستخدم فيه الـ event ده.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function exportData() {
  const data: Record<string, unknown> = {};
  for (const [name, key] of Object.entries(KEYS)) {
    try {
      const raw = localStorage.getItem(key);
      data[name] = raw ? JSON.parse(raw) : [];
    } catch {
      data[name] = [];
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `taskra-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(file: File, onDone: (ok: boolean) => void) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);
      for (const [name, key] of Object.entries(KEYS)) {
        if (data[name]) {
          localStorage.setItem(key, JSON.stringify(data[name]));
        }
      }
      onDone(true);
    } catch {
      onDone(false);
    }
  };
  reader.readAsText(file);
}

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () =>
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    importData(file, (ok) => {
      if (ok) {
        alert('تم الاستيراد بنجاح! سيتم تحديث الصفحة.');
        window.location.reload();
      } else {
        alert('فيه مشكلة في الملف. تأكد إنه ملف Taskra صح.');
      }
    });
  }

  return (
    <motion.div
      className="settings-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="settings-header">
        <h1>Settings</h1>
        <p className="settings-sub">Manage your data.</p>
      </div>

      <div className="settings-section">
        <h2>Appearance</h2>

        <div className="settings-card">
          <div className="settings-card-info">
            <h3>Theme</h3>
            <p>Switch between dark and light mode.</p>
          </div>
          <button
            className={`theme-toggle${theme === 'light' ? ' light' : ''}`}
            onClick={toggleTheme}
            role="switch"
            aria-checked={theme === 'light'}
            aria-label="Toggle dark/light theme"
          >
            <span className="theme-toggle-thumb">
              {theme === 'light' ? '☀️' : '🌙'}
            </span>
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h2>App</h2>

        <div className="settings-card">
          <div className="settings-card-info">
            <h3>Install App</h3>
            <p>Install Taskra on your device for quick, app-like access.</p>
          </div>
          <button
            className="btn-export"
            onClick={handleInstall}
            disabled={!installPrompt}
          >
            {installPrompt ? 'Install App' : 'Already Installed'}
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h2>Data Backup</h2>

        <div className="settings-card">
          <div className="settings-card-info">
            <h3>Export</h3>
            <p>Download all your tasks, notes, and goals as a JSON file.</p>
          </div>
          <button className="btn-export" onClick={exportData}>
            Export JSON
          </button>
        </div>

        <div className="settings-card">
          <div className="settings-card-info">
            <h3>Import</h3>
            <p>Restore your data from a previous backup file.</p>
          </div>
          <label className="btn-import">
            Import JSON
            <input type="file" accept=".json" onChange={handleImport} hidden />
          </label>
        </div>
      </div>
    </motion.div>
  );
}
