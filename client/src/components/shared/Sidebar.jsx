import { NavLink } from 'react-router-dom';

const links = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/templates', label: 'Templates' },
  { to: '/app/editor', label: 'Editor' },
  { to: '/app/renders', label: 'Renders' },
  { to: '/app/profile', label: 'Profile' },
];

const mobileLinks = [
  { to: '/app/templates', label: 'Şablonlar', icon: '▦' },
  { to: '/app/editor', label: 'Editor', icon: '✦', center: true },
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
        <NavLink
          to="/app/dashboard"
          className={({ isActive }) =>
            isActive ? 'mobile-bottom-link active' : 'mobile-bottom-link'
          }
          end
        >
          <span className="icon">⌂</span>
          <span>Oluştur</span>
        </NavLink>

        {mobileLinks.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => {
              const classNames = ['mobile-bottom-link'];
              if (isActive) {
                classNames.push('active');
              }
              if (item.center) {
                classNames.push('center');
              }
              return classNames.join(' ');
            }}
            end={item.to === '/app/dashboard'}
          >
            <span className="icon">{item.center ? '+' : item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
