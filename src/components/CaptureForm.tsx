import { useMemo, useState } from 'react'
import { StatDefinition } from '../types'
import { captureStat } from '../hooks/useStats'

export default function CaptureForm({
  definitions,
  onSaved,
}: {
  definitions: StatDefinition[]
  onSaved?: () => void
}) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const sections = useMemo(() => {
    const map = new Map<string, StatDefinition[]>()
    definitions.forEach((d) => {
      if (!map.has(d.section)) map.set(d.section, [])
      map.get(d.section)!.push(d)
    })
    return Array.from(map.entries())
  }, [definitions])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const entries = Object.entries(values).filter(([, v]) => v !== '' && v !== undefined)
    for (const [statKey, raw] of entries) {
      await captureStat(statKey, Number(raw))
    }

    setSaving(false)
    setMessage("Saved today's stats ✅")
    setValues({})
    onSaved?.()
  }

  if (definitions.length === 0) {
    return (
      <div className="text-sm text-slate-400 p-4">
        No stats configured yet. An admin can add them under Admin → Stats.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {sections.map(([section, stats]) => (
        <div key={section} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-700 mb-3">{section}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stats.map((s) => (
              <label key={s.key} className="text-sm">
                <span className="block text-slate-500 mb-1">
                  {s.label} {s.on_leaderboard && <span title="Counts toward leaderboard">⭐</span>}
                </span>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={values[s.key] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="0"
                />
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium px-5 py-2 rounded-lg shadow-sm"
        >
          {saving ? 'Saving…' : "Save Today's Stats"}
        </button>
        {message && <span className="text-sm text-green-600">{message}</span>}
      </div>
    </form>
  )
}
