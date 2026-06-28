import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/', icon: '◆', label: 'Dashboard' },
  { to: '/clientes', icon: '◈', label: 'Clientes' },
  { to: '/nueva-evaluacion', icon: '◇', label: 'Nueva Evaluación' },
  { to: '/historial', icon: '▣', label: 'Historial' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">CS</div>
        <div>
          <h1 className="sidebar__title">CreditSys</h1>
          <span className="sidebar__subtitle">Evaluación Crediticia</span>
        </div>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
          >
            <span className="sidebar__link-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__user">
        <div className="sidebar__avatar">{user?.avatar}</div>
        <div className="sidebar__user-info">
          <span className="sidebar__user-name">{user?.name}</span>
          <span className="sidebar__user-role">{user?.role}</span>
        </div>
        <button className="sidebar__logout" onClick={logout} title="Cerrar sesión">✕</button>
      </div>
    </aside>
  )
}
