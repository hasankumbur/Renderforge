import { useState } from 'react';

export default function Profile({ session }) {
  const [form, setForm] = useState({
    name: session?.name || 'RenderForge User',
    email: session?.email || 'user@renderforge.app',
    company: 'RenderForge Labs',
    timezone: 'Europe/Istanbul',
  });
  const [saved, setSaved] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <section className="profile-page">
      <div className="panel profile-card">
        <h2>Profil Ayarlari</h2>
        <p>Hesap bilgilerinizi ve calisma tercihlerinizi buradan yonetebilirsiniz.</p>

        <form className="profile-form" onSubmit={handleSubmit}>
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
            <span>Sirket</span>
            <input
              value={form.company}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, company: event.target.value }))
              }
            />
          </label>

          <label className="field">
            <span>Saat Dilimi</span>
            <select
              value={form.timezone}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, timezone: event.target.value }))
              }
            >
              <option value="Europe/Istanbul">Europe/Istanbul</option>
              <option value="Europe/London">Europe/London</option>
              <option value="America/New_York">America/New_York</option>
            </select>
          </label>

          <button className="button primary" type="submit">
            Kaydet
          </button>

          {saved && <p className="success-text">Profil bilgileri guncellendi.</p>}
        </form>
      </div>
    </section>
  );
}
