import './Settings.css';

const KEYS = {
  tasks: 'taskra_tasks',
  notes: 'taskra_notes',
  goals: 'taskra_goals',
  pomodoro: 'taskra_pomodoro',
};

function exportData() {
  const data = {};
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

function importData(file, onDone) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
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
  function handleImport(e) {
    const file = e.target.files[0];
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
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p className="settings-sub">Manage your data.</p>
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
    </div>
  );
}