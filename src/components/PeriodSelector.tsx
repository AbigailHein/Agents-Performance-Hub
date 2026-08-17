import { Period } from '../types'
import { PERIODS } from '../lib/periods'

interface Props {
  value: Period
  onChange: (p: Period) => void
  label?: string
}

export default function PeriodSelector({ value, onChange, label = 'View Stats' }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-slate-600">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Period)}
        className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        {PERIODS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
    </div>
  )
}
