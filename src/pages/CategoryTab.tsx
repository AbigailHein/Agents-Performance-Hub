import { useState } from 'react'
import { Category, Period } from '../types'
import { useAuth } from '../hooks/useAuth'
import { useStatDefinitions, useStatTotals, useStatTotalsAllPeriods, useLeaderboard } from '../hooks/useStats'
import { getPeriodRange } from '../lib/periods'
import CaptureForm from '../components/CaptureForm'
import PerformanceTable from '../components/PerformanceTable'
import StatsShowcase from '../components/StatsShowcase'
import PeriodSelector from '../components/PeriodSelector'
import LeaderboardTable from '../components/LeaderboardTable'

/**
 * Shared implementation for the Rentals and Sales tabs — everything for
 * that category (capture, performance, showcase, leaderboard) lives here
 * so the agent never has to leave the tab. Rentals and Sales pages just
 * render this with a different `category`.
 */
export default function CategoryTab({
  category,
  emoji,
  name,
}: {
  category: Category
  emoji: string
  name: string
}) {
  const { profile } = useAuth()
  const { definitions, loading: defsLoading } = useStatDefinitions(category)

  const [showcasePeriod, setShowcasePeriod] = useState<Period>('daily')
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<Period>('monthly')

  const allPeriods = useStatTotalsAllPeriods(profile?.id, category)
  const showcase = useStatTotals(profile?.id, category, showcasePeriod)
  const leaderboard = useLeaderboard(category, leaderboardPeriod)

  const showcaseRange = getPeriodRange(showcasePeriod)

  function refreshAll() {
    allPeriods.refresh()
    showcase.refresh()
    leaderboard.refresh()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-10">
      <header>
        <h1 className="text-2xl font-bold">
          {emoji} {name}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Everything {name.toLowerCase()}-related lives here — capture, performance, and the leaderboard.
        </p>
      </header>

      <section>
        <h2 className="text-lg font-semibold mb-3">📥 Capture {name} Stats</h2>
        {defsLoading ? (
          <div className="text-slate-400 text-sm">Loading form…</div>
        ) : (
          <CaptureForm definitions={definitions} onSaved={refreshAll} />
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">📊 My {name} Performance</h2>
        <PerformanceTable
          definitions={definitions}
          data={allPeriods.data}
          loading={allPeriods.loading || defsLoading}
          title={`My ${name} Stats`}
        />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-lg font-semibold">📊 Stats Showcase</h2>
          <PeriodSelector value={showcasePeriod} onChange={setShowcasePeriod} label="View Stats" />
        </div>
        <StatsShowcase
          definitions={definitions}
          totals={showcase.totals}
          loading={showcase.loading || defsLoading}
          periodLabel={showcaseRange.label}
          title={`${emoji} ${name} Stats`}
        />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-lg font-semibold">🏆 {name} Leaderboard</h2>
          <PeriodSelector value={leaderboardPeriod} onChange={setLeaderboardPeriod} label="Leaderboard" />
        </div>
        <LeaderboardTable
          rows={leaderboard.rows}
          loading={leaderboard.loading}
          title={`🏆 ${name.toUpperCase()} LEADERBOARD`}
        />
      </section>
    </div>
  )
}
