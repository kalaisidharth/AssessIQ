import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Clock, ChevronRight, CheckCircle, XCircle, AlertTriangle, Zap, SkipForward } from 'lucide-react'
import clsx from 'clsx'

const PHASE = { LOADING: 'loading', OVERVIEW: 'overview', QUIZ: 'quiz', RESULT: 'result', FINAL: 'final' }

export default function TakeAssessment() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [phase, setPhase] = useState(PHASE.LOADING)
  const [assessment, setAssessment] = useState(null)
  const [resultId, setResultId] = useState(null)
  const [currentRound, setCurrentRound] = useState(1)
  const [questions, setQuestions] = useState([])
  const [roundMeta, setRoundMeta] = useState(null)
  const [answers, setAnswers] = useState({})
  const [currentQ, setCurrentQ] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [roundResult, setRoundResult] = useState(null)
  const [finalResult, setFinalResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const timerRef = useRef(null)

  // Start assessment
  useEffect(() => {
    api.get(`/assessment/${id}/start`)
      .then(r => {
        setAssessment(r.data.assessment)
        setResultId(r.data.result_id)
        setCurrentRound(r.data.current_round)
        setPhase(PHASE.OVERVIEW)
      })
      .catch(err => {
        toast.error(err.response?.data?.detail || 'Failed to start assessment')
        navigate('/assessments')
      })
  }, [id])

  // Load questions for current round
  const loadRound = useCallback(async (roundNum) => {
    setPhase(PHASE.LOADING)
    try {
      const r = await api.get(`/assessment/${id}/round/${roundNum}/questions`)
      setQuestions(r.data.questions)
      setRoundMeta(r.data)
      setAnswers({})
      setCurrentQ(0)
      setTimeLeft(r.data.time_limit_minutes * 60)
      setStartTime(Date.now())
      setPhase(PHASE.QUIZ)
    } catch (err) {
      toast.error('Failed to load questions')
    }
  }, [id])

  // Countdown timer
  useEffect(() => {
    if (phase !== PHASE.QUIZ) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          handleSubmit(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (submitting) return
    clearInterval(timerRef.current)
    setSubmitting(true)

    const timeTaken = Math.round((Date.now() - startTime) / 1000)
    const submittedAnswers = questions.map(q => ({
      question_id: q.id,
      selected_option: answers[q.id] || ''
    }))

    try {
      const r = await api.post(`/assessment/${id}/round/${currentRound}/submit`, {
        assessment_id: id,
        round_number: currentRound,
        answers: submittedAnswers,
        time_taken_seconds: timeTaken
      })

      setRoundResult(r.data)
      setPhase(PHASE.RESULT)

      if (r.data.assessment_status === 'completed' || r.data.assessment_status === 'failed') {
        setFinalResult(r.data)
      }
    } catch (err) {
      toast.error('Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }, [submitting, startTime, questions, answers, currentRound, id])

  const handleNextRound = () => {
    const nextRound = roundResult?.next_round
    if (nextRound) {
      setCurrentRound(nextRound)
      loadRound(nextRound)
    }
  }

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const progress = ((currentQ + 1) / questions.length) * 100
  const answered = Object.keys(answers).length
  const isWarning = timeLeft < 120 && timeLeft > 0

  // ── LOADING ──────────────────────────────────────
  if (phase === PHASE.LOADING) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-2 border-volt-400/20 border-t-volt-400 animate-spin mx-auto mb-4" />
          <p className="font-mono text-volt-400 tracking-widest text-sm">LOADING...</p>
        </div>
      </div>
    )
  }

  // ── OVERVIEW ─────────────────────────────────────
  if (phase === PHASE.OVERVIEW) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-volt-400 mb-4 volt-glow">
              <Zap size={28} className="text-obsidian-950" fill="currentColor" />
            </div>
            <h1 className="font-display text-3xl text-white mb-2" style={{ fontWeight: 800, letterSpacing: '-0.04em' }}>
              {assessment?.title}
            </h1>
            <p className="text-gray-400">{assessment?.description}</p>
          </div>

          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="font-display text-lg text-white mb-4" style={{ fontWeight: 700 }}>Assessment Structure</h2>
            <div className="space-y-3">
              {assessment?.rounds?.map(r => (
                <div key={r.round_number} className="flex items-center gap-4 p-3 rounded-xl bg-obsidian-800/50">
                  <div className="w-8 h-8 rounded-full bg-volt-400/15 border border-volt-400/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-volt-400 font-mono text-sm font-600">{r.round_number}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-500">{r.name}</p>
                    <p className="text-gray-500 text-xs">{r.topic}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-300 text-sm">{r.num_questions} questions</p>
                    <p className="text-gray-500 text-xs">{r.time_limit_minutes} min</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-xl p-4 mb-6 border border-amber-400/20">
            <div className="flex items-start gap-3">
              <AlertTriangle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-amber-200/80 text-sm">
                You must meet the minimum score in each round to advance. Failing a round will end the assessment immediately.
              </p>
            </div>
          </div>

          <button
            onClick={() => loadRound(currentRound)}
            className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
          >
            {currentRound > 1 ? `Resume Round ${currentRound}` : 'Begin Assessment'}
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    )
  }

  // ── QUIZ ─────────────────────────────────────────
  if (phase === PHASE.QUIZ) {
    const q = questions[currentQ]
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header bar */}
        <div className="glass sticky top-0 z-30 px-6 py-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(180,255,57,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="round-badge">Round {currentRound}</div>
            <span className="text-gray-400 text-sm">{roundMeta?.round_name}</span>
          </div>
          <div className={clsx('flex items-center gap-2 font-mono text-lg font-600', isWarning ? 'timer-warning' : 'text-white')}>
            <Clock size={18} className={isWarning ? 'text-red-400' : 'text-volt-400'} />
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-gray-400">
            {answered}/{questions.length} answered
          </div>
        </div>

        {/* Progress */}
        <div className="progress-bar mx-0 rounded-none" style={{ height: '3px' }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Question area */}
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-6">
          {/* Question nav dots */}
          <div className="flex flex-wrap gap-2 mb-6">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={clsx(
                  'w-8 h-8 rounded-lg text-xs font-mono font-600 transition-all duration-200',
                  i === currentQ
                    ? 'bg-volt-400 text-obsidian-950'
                    : answers[questions[i]?.id]
                      ? 'bg-volt-400/20 text-volt-400 border border-volt-400/30'
                      : 'bg-obsidian-800 text-gray-500 border border-obsidian-600'
                )}
              >{i + 1}</button>
            ))}
          </div>

          {/* Question card */}
          <div className="glass rounded-2xl p-6 mb-6 flex-1">
            <div className="flex items-start gap-3 mb-6">
              <span className="text-volt-400 font-mono text-sm font-600 mt-0.5 flex-shrink-0">Q{currentQ + 1}.</span>
              <p className="text-white text-lg leading-relaxed font-body">{q?.question}</p>
            </div>

            <div className="space-y-3">
              {q && Object.entries(q.options).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setAnswers(prev => ({ ...prev, [q.id]: key }))}
                  className={clsx('option-btn flex items-start gap-3', answers[q.id] === key && 'selected')}
                >
                  <span className={clsx(
                    'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-600 flex-shrink-0 mt-0.5 border',
                    answers[q.id] === key
                      ? 'bg-volt-400 text-obsidian-950 border-volt-400'
                      : 'bg-obsidian-800 text-gray-400 border-obsidian-600'
                  )}>{key}</span>
                  <span className="text-gray-200 text-sm leading-relaxed">{val}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
              className="btn-ghost text-sm flex items-center gap-2 disabled:opacity-30"
            >
              ← Previous
            </button>

            {currentQ < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQ(currentQ + 1)}
                className="btn-primary flex items-center gap-2"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="btn-primary flex items-center gap-2 bg-green-500 hover:bg-green-600"
              >
                {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                Submit Round <CheckCircle size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── ROUND RESULT ─────────────────────────────────
  if (phase === PHASE.RESULT && roundResult) {
    const passed = roundResult.passed
    const isFinal = !roundResult.next_round

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Pass/Fail banner */}
          <div className={clsx(
            'rounded-2xl p-6 mb-6 text-center',
            passed ? 'bg-green-400/10 border border-green-400/30' : 'bg-red-400/10 border border-red-400/30'
          )}>
            <div className={clsx('w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3',
              passed ? 'bg-green-400/20' : 'bg-red-400/20')}>
              {passed
                ? <CheckCircle size={32} className="text-green-400" />
                : <XCircle size={32} className="text-red-400" />
              }
            </div>
            <h2 className="font-display text-2xl font-800 text-white mb-1" style={{ fontWeight: 800, letterSpacing: '-0.04em' }}>
              {passed ? (isFinal ? '🎉 Assessment Complete!' : `Round ${currentRound} Passed!`) : `Round ${currentRound} Failed`}
            </h2>
            <p className={clsx('text-lg font-mono font-600', passed ? 'text-green-400' : 'text-red-400')}>
              {roundResult.percent}% · {roundResult.score}/{roundResult.total} correct
            </p>
            {!passed && (
              <p className="text-gray-400 text-sm mt-2">
                Minimum required: {roundResult.min_score_percent}%. Assessment has ended.
              </p>
            )}
          </div>

          {/* Answer review */}
          <div className="glass rounded-2xl p-6 mb-6">
            <h3 className="font-display text-lg text-white mb-4" style={{ fontWeight: 700 }}>Answer Review</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {roundResult.answers.map((a, i) => (
                <div key={i} className={clsx('p-4 rounded-xl border', a.is_correct ? 'border-green-400/20 bg-green-400/5' : 'border-red-400/20 bg-red-400/5')}>
                  <div className="flex items-start gap-2 mb-2">
                    {a.is_correct
                      ? <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                      : <XCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                    }
                    <p className="text-white text-sm">{a.question}</p>
                  </div>
                  {!a.is_correct && (
                    <div className="ml-6 space-y-1 text-xs">
                      <p className="text-red-400">Your answer: {a.selected_option || 'Not answered'} — {a.options?.[a.selected_option] || '—'}</p>
                      <p className="text-green-400">Correct: {a.correct_option} — {a.options?.[a.correct_option]}</p>
                    </div>
                  )}
                  {a.explanation && (
                    <p className="ml-6 text-gray-400 text-xs mt-1 italic">{a.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => navigate('/results')} className="btn-ghost flex-1">
              View All Results
            </button>
            {passed && !isFinal && (
              <button onClick={handleNextRound} className="btn-primary flex-1 flex items-center justify-center gap-2">
                Start Round {roundResult.next_round} <ChevronRight size={16} />
              </button>
            )}
            {isFinal && (
              <button onClick={() => navigate('/dashboard')} className="btn-primary flex-1">
                Back to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
