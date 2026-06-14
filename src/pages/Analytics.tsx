import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { useTasks } from '../hooks/useTasks.ts';
import { usePomodoro } from '../hooks/usePomodoro.ts';
import { useGoals, goalProgress } from '../hooks/useGoals.ts';
import './Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const css = (name: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

interface DayInfo {
  key: string;
  label: string;
}

function lastNDays(n: number): DayInfo[] {
  const days: DayInfo[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    days.push({
      key: `${y}-${m}-${day}`,
      label: d.toLocaleDateString(undefined, { weekday: 'short' }),
    });
  }
  return days;
}

export default function Analytics() {
  const { tasks } = useTasks();
  const { sessions } = usePomodoro();
  const { goals } = useGoals();

  const days = useMemo(() => lastNDays(7), []);

  const primary = css('--primary') || '#6ee7b7';
  const blue = css('--blue') || '#93c5fd';
  const amber = css('--amber') || '#fcd34d';
  const red = css('--red') || '#fca5a5';
  const textMuted = css('--text-muted') || '#9ca3af';
  const border = css('--border') || '#27303f';
  const text = css('--text') || '#e5e7eb';

  const tasksCompletedData = useMemo(() => {
    const counts = days.map(
      ({ key }) =>
        tasks.filter(
          (t) => t.completed && t.completedAt && t.completedAt.slice(0, 10) === key
        ).length
    );
    return {
      labels: days.map((d) => d.label),
      datasets: [
        {
          label: 'Tasks Completed',
          data: counts,
          backgroundColor: primary,
          borderRadius: 6,
        },
      ],
    };
  }, [tasks, days, primary]);

  const focusTimeData = useMemo(() => {
    const minutes = days.map(({ key }) =>
      sessions
        .filter((s) => s.completedAt && s.completedAt.slice(0, 10) === key)
        .reduce((sum, s) => sum + s.durationMinutes, 0)
    );
    return {
      labels: days.map((d) => d.label),
      datasets: [
        {
          label: 'Focus Minutes',
          data: minutes,
          borderColor: blue,
          backgroundColor: blue,
          tension: 0.35,
          fill: false,
          pointRadius: 3,
        },
      ],
    };
  }, [sessions, days, blue]);

  const goalCompletionData = useMemo(() => {
    let done = 0;
    let remaining = 0;
    goals.forEach((g) => {
      const { total, done: d } = goalProgress(g);
      done += d;
      remaining += total - d;
    });
    return {
      labels: ['Completed', 'Remaining'],
      datasets: [
        {
          data: [done, remaining],
          backgroundColor: [primary, border],
          borderWidth: 0,
        },
      ],
    };
  }, [goals, primary, border]);

  const priorityData = useMemo(() => {
    const open = tasks.filter((t) => !t.completed);
    const high = open.filter((t) => t.priority === 'high').length;
    const medium = open.filter((t) => t.priority === 'medium').length;
    const low = open.filter((t) => t.priority === 'low').length;
    return {
      labels: ['High', 'Medium', 'Low'],
      datasets: [
        {
          data: [high, medium, low],
          backgroundColor: [red, amber, blue],
          borderWidth: 0,
        },
      ],
    };
  }, [tasks, red, amber, blue]);

  // ChartOptions<'bar'>: مكتبة chart.js عندها types دقيقة لخيارات كل
  // نوع رسم (مثلاً legend.position لازم تكون من قيم محددة زي 'bottom'
  // مش أي string). بدون هذا الـ type، TS كان هيوسع النوع لـ string
  // العادي ويرفض تمريره لـ <Bar>/<Line>/<Doughnut>.
  const commonOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: text },
      },
    },
    scales: {
      x: {
        ticks: { color: textMuted },
        grid: { color: border },
      },
      y: {
        ticks: { color: textMuted, precision: 0 },
        grid: { color: border },
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: text },
      },
    },
  };

  return (
    <motion.div
      className="analytics-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p className="subtitle">A look at your productivity over time.</p>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="card analytics-card">
          <h3 className="analytics-card-title">Tasks Completed (Last 7 Days)</h3>
          <div className="chart-wrap">
            <Bar data={tasksCompletedData} options={commonOptions} />
          </div>
        </div>

        <div className="card analytics-card">
          <h3 className="analytics-card-title">Focus Time (Last 7 Days)</h3>
          <div className="chart-wrap">
            <Line data={focusTimeData} options={commonOptions as ChartOptions<'line'>} />
          </div>
        </div>

        <div className="card analytics-card">
          <h3 className="analytics-card-title">Goal Completion Rate</h3>
          <div className="chart-wrap">
            {goals.length === 0 ? (
              <p className="analytics-empty">No goals yet.</p>
            ) : (
              <Doughnut data={goalCompletionData} options={doughnutOptions} />
            )}
          </div>
        </div>

        <div className="card analytics-card">
          <h3 className="analytics-card-title">Tasks by Priority</h3>
          <div className="chart-wrap">
            {tasks.filter((t) => !t.completed).length === 0 ? (
              <p className="analytics-empty">No open tasks.</p>
            ) : (
              <Doughnut data={priorityData} options={doughnutOptions} />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
