import { StatDefinition, Period } from '../types'

export default function PerformanceTable({
  definitions,
  data,
  loading,
  title,
}: {
  definitions: StatDefinition[]
  data: Record<Period, Record<string, number>>
  loading: boolean
  title: string
}) {
  const leaderboardStats = definitions.filter((d) => d.on_leaderboard)
  const operationalStats = definitions.filter((d) => !d.on_leaderboard)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 font-semibold">{title}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="px-4 py-2 font-medium">Statistic</th>
                <th className="px-4 py-2 font-medium">Today</th>
                <th className="px-4 py-2 font-medium">This Week</th>
                <th className="px-4 py-2 font-medium">This Month</th>
                <th className="px-4 py-2 font-medium">This Year</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    Loading…
                  </td>
                </tr>
              ) : (
                leaderboardStats.map((s) => (
                  <tr key={s.key} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-2 font-medium">{s.label}</td>
                    <td className="px-4 py-2">{(data.daily[s.key] ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-2">{(data.weekly[s.key] ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-2">{(data.monthly[s.key] ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-2">{(data.yearly[s.key] ?? 0).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {operationalStats.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 font-semibold">📌 Operational Stats</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="px-4 py-2 font-medium">Statistic</th>
                  <th className="px-4 py-2 font-medium">Today</th>
                  <th className="px-4 py-2 font-medium">This Week</th>
                  <th className="px-4 py-2 font-medium">This Month</th>
                  <th className="px-4 py-2 font-medium">This Year</th>
                </tr>
              </thead>
              <tbody>
                {operationalStats.map((s) => (
                  <tr key={s.key} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-2 font-medium">{s.label}</td>
                    <td className="px-4 py-2">{(data.daily[s.key] ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-2">{(data.weekly[s.key] ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-2">{(data.monthly[s.key] ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-2">{(data.yearly[s.key] ?? 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
