export interface User {
  id: number;
  username: string;
  email: string;
  avatar_color: string;
}

export interface Session {
  id: number;
  name: string;
  date: string;
  location?: string;
  notes?: string;
  small_blind: number;
  big_blind: number;
  created_by: number;
  created_by_name: string;
  player_count?: number;
  total_pot?: number;
  players?: SessionPlayer[];
}

export interface SessionPlayer {
  id: number;
  session_id: number;
  user_id: number;
  username: string;
  avatar_color: string;
  buy_in: number;
  cash_out: number;
}

export interface Transaction {
  from: string;
  to: string;
  amount: number;
}

export interface PlayerStats {
  overall: {
    sessions_played: number;
    total_profit: number;
    total_buy_in: number;
    total_cash_out: number;
    best_session: number;
    worst_session: number;
    avg_profit: number;
    wins: number;
    losses: number;
  };
  history: { date: string; session: string; profit: number; cumulative: number }[];
}

export interface LeaderboardEntry {
  id: number;
  username: string;
  avatar_color: string;
  sessions: number;
  total_profit: number;
  wins: number;
  avg_profit: number;
}
