import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Category, StatDefinition, LeaderboardRow } from '../types'
import { getPeriodRange } from '../lib/periods'
import { Period } from '../types'

export function useStatDefinitions(category: Category) {
  const [definitions, setDefinitions] = useState<StatDefinition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    supabase
      .from('stat_definitions')
      .select('*')
      .eq('category', category)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (active) {
          setDefinitions((data as StatDefinition[]) ?? [])
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [category])

  return { definitions, loading }
}

/** Totals for a single agent, for a single period, keyed by stat_key. */
export function useStatTotals(agentId: string | undefined, category: Category, period: Period) {
  const [totals, setTotals] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!agentId) return
    setLoading(true)
    const { start, end } = getPeriodRange(period)
    const { data } = await supabase.rpc('get_stat_totals', {
      p_agent_id: agentId,
      p_category: category,
      p_start_date: start,
      p_end_date: end,
    })
    const map: Record<string, number> = {}
    ;(data ?? []).forEach((row: { stat_key: string; total: number }) => {
      map[row.stat_key] = Number(row.total)
    })
    setTotals(map)
    setLoading(false)
  }, [agentId, category, period])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { totals, loading, refresh }
}

/** Totals for one agent across all four periods at once (used by the performance table). */
export function useStatTotalsAllPeriods(agentId: string | undefined, category: Category) {
  const [data, setData] = useState<Record<Period, Record<string, number>>>({
    daily: {},
    weekly: {},
    monthly: {},
    yearly: {},
  })
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!agentId) return
    setLoading(true)
    const periods: Period[] = ['daily', 'weekly', 'monthly', 'yearly']
    const results = await Promise.all(
      periods.map(async (p) => {
        const { start, end } = getPeriodRange(p)
        const { data } = await supabase.rpc('get_stat_totals', {
          p_agent_id: agentId,
          p_category: category,
          p_start_date: start,
          p_end_date: end,
        })
        const map: Record<string, number> = {}
        ;(data ?? []).forEach((row: { stat_key: string; total: number }) => {
          map[row.stat_key] = Number(row.total)
        })
        return [p, map] as const
      }),
    )
    const next = { daily: {}, weekly: {}, monthly: {}, yearly: {} } as Record<Period, Record<string, number>>
    results.forEach(([p, map]) => {
      next[p] = map
    })
    setData(next)
    setLoading(false)
  }, [agentId, category])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { data, loading, refresh }
}

export function useLeaderboard(category: Category, period: Period) {
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { start, end } = getPeriodRange(period)
    const { data } = await supabase.rpc('get_leaderboard', {
      p_category: category,
      p_start_date: start,
      p_end_date: end,
    })
    setRows((data as LeaderboardRow[]) ?? [])
    setLoading(false)
  }, [category, period])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { rows, loading, refresh }
}

/** Upsert a single stat entry for "today" (or a given date). */
export async function captureStat(statKey: string, value: number, entryDate?: string) {
  const date = entryDate ?? new Date().toISOString().slice(0, 10)
  const { error } = await supabase.rpc('upsert_stat_entry', {
    p_stat_key: statKey,
    p_entry_date: date,
    p_value: value,
  })
  return { error: error?.message ?? null }
}
