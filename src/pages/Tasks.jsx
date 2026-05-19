import { useMemo, useState } from 'react';
import { useTasks, todayKey, isThisWeek } from '../hooks/useTasks.js';
import './Tasks.css';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'completed', label: 'Completed' },
];

const PRIORITIES = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const initialForm = {
  title: '',
  priority: 'medium',
  dueDate: todayKey(),
  notes: '',
};

export default function Tasks() {
  const { tasks, addTask, toggleTask, deleteTask } = useTasks();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);

  const filtered = useMemo(() => {
    const today = todayKey();
    let list = tasks;
    if (filter === 'today') {
      list = list.filter((t) => t.dueDate === today && !t.completed);
    } else if (filter === 'week') {
      list = list.filter((t) => isThisWeek(t.dueDate) && !t.completed);
    } else if (filter === 'completed') {
      list = list.filter((t) => t.completed);
    } else {
      list = list.filter((t) => !t.completed);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q))
      );
    }
    return list;
  }, [tasks, filter, search]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addTask(form);
    setForm(initialForm);
    setShowForm(false);
  };

  return (
    <div className="tasks-page">
      <div className="page-header">
        <div>
          <h1>Tasks</h1>
          <p className="subtitle">Plan it. Ship it. Cross it off.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? '× Close' : '+ Add Task'}
        </button>
      </div>

      {showForm && (
        <form className="add-form card" onSubmit={submit}>
          <div className="form-grid">
            <div className="form-row" style={{ gridColumn: '1 / -1' }}>
              <label>Title</label>
              <input
                className="input"
                placeholder="What needs to get done?"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                autoFocus
              />
            </div>
            <div className="form-row">
              <label>Priority</label>
              <select
                className="select"
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priority: e.target.value }))
                }
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Due date</label>
              <input
                type="date"
                className="input"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
              />
            </div>
            <div className="form-row" style={{ gridColumn: '1 / -1' }}>
              <label>Notes (optional)</label>
              <textarea
                className="textarea"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Any context, links, sub-steps…"
              />
            </div>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn"
              onClick={() => {
                setShowForm(false);
                setForm(initialForm);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Task
            </button>
          </div>
        </form>
      )}

      <div className="tasks-toolbar">
        <div className="filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`filter-tab${filter === f.key ? ' active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          className="input search-input"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card empty">
          {tasks.length === 0
            ? 'No tasks yet. Add your first task! ✅'
            : 'No tasks match this view.'}
        </div>
      ) : (
        <ul className="task-list">
          {filtered.map((t) => (
            <li
              key={t.id}
              className={`task-row card${t.completed ? ' task-done' : ''}`}
            >
              <label className="check-wrap">
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => toggleTask(t.id)}
                />
                <span className="check-box" />
              </label>
              <div className="task-body">
                <div className="task-title-row">
                  <span className="task-title">{t.title}</span>
                  <span className={`badge badge-${t.priority}`}>
                    {t.priority}
                  </span>
                </div>
                <div className="task-meta">
                  {t.dueDate && (
                    <span className="task-due">
                      Due {formatDue(t.dueDate)}
                    </span>
                  )}
                  {t.notes && <span className="task-notes">{t.notes}</span>}
                </div>
              </div>
              <button
                className="btn btn-danger task-delete"
                onClick={() => deleteTask(t.id)}
                aria-label="Delete task"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatDue(dateStr) {
  if (!dateStr) return '';
  const today = todayKey();
  if (dateStr === today) return 'today';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
