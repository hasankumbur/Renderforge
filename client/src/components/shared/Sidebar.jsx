import { NavLink } from 'react-router-dom';

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M5 19h14" />
      <path d="M7 16l8-8 2 2-8 8-3 1z" />
      <path d="M14.5 8.5l2 2" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9">
      <rect x="4" y="4" width="7" height="7" rx="1.8" />
      <rect x="13" y="4" width="7" height="7" rx="1.8" />
      <rect x="4" y="13" width="7" height="7" rx="1.8" />
      <rect x="13" y="13" width="7" height="7" rx="1.8" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M6 17.5L16.5 7l2.5 2.5L8.5 20H6z" />
      <path d="M14.8 8.7l2.5 2.5" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9">
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <polygon points="10,9 16,12 10,15" fill="currentColor" stroke="none" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19c1.2-3.2 4-5 7-5s5.8 1.8 7 5" />
    </svg>
  );
}

const links = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/templates', label: 'Templates' },
  { to: '/app/editor', label: 'Editor' },
  { to: '/app/renders', label: 'Renders' },
  { to: '/app/profile', label: 'Profile' },
];

const mobileLinks = [
  { to: '/app/templates', label: 'Şablonlar', icon: GridIcon },
  { to: '/app/renders', label: 'Renders', icon: PlayIcon },
  { to: '/app/profile', label: 'Profil', icon: UserIcon },
];

export default function Sidebar({
  open,
  onClose,
  hideMobileNav = false,
  hideDesktopSidebar = false,
}) {
  return (
    <>
      <aside className={hideDesktopSidebar ? 'sidebar hidden' : open ? 'sidebar open' : 'sidebar'}>
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

      <nav className={hideMobileNav ? 'mobile-bottom-nav hidden' : 'mobile-bottom-nav'}>
        <NavLink
          to="/app/dashboard"
          className={({ isActive }) =>
            isActive ? 'mobile-bottom-link active' : 'mobile-bottom-link'
          }
          end
        >
          <span className="icon">
            <HomeIcon />
          </span>
          <span>Oluştur</span>
        </NavLink>

        {mobileLinks.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? 'mobile-bottom-link active' : 'mobile-bottom-link')}
            end={item.to === '/app/dashboard'}
          >
            <span className="icon">
              <item.icon />
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
