import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

function fmt(n: number) {
  return (n >= 0 ? '+' : '') + '$' + Math.abs(n).toFixed(2);
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.stats.leaderboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy size={24} className="text-yellow-400" /> Leaderboard</h1>

      {data.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">No data yet.</div>
      ) : (
        <>
          <div className="card">
            <h2 className="font-semibold mb-4">Total Profit Ranking</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `$${v}`} tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis type="category" dataKey="username" tick={{ fill: '#9ca3af', fontSize: 12 }} width={80} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                  formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Profit']}
                />
                <ReferenceLine x={0} stroke="#374151" />
                <Bar dataKey="total_profit" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="divide-y divide-gray-800">
              {data.map((p, i) => (
                <div key={p.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <span className="text-xl w-8 text-center">{MEDALS[i] || <span className="text-gray-500 text-sm font-mono">{i + 1}</span>}</span>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white shrink-0"
                    style={{ background: p.avatar_color }}>
                    {p.username[0].toUpperCase()}
                  </div>
                  <Link to={`/stats/${p.id}`} className="font-semibold hover:text-indigo-400 flex-1">{p.username}</Link>
                  <div className="text-right text-sm space-y-0.5">
                    <div className={p.total_profit >= 0 ? 'profit text-base' : 'loss text-base'}>{fmt(p.total_profit)}</div>
                    <div className="text-gray-400">{p.sessions} sessions · {Math.round((p.wins / p.sessions) * 100)}% win</div>
                  </div>
                  <div className="hidden md:flex items-center">
                    {p.total_profit >= 0
                      ? <TrendingUp size={18} className="text-emerald-400" />
                      : <TrendingDown size={18} className="text-red-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
