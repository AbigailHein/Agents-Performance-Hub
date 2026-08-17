import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'

export default function Profile() {
  const { profile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', profile.id)
    setSaving(false)
    setMessage(error ? error.message : 'Profile updated ✅')
  }

  if (!profile) return null

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">👤 Profile</h1>
      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <label className="block text-sm">
          <span className="block text-slate-500 mb-1">Full name</span>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </label>
        <label className="block text-sm">
          <span className="block text-slate-500 mb-1">Role</span>
          <input
            value={profile.role}
            disabled
            className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-slate-500"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium px-5 py-2 rounded-lg"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {message && <div className="text-sm text-slate-500">{message}</div>}
      </form>
    </div>
  )
}
