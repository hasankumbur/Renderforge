function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 18h16l-1.4-8-4.6 3-2-5-2 5-4.6-3z" />
      <path d="M4 20h16" />
      <circle cx="4" cy="8" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="20" cy="8" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Header({ session, onToggleMenu }) {
  const initials = (session?.name || 'RF')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="header">
      <button type="button" className="header-avatar-wrap" onClick={onToggleMenu}>
        {session?.avatarUrl ? (
          <img src={session.avatarUrl} alt="avatar" className="header-avatar" />
        ) : (
          <span className="header-avatar header-avatar-fallback">{initials}</span>
        )}
      </button>

      <div className="header-center-spacer" />

      <button type="button" className="premium-button" aria-label="premium">
        <CrownIcon />
      </button>
    </header>
  );
}
