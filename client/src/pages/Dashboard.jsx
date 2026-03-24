import { Link } from 'react-router-dom';

const quickChips = ['Instagram', 'Facebook', 'TikTok', 'YouTube', 'Reklam'];

const categories = [
  {
    name: 'Instagram Hikayesi',
    icon: 'instagram',
    gradient: 'linear-gradient(135deg, #f58529, #dd2a7b, #8134af)',
  },
  {
    name: 'Instagram Gönderisi',
    icon: 'instagramSquare',
    gradient: 'linear-gradient(135deg, #dd2a7b, #8134af)',
  },
  {
    name: 'Instagram Reels',
    icon: 'reels',
    gradient: 'linear-gradient(135deg, #8134af, #dd2a7b, #f58529)',
  },
  {
    name: 'Facebook Gönderisi',
    icon: 'facebook',
    gradient: 'linear-gradient(135deg, #1877f2, #0a4fd6)',
  },
  {
    name: 'Facebook Reklamı',
    icon: 'megaphone',
    gradient: 'linear-gradient(135deg, #0a4fd6, #42a5f5)',
  },
  {
    name: 'TikTok Videosu',
    icon: 'tiktok',
    gradient: 'linear-gradient(135deg, #010101, #69c9d0, #ee1d52)',
  },
  {
    name: 'YouTube Kısa',
    icon: 'shorts',
    gradient: 'linear-gradient(135deg, #ff0000, #cc0000)',
  },
  {
    name: 'YouTube Thumbnail',
    icon: 'youtube',
    gradient: 'linear-gradient(135deg, #ff0000, #ff6b6b)',
  },
  {
    name: 'Kampanya Seti',
    icon: 'sparkle',
    gradient: 'linear-gradient(135deg, #7c3aed, #ec4899)',
  },
];

const templateCards = [
  { name: 'Instagram Hikayesi', badge: 'IG' },
  { name: 'Mobil Video', badge: 'TT' },
  { name: 'TikTok Videosu', badge: 'TT' },
  { name: 'Logo', badge: 'BR' },
  { name: 'Instagram Gönderisi', badge: 'IG' },
  { name: 'Sunum', badge: 'SL' },
  { name: 'Afiş', badge: 'PR' },
  { name: 'Davet', badge: 'EV' },
];

function CategoryIcon({ type }) {
  if (type === 'instagram' || type === 'instagramSquare') {
    return (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="4" width="16" height="16" rx="5" />
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (type === 'reels') {
    return (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="5" width="16" height="14" rx="4" />
        <line x1="8" y1="5" x2="12" y2="9" />
        <line x1="13" y1="5" x2="17" y2="9" />
        <polygon points="10,10 16,12 10,14" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (type === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
        <path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v4h4v-4h3.2l.8-4H13V9c0-.7.3-1 1-1z" />
      </svg>
    );
  }

  if (type === 'megaphone') {
    return (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 12h4l9-4v8l-9-4H3z" />
        <path d="M10 14l2 5h2l-2-5" />
        <path d="M18 9l3-1" />
        <path d="M18 15l3 1" />
      </svg>
    );
  }

  if (type === 'tiktok') {
    return (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5" />
        <path d="M14 7c1.2 1.6 2.6 2.4 4.5 2.5" />
      </svg>
    );
  }

  if (type === 'shorts') {
    return (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 4c2 0 2 2 4 2s2-2 4-2v6c-2 0-2 2-4 2s-2-2-4-2z" />
        <path d="M9 14c2 0 2 2 4 2s2-2 4-2v6c-2 0-2 2-4 2s-2-2-4-2z" />
      </svg>
    );
  }

  if (type === 'youtube') {
    return (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="6" width="18" height="12" rx="4" />
        <polygon points="10,9 16,12 10,15" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3l1.8 3.8 4.2.5-3.1 2.8.9 4.1L12 12.8 8.2 14.2l.9-4.1L6 7.3l4.2-.5z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <line x1="20" y1="20" x2="16.5" y2="16.5" />
    </svg>
  );
}

export default function Dashboard() {
  return (
    <section className="dashboard-shell">
      <div className="hero-section section-reveal" style={{ '--delay': '0ms' }}>
        <h2 className="hero-title">Bugün ne tasarlayacaksınız?</h2>
        <p className="hero-subtitle">Sosyal medya, reklam ve kampanya kreatifleri</p>
      </div>

      <div className="search-wrap section-reveal" style={{ '--delay': '80ms' }}>
        <label className="search-bar">
          <span className="search-icon"><SearchIcon /></span>
          <input placeholder="Ne oluşturmak istiyorsunuz?" />
        </label>

        <div className="filter-chip-row">
          {quickChips.map((chip, index) => (
            <button
              key={chip}
              type="button"
              className={index === 0 ? 'filter-chip active' : 'filter-chip'}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div className="section-block section-reveal" style={{ '--delay': '160ms' }}>
        <h3 className="section-title">Ne oluşturmak istersiniz?</h3>
        <div className="category-grid">
          {categories.map((item) => (
            <button key={item.name} type="button" className="category-item">
              <span className="category-icon" style={{ background: item.gradient }}>
                <CategoryIcon type={item.icon} />
              </span>
              <span className="category-label">{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="section-block section-reveal" style={{ '--delay': '240ms' }}>
        <div className="section-header-row">
          <h3 className="section-title">Şablonları Keşfedin</h3>
          <Link to="/app/templates" className="section-link">Tümünü Gör</Link>
        </div>

        <div className="template-row" role="list">
          {templateCards.map((item, index) => (
            <article key={`${item.name}-${index}`} className="template-card" role="listitem">
              <div className="template-card-preview">
                <span className="template-badge">{item.badge}</span>
              </div>
              <div className="template-card-footer">
                <strong>{item.name}</strong>
                <small>Hazır set</small>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
