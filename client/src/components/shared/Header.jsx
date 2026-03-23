import { useEffect, useState } from 'react';

export default function Header({ session, onLogout, onToggleMenu }) {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const key = localStorage.getItem('renderforge_api_key') || '';
    setApiKey(key);
  }, []);

  function handleChange(value) {
    setApiKey(value);
    localStorage.setItem('renderforge_api_key', value);
  }

  return (
    <header className="header">
      <div className="header-left">
        <button type="button" className="menu-button" onClick={onToggleMenu}>
          ☰
        </button>
        <div className="brand">RenderForge Studio</div>
      </div>

      <div className="header-right">
        <input
          className="api-key-input"
          placeholder="rforge_dev_secret"
          value={apiKey}
          onChange={(event) => handleChange(event.target.value)}
        />

        <div className="user-chip">
          <div className="user-avatar">{session?.name?.slice(0, 1) || 'U'}</div>
          <div className="user-meta">
            <strong>{session?.name || 'Kullanici'}</strong>
            <small>{session?.email || 'user@renderforge.app'}</small>
          </div>
        </div>

        <button type="button" className="button" onClick={onLogout}>
          Cikis
        </button>
      </div>
    </header>
  );
}
