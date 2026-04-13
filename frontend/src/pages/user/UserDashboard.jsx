import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/shared/Sidebar'
import PageLayout from '../../components/shared/PageLayout'
import StatCard from '../../components/shared/StatCard'
import StatusBadge from '../../components/shared/StatusBadge'
import api from '../../utils/api'
import { LayoutDashboard, ClipboardList, BarChart3, Trophy, Clock, XCircle, TrendingUp, ArrowRight } from 'lucide-react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/assessments', icon: ClipboardList, label: 'My Assessments' },
  { to: '/results', icon: BarChart3, label: 'My Results' },
]

export default function UserDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/user/dashboard').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex">
      <Sidebar links={NAV} />
      <PageLayout>
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="round-badge">DASHBOARD</span>
          </div>
          <h1 className="section-title text-4xl">
            Welcome back, <span className="text-volt-400">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-gray-400 mt-2 font-body">Here's your assessment overview.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 rounded-full border-2 border-volt-400/20 border-t-volt-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <StatCard label="Assigned" value={data?.total_assigned ?? 0} icon={ClipboardList} color="volt" />
              <StatCard label="Completed" value={data?.completed ?? 0} icon={Trophy} color="green" />
              <StatCard label="Failed" value={data?.failed ?? 0} icon={XCircle} color="red" />
              <StatCard label="Avg Score" value={`${data?.average_score ?? 0}%`} icon={TrendingUp} color="blue" />
            </div>

            {/* Recent results */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg text-white" style={{ fontWeight: 700, letterSpacing: '-0.03em' }}>
                  Recent Activity
                </h2>
                <Link to="/results" className="text-volt-400 text-sm hover:text-volt-500 flex items-center gap-1 transition-colors">
                  View all <ArrowRight size={14} />
                </Link>
              </div>

              {data?.recent_results?.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList size={40} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 font-body">No assessments taken yet.</p>
                  <Link to="/assessments" className="btn-primary inline-flex mt-4 text-sm">
                    View Assigned Tests
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {data?.recent_results?.map(r => (
                    <Link key={r.id} to={`/results/${r.id}`}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-white/3 transition-all duration-200 border border-transparent hover:border-volt-400/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-volt-400/10 flex items-center justify-center">
                          <BarChart3 size={18} className="text-volt-400" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-500">{r.assessment_id?.slice(-6).toUpperCase()}</p>
                          <p className="text-gray-500 text-xs font-mono">{r.completed_at?.slice(0, 10)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-sm text-white">{r.overall_score}%</span>
                        <StatusBadge status={r.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Link to="/assessments" className="glass rounded-2xl p-6 hover:border-volt-400/20 transition-all duration-300 group">
                <ClipboardList size={24} className="text-volt-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-display text-white font-700" style={{ fontWeight: 700 }}>Take Assessment</h3>
                <p className="text-gray-400 text-sm mt-1">Start or resume your tests</p>
              </Link>
              <Link to="/results" className="glass rounded-2xl p-6 hover:border-volt-400/20 transition-all duration-300 group">
                <BarChart3 size={24} className="text-volt-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-display text-white font-700" style={{ fontWeight: 700 }}>View Results</h3>
                <p className="text-gray-400 text-sm mt-1">Review your past performance</p>
              </Link>
            </div>
          </>
        )}
      </PageLayout>
    </div>
  )
}
