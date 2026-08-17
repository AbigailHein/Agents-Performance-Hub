import { Period } from '../types'

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10)
}

/** Returns [startDate, endDate] (inclusive, ISO strings) for a given period, anchored on today. */
export function getPeriodRange(period: Period): { start: string; end: string; label: string } {
  const now = new Date()
  const end = toISODate(now)

  if (period === 'daily') {
    return { start: end, end, label: now.toLocaleDateString(undefined, { dateStyle: 'long' }) }
  }

  if (period === 'weekly') {
    const day = now.getDay() // 0 = Sunday
    const diffToMonday = (day + 6) % 7
    const start = new Date(now)
    start.setDate(now.getDate() - diffToMonday)
    return { start: toISODate(start), end, label: 'This Week' }
  }

  if (period === 'monthly') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return {
      start: toISODate(start),
      end,
      label: now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    }
  }

  // yearly
  const start = new Date(now.getFullYear(), 0, 1)
  return { start: toISODate(start), end, label: String(now.getFullYear()) }
}

export const PERIODS: { value: Period; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]
