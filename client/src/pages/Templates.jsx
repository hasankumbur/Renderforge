import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function Templates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');

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

  async function deleteTemplate(id) {
    const confirmed = window.confirm('Bu template silinsin mi? Bu islem geri alinamaz.');
    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setError('');
    try {
      await api.deleteTemplate(id);
      setTemplates((prev) => prev.filter((item) => item.id !== id));
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setDeletingId('');
    }
  }

  return (
    <section className="page-stack">
      <div className="page-title-row">
        <h2>Templates</h2>
        <button className="button primary" type="button" onClick={() => navigate('/app/editor')}>
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

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link className="button" to={`/app/editor/${template.id}`}>
                Duzenle
              </Link>
              <button
                className="button"
                type="button"
                onClick={() => deleteTemplate(template.id)}
                disabled={deletingId === template.id}
              >
                {deletingId === template.id ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
