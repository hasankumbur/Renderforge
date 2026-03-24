import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';

const quickChips = ['Tum', 'Instagram', 'Facebook', 'TikTok', 'YouTube', 'Reklam'];

const categoryDefinitions = [
  {
    name: 'Instagram Hikayesi',
    icon: 'instagram',
    gradient: 'linear-gradient(135deg, #f58529, #dd2a7b, #8134af)',
    chip: 'Instagram',
    terms: ['instagram', 'hikaye', 'story'],
  },
  {
    name: 'Instagram Gonderisi',
    icon: 'instagramSquare',
    gradient: 'linear-gradient(135deg, #dd2a7b, #8134af)',
    chip: 'Instagram',
    terms: ['instagram', 'post', 'gonderi'],
  },
  {
    name: 'Instagram Reels',
    icon: 'reels',
    gradient: 'linear-gradient(135deg, #8134af, #dd2a7b, #f58529)',
    chip: 'Instagram',
    terms: ['instagram', 'reel', 'reels'],
  },
  {
    name: 'Facebook Gonderisi',
    icon: 'facebook',
    gradient: 'linear-gradient(135deg, #1877f2, #0a4fd6)',
    chip: 'Facebook',
    terms: ['facebook', 'meta', 'gonderi', 'post'],
  },
  {
    name: 'Facebook Reklami',
    icon: 'megaphone',
    gradient: 'linear-gradient(135deg, #0a4fd6, #42a5f5)',
    chip: 'Reklam',
    terms: ['facebook', 'meta', 'ad', 'reklam'],
  },
  {
    name: 'TikTok Videosu',
    icon: 'tiktok',
    gradient: 'linear-gradient(135deg, #010101, #69c9d0, #ee1d52)',
    chip: 'TikTok',
    terms: ['tiktok', 'video'],
  },
  {
    name: 'YouTube Kisa',
    icon: 'shorts',
    gradient: 'linear-gradient(135deg, #ff0000, #cc0000)',
    chip: 'YouTube',
    terms: ['youtube', 'short', 'kisa'],
  },
  {
    name: 'YouTube Thumbnail',
    icon: 'youtube',
    gradient: 'linear-gradient(135deg, #ff0000, #ff6b6b)',
    chip: 'YouTube',
    terms: ['youtube', 'thumbnail', 'kapak'],
  },
  {
    name: 'Kampanya Seti',
    icon: 'sparkle',
    gradient: 'linear-gradient(135deg, #7c3aed, #ec4899)',
    chip: 'Reklam',
    terms: ['kampanya', 'campaign', 'ad', 'reklam'],
  },
];

function toSearchText(value) {
  return String(value || '').toLocaleLowerCase('tr-TR');
}

function isMatch(value, terms) {
  const text = toSearchText(value);
  return terms.some((term) => text.includes(term));
}

function detectPlatform(name) {
  const text = toSearchText(name);
  if (text.includes('instagram')) {
    return 'Instagram';
  }
  if (text.includes('facebook') || text.includes('meta')) {
    return 'Facebook';
  }
  if (text.includes('tiktok')) {
    return 'TikTok';
  }
  if (text.includes('youtube')) {
    return 'YouTube';
  }
  if (text.includes('reklam') || text.includes('kampanya') || text.includes('ad')) {
    return 'Reklam';
  }
  return 'Tum';
}

function templateBadge(name) {
  const platform = detectPlatform(name);
  if (platform === 'Instagram') {
    return 'IG';
  }
  if (platform === 'Facebook') {
    return 'FB';
  }
  if (platform === 'TikTok') {
    return 'TT';
  }
  if (platform === 'YouTube') {
    return 'YT';
  }
  if (platform === 'Reklam') {
    return 'AD';
  }
  return 'RF';
}

