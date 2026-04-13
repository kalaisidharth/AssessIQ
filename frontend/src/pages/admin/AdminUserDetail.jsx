import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Sidebar from '../../components/shared/Sidebar'
import PageLayout from '../../components/shared/PageLayout'
import StatusBadge from '../../components/shared/StatusBadge'
import api from '../../utils/api'
import { LayoutDashboard, Users, ClipboardList, BarChart3, ArrowLeft, Trophy, XCircle, TrendingUp } from 'lucide-react'

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/assessments', icon: ClipboardList, label: 'Assessments' },
  { to: '/admin/results', icon: BarChart3, label: 'All Results' },
]

export default function AdminUserDetail() {
  const { id } = useParams()
  const [results, setResults] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/admin/users'), api.get(`/admin/users/${id}/results`)])
      .then(([users, res]) => {
        setUser(users.data.find(u => u.id === id))
        setResults(res.data)
      })
      .finally(() => setLoading(false))
  }, [id])

  const completed = results.filter(r => r.status === 'completed').length
  const avg = results.length ? (results.reduce((s, r) => s + (r.overall_score || 0), 0) / results.length).toFixed(1) : 0

  return (
    <div className="flex">
      <Sidebar links={NAV} />
      <PageLayout>
        <Link to="/admin/users" className="inline-flex items-center gap-2 text-gray-400 hover:text-volt-400 text-sm mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Users
        </Link>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 rounded-full border-2 border-volt-400/20 border-t-volt-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* User header */}
            <div className="glass rounded-2xl p-6 mb-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-volt-400/15 border border-volt-400/20 flex items-center justify-center font-display text-volt-400 text-2xl font-800">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="section-title text-3xl">{user?.name}</h1>
                <p className="text-gray-400">{user?.email}</p>
                <p className="text-gray-600 text-xs mt-1">Member since {user?.created_at?.slice(0, 10)}</p>
              </div>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-3xl font-mono font-800 text-white">{results.length}</p>
                  <p className="text-gray-500 text-xs mt-1">Tests Taken</p>
                </div>
                <div>
                  <p className="text-3xl font-mono font-800 text-green-400">{completed}</p>
                  <p className="text-gray-500 text-xs mt-1">Completed</p>
                </div>
                <div>
                  <p className="text-3xl font-mono font-800 text-volt-400">{avg}%</p>
                  <p className="text-gray-500 text-xs mt-1">Avg Score</p>
                </div>
              </div>
            </div>

            {/* Results */}
            <h2 className="font-display text-xl text-white mb-4" style={{ fontWeight: 700, letterSpacing: '-0.03em' }}>Assessment History</h2>
            {results.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <ClipboardList size={36} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No assessments taken yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map(r => (
                  <div key={r.id} className="glass rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-white font-500">{r.assessment_title}</h3>
                        <p className="text-gray-500 text-xs">{r.completed_at?.slice(0, 16).replace('T', ' ')}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-mono text-xl font-700 text-white">{r.overall_score}%</p>
                        <StatusBadge status={r.status} />
                      </div>
                    </div>

                    {/* Round pills */}
                    <div className="flex flex-wrap gap-2">
                      {r.round_results?.map(rr => (
                        <div key={rr.round_number} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs ${rr.passed ? 'bg-green-400/10 border border-green-400/25 text-green-400' : 'bg-red-400/10 border border-red-400/25 text-red-400'}`}>
                          R{rr.round_number}: {rr.percent}%
                          {rr.passed ? ' ✓' : ' ✗'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </PageLayout>
    </div>
  )
}
