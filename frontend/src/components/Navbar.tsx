import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, CalendarDays, Trophy, ArrowLeftRight, BarChart2, LogOut } from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/sessions', label: 'Sessions', icon: CalendarDays },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/settlements', label: 'Settlements', icon: ArrowLeftRight },
  { to: '/stats', label: 'My Stats', icon: BarChart2 },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-14 gap-1">
        <Link to="/dashboard" className="flex items-center gap-2 mr-6 text-white font-bold text-lg shrink-0">
          <span className="text-2xl">♠</span>
          <span className="hidden sm:block">203 Poker</span>
        </Link>

        <div className="flex items-center gap-1 flex-1 overflow-x-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                ${location.pathname.startsWith(to)
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}>
              <Icon size={15} />
              <span className="hidden md:block">{label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-2 shrink-0">
          {user && (
            <>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: user.avatar_color }}>
                {user.username[0].toUpperCase()}
              </div>
              <span className="text-sm text-gray-400 hidden sm:block">{user.username}</span>
            </>
          )}
          <button onClick={handleLogout} className="text-gray-500 hover:text-gray-300 p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}
