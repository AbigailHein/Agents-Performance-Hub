import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useStatTotals } from '../hooks/useStats'

// Maps the Dashboard's summary rows to the underlying stat_key in each category.
// Edit these if your stat_definitions keys change.
const ROW_MAP: { label: string; rentalKey: string; salesKey: string }[] = [
  { label: 'Listings', rentalKey: 'listings_uploaded', salesKey: 'sales_listings_uploaded' },
  { label: 'Viewings', rentalKey: 'viewings', salesKey: 'sales_viewings' },
  { label: 'Applications/Offers', rentalKey: 'successful_applications', salesKey: 'successful_offers' },
  { label: 'Closed', rentalKey: 'leases_concluded', salesKey: 'sales_concluded' },
]

export default function Dashboard() {
  const { profile } = useAuth()
  const rentalToday = useStatTotals(profile?.id, 'rental', 'daily')
  const salesToday = useStatTotals(profile?.id, 'sales', 'daily')

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold">🏠 Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Welcome back{profile ? `, ${profile.full_name}` : ''}. Here's today at a glance.
        </p>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 font-semibold">Today's Performance</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100">
              <th className="px-4 py-2 font-medium"> </th>
              <th className="px-4 py-2 font-medium">🔑 Rentals</th>
              <th className="px-4 py-2 font-medium">🏡 Sales</th>
            </tr>
          </thead>
          <tbody>
            {ROW_MAP.map((row) => (
              <tr key={row.label} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-2 font-medium">{row.label}</td>
                <td className="px-4 py-2">
                  {rentalToday.loading ? '…' : (rentalToday.totals[row.rentalKey] ?? 0)}
                </td>
                <td className="px-4 py-2">
                  {salesToday.loading ? '…' : (salesToday.totals[row.salesKey] ?? 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/rentals"
          className="block bg-brand-600 hover:bg-brand-700 text-white rounded-xl p-5 shadow-sm transition-colors"
        >
          <div className="text-lg font-semibold">🔑 Rentals →</div>
          <div className="text-brand-100 text-sm mt-1">Capture, track, and rank your rental performance</div>
        </Link>
        <Link
          to="/sales"
          className="block bg-slate-800 hover:bg-slate-900 text-white rounded-xl p-5 shadow-sm transition-colors"
        >
          <div className="text-lg font-semibold">🏡 Sales →</div>
          <div className="text-slate-200 text-sm mt-1">Capture, track, and rank your sales performance</div>
        </Link>
      </div>
    </div>
  )
}
