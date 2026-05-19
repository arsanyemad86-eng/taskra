import { usePomodoro, MODES, formatTime } from '../hooks/usePomodoro.js';
import './Pomodoro.css';

const MODE_KEYS = ['focus', 'short', 'long'];
const RADIUS = 130;
const CIRC = 2 * Math.PI * RADIUS;

export default function Pomodoro() {
  const {
    mode,
    switchMode,
    secondsLeft,
    running,
    start,
    pause,
    reset,
    sessionIndex,
    progress,
    todayStats,
    toast,
    dismissToast,
  } = usePomodoro();

  // SVG dash offset — depletes as time passes
  const dashOffset = CIRC * (1 - progress);
  const accent =
    mode === 'focus'
      ? 'var(--primary)'
      : mode === 'short'
        ? 'var(--blue)'
        : 'var(--amber)';

  return (
    <div className="pomodoro-page">
      <div className="page-header">
        <div>
          <h1>Pomodoro</h1>
          <p className="subtitle">25 minutes. One thing. No noise.</p>
        </div>
      </div>

      <div className="mode-tabs">
        {MODE_KEYS.map((m) => (
          <button
            key={m}
            className={`mode-tab${mode === m ? ' active' : ''}`}
            onClick={() => switchMode(m)}
          >
            {MODES[m].label}
            <span className="mode-min">{MODES[m].minutes}m</span>
          </button>
        ))}
      </div>

      <div className="timer-wrap">
        <div className="timer-circle">
          <svg
            width="320"
            height="320"
            viewBox="0 0 320 320"
            className="timer-svg"
          >
            <circle
              cx="160"
              cy="160"
              r={RADIUS}
              fill="none"
              stroke="var(--border)"
              strokeWidth="10"
            />
            <circle
              cx="160"
              cy="160"
              r={RADIUS}
              fill="none"
              stroke={accent}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 160 160)"
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <div className="timer-center">
            <div className="timer-mode">{MODES[mode].label}</div>
            <div className="timer-time" style={{ color: accent }}>
              {formatTime(secondsLeft)}
            </div>
            <div className="timer-session">
              Session {sessionIndex} of 4
            </div>
          </div>
        </div>

        <div className="timer-controls">
          {!running ? (
            <button className="btn btn-primary timer-btn" onClick={start}>
              ▶ Start
            </button>
          ) : (
            <button className="btn timer-btn" onClick={pause}>
              ❚❚ Pause
            </button>
          )}
          <button className="btn timer-btn" onClick={reset}>
            ↻ Reset
          </button>
        </div>
      </div>

      <div className="pomo-stats">
        <div className="card pomo-stat">
          <div className="pomo-stat-label">Focus Sessions Today</div>
          <div className="pomo-stat-value">{todayStats.count}</div>
        </div>
        <div className="card pomo-stat">
          <div className="pomo-stat-label">Focus Minutes Today</div>
          <div className="pomo-stat-value">{todayStats.totalMinutes}m</div>
        </div>
      </div>

      {toast && (
        <div className="toast" onClick={dismissToast} role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
