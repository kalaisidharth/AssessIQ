import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/shared/Sidebar'
import PageLayout from '../../components/shared/PageLayout'
import StatusBadge from '../../components/shared/StatusBadge'
import api from '../../utils/api'
import { LayoutDashboard, ClipboardList, BarChart3, Clock, Layers, ChevronRight, Lock } from 'lucide-react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/assessments', icon: ClipboardList, label: 'My Assessments' },
  { to: '/results', icon: BarChart3, label: 'My Results' },
]

export default function UserAssessments() {
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/user/assessments').then(r => setAssessments(r.data)).finally(() => setLoading(false))
  }, [])

  const canStart = (a) => {
    if (a.status === 'not_started' || a.status === 'in_progress') return true
    if ((a.status === 'completed' || a.status === 'failed') && a.allow_retake) return true
    return false
  }

  const getBtnLabel = (a) => {
    if (a.status === 'in_progress') return 'Resume'
    if (a.status === 'not_started') return 'Start Test'
    if (a.allow_retake) return 'Retake'
    return 'Completed'
  }

  return (
    <div className="flex">
      <Sidebar links={NAV} />
      <PageLayout>
        <div className="mb-10">
          <span className="round-badge mb-2 inline-block">ASSESSMENTS</span>
          <h1 className="section-title text-4xl">My Assigned Tests</h1>
          <p className="text-gray-400 mt-2">Complete each round with the minimum score to advance.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 rounded-full border-2 border-volt-400/20 border-t-volt-400 animate-spin" />
          </div>
        ) : assessments.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <ClipboardList size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="font-display text-xl text-white mb-2" style={{ fontWeight: 700 }}>No assessments yet</h3>
            <p className="text-gray-400">Your admin will assign assessments to you.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {assessments.map(a => (
              <div key={a.id} className="glass rounded-2xl p-6 hover:border-volt-400/15 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="font-display text-xl text-white" style={{ fontWeight: 700, letterSpacing: '-0.03em' }}>
                        {a.title}
                      </h2>
                      <StatusBadge status={a.status} />
                    </div>
                    {a.description && <p className="text-gray-400 text-sm">{a.description}</p>}
                  </div>
                </div>

                {/* Rounds preview */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {a.rounds.map(r => (
                    <div key={r.round_number} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-obsidian-800 border border-obsidian-600">
                      <div className="w-5 h-5 rounded-full bg-volt-400/20 border border-volt-400/40 flex items-center justify-center">
                        <span className="text-volt-400 text-xs font-mono font-600">{r.round_number}</span>
                      </div>
                      <span className="text-gray-300 text-xs font-body">{r.name}</span>
                      <span className="text-gray-500 text-xs">·</span>
                      <Clock size={11} className="text-gray-500" />
                      <span className="text-gray-500 text-xs">{r.time_limit_minutes}m</span>
                    </div>
                  ))}
                </div>

                {/* Info row */}
                <div className="flex items-center gap-6 text-sm text-gray-400 mb-5">
                  <div className="flex items-center gap-1.5">
                    <Layers size={14} className="text-volt-400" />
                    <span>{a.num_rounds} rounds</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ClipboardList size={14} className="text-volt-400" />
                    <span>{a.rounds.reduce((s, r) => s + r.num_questions, 0)} questions total</span>
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center gap-3">
                  {canStart(a) ? (
                    <Link
                      to={`/assessments/${a.id}/take`}
                      className="btn-primary flex items-center gap-2 text-sm"
                    >
                      {getBtnLabel(a)} <ChevronRight size={16} />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Lock size={14} />
                      <span>
                        {a.status === 'completed' ? 'Assessment completed' : 'Assessment ended'}
                        {!a.allow_retake && ' · No retake allowed'}
                      </span>
                    </div>
                  )}

                  {a.result_id && (
                    <Link to={`/results/${a.result_id}`} className="btn-ghost text-sm flex items-center gap-2">
                      View Results <ChevronRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </PageLayout>
    </div>
  )
}
