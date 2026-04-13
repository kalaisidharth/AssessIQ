import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Sidebar from '../../components/shared/Sidebar'
import PageLayout from '../../components/shared/PageLayout'
import StatusBadge from '../../components/shared/StatusBadge'
import api from '../../utils/api'
import { LayoutDashboard, ClipboardList, BarChart3, CheckCircle, XCircle, ChevronDown, ChevronUp, Clock, ArrowLeft } from 'lucide-react'
import clsx from 'clsx'
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/assessments', icon: ClipboardList, label: 'My Assessments' },
  { to: '/results', icon: BarChart3, label: 'My Results' },
]

export default function ResultDetail() {
  const { id } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedRound, setExpandedRound] = useState(null)

  useEffect(() => {
    api.get(`/user/results/${id}`).then(r => setResult(r.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex">
      <Sidebar links={NAV} />
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 rounded-full border-2 border-volt-400/20 border-t-volt-400 animate-spin" />
        </div>
      </PageLayout>
    </div>
  )

  if (!result) return null

  const chartData = [{ name: 'Score', value: result.overall_score, fill: result.status === 'completed' ? '#b4ff39' : '#ff6b6b' }]

  return (
    <div className="flex">
      <Sidebar links={NAV} />
      <PageLayout>
        <div className="mb-8">
          <Link to="/results" className="inline-flex items-center gap-2 text-gray-400 hover:text-volt-400 text-sm mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to Results
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <span className="round-badge mb-2 inline-block">RESULT DETAIL</span>
              <h1 className="section-title text-4xl">{result.assessment_title}</h1>
            </div>
            <StatusBadge status={result.status} />
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass rounded-2xl p-6 col-span-1 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={chartData} startAngle={180} endAngle={-180}>
                <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'rgba(255,255,255,0.05)' }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <p className="text-gray-400 text-sm mt-2">Overall Score</p>
            <p className="font-mono text-3xl font-700 text-white">{result.overall_score}%</p>
          </div>

          <div className="glass rounded-2xl p-6 col-span-2 grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Rounds Completed</p>
              <p className="text-white font-mono text-2xl font-700 mt-1">{result.round_results?.length}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Status</p>
              <p className={clsx('font-mono text-2xl font-700 mt-1', result.status === 'completed' ? 'text-green-400' : 'text-red-400')}>
                {result.status === 'completed' ? 'PASSED' : 'FAILED'}
              </p>
            </div>
            {result.failed_at_round && (
              <div>
                <p className="text-gray-400 text-sm">Failed At</p>
                <p className="text-red-400 font-mono text-2xl font-700 mt-1">Round {result.failed_at_round}</p>
              </div>
            )}
            <div>
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-white text-base font-500 mt-1">{result.completed_at?.slice(0, 16).replace('T', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Round-by-round breakdown */}
        <div className="space-y-4">
          <h2 className="font-display text-xl text-white" style={{ fontWeight: 700, letterSpacing: '-0.03em' }}>Round Breakdown</h2>
          {result.round_results?.map(rr => (
            <div key={rr.round_number} className={clsx(
              'glass rounded-2xl overflow-hidden border',
              rr.passed ? 'border-green-400/15' : 'border-red-400/20'
            )}>
              <button
                className="w-full flex items-center justify-between p-5 hover:bg-white/3 transition-colors"
                onClick={() => setExpandedRound(expandedRound === rr.round_number ? null : rr.round_number)}
              >
                <div className="flex items-center gap-4">
                  <div className="round-badge">R{rr.round_number}</div>
                  <div className="text-left">
                    <p className="text-white font-500">{rr.round_name}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                      <span className="flex items-center gap-1"><Clock size={10} /> {Math.round(rr.time_taken_seconds / 60)}m {rr.time_taken_seconds % 60}s</span>
                      <span>{rr.score}/{rr.total} correct</span>
                      <span>Min: {rr.min_score_percent}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={clsx('font-mono text-xl font-700', rr.passed ? 'text-green-400' : 'text-red-400')}>
                      {rr.percent}%
                    </p>
                  </div>
                  {rr.passed
                    ? <CheckCircle size={20} className="text-green-400" />
                    : <XCircle size={20} className="text-red-400" />
                  }
                  {expandedRound === rr.round_number ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>

              {expandedRound === rr.round_number && (
                <div className="border-t border-white/5 p-5 space-y-3">
                  {rr.answers?.map((a, i) => (
                    <div key={i} className={clsx('p-4 rounded-xl border text-sm', a.is_correct ? 'border-green-400/15 bg-green-400/5' : 'border-red-400/20 bg-red-400/5')}>
                      <div className="flex items-start gap-2 mb-2">
                        {a.is_correct
                          ? <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                          : <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                        }
                        <p className="text-white leading-snug">{a.question}</p>
                      </div>
                      {!a.is_correct && (
                        <div className="ml-5 space-y-1 text-xs">
                          <p className="text-red-400">Your answer: {a.selected_option || 'Not answered'} — {a.options?.[a.selected_option] || '—'}</p>
                          <p className="text-green-400">Correct: {a.correct_option} — {a.options?.[a.correct_option]}</p>
                        </div>
                      )}
                      {a.explanation && <p className="ml-5 text-gray-500 text-xs mt-1 italic">{a.explanation}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </PageLayout>
    </div>
  )
}
