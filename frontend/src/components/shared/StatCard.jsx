export default function StatCard({ label, value, icon: Icon, color = 'volt', sub }) {
  const colors = {
    volt: 'text-volt-400 bg-volt-400/10 border-volt-400/20',
    green: 'text-green-400 bg-green-400/10 border-green-400/20',
    red: 'text-red-400 bg-red-400/10 border-red-400/20',
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    amber: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  }

  return (
    <div className="glass rounded-2xl p-6 flex items-start gap-4 hover:border-volt-400/15 transition-all duration-300">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-gray-400 text-sm font-body">{label}</p>
        <p className="text-white text-3xl font-display mt-0.5" style={{ fontWeight: 800, letterSpacing: '-0.04em' }}>{value}</p>
        {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  )
}
