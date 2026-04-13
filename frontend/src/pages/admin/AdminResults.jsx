import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/shared/Sidebar'
import PageLayout from '../../components/shared/PageLayout'
import StatusBadge from '../../components/shared/StatusBadge'
import api from '../../utils/api'
import { LayoutDashboard, Users, ClipboardList, BarChart3, Search, TrendingUp, Filter } from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/assessments', icon: ClipboardList, label: 'Assessments' },
  { to: '/admin/results', icon: BarChart3, label: 'All Results' },
]

export default function AdminResults() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    api.get('/admin/results').then(r => setResults(r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = results.filter(r => {
    const matchSearch =
      r.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      r.assessment_title?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = {
    total: results.length,
    completed: results.filter(r => r.status === 'completed').length,
    failed: results.filter(r => r.status === 'failed').length,
    avgScore: results.length
      ? (results.reduce((s, r) => s + (r.overall_score || 0), 0) / results.length).toFixed(1)
      : 0,
  }

  return (
    <div className="flex">
      <Sidebar links={NAV} />
      <PageLayout>
        <div className="mb-8">
          <span className="round-badge mb-2 inline-block">RESULTS</span>
          <h1 className="section-title text-4xl">All Candidate Results</h1>
          <p className="text-gray-400 mt-2">Track every candidate's assessment performance.</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Attempts', value: stats.total, color: 'text-volt-400' },
            { label: 'Completed', value: stats.completed, color: 'text-green-400' },
            { label: 'Failed', value: stats.failed, color: 'text-red-400' },
            { label: 'Avg Score', value: `${stats.avgScore}%`, color: 'text-amber-400' },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl p-5">
              <p className="text-gray-400 text-sm mb-1">{s.label}</p>
              <p className={clsx('font-display text-3xl font-800', s.color)} style={{ fontWeight: 800, letterSpacing: '-0.04em' }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              className="input-field pl-10"
              placeholder="Search by candidate, email or assessment..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'completed', 'failed', 'in_progress'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-mono transition-all duration-200 border',
                  statusFilter === s
                    ? 'bg-volt-400/15 text-volt-400 border-volt-400/30'
                    : 'text-gray-500 border-obsidian-600 hover:border-obsidian-500 hover:text-gray-300'
                )}
              >
                {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 rounded-full border-2 border-volt-400/20 border-t-volt-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <TrendingUp size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="font-display text-xl text-white mb-2" style={{ fontWeight: 700 }}>No results found</h3>
            <p className="text-gray-400">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-4 text-gray-500 font-500">Candidate</th>
                    <th className="text-left px-4 py-4 text-gray-500 font-500">Assessment</th>
                    <th className="text-center px-4 py-4 text-gray-500 font-500">Rounds</th>
                    <th className="text-center px-4 py-4 text-gray-500 font-500">Score</th>
                    <th className="text-center px-4 py-4 text-gray-500 font-500">Status</th>
                    <th className="text-center px-4 py-4 text-gray-500 font-500">Failed At</th>
                    <th className="text-left px-4 py-4 text-gray-500 font-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map(r => (
                    <tr key={r.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/admin/users/${r.user_id || ''}`} className="hover:text-volt-400 transition-colors">
                          <p className="text-white font-500">{r.user_name}</p>
                          <p className="text-gray-500 text-xs">{r.user_email}</p>
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-gray-300 max-w-[180px] truncate">{r.assessment_title}</td>
                      <td className="px-4 py-4 text-center text-gray-400 font-mono">{r.rounds_completed}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={clsx(
                          'font-mono font-700 text-base',
                          r.overall_score >= 70 ? 'text-green-400' : r.overall_score >= 50 ? 'text-amber-400' : 'text-red-400'
                        )}>
                          {r.overall_score}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-4 text-center">
                        {r.failed_at_round ? (
                          <span className="text-red-400 text-xs font-mono">Round {r.failed_at_round}</span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-gray-500 text-xs font-mono whitespace-nowrap">
                        {r.completed_at?.slice(0, 10) || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </PageLayout>
    </div>
  )
}
