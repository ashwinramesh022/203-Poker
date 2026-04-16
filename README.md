# 203 Poker

A full-stack web app for managing poker home games.

## Features

- **Accounts** — Register and log in with secure JWT auth
- **Sessions** — Record daily sessions with buy-ins, cash-outs, location, blinds, and notes
- **Settlements** — Automatically calculate minimum payments to settle all debts (greedy algorithm)
- **Player Stats** — Cumulative P&L chart, session-by-session bar chart, win rate, best/worst session
- **Leaderboard** — All-time profit ranking with visual chart
- **Dashboard** — Quick overview of your stats and recent activity

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React + TypeScript + Vite + Tailwind CSS + Recharts |
| Backend | Node.js + Express + TypeScript |
| Database | SQLite (via better-sqlite3) |
| Auth | JWT + bcrypt |

## Getting Started

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:3001`.

## Debt Settlement Algorithm

Uses a greedy two-pointer algorithm: players with net losses pay those with net gains, minimising the total number of transactions needed.
