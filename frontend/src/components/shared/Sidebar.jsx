import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogOut, Zap } from 'lucide-react'
import clsx from 'clsx'

export default function Sidebar({ links }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-40"
      style={{ background: 'rgba(5,5,8,0.95)', borderRight: '1px solid rgba(180,255,57,0.08)' }}>

      {/* Logo */}
      <div className="p-6 border-b border-volt-400/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-volt-400 flex items-center justify-center volt-glow">
            <Zap size={18} className="text-obsidian-950" fill="currentColor" />
          </div>
          <div>
            <h1 className="font-display font-800 text-white text-lg leading-none" style={{ fontWeight: 800, letterSpacing: '-0.04em' }}>AssessIQ</h1>
            <p className="text-volt-400 text-xs font-mono mt-0.5">{user?.role?.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard' || to === '/admin'}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body font-500 transition-all duration-200',
              isActive
                ? 'bg-volt-400/10 text-volt-400 border border-volt-400/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="p-4 border-t border-volt-400/10">
        <div className="glass rounded-xl p-3 mb-3">
          <p className="text-white text-sm font-500 truncate">{user?.name}</p>
          <p className="text-gray-500 text-xs truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all duration-200"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
