import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { ArrowLeftRight, ArrowRight } from 'lucide-react';

function fmt(n: number) {
  return (n >= 0 ? '+' : '') + '$' + Math.abs(n).toFixed(2);
}

export default function Settlements() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.stats.settlements().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <ArrowLeftRight size={22} className="text-indigo-400" /> All-Time Settlements
      </h1>
      <p className="text-sm text-gray-400">Minimum transactions to settle all debts across every recorded session.</p>

      {data?.transactions?.length === 0 && (
        <div className="card text-center py-10 text-gray-400">Everyone is settled up! 🎉</div>
      )}

      {data?.transactions?.length > 0 && (
        <div className="card space-y-3">
          <h2 className="font-semibold">Payments Required</h2>
          {data.transactions.map((t: any, i: number) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-800 last:border-0">
              <div className="flex items-center gap-2 flex-1">
                <span className="font-semibold text-red-400">{t.from}</span>
                <ArrowRight size={16} className="text-gray-500 shrink-0" />
                <span className="font-semibold text-emerald-400">{t.to}</span>
              </div>
              <span className="font-bold text-lg">${t.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Per-player running balance */}
      {data?.balances?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-4">All-Time Balances</h2>
          <div className="divide-y divide-gray-800">
            {[...data.balances].sort((a: any, b: any) => b.net - a.net).map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: p.avatar_color }}>{p.username[0].toUpperCase()}</div>
                <Link to={`/stats/${p.id}`} className="font-medium hover:text-indigo-400 flex-1">{p.username}</Link>
                <span className={p.net >= 0 ? 'profit' : 'loss'}>{fmt(p.net)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
