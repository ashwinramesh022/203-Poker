import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Edit, Trash2, ArrowLeft, MapPin } from 'lucide-react';

function fmt(n: number) {
  return (n >= 0 ? '+' : '') + '$' + Math.abs(n).toFixed(2);
}

export default function SessionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.sessions.get(Number(id)),
      api.stats.sessionSettlements(Number(id)),
    ]).then(([s, st]) => {
      setSession(s);
      setSettlements(st.transactions);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this session?')) return;
    await api.sessions.delete(Number(id));
    navigate('/sessions');
  };

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Loading...</div>;
  if (!session) return <div className="text-center py-20 text-gray-400">Session not found.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-start gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-300 mt-1">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{session.name}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-gray-400 mt-1">
            <span>{session.date}</span>
            {session.location && <span className="flex items-center gap-1"><MapPin size={12} />{session.location}</span>}
            <span>Blinds: ${session.small_blind}/${session.big_blind}</span>
            <span>by {session.created_by_name}</span>
          </div>
        </div>
        {user?.id === session.created_by && (
          <div className="flex gap-2">
            <Link to={`/sessions/${id}/edit`} className="btn-secondary flex items-center gap-1 py-1.5 px-3 text-sm">
              <Edit size={14} /> Edit
            </Link>
            <button onClick={handleDelete} className="btn-danger flex items-center gap-1 py-1.5 px-3 text-sm">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {session.notes && (
        <div className="card bg-gray-800/50">
          <p className="text-gray-300 text-sm">{session.notes}</p>
        </div>
      )}

      {/* Player results */}
      <div className="card">
        <h2 className="font-semibold mb-4">Results</h2>
        <div className="space-y-2">
          {session.players?.map((p: any) => {
            const profit = p.cash_out - p.buy_in;
            return (
              <div key={p.user_id} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: p.avatar_color }}>
                  {p.username[0].toUpperCase()}
                </div>
                <Link to={`/stats/${p.user_id}`} className="font-medium hover:text-indigo-400 flex-1">{p.username}</Link>
                <div className="text-right text-sm space-y-0.5">
                  <div className="text-gray-400">
                    ${p.buy_in.toFixed(2)} → ${p.cash_out.toFixed(2)}
                  </div>
                  <div className={profit >= 0 ? 'profit' : 'loss'}>{fmt(profit)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settlements */}
      {settlements.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-4">Payments</h2>
          <div className="space-y-2">
            {settlements.map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-sm py-2 border-b border-gray-800 last:border-0">
                <span className="font-medium text-red-400">{t.from}</span>
                <span className="text-gray-500">pays</span>
                <span className="font-medium text-emerald-400">{t.to}</span>
                <span className="ml-auto font-semibold">${t.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
