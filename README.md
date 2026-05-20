# ⚡ Taskra — Build. Focus. Compound.

A clean, dark-mode productivity app built for developers and focused individuals. Manage tasks, notes, goals, and deep work sessions — all in one place.

🔗 **Live Demo:** [taskra-sepia.vercel.app](https://taskra-sepia.vercel.app)

---

## Screenshots

> Dashboard · Tasks · Notes · Goals · Pomodoro

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool |
| React Router v6 | Client-side routing |
| localStorage | Persistent state |
| CSS Custom Properties | Design system / theming |

---

## Features

- **Dashboard** — Daily overview with stat cards, today's tasks, recent notes, goals progress, and streak counter
- **Tasks** — Priority badges, checkbox animations, search, and filter tabs
- **Notes** — Card grid with categories and modal editor
- **Goals** — Milestone tracking with progress bars
- **Pomodoro** — Circular SVG timer with session counter

---

## Design System

```
Font:       Outfit (Google Fonts)
Mode:       Dark only

--bg:           #0f1117
--surface:      #1a1d27
--surface-2:    #242736
--border:       #2e3146
--text:         #e2e4f0
--text-muted:   #8b8fa8
--primary:      #6ee7b7  (mint green)
--amber:        #fcd34d
--blue:         #93c5fd
--red:          #fca5a5
--radius:       12px
```

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/arsanyemad86-eng/taskra.git

# Navigate to project
cd taskra

# Install dependencies
npm install

# Start dev server
npm run dev
```

---

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx
│   └── Sidebar.jsx
├── hooks/
│   ├── useGoals.js
│   ├── useNotes.js
│   ├── usePomodoro.js
│   ├── useStreak.js
│   └── useTasks.js
├── pages/
│   ├── Dashboard.jsx
│   ├── Tasks.jsx
│   ├── Notes.jsx
│   ├── Goals.jsx
│   └── Pomodoro.jsx
└── main.jsx
```

---

## Other Projects

| Project | Description | Live |
|---|---|---|
| [UXNIN Store](https://github.com/arsanyemad86-eng/uxnin-store) | Fitness supplements e-commerce | — |
| [FinTrack](https://github.com/arsanyemad86-eng/finance-tracker) | Personal finance tracker | [Live](https://finance-tracker-gamma-ashen.vercel.app) |

---

## Author

**Arsany Emad** — Front-End Developer  
GitHub: [@arsanyemad86-eng](https://github.com/arsanyemad86-eng)