import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Templates' },
  { to: '/editor', label: 'Editor' },
  { to: '/renders', label: 'Renders' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {links.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            isActive ? 'sidebar-link active' : 'sidebar-link'
          }
          end={item.to === '/'}
        >
          {item.label}
        </NavLink>
      ))}
    </aside>
  );
}
