# Taskra

A focused, dark-mode productivity app — tasks, notes, goals, and a Pomodoro timer in one place.

## Stack

- React 18
- Vite 5
- React Router v6
- localStorage for persistence (no backend)

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Data keys

- `taskra_tasks`
- `taskra_notes`
- `taskra_goals`
- `taskra_pomodoro`
- `taskra_streak`

Clear them from DevTools > Application > Local Storage to wipe state.

## Project structure

```
src/
├── components/   Sidebar
├── pages/        Dashboard, Tasks, Notes, Goals, Pomodoro
├── hooks/        useTasks, useNotes, useGoals, usePomodoro
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```
