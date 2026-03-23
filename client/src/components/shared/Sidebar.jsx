import { NavLink } from 'react-router-dom';

const links = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/templates', label: 'Templates' },
  { to: '/app/editor', label: 'Editor' },
  { to: '/app/renders', label: 'Renders' },
  { to: '/app/profile', label: 'Profile' },
];

const mobileLinks = [
  { to: '/app/dashboard', label: 'Olustur', icon: '⊕' },
  { to: '/app/templates', label: 'Sablonlar', icon: '▦' },
  { to: '/app/editor', label: 'Editor', icon: '✦' },
  { to: '/app/renders', label: 'Renders', icon: '▶' },
  { to: '/app/profile', label: 'Profil', icon: '☺' },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <aside className={open ? 'sidebar open' : 'sidebar'}>
        <div className="sidebar-section-title">UYGULAMA</div>
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? 'sidebar-link active' : 'sidebar-link'
            }
            onClick={onClose}
            end={item.to === '/app/dashboard'}
          >
            {item.label}
          </NavLink>
        ))}
      </aside>
      {open && <button className="sidebar-overlay" onClick={onClose} aria-label="close menu" />}

      <nav className="mobile-bottom-nav">
        {mobileLinks.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? 'mobile-bottom-link active' : 'mobile-bottom-link'
            }
            end={item.to === '/app/dashboard'}
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
