import { Link } from 'react-router-dom';

const stats = [
  { label: 'Aylik Render', value: '1,284', delta: '+12%' },
  { label: 'Aktif Template', value: '42', delta: '+4%' },
  { label: 'Takim Uyesi', value: '8', delta: '+1' },
  { label: 'Basarili Islem', value: '%99.2', delta: '+0.3' },
];

const quickActions = [
  { label: 'Yeni Template Baslat', to: '/app/editor' },
  { label: 'Template Kutuphanesi', to: '/app/templates' },
  { label: 'Render Gecmisi', to: '/app/renders' },
];

export default function Dashboard() {
  return (
    <section className="dashboard-page">
      <div className="dashboard-hero panel">
        <div>
          <h2>Hos geldiniz 👋</h2>
          <p>
            RenderForge Studio ile sosyal medya, reklam ve kampanya kreatiflerini hizli
            olusturun.
          </p>
        </div>
        <Link to="/app/editor" className="button primary">
          Yeni Proje
        </Link>
      </div>

      <div className="dashboard-stats">
        {stats.map((item) => (
          <article key={item.label} className="panel stat-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.delta}</small>
          </article>
        ))}
      </div>

      <div className="dashboard-bottom">
        <article className="panel">
          <h3>Hizli Islemler</h3>
          <div className="quick-actions">
            {quickActions.map((action) => (
              <Link key={action.to} className="button" to={action.to}>
                {action.label}
              </Link>
            ))}
          </div>
        </article>

        <article className="panel">
          <h3>Onemli Notlar</h3>
          <ul className="notes-list">
            <li>API key alanindan entegrasyon anahtarini guncelleyin.</li>
            <li>Templateleri mobilde de inceleyebilmek icin responsive kartlar aktif.</li>
            <li>Video render sureci artik MP4/GIF formatlarini destekliyor.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
