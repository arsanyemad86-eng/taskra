import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTasks, todayKey } from '../hooks/useTasks.ts';
import { useNotes } from '../hooks/useNotes.ts';
import { useGoals, goalProgress } from '../hooks/useGoals.ts';
import { usePomodoro } from '../hooks/usePomodoro.ts';
import { useStreak } from '../hooks/useStreak.ts';
import './Dashboard.css';
import { useAuth } from '../context/AuthContext';


function greeting(name: string): { text: string; icon: string } {
  const h = new Date().getHours();
  if (h < 12) return { text: `Good morning, ${name}`, icon: '☀️' };
  if (h < 18) return { text: `Good afternoon, ${name}`, icon: '🌤️' };
  return { text: `Good evening, ${name}`, icon: '🌙' };
}

function streakMessage(count: number): string {
  if (count === 0) return 'Start your streak — complete one task today.';
  if (count < 3) return 'Building momentum. Keep going.';
  if (count < 7) return `${count} days strong! Don't break the chain.`;
  if (count < 14) return `${count} days! You're compounding.`;
  if (count < 30) return `${count} days! Discipline becoming identity.`;
  return `${count} days. Elite consistency.`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, toggleTask, stats } = useTasks();
  const { notes } = useNotes();
  const { goals } = useGoals();
  const { todayStats } = usePomodoro();
  const streak = useStreak(tasks);

  const g = greeting(user?.name || 'there');
  const today = todayKey();

  const tasksToday = tasks.filter((t) => t.dueDate === today);
  const tasksTodayPending = tasksToday.filter((t) => !t.completed);
  const allTodayDone = tasksToday.length > 0 && tasksTodayPending.length === 0;

  const recentNotes = notes.slice(0, 3);
  const activeGoals = goals.filter((goal) => {
    const { pct } = goalProgress(goal);
    return pct < 100;
  });

  return (
    <motion.div
      className="dashboard"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="dashboard-header">
        <h1>
          {g.text} <span aria-hidden="true">{g.icon}</span>
        </h1>
        <p className="subtitle">Here's your view for today.</p>
      </div>

      <div className="stat-grid">
        <StatCard
          label="Tasks Today"
          value={tasksToday.length}
          accent="blue"
          hint={`${tasksTodayPending.length} pending`}
          icon="📋"
        />
        <StatCard
          label="Completed"
          value={stats.completed.length}
          accent="primary"
          hint={`${stats.completedToday.length} today`}
          icon="✅"
        />
        <StatCard
          label="Active Goals"
          value={activeGoals.length}
          accent="amber"
          hint={`${goals.length} total`}
          icon="🎯"
        />
        <StatCard
          label="Focus Time"
          value={`${todayStats.totalMinutes}m`}
          accent="primary"
          hint={`${todayStats.count} sessions`}
          icon="⏱️"
        />
      </div>

      {allTodayDone && (
        <div className="celebration">
          Great work today, {user?.name}! 🎉 Every task done. Stack another tomorrow.
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-col">
          <div className="card">
            <div className="card-title-row">
              <h3 className="card-title">Today's Tasks</h3>
              <Link to="/tasks" className="link-muted">
                View all →
              </Link>
            </div>
            {tasksToday.length === 0 ? (
              <div className="empty-mini">
                No tasks due today. Plan something in{' '}
                <Link to="/tasks" className="inline-link">
                  Tasks
                </Link>
                .
              </div>
            ) : (
              <ul className="mini-task-list">
                {tasksToday.map((t) => (
                  <li key={t.id} className="mini-task">
                    <label className="check-wrap">
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => toggleTask(t.id)}
                      />
                      <span className="check-box" />
                    </label>
                    <span
                      className={`mini-task-title${
                        t.completed ? ' done' : ''
                      }`}
                    >
                      {t.title}
                    </span>
                    <span className={`badge badge-${t.priority}`}>
                      {t.priority}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <div className="card-title-row">
              <h3 className="card-title">Recent Notes</h3>
              <Link to="/notes" className="link-muted">
                View all →
              </Link>
            </div>
            {recentNotes.length === 0 ? (
              <div className="empty-mini">
                No notes yet.{' '}
                <Link to="/notes" className="inline-link">
                  Write one
                </Link>
                .
              </div>
            ) : (
              <ul className="mini-note-list">
                {recentNotes.map((n) => (
                  <li key={n.id} className="mini-note">
                    <div className="mini-note-head">
                      <span className="mini-note-title">{n.title}</span>
                      <span className="badge badge-cat">{n.category}</span>
                    </div>
                    <p className="mini-note-preview">
                      {n.content
                        ? n.content.slice(0, 90) +
                          (n.content.length > 90 ? '…' : '')
                        : 'No content yet.'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="dashboard-col">
          <div className="card">
            <div className="card-title-row">
              <h3 className="card-title">Goals Progress</h3>
              <Link to="/goals" className="link-muted">
                View all →
              </Link>
            </div>
            {goals.length === 0 ? (
              <div className="empty-mini">
                No goals yet.{' '}
                <Link to="/goals" className="inline-link">
                  Set one
                </Link>
                .
              </div>
            ) : (
              <ul className="mini-goal-list">
                {goals.map((goal) => {
                  const { pct, done, total } = goalProgress(goal);
                  const color =
                    pct >= 75
                      ? 'var(--primary)'
                      : pct >= 40
                        ? 'var(--amber)'
                        : 'var(--red)';
                  return (
                    <li key={goal.id} className="mini-goal">
                      <div className="mini-goal-head">
                        <span className="mini-goal-title">{goal.title}</span>
                        <span className="mini-goal-count">
                          {done}/{total}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${pct}%`,
                            background: color,
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="card streak-card">
            <h3 className="card-title">Streak</h3>
            <div className="streak-row">
              <div className="streak-flame" aria-hidden="true">
                🔥
              </div>
              <div className="streak-num">{streak}</div>
              <div className="streak-unit">days</div>
            </div>
            <p className="streak-msg">{streakMessage(streak)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// StatCardProps: accent محصور بـ union type لأن CSS عندنا classes
// جاهزة بس لـ stat-blue / stat-primary / stat-amber (وكذلك
// stat-value-*). أي قيمة تانية هتبوظ الـ styling بصمت - الـ union بيمنع
// كتابتها من الأساس. value: number | string لأنه بييجي مرة رقم
// (tasksToday.length) ومرة نص (`${todayStats.totalMinutes}m`).
interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  accent: 'blue' | 'primary' | 'amber';
  icon: string;
}

function StatCard({ label, value, hint, accent, icon }: StatCardProps) {
  return (
    <div className={`stat-card stat-${accent}`}>
      <div className="stat-top-row">
        <div className="stat-label">{label}</div>
        <div className="stat-icon" aria-hidden="true">{icon}</div>
      </div>
      <div className={`stat-value stat-value-${accent}`}>{value}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}
