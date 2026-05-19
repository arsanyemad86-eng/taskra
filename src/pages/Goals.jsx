import { useState } from 'react';
import { useGoals, goalProgress } from '../hooks/useGoals.js';
import './Goals.css';

const CATEGORIES = ['Health', 'Learning', 'Career', 'Personal', 'Finance'];
const blankForm = { title: '', category: 'Learning' };

export default function Goals() {
  const {
    goals,
    addGoal,
    deleteGoal,
    addMilestone,
    toggleMilestone,
    deleteMilestone,
  } = useGoals();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [milestoneDrafts, setMilestoneDrafts] = useState({}); // {goalId: text}

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addGoal(form);
    setForm(blankForm);
    setShowForm(false);
  };

  const submitMilestone = (goalId, e) => {
    e.preventDefault();
    const text = milestoneDrafts[goalId] || '';
    if (!text.trim()) return;
    addMilestone(goalId, text);
    setMilestoneDrafts((d) => ({ ...d, [goalId]: '' }));
  };

  return (
    <div className="goals-page">
      <div className="page-header">
        <div>
          <h1>Goals</h1>
          <p className="subtitle">
            Break big things into checkable milestones.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? '× Close' : '+ Add Goal'}
        </button>
      </div>

      {showForm && (
        <form className="add-form card" onSubmit={submit}>
          <div className="form-grid">
            <div className="form-row" style={{ gridColumn: '1 / -1' }}>
              <label>Goal title</label>
              <input
                className="input"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Ship a React portfolio site"
                autoFocus
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
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn"
              onClick={() => {
                setShowForm(false);
                setForm(blankForm);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Goal
            </button>
          </div>
        </form>
      )}

      {goals.length === 0 ? (
        <div className="card empty">No goals yet. Set your first goal! 🎯</div>
      ) : (
        <div className="goals-list">
          {goals.map((goal) => {
            const { pct, done, total } = goalProgress(goal);
            const color =
              pct >= 75
                ? 'var(--primary)'
                : pct >= 40
                  ? 'var(--amber)'
                  : 'var(--red)';
            return (
              <article key={goal.id} className="goal-card card">
                <div className="goal-head">
                  <div>
                    <h3 className="goal-title">{goal.title}</h3>
                    <span className="badge badge-cat">{goal.category}</span>
                  </div>
                  <button
                    className="btn btn-danger"
                    onClick={() => deleteGoal(goal.id)}
                  >
                    Delete
                  </button>
                </div>

                <div className="goal-progress">
                  <div className="goal-progress-bar">
                    <div
                      className="goal-progress-fill"
                      style={{
                        width: `${pct}%`,
                        background: color,
                      }}
                    />
                  </div>
                  <div className="goal-progress-meta">
                    <span style={{ color }}>{pct}%</span>
                    <span className="goal-progress-count">
                      {done} / {total} completed
                    </span>
                  </div>
                </div>

                {goal.milestones.length > 0 && (
                  <ul className="milestones">
                    {goal.milestones.map((m) => (
                      <li
                        key={m.id}
                        className={`milestone${m.completed ? ' done' : ''}`}
                      >
                        <label className="check-wrap">
                          <input
                            type="checkbox"
                            checked={m.completed}
                            onChange={() =>
                              toggleMilestone(goal.id, m.id)
                            }
                          />
                          <span className="check-box" />
                        </label>
                        <span className="milestone-title">{m.title}</span>
                        <button
                          className="milestone-delete"
                          onClick={() => deleteMilestone(goal.id, m.id)}
                          aria-label="Remove milestone"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <form
                  className="milestone-form"
                  onSubmit={(e) => submitMilestone(goal.id, e)}
                >
                  <input
                    className="input"
                    placeholder="+ Add milestone"
                    value={milestoneDrafts[goal.id] || ''}
                    onChange={(e) =>
                      setMilestoneDrafts((d) => ({
                        ...d,
                        [goal.id]: e.target.value,
                      }))
                    }
                  />
                  <button type="submit" className="btn btn-primary">
                    Add
                  </button>
                </form>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
