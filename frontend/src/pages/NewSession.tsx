import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2 } from 'lucide-react';

interface PlayerRow { user_id: number; buy_in: string; cash_out: string; }

export default function NewSession() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [smallBlind, setSmallBlind] = useState('0.25');
  const [bigBlind, setBigBlind] = useState('0.50');
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.auth.users().then(users => {
      setAllUsers(users);
      if (!isEdit && user) {
        setPlayers([{ user_id: user.id, buy_in: '20', cash_out: '0' }]);
      }
    });

    if (isEdit) {
      api.sessions.get(Number(id)).then(s => {
        setName(s.name); setDate(s.date); setLocation(s.location || '');
        setNotes(s.notes || ''); setSmallBlind(String(s.small_blind)); setBigBlind(String(s.big_blind));
        setPlayers(s.players.map((p: any) => ({ user_id: p.user_id, buy_in: String(p.buy_in), cash_out: String(p.cash_out) })));
      });
    }
  }, [id, isEdit, user]);

  const addPlayer = () => {
    const used = new Set(players.map(p => p.user_id));
    const next = allUsers.find(u => !used.has(u.id));
    if (next) setPlayers(prev => [...prev, { user_id: next.id, buy_in: '20', cash_out: '0' }]);
  };

  const removePlayer = (idx: number) => setPlayers(prev => prev.filter((_, i) => i !== idx));

  const updatePlayer = (idx: number, field: keyof PlayerRow, value: string) =>
    setPlayers(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));

  const totalBuyIn = players.reduce((s, p) => s + (parseFloat(p.buy_in) || 0), 0);
  const totalCashOut = players.reduce((s, p) => s + (parseFloat(p.cash_out) || 0), 0);
  const balanced = Math.abs(totalBuyIn - totalCashOut) < 0.01;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!balanced) return setError('Total buy-in must equal total cash-out');
    setError(''); setLoading(true);
    try {
      const payload = {
        name, date, location, notes,
        small_blind: parseFloat(smallBlind), big_blind: parseFloat(bigBlind),
        players: players.map(p => ({ user_id: Number(p.user_id), buy_in: parseFloat(p.buy_in) || 0, cash_out: parseFloat(p.cash_out) || 0 })),
      };
      if (isEdit) {
        await api.sessions.update(Number(id), payload);
        navigate(`/sessions/${id}`);
      } else {
        const s = await api.sessions.create(payload);
        navigate(`/sessions/${s.id}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Session' : 'New Session'}</h1>

      <form onSubmit={submit} className="space-y-5">
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-300">Session Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Session Name</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} required placeholder="Friday Night Poker" />
            </div>
            <div>
              <label className="label">Date</label>
              <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input" value={location} onChange={e => setLocation(e.target.value)} placeholder="John's place" />
            </div>
            <div>
              <label className="label">Small Blind ($)</label>
              <input className="input" type="number" step="0.25" value={smallBlind} onChange={e => setSmallBlind(e.target.value)} />
            </div>
            <div>
              <label className="label">Big Blind ($)</label>
              <input className="input" type="number" step="0.25" value={bigBlind} onChange={e => setBigBlind(e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="label">Notes</label>
              <textarea className="input resize-none h-20" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes about the session..." />
            </div>
          </div>
        </div>

        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-300">Players</h2>
            <div className={`text-xs px-2 py-1 rounded-full ${balanced ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'}`}>
              {balanced ? '✓ Balanced' : `Δ $${Math.abs(totalBuyIn - totalCashOut).toFixed(2)}`}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 px-1">
            <div className="col-span-5">Player</div>
            <div className="col-span-3">Buy-in</div>
            <div className="col-span-3">Cash-out</div>
            <div className="col-span-1"></div>
          </div>

          {players.map((p, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <select className="input text-sm py-1.5"
                  value={p.user_id}
                  onChange={e => updatePlayer(idx, 'user_id', e.target.value)}>
                  {allUsers.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                </select>
              </div>
              <div className="col-span-3">
                <input className="input text-sm py-1.5" type="number" step="1" min="0" value={p.buy_in}
                  onChange={e => updatePlayer(idx, 'buy_in', e.target.value)} />
              </div>
              <div className="col-span-3">
                <input className="input text-sm py-1.5" type="number" step="0.01" min="0" value={p.cash_out}
                  onChange={e => updatePlayer(idx, 'cash_out', e.target.value)} />
              </div>
              <div className="col-span-1 flex justify-center">
                <button type="button" onClick={() => removePlayer(idx)} className="text-gray-600 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-sm">
            <button type="button" onClick={addPlayer} disabled={players.length >= allUsers.length}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 disabled:opacity-40">
              <Plus size={14} /> Add Player
            </button>
            <span className="text-gray-400">
              Buy-in: <span className="text-white">${totalBuyIn.toFixed(2)}</span>
              {' · '}
              Cash-out: <span className="text-white">${totalCashOut.toFixed(2)}</span>
            </span>
          </div>
        </div>

        {error && <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-2 rounded-lg text-sm">{error}</div>}

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1" disabled={loading || !balanced}>
            {loading ? 'Saving...' : isEdit ? 'Update Session' : 'Save Session'}
          </button>
        </div>
      </form>
    </div>
  );
}
