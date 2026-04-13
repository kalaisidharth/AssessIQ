import clsx from 'clsx'

const STATUS_CONFIG = {
  completed: { label: 'Completed', cls: 'text-green-400 bg-green-400/10 border-green-400/30' },
  failed: { label: 'Failed', cls: 'text-red-400 bg-red-400/10 border-red-400/30' },
  in_progress: { label: 'In Progress', cls: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  not_started: { label: 'Not Started', cls: 'text-gray-400 bg-gray-400/10 border-gray-400/30' },
}

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.not_started
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono border', config.cls)}>
      {config.label}
    </span>
  )
}
