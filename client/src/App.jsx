import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/shared/Header.jsx';
import Sidebar from './components/shared/Sidebar.jsx';
import { api, clearAuth, getToken, setToken } from './lib/api.js';
import Dashboard from './pages/Dashboard.jsx';
import Editor from './pages/Editor.jsx';
import Login from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';
import Renders from './pages/Renders.jsx';
import Templates from './pages/Templates.jsx';

const SESSION_KEY = 'renderforge_session';

function getStoredSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_e) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function AppArea({ session, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isEditorRoute = location.pathname.startsWith('/app/editor');

  return (
    <div className={isEditorRoute ? 'app-shell editor-route' : 'app-shell'}>
      {!isEditorRoute && (
        <Header
          session={session}
          onToggleMenu={() => setMobileMenuOpen((prev) => !prev)}
        />
      )}
      <div className="app-content">
        <Sidebar
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          hideMobileNav={isEditorRoute}
          hideDesktopSidebar={isEditorRoute}
        />
        <main
          className={isEditorRoute ? 'page-container editor-route' : 'page-container'}
          onClick={() => setMobileMenuOpen(false)}
        >
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="templates" element={<Templates />} />
            <Route path="editor" element={<Editor />} />
            <Route path="editor/:id" element={<Editor />} />
            <Route path="renders" element={<Renders />} />
            <Route path="profile" element={<Profile session={session} onLogout={onLogout} />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(getStoredSession);
  const [checking, setChecking] = useState(!!getToken());

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setChecking(false);
      setSession(null);
      return;
    }

    api.getMe()
      .then((res) => {
        const user = res.data;
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        setSession(user);
      })
      .catch(() => {
        clearAuth();
        setSession(null);
      })
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = useCallback((user) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    setSession(user);
  }, []);

  const handleLogout = useCallback(() => {
    api.logout().finally(() => {
      clearAuth();
      setSession(null);
    });
  }, []);

  if (checking) {
    return (
      <div className="auth-page">
        <p style={{ color: 'var(--text-secondary)' }}>Oturum kontrol ediliyor...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          session ? (
            <Navigate to="/app/dashboard" replace />
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />

      <Route
        path="/app/*"
        element={
          session ? (
            <AppArea session={session} onLogout={handleLogout} />
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
