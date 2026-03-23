import { useEffect, useState } from 'react';

export default function Header() {
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
      <div className="brand">RenderForge MVP</div>
      <input
        className="api-key-input"
        placeholder="X-API-Key"
        value={apiKey}
        onChange={(event) => handleChange(event.target.value)}
      />
    </header>
  );
}
