import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useTasks, todayKey, isThisWeek } from '../hooks/useTasks.ts';
import type { Priority, Recurrence } from '../types/index.ts';
import './Tasks.css';

// FilterKey: union بقيم الفلاتر بس. أي مقارنة `filter === '...'` بحاجة
// قيمة من النوع ده - typo زي 'todayy' هيبقى error وقت الكتابة.
type FilterKey = 'all' | 'today' | 'week' | 'completed' | 'category';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'completed', label: 'Completed' },
  { key: 'category', label: 'By Category' },
];

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const CATEGORIES = ['Work', 'Personal', 'Learning', 'Health', 'Other'];

const RECURRENCES: { value: Recurrence; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];

// TaskFormState: شكل بيانات الفورم (إضافة وتعديل المهام). شبيه بـ
// NewTaskInput من types/index.ts، لكن هنا كل الحقول إلزامية (مش
// اختيارية) لأن الفورم دايمًا بيبدأ من initialForm اللي فيها قيم
// لكل حقل - مفيش "افتراضي يحصل بعدين" كما في addTask.
interface TaskFormState {
  title: string;
  priority: Priority;
  dueDate: string;
  notes: string;
  category: string;
  recurrence: Recurrence;
}

const initialForm: TaskFormState = {
  title: '',
  priority: 'medium',
  dueDate: todayKey(),
  notes: '',
  category: 'Work',
  recurrence: 'none',
};

