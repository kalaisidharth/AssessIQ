import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/shared/Sidebar'
import PageLayout from '../../components/shared/PageLayout'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { LayoutDashboard, Users, ClipboardList, BarChart3, Plus, Trash2, ChevronDown, ChevronUp, Zap, Loader } from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/assessments', icon: ClipboardList, label: 'Assessments' },
  { to: '/admin/results', icon: BarChart3, label: 'All Results' },
]

const DIFFICULTIES = ['easy', 'medium', 'hard']

const defaultRound = (num) => ({
  round_number: num,
  name: `Round ${num}`,
  topic: '',
  difficulty: 'medium',
  num_questions: 5,
  min_score_percent: 60,
  time_limit_minutes: 15,
})

export default function CreateAssessment() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [allowRetake, setAllowRetake] = useState(false)
  const [rounds, setRounds] = useState([defaultRound(1), defaultRound(2), defaultRound(3), defaultRound(4)])
  const [expandedRound, setExpandedRound] = useState(1)
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(true)

  useEffect(() => {
    api.get('/admin/users').then(r => setUsers(r.data)).finally(() => setLoadingUsers(false))
  }, [])

  const updateRound = (idx, field, value) => {
    setRounds(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))
  }

  const addRound = () => {
    if (rounds.length >= 6) return toast.error('Maximum 6 rounds allowed')
    setRounds(prev => [...prev, defaultRound(prev.length + 1)])
    setExpandedRound(rounds.length + 1)
  }

  const removeRound = (idx) => {
    if (rounds.length <= 1) return toast.error('Minimum 1 round required')
    setRounds(prev => prev.filter((_, i) => i !== idx).map((r, i) => ({ ...r, round_number: i + 1, name: r.name.match(/^Round \d+$/) ? `Round ${i + 1}` : r.name })))
  }

  const toggleUser = (uid) => {
    setSelectedUsers(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return toast.error('Assessment title is required')
    for (const r of rounds) {
      if (!r.topic.trim()) return toast.error(`Topic is required for ${r.name}`)
    }

    setLoading(true)
    const toastId = toast.loading('🤖 Generating AI questions for all rounds... This may take 30-60 seconds.')
    try {
      await api.post('/admin/assessments', {
        title,
        description,
        rounds,
        assigned_to: selectedUsers,
        allow_retake: allowRetake,
      })
      toast.dismiss(toastId)
      toast.success('Assessment created with AI-generated questions!')
      navigate('/admin/assessments')
    } catch (err) {
      toast.dismiss(toastId)
      toast.error(err.response?.data?.detail || 'Failed to create assessment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex">
      <Sidebar links={NAV} />
      <PageLayout>
        <div className="mb-8">
          <span className="round-badge mb-2 inline-block">CREATE</span>
          <h1 className="section-title text-4xl">New Assessment</h1>
          <p className="text-gray-400 mt-2">Configure rounds and let AI generate questions automatically.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-lg text-white" style={{ fontWeight: 700 }}>Basic Info</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Assessment Title *</label>
              <input className="input-field" placeholder="e.g., Full Stack Developer Assessment" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Description</label>
              <textarea className="input-field resize-none" rows={2} placeholder="Brief description for candidates..." value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setAllowRetake(p => !p)}
                className={clsx('w-12 h-6 rounded-full transition-colors duration-200 relative', allowRetake ? 'bg-volt-400' : 'bg-obsidian-600')}
              >
                <div className={clsx('absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200', allowRetake ? 'translate-x-7' : 'translate-x-1')} />
              </div>
              <span className="text-gray-300 text-sm">Allow candidates to retake this assessment</span>
            </label>
          </div>

          {/* Rounds config */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg text-white" style={{ fontWeight: 700 }}>
                Rounds Configuration
                <span className="ml-2 text-gray-500 text-sm font-400 font-body">({rounds.length} rounds)</span>
              </h2>
              <button type="button" onClick={addRound} className="btn-ghost text-sm flex items-center gap-2 py-2">
                <Plus size={14} /> Add Round
              </button>
            </div>

            <div className="space-y-3">
              {rounds.map((round, idx) => (
                <div key={idx} className="border border-obsidian-600 rounded-xl overflow-hidden">
                  {/* Round header */}
                  <div
                    className="flex items-center justify-between px-4 py-3 bg-obsidian-800/50 cursor-pointer hover:bg-obsidian-800 transition-colors"
                    onClick={() => setExpandedRound(expandedRound === round.round_number ? null : round.round_number)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-volt-400/15 border border-volt-400/30 flex items-center justify-center">
                        <span className="text-volt-400 font-mono text-xs font-600">{round.round_number}</span>
                      </div>
                      <span className="text-white text-sm font-500">{round.name}</span>
                      {round.topic && <span className="text-gray-500 text-xs">· {round.topic}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {rounds.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeRound(idx) }}
                          className="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      {expandedRound === round.round_number ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </div>

                  {/* Round body */}
                  {expandedRound === round.round_number && (
                    <div className="p-4 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Round Name</label>
                        <input className="input-field text-sm py-2" value={round.name} onChange={e => updateRound(idx, 'name', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Topic / Subject *</label>
                        <input className="input-field text-sm py-2" placeholder="e.g., React Hooks, SQL Queries" value={round.topic} onChange={e => updateRound(idx, 'topic', e.target.value)} required />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Difficulty</label>
                        <select className="input-field text-sm py-2" value={round.difficulty} onChange={e => updateRound(idx, 'difficulty', e.target.value)}>
                          {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Number of Questions</label>
                        <input type="number" min={3} max={20} className="input-field text-sm py-2" value={round.num_questions} onChange={e => updateRound(idx, 'num_questions', parseInt(e.target.value))} />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Minimum Score to Pass (%)</label>
                        <input type="number" min={0} max={100} className="input-field text-sm py-2" value={round.min_score_percent} onChange={e => updateRound(idx, 'min_score_percent', parseInt(e.target.value))} />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Time Limit (minutes)</label>
                        <input type="number" min={5} max={120} className="input-field text-sm py-2" value={round.time_limit_minutes} onChange={e => updateRound(idx, 'time_limit_minutes', parseInt(e.target.value))} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Assign users */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-lg text-white mb-1" style={{ fontWeight: 700 }}>Assign to Candidates</h2>
            <p className="text-gray-500 text-sm mb-4">Select users who can take this assessment. You can assign more users later.</p>

            {loadingUsers ? (
              <p className="text-gray-500 text-sm">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="text-gray-500 text-sm">No registered users yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {users.map(u => (
                  <label key={u.id} className={clsx(
                    'flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-200',
                    selectedUsers.includes(u.id)
                      ? 'border-volt-400/40 bg-volt-400/8'
                      : 'border-obsidian-600 hover:border-obsidian-500'
                  )}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectedUsers.includes(u.id)}
                      onChange={() => toggleUser(u.id)}
                    />
                    <div className={clsx(
                      'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
                      selectedUsers.includes(u.id) ? 'bg-volt-400 border-volt-400' : 'border-gray-600'
                    )}>
                      {selectedUsers.includes(u.id) && <div className="w-2 h-2 rounded-sm bg-obsidian-950" />}
                    </div>
                    <div>
                      <p className="text-white text-sm font-500">{u.name}</p>
                      <p className="text-gray-500 text-xs">{u.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {selectedUsers.length > 0 && (
              <p className="text-volt-400 text-sm mt-3 font-mono">{selectedUsers.length} candidate{selectedUsers.length > 1 ? 's' : ''} selected</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/assessments')}
              className="btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-2 flex items-center justify-center gap-2 flex-1"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Zap size={18} fill="currentColor" />
                  Create & Generate Questions
                </>
              )}
            </button>
          </div>
        </form>
      </PageLayout>
    </div>
  )
}
