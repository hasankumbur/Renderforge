import { useState } from 'react';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({
    name: 'RenderForge User',
    email: 'user@renderforge.app',
    password: 'demo1234',
  });
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('E-posta ve şifre zorunludur.');
      return;
    }

    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.apiKey) {
        localStorage.setItem('renderforge_api_key', data.apiKey);
      }
    } catch (_err) {
      // Config alınamazsa sessizce devam et
    }

    onLogin({
      name: form.name || 'RenderForge User',
      email: form.email,
      role: 'Owner',
    });
  }

  return (
    <div className="auth-page">
      <div className="auth-card panel">
        <h1>RenderForge</h1>
        <p>Video ve görsel otomasyon platformu</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Ad Soyad</span>
            <input
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
          </label>

          <label className="field">
            <span>E-posta</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
            />
          </label>

          <label className="field">
            <span>Şifre</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, password: event.target.value }))
              }
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button className="button primary auth-submit" type="submit">
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}
