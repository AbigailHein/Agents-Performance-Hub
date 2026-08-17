export type Category = 'rental' | 'sales'
export type Period = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface Profile {
  id: string
  full_name: string
  avatar_url: string | null
  role: 'agent' | 'admin'
  created_at: string
}

export interface StatDefinition {
  key: string
  category: Category
  section: string
  label: string
  on_leaderboard: boolean
  points: number
  sort_order: number
}

export interface StatEntry {
  id: string
  agent_id: string
  stat_key: string
  entry_date: string
  value: number
}

export interface LeaderboardRow {
  agent_id: string
  full_name: string
  avatar_url: string | null
  total_points: number
}