function formatShortDate(value) {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

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
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [renders, setRenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeChip, setActiveChip] = useState('Tum');

  useEffect(() => {
    let mounted = true;

    async function loadDashboardData() {
      setLoading(true);
      setError('');

      const [templateResult, renderResult] = await Promise.allSettled([
        api.getTemplates(),
        api.getRenderHistory(),
      ]);

      if (!mounted) {
        return;
      }

      if (templateResult.status === 'fulfilled') {
        setTemplates(templateResult.value.data || []);
      } else {
        setTemplates([]);
      }

      if (renderResult.status === 'fulfilled') {
        setRenders(renderResult.value.data || []);
      } else {
        setRenders([]);
      }

      const nextError = [templateResult, renderResult]
        .filter((item) => item.status === 'rejected')
        .map((item) => item.reason?.message || 'Veri alinirken hata olustu')
        .join(' | ');

      setError(nextError);
      setLoading(false);
    }

    loadDashboardData();

    return () => {
      mounted = false;
    };
  }, []);

  const templateRows = useMemo(
    () =>
      (templates || []).map((item) => {
        const platform = detectPlatform(item.name);
        const searchIndex = toSearchText(
          `${item.name || ''} ${item.width || ''} ${item.height || ''} ${platform}`
        );

        return {
          ...item,
          platform,
          searchIndex,
          badge: templateBadge(item.name),
        };
      }),
    [templates]
  );

  const filteredTemplates = useMemo(() => {
    const normalizedSearch = toSearchText(search.trim());

    return templateRows.filter((item) => {
      const chipOk = activeChip === 'Tum' ? true : item.platform === activeChip;
      const searchOk = normalizedSearch ? item.searchIndex.includes(normalizedSearch) : true;
      return chipOk && searchOk;
    });
  }, [activeChip, search, templateRows]);

  const categories = useMemo(
    () =>
      categoryDefinitions.map((item) => ({
        ...item,
        count: templateRows.filter((template) => isMatch(template.name, item.terms)).length,
      })),
    [templateRows]
  );

  const doneRenderCount = useMemo(
    () => renders.filter((item) => item.status === 'done').length,
    [renders]
  );
  const processingRenderCount = useMemo(
    () => renders.filter((item) => item.status === 'processing' || item.status === 'pending').length,
    [renders]
  );

  return (
    <section className="dashboard-shell">
      <div className="hero-section section-reveal" style={{ '--delay': '0ms' }}>
        <h2 className="hero-title">Bugün ne tasarlayacaksınız?</h2>
        <p className="hero-subtitle">
          {loading
            ? 'Veriler yukleniyor...'
            : `${templates.length} aktif template, ${doneRenderCount} tamamlanan render`}
        </p>
        <div className="dashboard-kpi-row">
          <span>{renders.length} toplam render</span>
          <span>{processingRenderCount} islemde</span>
        </div>
      </div>

      <div className="search-wrap section-reveal" style={{ '--delay': '80ms' }}>
        <label className="search-bar">
          <span className="search-icon"><SearchIcon /></span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ne olusturmak istiyorsunuz?"
          />
        </label>

        <div className="filter-chip-row">
          {quickChips.map((chip) => (
            <button
              key={chip}
              type="button"
              className={chip === activeChip ? 'filter-chip active' : 'filter-chip'}
              onClick={() => setActiveChip(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div className="section-block section-reveal" style={{ '--delay': '160ms' }}>
        <h3 className="section-title">Ne olusturmak istersiniz?</h3>
        <div className="category-grid">
          {categories.map((item) => (
            <button
              key={item.name}
              type="button"
              className="category-item"
              onClick={() => {
                setActiveChip(item.chip);
                setSearch('');
              }}
            >
              <span className="category-icon" style={{ background: item.gradient }}>
                <CategoryIcon type={item.icon} />
              </span>
              <span className="category-label">{item.name}</span>
              <small className="category-meta">{item.count} template</small>
            </button>
          ))}
        </div>
      </div>

      <div className="section-block section-reveal" style={{ '--delay': '240ms' }}>
        <div className="section-header-row">
          <h3 className="section-title">Sablonlari Kesfedin</h3>
          <Link to="/app/templates" className="section-link">Tumunu Gor</Link>
        </div>

        <div className="template-row" role="list">
          {filteredTemplates.map((item) => (
            <article key={item.id} className="template-card" role="listitem">
              <button
                type="button"
                className="template-card-button"
                onClick={() => navigate(`/app/editor/${item.id}`)}
              >
                <div className="template-card-preview">
                  <span className="template-badge">{item.badge}</span>
                </div>
                <div className="template-card-footer">
                  <strong>{item.name}</strong>
                  <small>
                    {item.width}x{item.height} • {formatShortDate(item.updated_at)}
                  </small>
                </div>
              </button>
            </article>
          ))}
        </div>

        {!loading && filteredTemplates.length === 0 && (
          <div className="dashboard-empty-state panel">
            <p>Filtreye uygun template bulunamadi.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="button" onClick={() => setActiveChip('Tum')}>
                Filtreyi sifirla
              </button>
              <Link to="/app/editor" className="button primary">
                Yeni template olustur
              </Link>
            </div>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}
      </div>
    </section>
  );
}
