import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function Templates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadTemplates() {
    setLoading(true);
    setError('');

    try {
      const payload = await api.getTemplates();
      setTemplates(payload.data || []);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Templates</h2>
        <button className="button primary" type="button" onClick={() => navigate('/editor')}>
          Yeni Template
        </button>
      </div>

      {loading && <p>Yukleniyor...</p>}
      {error && <p style={{ color: '#fca5a5' }}>{error}</p>}

      <div className="card-grid">
        {templates.map((template) => (
          <article key={template.id} className="panel">
            <div style={{ marginBottom: 10 }}>
              <strong>{template.name}</strong>
              <div style={{ color: '#94a3b8', marginTop: 4 }}>
                {template.width}x{template.height}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <Link className="button" to={`/editor/${template.id}`}>
                Duzenle
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
