import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/shared/Sidebar'
import PageLayout from '../../components/shared/PageLayout'
import StatusBadge from '../../components/shared/StatusBadge'
import api from '../../utils/api'
import { LayoutDashboard, ClipboardList, BarChart3, ChevronRight, Trophy } from 'lucide-react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/assessments', icon: ClipboardList, label: 'My Assessments' },
  { to: '/results', icon: BarChart3, label: 'My Results' },
]

export default function UserResults() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/user/results').then(r => setResults(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex">
      <Sidebar links={NAV} />
      <PageLayout>
        <div className="mb-10">
          <span className="round-badge mb-2 inline-block">RESULTS</span>
          <h1 className="section-title text-4xl">My Results</h1>
          <p className="text-gray-400 mt-2">Review your past assessment performance.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 rounded-full border-2 border-volt-400/20 border-t-volt-400 animate-spin" />
          </div>
        ) : results.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <Trophy size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="font-display text-xl text-white mb-2" style={{ fontWeight: 700 }}>No results yet</h3>
            <p className="text-gray-400 mb-6">Complete an assessment to see your results here.</p>
            <Link to="/assessments" className="btn-primary inline-flex">Take an Assessment</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map(r => (
              <Link
                key={r.id}
                to={`/results/${r.id}`}
                className="glass rounded-2xl p-6 flex items-center justify-between hover:border-volt-400/20 transition-all duration-300 block"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display text-lg text-white" style={{ fontWeight: 700, letterSpacing: '-0.03em' }}>
                      {r.assessment_title}
                    </h3>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{r.round_results?.length} round{r.round_results?.length !== 1 ? 's' : ''} completed</span>
                    {r.failed_at_round && <span className="text-red-400">Failed at Round {r.failed_at_round}</span>}
                    <span>{r.completed_at?.slice(0, 10)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">Overall Score</p>
                    <p className="font-mono text-2xl font-700 text-white">{r.overall_score}%</p>
                  </div>
                  <ChevronRight size={20} className="text-gray-500" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </PageLayout>
    </div>
  )
}
