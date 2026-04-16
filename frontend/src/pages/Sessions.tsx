import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Plus, MapPin, Users, DollarSign } from 'lucide-react';

export default function Sessions() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.sessions.list().then(setSessions).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sessions</h1>
        <Link to="/sessions/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Session
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">🃏</div>
          <p className="text-gray-400">No sessions recorded yet.</p>
          <Link to="/sessions/new" className="btn-primary mt-4 inline-block">Record First Session</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => (
            <Link key={s.id} to={`/sessions/${s.id}`}
              className="card block hover:border-indigo-500/50 transition-colors group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold group-hover:text-indigo-400 transition-colors">{s.name}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-400">
                    <span>{s.date}</span>
                    {s.location && <span className="flex items-center gap-1"><MapPin size={12} />{s.location}</span>}
                    <span className="flex items-center gap-1"><Users size={12} />{s.player_count} players</span>
                    <span className="flex items-center gap-1"><DollarSign size={12} />Blinds {s.small_blind}/{s.big_blind}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm text-gray-400">Total pot</div>
                  <div className="font-semibold">${Number(s.total_pot || 0).toFixed(2)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
