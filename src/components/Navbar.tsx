import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`

export default function Navbar() {
  const { profile, signOut } = useAuth()

  return (
    <nav className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-1 overflow-x-auto">
          <NavLink to="/" end className={linkClass}>
            🏠 Dashboard
          </NavLink>
          <NavLink to="/rentals" className={linkClass}>
            🔑 Rentals
          </NavLink>
          <NavLink to="/sales" className={linkClass}>
            🏡 Sales
          </NavLink>
          <NavLink to="/leaderboard" className={linkClass}>
            🏆 Leaderboard
          </NavLink>
          <NavLink to="/profile" className={linkClass}>
            👤 Profile
          </NavLink>
          {profile?.role === 'admin' && (
            <NavLink to="/admin" className={linkClass}>
              🔐 Admin
            </NavLink>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm text-slate-500">{profile?.full_name}</span>
          <button
            onClick={signOut}
            className="text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
