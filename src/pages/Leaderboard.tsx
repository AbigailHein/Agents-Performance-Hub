import { useState } from 'react'
import { Period } from '../types'
import { useLeaderboard } from '../hooks/useStats'
import PeriodSelector from '../components/PeriodSelector'
import LeaderboardTable from '../components/LeaderboardTable'

export default function Leaderboard() {
  const [period, setPeriod] = useState<Period>('monthly')
  const rentals = useLeaderboard('rental', period)
  const sales = useLeaderboard('sales', period)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">🏆 Leaderboard</h1>
        <PeriodSelector value={period} onChange={setPeriod} label="Leaderboard" />
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        <LeaderboardTable rows={rentals.rows} loading={rentals.loading} title="🔑 RENTAL LEADERBOARD" />
        <LeaderboardTable rows={sales.rows} loading={sales.loading} title="🏡 SALES LEADERBOARD" />
      </div>
    </div>
  )
}
