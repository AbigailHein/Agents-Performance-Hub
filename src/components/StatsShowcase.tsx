import { StatDefinition } from '../types'

export default function StatsShowcase({
  definitions,
  totals,
  loading,
  periodLabel,
  title,
}: {
  definitions: StatDefinition[]
  totals: Record<string, number>
  loading: boolean
  periodLabel: string
  title: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <span className="font-semibold">{title}</span>
        <span className="text-sm text-slate-400">{periodLabel}</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 border-b border-slate-100">
            <th className="px-4 py-2 font-medium">Stat</th>
            <th className="px-4 py-2 font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={2} className="px-4 py-6 text-center text-slate-400">
                Loading…
              </td>
            </tr>
          ) : (
            definitions.map((s) => (
              <tr key={s.key} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-2">{s.label}</td>
                <td className="px-4 py-2 font-medium">{(totals[s.key] ?? 0).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
