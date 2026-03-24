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
        <span role="img" aria-hidden="true">
          👑
        </span>
      </button>
    </header>
  );
}
