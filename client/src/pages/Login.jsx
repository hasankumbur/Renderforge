import { useState } from 'react';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({
    name: 'RenderForge User',
    email: 'user@renderforge.app',
    password: 'demo1234',
  });
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('E-posta ve sifre zorunludur.');
      return;
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
        <p>Video ve gorsel otomasyon platformu</p>

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
            <span>Sifre</span>
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
            Giris Yap
          </button>
        </form>
      </div>
    </div>
  );
}
