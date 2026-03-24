import { useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/shared/Header.jsx';
import Sidebar from './components/shared/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Editor from './pages/Editor.jsx';
import Login from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';
import Renders from './pages/Renders.jsx';
import Templates from './pages/Templates.jsx';

const SESSION_KEY = 'renderforge_session';

function getInitialSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (_error) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function saveSession(session) {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function AppArea({ session }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <Header
        session={session}
        onToggleMenu={() => setMobileMenuOpen((prev) => !prev)}
      />
      <div className="app-content">
        <Sidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        <main className="page-container" onClick={() => setMobileMenuOpen(false)}>
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="templates" element={<Templates />} />
            <Route path="editor" element={<Editor />} />
            <Route path="editor/:id" element={<Editor />} />
            <Route path="renders" element={<Renders />} />
            <Route path="profile" element={<Profile session={session} />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(getInitialSession);

  const authApi = useMemo(
    () => ({
      login(nextSession) {
        saveSession(nextSession);
        setSession(nextSession);
      },
      logout() {
        saveSession(null);
        setSession(null);
      },
    }),
    []
  );

  return (
    <Routes>
      <Route
        path="/login"
        element={
          session ? (
            <Navigate to="/app/dashboard" replace />
          ) : (
            <Login onLogin={authApi.login} />
          )
        }
      />

      <Route
        path="/app/*"
        element={
          session ? (
            <AppArea session={session} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="*"
        element={<Navigate to={session ? '/app/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
}
