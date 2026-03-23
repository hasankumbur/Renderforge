import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

export default function Renders() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getRenderHistory()
      .then((payload) => setRows(payload.data || []))
      .catch((apiError) => setError(apiError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="page-stack">
      <h2>Render Gecmisi</h2>
      {loading && <p>Yukleniyor...</p>}
      {error && <p style={{ color: '#fca5a5' }}>{error}</p>}

      <div className="panel">
        <div className="table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th align="left">Render ID</th>
                <th align="left">Template</th>
                <th align="left">Tip</th>
                <th align="left">Durum</th>
                <th align="left">Tarih</th>
                <th align="left">Cikti</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.template_id}</td>
                  <td>{row.output_type}</td>
                  <td>{row.status}</td>
                  <td>{row.created_at}</td>
                  <td>
                    {row.output_url ? (
                      <a href={row.output_url} target="_blank" rel="noreferrer">
                        Indir
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
