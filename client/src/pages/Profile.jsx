import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';

const actions = [
  {
    to: '/app/editor',
    label: 'Yeni Template Başlat',
    icon: 'plus',
  },
  {
    to: '/app/templates',
    label: 'Template Kütüphanesi',
    icon: 'grid',
  },
  {
    to: '/app/renders',
    label: 'Render Geçmişi',
    icon: 'clock',
  },
];

function StatIcon({ type }) {
  if (type === 'render') {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="14" rx="3" />
        <circle cx="12" cy="11" r="3" />
      </svg>
    );
  }

  if (type === 'layout') {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="8" height="8" rx="2" />
        <rect x="13" y="3" width="8" height="5" rx="2" />
        <rect x="13" y="10" width="8" height="11" rx="2" />
        <rect x="3" y="13" width="8" height="8" rx="2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 7L10 17l-5-5" />
    </svg>
  );
}

function ActionIcon({ type }) {
  if (type === 'plus') {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    );
  }

  if (type === 'grid') {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 2" />
    </svg>
  );
}

export default function Profile({ session }) {
  const [templateCount, setTemplateCount] = useState(null);
  const [totalRenders, setTotalRenders] = useState(null);
  const [successRate, setSuccessRate] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      const [tplResult, renderResult] = await Promise.allSettled([
        api.getTemplates(),
        api.getRenderHistory(),
      ]);

      if (!mounted) return;

      if (tplResult.status === 'fulfilled') {
        setTemplateCount((tplResult.value.data || []).length);
      } else {
        setTemplateCount(0);
      }

      if (renderResult.status === 'fulfilled') {
        const renders = renderResult.value.data || [];
        setTotalRenders(renders.length);
        const doneCount = renders.filter((r) => r.status === 'done').length;
        setSuccessRate(renders.length > 0 ? ((doneCount / renders.length) * 100).toFixed(1) : '0.0');
      } else {
        setTotalRenders(0);
        setSuccessRate('0.0');
      }
    }

    loadStats();
    return () => { mounted = false; };
  }, []);

  const initials = (session?.name || 'RF')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const stats = [
    {
      label: 'Toplam Template',
      value: templateCount !== null ? String(templateCount) : '--',
      icon: 'layout',
      gradient: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    },
    {
      label: 'Toplam Render',
      value: totalRenders !== null ? String(totalRenders) : '--',
      icon: 'render',
      gradient: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    },
    {
      label: 'Başarı Oranı',
      value: successRate !== null ? `%${successRate}` : '--',
      icon: 'check',
      gradient: 'linear-gradient(135deg, #16a34a, #10b981)',
    },
  ];

  return (
    <section className="profile-shell">
      <div className="profile-header section-reveal" style={{ '--delay': '0ms' }}>
        <div className="profile-avatar-ring">
          <div className="profile-avatar-inner">{initials}</div>
        </div>
        <h2>{session?.name || 'RenderForge User'}</h2>
        <p>@{(session?.email || 'user').split('@')[0]}</p>
      </div>

      <div className="profile-stats-grid section-reveal" style={{ '--delay': '80ms' }}>
        {stats.map((item) => (
          <article key={item.label} className="profile-stat-card">
            <span className="profile-stat-icon" style={{ background: item.gradient }}>
              <StatIcon type={item.icon} />
            </span>
            <div className="profile-stat-value-row">
              <strong>{item.value}</strong>
            </div>
            <small>{item.label}</small>
          </article>
        ))}
      </div>

      <div className="profile-actions section-reveal" style={{ '--delay': '160ms' }}>
        <h3 className="section-title">Hızlı İşlemler</h3>
        <div className="action-row">
          {actions.map((action) => (
            <Link key={action.to} to={action.to} className="action-pill">
              <ActionIcon type={action.icon} />
              <span>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
