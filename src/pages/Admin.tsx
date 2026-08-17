import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Profile, StatDefinition, Category } from '../types'

type AdminSection = 'users' | 'stats' | 'settings'

export default function Admin() {
  const [section, setSection] = useState<AdminSection>('users')

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">🔐 Admin</h1>
      </header>

      <div className="flex gap-2 border-b border-slate-200">
        {(['users', 'stats', 'settings'] as AdminSection[]).map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              section === s ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500'
            }`}
          >
            {s === 'users' ? 'Users' : s === 'stats' ? 'Stats' : 'Settings'}
          </button>
        ))}
      </div>

      {section === 'users' && <UsersPanel />}
      {section === 'stats' && <StatsPanel />}
      {section === 'settings' && <SettingsPanel />}
    </div>
  )
}

function UsersPanel() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('full_name')
    setUsers((data as Profile[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function toggleRole(u: Profile) {
    const newRole = u.role === 'admin' ? 'agent' : 'admin'
    await supabase.from('profiles').update({ role: newRole }).eq('id', u.id)
    load()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 border-b border-slate-100">
            <th className="px-4 py-2 font-medium">Name</th>
            <th className="px-4 py-2 font-medium">Role</th>
            <th className="px-4 py-2 font-medium">Joined</th>
            <th className="px-4 py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                Loading…
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-2 font-medium">{u.full_name}</td>
                <td className="px-4 py-2 capitalize">{u.role}</td>
                <td className="px-4 py-2 text-slate-500">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => toggleRole(u)} className="text-brand-600 hover:underline text-xs">
                    Make {u.role === 'admin' ? 'Agent' : 'Admin'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function StatsPanel() {
  const [category, setCategory] = useState<Category>('rental')

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setCategory('rental')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            category === 'rental' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          🔑 Rentals
        </button>
        <button
          onClick={() => setCategory('sales')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            category === 'sales' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          🏡 Sales
        </button>
      </div>
      <StatDefinitionsTable category={category} />
    </div>
  )
}

function StatDefinitionsTable({ category }: { category: Category }) {
  const [defs, setDefs] = useState<StatDefinition[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('stat_definitions')
      .select('*')
      .eq('category', category)
      .order('sort_order')
    setDefs((data as StatDefinition[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [category])

  async function toggleLeaderboard(d: StatDefinition) {
    await supabase.from('stat_definitions').update({ on_leaderboard: !d.on_leaderboard }).eq('key', d.key)
    load()
  }

  async function updatePoints(d: StatDefinition, points: number) {
    await supabase.from('stat_definitions').update({ points }).eq('key', d.key)
    load()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 border-b border-slate-100">
            <th className="px-4 py-2 font-medium">Section</th>
            <th className="px-4 py-2 font-medium">Label</th>
            <th className="px-4 py-2 font-medium">On Leaderboard</th>
            <th className="px-4 py-2 font-medium">Points</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                Loading…
              </td>
            </tr>
          ) : (
            defs.map((d) => (
              <tr key={d.key} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-2 text-slate-500">{d.section}</td>
                <td className="px-4 py-2 font-medium">{d.label}</td>
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={d.on_leaderboard}
                    onChange={() => toggleLeaderboard(d)}
                    className="h-4 w-4 accent-brand-600"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    defaultValue={d.points}
                    onBlur={(e) => updatePoints(d, Number(e.target.value))}
                    className="w-20 border border-slate-300 rounded px-2 py-1"
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <p className="px-4 py-3 text-xs text-slate-400 border-t border-slate-100">
        To add a brand-new stat (e.g. once final Sales stats are confirmed), insert a row into{' '}
        <code>stat_definitions</code> in Supabase — it will appear here and in the Capture form automatically.
      </p>
    </div>
  )
}

function SettingsPanel() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-sm text-slate-500">
      General app settings (company name, branding, leaderboard reset schedule, etc.) can be added here as
      needed — e.g. by adding a <code>settings</code> table with key/value rows.
    </div>
  )
}
