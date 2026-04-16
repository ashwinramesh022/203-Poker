import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Sessions from './pages/Sessions';
import NewSession from './pages/NewSession';
import SessionDetail from './pages/SessionDetail';
import PlayerStats from './pages/PlayerStats';
import Leaderboard from './pages/Leaderboard';
import Settlements from './pages/Settlements';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/sessions" element={<ProtectedRoute><Layout><Sessions /></Layout></ProtectedRoute>} />
          <Route path="/sessions/new" element={<ProtectedRoute><Layout><NewSession /></Layout></ProtectedRoute>} />
          <Route path="/sessions/:id" element={<ProtectedRoute><Layout><SessionDetail /></Layout></ProtectedRoute>} />
          <Route path="/sessions/:id/edit" element={<ProtectedRoute><Layout><NewSession /></Layout></ProtectedRoute>} />
          <Route path="/stats" element={<ProtectedRoute><Layout><PlayerStats /></Layout></ProtectedRoute>} />
          <Route path="/stats/:userId" element={<ProtectedRoute><Layout><PlayerStats /></Layout></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Layout><Leaderboard /></Layout></ProtectedRoute>} />
          <Route path="/settlements" element={<ProtectedRoute><Layout><Settlements /></Layout></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
