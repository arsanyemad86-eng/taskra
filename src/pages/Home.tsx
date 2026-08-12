import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import "./Home.css";

interface StatCardData {
  label: string;
  value: string;
  bar: string;
}

const STAT_CARDS: StatCardData[] = [
  { label: "Tasks Today", value: "0", bar: "var(--blue)" },
  { label: "Completed", value: "0", bar: "var(--primary)" },
  { label: "Active Goals", value: "2", bar: "var(--amber)" },
  { label: "Focus Time", value: "0m", bar: "var(--primary)" },
];

function StatCard({ label, value, bar }: StatCardData) {
  return (
    <div className="card home-stat-card">
      <div className="home-stat-bar" style={{ backgroundColor: bar }} />
      <p className="home-stat-label">{label}</p>
      <p className="home-stat-value">{value}</p>
    </div>
  );
}

export default function Home() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="home">
      <section className="home-hero">
        {/* Background blobs — Taskra colors instead of Encan's orange/yellow */}
        <div className="home-blob home-blob-green" aria-hidden="true" />
        <div className="home-blob home-blob-amber" aria-hidden="true" />

        <div className="home-content">
          <div className="home-eyebrow-wrap">
            <span className="home-eyebrow">
              Now live · Build. Focus. Compound.
            </span>
          </div>

          <h1 className="home-headline">
            <span className="home-headline-line">Your day,</span>
            <span className="home-headline-line home-headline-accent">
              compounded.
            </span>
          </h1>

          <p className="home-subtext">
            Tasks, notes, goals, and focus sessions — in one calm, focused
            workspace built to keep you moving.
          </p>

          <div className="home-cta-wrap">
            <Link to="/login" className="btn btn-primary home-cta">
              Open Dashboard
            </Link>
          </div>

          <div className="home-panel-wrap">
            {/* Floating card, Encan-style — sits partly outside the main frame */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -10, rotate: -4 }}
              animate={{ opacity: 1, y: 0, rotate: -4 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.35 }}
              className="card home-float-card"
            >
              <span className="home-float-emoji">🔥</span>
              <div>
                <p className="home-float-title">Streak</p>
                <p className="home-float-value">1 day</p>
              </div>
            </motion.div>

            {/* Product mockup in a browser-style frame */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="home-panel"
            >
              <div className="home-panel-bar">
                <span className="home-panel-dot" />
                <span className="home-panel-dot" />
                <span className="home-panel-dot" />
                <span className="home-panel-brand">⚡ Taskra</span>
              </div>
              <div className="home-cards">
                {STAT_CARDS.map((card) => (
                  <StatCard key={card.label} {...card} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}