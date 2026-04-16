import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, CalendarDays, Trophy, Plus, ArrowRight } from 'lucide-react';

function fmt(n: number) {
  return (n >= 0 ? '+' : '') + '$' + Math.abs(n).toFixed(2);
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.stats.player(user.id),
      api.sessions.list(),
      api.stats.leaderboard(),
    ]).then(([s, sess, lb]) => {
      setStats(s);
      setSessions(sess.slice(0, 5));
      setLeaderboard(lb.slice(0, 5));
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Loading...</div>;

  const o = stats?.overall;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.username} 👋</h1>
          <p className="text-gray-400 text-sm mt-0.5">Here's your poker overview</p>
        </div>
        <Link to="/sessions/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Session
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Profit', value: fmt(o?.total_profit || 0), icon: o?.total_profit >= 0 ? TrendingUp : TrendingDown, color: o?.total_profit >= 0 ? 'text-emerald-400' : 'text-red-400' },
          { label: 'Sessions', value: o?.sessions_played || 0, icon: CalendarDays, color: 'text-indigo-400' },
          { label: 'Best Session', value: fmt(o?.best_session || 0), icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Win Rate', value: o?.sessions_played ? `${Math.round((o.wins / o.sessions_played) * 100)}%` : '—', icon: Trophy, color: 'text-yellow-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
              </div>
              <Icon size={20} className={color} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent sessions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Recent Sessions</h2>
            <Link to="/sessions" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {sessions.length === 0
            ? <p className="text-gray-500 text-sm">No sessions yet. <Link to="/sessions/new" className="text-indigo-400">Create one!</Link></p>
            : sessions.map(s => (
              <Link key={s.id} to={`/sessions/${s.id}`}
                className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0 hover:bg-gray-800/50 -mx-2 px-2 rounded-lg transition-colors">
                <div>
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.date} · {s.player_count} players</p>
                </div>
                <span className="text-sm text-gray-400">${Number(s.total_pot || 0).toFixed(2)} pot</span>
              </Link>
            ))}
        </div>

        {/* Leaderboard preview */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Leaderboard</h2>
            <Link to="/leaderboard" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {leaderboard.length === 0
            ? <p className="text-gray-500 text-sm">No data yet.</p>
            : leaderboard.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 py-3 border-b border-gray-800 last:border-0">
                <span className="text-gray-500 text-sm w-5">{i + 1}</span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: p.avatar_color }}>{p.username[0].toUpperCase()}</div>
                <Link to={`/stats/${p.id}`} className="font-medium text-sm hover:text-indigo-400 flex-1">{p.username}</Link>
                <span className={p.total_profit >= 0 ? 'profit text-sm' : 'loss text-sm'}>{fmt(p.total_profit)}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
