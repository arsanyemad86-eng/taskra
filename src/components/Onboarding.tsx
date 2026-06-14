import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Onboarding.css';

// Feature: شكل كل عنصر في قايمة المميزات اللي بتظهر في الخطوة 2.
interface Feature {
  icon: string;
  title: string;
  desc: string;
}

const FEATURES: Feature[] = [
  { icon: '✅', title: 'Tasks', desc: 'Organize your day with priorities, categories, and due dates.' },
  { icon: '🎯', title: 'Goals', desc: 'Break big ambitions into trackable milestones.' },
  { icon: '⏱️', title: 'Pomodoro', desc: 'Stay focused with timed work sessions and breaks.' },
  { icon: '🔥', title: 'Streak', desc: 'Build momentum by showing up every day.' },
];

// OnboardingProps: تعريف props الكومبونينت.
// - onFinish اختياري (`?`) لأن الكود الأصلي بينده بـ `onFinish?.(name)`
//   (optional chaining) - يعني ممكن الكومبونينت يُستخدم من غير ما حد
//   يمرّر الـ prop ده أصلاً. التوقيع `(name: string) => void` بيوضح
//   إن أي دالة تُمرَّر هنا المفروض تستقبل الاسم النهائي وما ترجّع شيء.
interface OnboardingProps {
  onFinish?: (name: string) => void;
}

export default function Onboarding({ onFinish }: OnboardingProps) {
  const { user } = useAuth();

  // step محصور منطقيًا بين 1 و 3 (تظهر في next/back عن طريق
  // Math.min/Math.max)، لكن سيبناه `number` عادي - عمل union type
  // زي `1 | 2 | 3` هنا هيكون over-engineering لخطوات onboarding بسيطة
  // كده، وده مثال على *عدم* استخدام type معقد لما يكون التعقيد مش لازم.
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>(user?.name || '');

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const finish = () => {
    localStorage.setItem('taskra_onboarded', 'true');
    onFinish?.(name);
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card card">
        <div className="onboarding-step" key={step}>
          {step === 1 && (
            <div className="onboarding-content">
              <h1 className="onboarding-title">Welcome to Taskra ⚡</h1>
              <p className="onboarding-tagline">Build. Focus. Compound.</p>
              <p className="onboarding-desc">
                Taskra is your all-in-one productivity space — manage tasks,
                track goals, run focus sessions, and build streaks that keep
                you moving forward, every single day.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="onboarding-content">
              <h2 className="onboarding-title">Everything you need</h2>
              <div className="onboarding-features">
                {FEATURES.map((f) => (
                  <div className="onboarding-feature-card" key={f.title}>
                    <div className="onboarding-feature-icon">{f.icon}</div>
                    <h3 className="onboarding-feature-title">{f.title}</h3>
                    <p className="onboarding-feature-desc">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="onboarding-content">
              <h2 className="onboarding-title">You're all set</h2>
              <p className="onboarding-desc">
                What should we call you?
              </p>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoFocus
              />
            </div>
          )}
        </div>

        <div className="onboarding-dots">
          {[1, 2, 3].map((s) => (
            <span key={s} className={`onboarding-dot${s === step ? ' active' : ''}`} />
          ))}
        </div>

        <div className="onboarding-actions">
          {step > 1 ? (
            <button className="btn" onClick={back}>
              Back
            </button>
          ) : (
            <span />
          )}
          {step < 3 ? (
            <button className="btn btn-primary" onClick={next}>
              Next
            </button>
          ) : (
            <button className="btn btn-primary" onClick={finish}>
              Let's go
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