export default function Tasks() {
  const { tasks, addTask, toggleTask, deleteTask, saveTask } = useTasks();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [categoryFilter, setCategoryFilter] = useState('Work');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TaskFormState>(initialForm);
  // editingId: string | null - null يعني "مفيش مهمة قيد التعديل دلوقتي".
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TaskFormState>(initialForm);

  const filtered = useMemo(() => {
    const today = todayKey();
    let list = tasks;
    if (filter === 'today') {
      list = list.filter((t) => t.dueDate === today && !t.completed);
    } else if (filter === 'week') {
      list = list.filter((t) => isThisWeek(t.dueDate) && !t.completed);
    } else if (filter === 'completed') {
      list = list.filter((t) => t.completed);
    } else if (filter === 'category') {
      list = list.filter((t) => !t.completed && t.category === categoryFilter);
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
  }, [tasks, filter, categoryFilter, search]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addTask(form);
    setForm(initialForm);
    setShowForm(false);
  };

  useEffect(() => {
    function onNewTask() {
      setShowForm(true);
    }
    function onEscape() {
      if (editingId) {
        cancelEdit();
      } else if (showForm) {
        setShowForm(false);
        setForm(initialForm);
      }
    }
    function onSubmitShortcut() {
      if (showForm) {
        if (!form.title.trim()) return;
        addTask(form);
        setForm(initialForm);
        setShowForm(false);
      } else if (editingId) {
        if (!editForm.title.trim()) return;
        saveTask(editingId, editForm);
        cancelEdit();
      }
    }
    window.addEventListener('taskra:new-task', onNewTask);
    window.addEventListener('taskra:escape', onEscape);
    window.addEventListener('taskra:submit', onSubmitShortcut);
    return () => {
      window.removeEventListener('taskra:new-task', onNewTask);
      window.removeEventListener('taskra:escape', onEscape);
      window.removeEventListener('taskra:submit', onSubmitShortcut);
    };
  }, [showForm, editingId, form, editForm, addTask, saveTask]);

  const startEdit = (t: TaskFormState & { id: string }) => {
    setEditingId(t.id);
    setEditForm({
      title: t.title,
      priority: t.priority,
      dueDate: t.dueDate || '',
      notes: t.notes || '',
      category: t.category || 'Work',
      recurrence: t.recurrence || 'none',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(initialForm);
  };

  const submitEdit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editForm.title.trim()) return;
    // editingId ممكن يكون null حسب النوع بتاعه، لكن منطقيًا الفورم ده
    // مش بيُعرض إلا لو editingId === t.id (يعني string). الـ check ده
    // بيأكد لـ TypeScript الحقيقة دي قبل ما نستخدمه كـ string.
    if (editingId === null) return;
    saveTask(editingId, editForm);
    cancelEdit();
  };

  return (
    <motion.div
      className="tasks-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
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
                  setForm((f) => ({ ...f, priority: e.target.value as Priority }))
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
            <div className="form-row">
              <label>Category</label>
              <select
                className="select"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Repeat</label>
              <select
                className="select"
                value={form.recurrence}
                onChange={(e) =>
                  setForm((f) => ({ ...f, recurrence: e.target.value as Recurrence }))
                }
              >
                {RECURRENCES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
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

      <div className="toolbar">
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

      {filter === 'category' && (
        <div className="filter-tabs sub-tabs">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`filter-tab${categoryFilter === c ? ' active' : ''}`}
              onClick={() => setCategoryFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">✅</div>
          {tasks.length === 0 ? (
            <>
              <h3 className="empty-title">No tasks yet</h3>
              <p className="empty-sub">Add your first task to get started.</p>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                + Add Task
              </button>
            </>
          ) : (
            <>
              <h3 className="empty-title">No tasks match this view</h3>
              <p className="empty-sub">Try a different filter or search term.</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setFilter('all');
                  setSearch('');
                }}
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      ) : (
        <ul className="task-list">
          {filtered.map((t) =>
            editingId === t.id ? (
              <li key={t.id} className="task-row task-edit-row card">
                <form className="form-grid" onSubmit={submitEdit}>
                  <div className="form-row" style={{ gridColumn: '1 / -1' }}>
                    <label>Title</label>
                    <input
                      className="input"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, title: e.target.value }))
                      }
                      autoFocus
                    />
                  </div>
                  <div className="form-row">
                    <label>Priority</label>
                    <select
                      className="select"
                      value={editForm.priority}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, priority: e.target.value as Priority }))
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
                      value={editForm.dueDate}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, dueDate: e.target.value }))
                      }
                    />
                  </div>
                  <div className="form-row">
                    <label>Category</label>
                    <select
                      className="select"
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, category: e.target.value }))
                      }
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row">
                    <label>Repeat</label>
                    <select
                      className="select"
                      value={editForm.recurrence}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, recurrence: e.target.value as Recurrence }))
                      }
                    >
                      {RECURRENCES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row" style={{ gridColumn: '1 / -1' }}>
                    <label>Notes (optional)</label>
                    <textarea
                      className="textarea"
                      value={editForm.notes}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, notes: e.target.value }))
                      }
                      placeholder="Any context, links, sub-steps…"
                    />
                  </div>
                  <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
                    <button type="button" className="btn" onClick={cancelEdit}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save
                    </button>
                  </div>
                </form>
              </li>
            ) : (
              <li
                key={t.id}
                className={`task-row card${t.completed ? ' task-done' : ''} priority-${t.priority}`}
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
                    {t.category && (
                      <span className="badge badge-category" data-category={t.category}>
                        {t.category}
                      </span>
                    )}
                  </div>
                  <div className="task-meta">
                    {t.dueDate && (
                      <span className="task-due">
                        Due {formatDue(t.dueDate)}
                      </span>
                    )}
                    {t.recurrence === 'daily' && (
                      <span className="task-recurrence" title="Repeats daily">🔁</span>
                    )}
                    {t.recurrence === 'weekly' && (
                      <span className="task-recurrence" title="Repeats weekly">📅</span>
                    )}
                    {t.notes && <span className="task-notes">{t.notes}</span>}
                  </div>
                </div>
                <div className="task-actions">
                  <button
                    className="task-edit-btn"
                    onClick={() => startEdit(t)}
                    aria-label="Edit task"
                    title="Edit task"
                  >
                    ✎
                  </button>
                  <button
                    className="task-delete-btn"
                    onClick={() => deleteTask(t.id)}
                    aria-label="Delete task"
                    title="Delete task"
                  >
                    ✕
                  </button>
                </div>
              </li>
            )
          )}
        </ul>
      )}
    </motion.div>
  );
}

function formatDue(dateStr: string): string {
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
