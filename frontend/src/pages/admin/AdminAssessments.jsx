import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/shared/Sidebar'
import PageLayout from '../../components/shared/PageLayout'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { LayoutDashboard, Users, ClipboardList, BarChart3, Plus, Trash2, RefreshCw, UserPlus, Layers, Clock } from 'lucide-react'

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/assessments', icon: ClipboardList, label: 'Assessments' },
  { to: '/admin/results', icon: BarChart3, label: 'All Results' },
]

export default function AdminAssessments() {
  const [assessments, setAssessments] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [regenLoading, setRegenLoading] = useState(null)
  const [assignModal, setAssignModal] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [minScoreModal, setMinScoreModal] = useState(null)
  const [minScores, setMinScores] = useState({})

  const load = () => {
    Promise.all([api.get('/admin/assessments'), api.get('/admin/users')])
      .then(([a, u]) => { setAssessments(a.data); setUsers(u.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this assessment?')) return
    await api.delete(`/admin/assessments/${id}`)
    toast.success('Assessment deleted')
    load()
  }

  const handleRegen = async (id) => {
    setRegenLoading(id)
    const tid = toast.loading('Regenerating questions...')
    try {
      await api.post(`/admin/regenerate-questions/${id}`)
      toast.dismiss(tid)
      toast.success('Questions regenerated!')
    } catch {
      toast.dismiss(tid)
      toast.error('Failed to regenerate')
    } finally {
      setRegenLoading(null)
    }
  }

  const openAssign = (a) => {
    setAssignModal(a)
    setSelectedUsers(a.assigned_to || [])
  }

  const handleAssign = async () => {
    await api.put(`/admin/assessments/${assignModal.id}/assign`, selectedUsers)
    toast.success('Assignment updated')
    setAssignModal(null)
    load()
  }

  const openMinScore = (a) => {
    const scores = {}
    a.rounds?.forEach(r => { scores[r.round_number] = r.min_score_percent })
    setMinScores(scores)
    setMinScoreModal(a)
  }

  const handleMinScore = async () => {
    await api.put(`/admin/assessments/${minScoreModal.id}/min-scores`, {
      assessment_id: minScoreModal.id,
      rounds_min_scores: minScores,
    })
    toast.success('Minimum scores updated')
    setMinScoreModal(null)
    load()
  }

  return (
    <div className="flex">
      <Sidebar links={NAV} />
      <PageLayout>
        <div className="mb-8 flex items-start justify-between">
          <div>
            <span className="round-badge mb-2 inline-block">ASSESSMENTS</span>
            <h1 className="section-title text-4xl">All Assessments</h1>
          </div>
          <Link to="/admin/assessments/create" className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Create New
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 rounded-full border-2 border-volt-400/20 border-t-volt-400 animate-spin" />
          </div>
        ) : assessments.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <ClipboardList size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="font-display text-xl text-white mb-2" style={{ fontWeight: 700 }}>No assessments yet</h3>
            <Link to="/admin/assessments/create" className="btn-primary inline-flex mt-2">Create First Assessment</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map(a => (
              <div key={a.id} className="glass rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-display text-xl text-white" style={{ fontWeight: 700, letterSpacing: '-0.03em' }}>{a.title}</h2>
                    {a.description && <p className="text-gray-400 text-sm mt-1">{a.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openMinScore(a)} className="btn-ghost text-xs py-2 px-3">Set Min Scores</button>
                    <button onClick={() => openAssign(a)} className="btn-ghost text-xs py-2 px-3 flex items-center gap-1">
                      <UserPlus size={13} /> Assign
                    </button>
                    <button onClick={() => handleRegen(a.id)} disabled={regenLoading === a.id}
                      className="btn-ghost text-xs py-2 px-3 flex items-center gap-1">
                      <RefreshCw size={13} className={regenLoading === a.id ? 'animate-spin' : ''} /> Regen
                    </button>
                    <button onClick={() => handleDelete(a.id)} className="p-2 text-gray-500 hover:text-red-400 transition-colors rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {a.rounds?.map(r => (
                    <div key={r.round_number} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-obsidian-800 border border-obsidian-600 text-xs">
                      <span className="text-volt-400 font-mono font-600">R{r.round_number}</span>
                      <span className="text-gray-300">{r.name}</span>
                      <span className="text-gray-500">·</span>
                      <span className="text-gray-400">{r.topic}</span>
                      <span className="text-gray-500">·</span>
                      <span className="text-amber-400">min {r.min_score_percent}%</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Layers size={11} /> {a.rounds?.length} rounds</span>
                  <span className="flex items-center gap-1"><Users size={11} /> {a.assigned_to?.length || 0} assigned</span>
                  <span className="flex items-center gap-1"><Clock size={11} /> {a.created_at?.slice(0, 10)}</span>
                  {a.allow_retake && <span className="text-volt-400">Retake allowed</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Assign Modal */}
        {assignModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="glass rounded-2xl p-6 w-full max-w-md">
              <h3 className="font-display text-lg text-white mb-4" style={{ fontWeight: 700 }}>
                Assign: {assignModal.title}
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {users.map(u => (
                  <label key={u.id} className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-white/5">
                    <input type="checkbox" checked={selectedUsers.includes(u.id)}
                      onChange={() => setSelectedUsers(p => p.includes(u.id) ? p.filter(i => i !== u.id) : [...p, u.id])} />
                    <div>
                      <p className="text-white text-sm">{u.name}</p>
                      <p className="text-gray-500 text-xs">{u.email}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setAssignModal(null)} className="btn-ghost flex-1 text-sm py-2">Cancel</button>
                <button onClick={handleAssign} className="btn-primary flex-1 text-sm py-2">Save Assignment</button>
              </div>
            </div>
          </div>
        )}

        {/* Min Score Modal */}
        {minScoreModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="glass rounded-2xl p-6 w-full max-w-md">
              <h3 className="font-display text-lg text-white mb-4" style={{ fontWeight: 700 }}>
                Minimum Scores: {minScoreModal.title}
              </h3>
              <div className="space-y-3 mb-4">
                {minScoreModal.rounds?.map(r => (
                  <div key={r.round_number} className="flex items-center gap-4">
                    <span className="text-gray-300 text-sm flex-1">{r.name}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number" min={0} max={100}
                        className="input-field text-sm py-1.5 w-20 text-center"
                        value={minScores[r.round_number] ?? r.min_score_percent}
                        onChange={e => setMinScores(p => ({ ...p, [r.round_number]: parseInt(e.target.value) }))}
                      />
                      <span className="text-gray-400 text-sm">%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setMinScoreModal(null)} className="btn-ghost flex-1 text-sm py-2">Cancel</button>
                <button onClick={handleMinScore} className="btn-primary flex-1 text-sm py-2">Update Scores</button>
              </div>
            </div>
          </div>
        )}
      </PageLayout>
    </div>
  )
}
