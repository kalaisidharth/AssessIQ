import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/shared/Sidebar'
import PageLayout from '../../components/shared/PageLayout'
import api from '../../utils/api'
import { LayoutDashboard, Users, ClipboardList, BarChart3, ChevronRight, Search } from 'lucide-react'

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/assessments', icon: ClipboardList, label: 'Assessments' },
  { to: '/admin/results', icon: BarChart3, label: 'All Results' },
]

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/admin/users').then(r => setUsers(r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex">
      <Sidebar links={NAV} />
      <PageLayout>
        <div className="mb-8">
          <span className="round-badge mb-2 inline-block">USERS</span>
          <h1 className="section-title text-4xl">Registered Candidates</h1>
          <p className="text-gray-400 mt-2">View all users and their assessment history.</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="input-field pl-10"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 rounded-full border-2 border-volt-400/20 border-t-volt-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <Users size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="font-display text-xl text-white mb-2" style={{ fontWeight: 700 }}>
              {search ? 'No matching users' : 'No users yet'}
            </h3>
            <p className="text-gray-400">Users who register will appear here.</p>
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-white/5">
              {filtered.map((u, i) => (
                <Link key={u.id} to={`/admin/users/${u.id}`}
                  className="flex items-center justify-between p-5 hover:bg-white/3 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-volt-400/15 border border-volt-400/20 flex items-center justify-center font-display text-volt-400 font-700">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-500">{u.name}</p>
                      <p className="text-gray-400 text-sm">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-gray-500 text-xs">Joined {u.created_at?.slice(0, 10)}</p>
                    <ChevronRight size={18} className="text-gray-500" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </PageLayout>
    </div>
  )
}
