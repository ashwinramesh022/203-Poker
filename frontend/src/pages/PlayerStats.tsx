import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, TrendingUp, TrendingDown, Award } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, ReferenceLine, Cell,
} from 'recharts';

function fmt(n: number) {
  return (n >= 0 ? '+' : '') + '$' + Math.abs(n).toFixed(2);
}

export default function PlayerStats() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const targetId = userId ? Number(userId) : user?.id;

  const [stats, setStats] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!targetId) return;
    Promise.all([api.stats.player(targetId), api.auth.users()])
      .then(([s, u]) => { setStats(s); setAllUsers(u); })
      .finally(() => setLoading(false));
  }, [targetId]);

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Loading...</div>;

  const o = stats?.overall;
  const playerName = allUsers.find(u => u.id === targetId)?.username || 'Player';
  const isOwn = targetId === user?.id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-300">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">{isOwn ? 'My Stats' : `${playerName}'s Stats`}</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total P&L', value: fmt(o?.total_profit || 0), color: o?.total_profit >= 0 ? 'text-emerald-400' : 'text-red-400' },
          { label: 'Sessions', value: o?.sessions_played || 0, color: 'text-indigo-400' },
          { label: 'Win Rate', value: o?.sessions_played ? `${Math.round((o.wins / o.sessions_played) * 100)}%` : '—', color: 'text-yellow-400' },
          { label: 'Avg / Session', value: fmt(o?.avg_profit || 0), color: o?.avg_profit >= 0 ? 'text-emerald-400' : 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card">
            <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Best Session', value: fmt(o?.best_session || 0), icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Worst Session', value: fmt(o?.worst_session || 0), icon: TrendingDown, color: 'text-red-400' },
          { label: 'W / L', value: `${o?.wins || 0} / ${o?.losses || 0}`, icon: Award, color: 'text-yellow-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-3">
            <Icon size={24} className={color} />
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className={`font-bold ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cumulative P&L chart */}
      {stats?.history?.length > 0 && (
        <>
          <div className="card">
            <h2 className="font-semibold mb-4">Cumulative Profit Over Time</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={stats.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tickFormatter={v => `$${v}`} tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                  formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Cumulative P&L']}
                />
                <ReferenceLine y={0} stroke="#374151" />
                <Line type="monotone" dataKey="cumulative" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-4">Session-by-Session Results</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="session" tick={{ fill: '#6b7280', fontSize: 10 }} />
                <YAxis tickFormatter={v => `$${v}`} tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                  formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Profit']}
                />
                <ReferenceLine y={0} stroke="#374151" />
                <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                  {stats.history.map((entry: any, index: number) => (
                    <Cell key={index} fill={entry.profit >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {(!stats?.history || stats.history.length === 0) && (
        <div className="card text-center py-10 text-gray-400">No session data yet.</div>
      )}
    </div>
  );
}
