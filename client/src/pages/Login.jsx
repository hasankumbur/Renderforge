import { useState } from 'react';
import { api, setToken } from '../lib/api.js';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('E-posta ve şifre zorunludur.');
      return;
    }

    if (mode === 'register' && !form.name) {
      setError('Ad Soyad zorunludur.');
      return;
    }

    if (mode === 'register' && form.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);

    try {
      const payload = mode === 'register'
        ? await api.register({ name: form.name, email: form.email, password: form.password })
        : await api.login({ email: form.email, password: form.password });

      const { user, token } = payload.data;
      setToken(token);
      onLogin(user);
    } catch (err) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card panel">
        <h1>RenderForge</h1>
        <p>Video ve görsel otomasyon platformu</p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Giriş Yap
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Kayıt Ol
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label className="field">
              <span>Ad Soyad</span>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Adınız Soyadınız"
              />
            </label>
          )}

          <label className="field">
            <span>E-posta</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="ornek@email.com"
            />
          </label>

          <label className="field">
            <span>Şifre</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder={mode === 'register' ? 'En az 6 karakter' : 'Şifreniz'}
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button className="button primary auth-submit" type="submit" disabled={loading}>
            {loading
              ? 'Lütfen bekleyin...'
              : mode === 'register'
                ? 'Kayıt Ol'
                : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}
