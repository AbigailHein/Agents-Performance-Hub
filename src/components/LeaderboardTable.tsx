import { LeaderboardRow } from '../types'

const MEDALS = ['🥇', '🥈', '🥉']

export default function LeaderboardTable({
  rows,
  loading,
  title,
}: {
  rows: LeaderboardRow[]
  loading: boolean
  title: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 font-semibold">{title}</div>
      {loading ? (
        <div className="p-4 text-sm text-slate-400">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="p-4 text-sm text-slate-400">No entries captured for this period yet.</div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.map((r, i) => (
            <li key={r.agent_id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-semibold text-slate-500">
                  {MEDALS[i] ?? i + 1}
                </span>
                <span className="font-medium">{r.full_name}</span>
              </div>
              <span className="font-semibold text-brand-700">{r.total_points.toLocaleString()} pts</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
