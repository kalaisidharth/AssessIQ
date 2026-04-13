import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/shared/Sidebar'
import PageLayout from '../../components/shared/PageLayout'
import StatCard from '../../components/shared/StatCard'
import StatusBadge from '../../components/shared/StatusBadge'
import api from '../../utils/api'
import { LayoutDashboard, Users, ClipboardList, BarChart3, Plus, TrendingUp, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react'

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/assessments', icon: ClipboardList, label: 'Assessments' },
  { to: '/admin/results', icon: BarChart3, label: 'All Results' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentResults, setRecentResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/users'),
      api.get('/admin/assessments'),
      api.get('/admin/results'),
    ]).then(([users, assessments, results]) => {
      const rs = results.data
      setStats({
        users: users.data.length,
        assessments: assessments.data.length,
        completed: rs.filter(r => r.status === 'completed').length,
        failed: rs.filter(r => r.status === 'failed').length,
        avg_score: rs.length ? (rs.reduce((s, r) => s + (r.overall_score || 0), 0) / rs.length).toFixed(1) : 0,
      })
      setRecentResults(rs.slice(0, 8))
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex">
      <Sidebar links={NAV} />
      <PageLayout>
        <div className="mb-10 flex items-start justify-between">
          <div>
            <span className="round-badge mb-2 inline-block">ADMIN PANEL</span>
            <h1 className="section-title text-4xl">Overview</h1>
            <p className="text-gray-400 mt-2">Manage assessments, users, and view results.</p>
          </div>
          <Link to="/admin/assessments/create" className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Assessment
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 rounded-full border-2 border-volt-400/20 border-t-volt-400 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
              <StatCard label="Total Users" value={stats.users} icon={Users} color="volt" />
              <StatCard label="Assessments" value={stats.assessments} icon={ClipboardList} color="blue" />
              <StatCard label="Completed" value={stats.completed} icon={CheckCircle} color="green" />
              <StatCard label="Failed" value={stats.failed} icon={XCircle} color="red" />
              <StatCard label="Avg Score" value={`${stats.avg_score}%`} icon={TrendingUp} color="amber" />
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Link to="/admin/assessments/create" className="glass rounded-2xl p-5 hover:border-volt-400/20 transition-all duration-300 group">
                <Plus size={22} className="text-volt-400 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-display text-white font-700" style={{ fontWeight: 700 }}>Create Assessment</h3>
                <p className="text-gray-500 text-sm">AI-generate a new test</p>
              </Link>
              <Link to="/admin/users" className="glass rounded-2xl p-5 hover:border-volt-400/20 transition-all duration-300 group">
                <Users size={22} className="text-volt-400 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-display text-white font-700" style={{ fontWeight: 700 }}>Manage Users</h3>
                <p className="text-gray-500 text-sm">Assign tests to candidates</p>
              </Link>
              <Link to="/admin/results" className="glass rounded-2xl p-5 hover:border-volt-400/20 transition-all duration-300 group">
                <BarChart3 size={22} className="text-volt-400 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-display text-white font-700" style={{ fontWeight: 700 }}>View Results</h3>
                <p className="text-gray-500 text-sm">All candidate scores</p>
              </Link>
            </div>

            {/* Recent results table */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg text-white" style={{ fontWeight: 700, letterSpacing: '-0.03em' }}>Recent Results</h2>
                <Link to="/admin/results" className="text-volt-400 text-sm flex items-center gap-1 hover:text-volt-500 transition-colors">
                  View all <ArrowRight size={14} />
                </Link>
              </div>

              {recentResults.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No results yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b border-white/5">
                        <th className="text-left pb-3 font-500">Candidate</th>
                        <th className="text-left pb-3 font-500">Assessment</th>
                        <th className="text-center pb-3 font-500">Rounds</th>
                        <th className="text-center pb-3 font-500">Score</th>
                        <th className="text-center pb-3 font-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {recentResults.map(r => (
                        <tr key={r.id} className="hover:bg-white/2 transition-colors">
                          <td className="py-3">
                            <p className="text-white font-500">{r.user_name}</p>
                            <p className="text-gray-500 text-xs">{r.user_email}</p>
                          </td>
                          <td className="py-3 text-gray-300">{r.assessment_title}</td>
                          <td className="py-3 text-center text-gray-400">{r.rounds_completed}</td>
                          <td className="py-3 text-center font-mono font-600 text-white">{r.overall_score}%</td>
                          <td className="py-3 text-center"><StatusBadge status={r.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </PageLayout>
    </div>
  )
}
