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

const categories = [
  { name: 'Sosyal medya', icon: '❤', color: '#f43f5e' },
  { name: 'Video', icon: '▶', color: '#c026d3' },
  { name: 'Fotograf', icon: '◉', color: '#2563eb' },
  { name: 'Sunum', icon: '▣', color: '#ea580c' },
  { name: 'Belge', icon: '▤', color: '#06b6d4' },
  { name: 'Canva kod', icon: '</>', color: '#16a34a' },
  { name: 'Web sitesi', icon: '⌘', color: '#4f46e5' },
  { name: 'E-posta', icon: '✉', color: '#7c3aed' },
  { name: 'Beyaz tahta', icon: '◻', color: '#0ea5e9' },
  { name: 'Takvim', icon: '▦', color: '#6366f1' },
];

const templatePreview = [
  'Instagram Hikayesi',
  'Mobil Video',
  'TikTok Videosu',
  'Logo',
  'Instagram Gonderisi',
  'Sunum',
  'Afis',
  'Davet',
];

export default function Dashboard() {
  return (
    <section className="dashboard-shell">
      <div className="dashboard-hero panel">
        <div>
          <h2>Bugun ne tasarlayacaksiniz?</h2>
          <p>
            RenderForge Studio ile sosyal medya, reklam ve kampanya kreatiflerini hizli
            olusturun.
          </p>
        </div>
        <Link to="/app/editor" className="button primary">
          Yeni Proje
        </Link>
      </div>

      <div className="dashboard-search panel">
        <div className="search-box">
          <span className="search-icon">⌕</span>
          <input placeholder="Ne olusturmak istiyorsunuz?" />
        </div>

        <div className="quick-chip-row">
          <span className="quick-chip active">Is</span>
          <span className="quick-chip">Pazarlama</span>
          <span className="quick-chip">Sosyal medya</span>
          <span className="quick-chip">Satis</span>
        </div>
      </div>

      <div className="panel">
        <div className="section-header-row">
          <h3>Kategoriler</h3>
          <Link to="/app/templates">Tumunu gor</Link>
        </div>
        <div className="category-grid">
          {categories.map((item) => (
            <article key={item.name} className="category-card">
              <div className="category-icon" style={{ background: item.color }}>
                {item.icon}
              </div>
              <span>{item.name}</span>
            </article>
          ))}
        </div>
      </div>

      <div className="dashboard-main-grid">
        <div className="panel">
          <div className="section-header-row">
            <h3>Sablonlari kesfedin</h3>
            <Link to="/app/templates">Tum sablonlar</Link>
          </div>
          <div className="template-preview-grid">
            {templatePreview.map((name, index) => (
              <article key={`${name}-${index}`} className="template-preview-card">
                <div className="template-preview-thumb" />
                <div className="template-preview-meta">
                  <strong>{name}</strong>
                  <small>Hazir set</small>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="dashboard-page">
          <div className="dashboard-stats">
            {stats.map((item) => (
              <article key={item.label} className="panel stat-card">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>{item.delta}</small>
              </article>
            ))}
          </div>

          <div className="panel">
            <h3>Hizli Islemler</h3>
            <div className="quick-actions">
              {quickActions.map((action) => (
                <Link key={action.to} className="button" to={action.to}>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
