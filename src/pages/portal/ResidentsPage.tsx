import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/portal/PageHeader'
import { apiGet } from '@/lib/api/client'
import { AddResidentModal } from '@/components/portal/AddResidentModal'

type ResidentRow = {
  id: string
  resident_number: string
  first_name: string
  last_name: string
  preferred_name: string | null
  date_of_birth: string | null
  status: 'active' | 'discharged' | 'deceased'
  admission_date: string | null
  room_number: string | null
  ward: string | null
}

type ResidentListResponse = {
  data: ResidentRow[]
  total: number
  page: number
  limit: number
}

const statusConfig = {
  active:     { dot: '#16a34a', label: 'Active',     bg: 'rgba(22,163,74,0.08)',   color: '#15803d' },
  discharged: { dot: '#ca8a04', label: 'Discharged', bg: 'rgba(202,138,4,0.1)',    color: '#a16207' },
  deceased:   { dot: '#5a5a5a', label: 'Deceased',   bg: 'rgba(90,90,90,0.1)',     color: '#5a5a5a' },
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

function displayName(r: ResidentRow) {
  return `${r.first_name} ${r.last_name}`
}

export default function ResidentsPage() {
  const [residents, setResidents] = useState<ResidentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [addOpen, setAddOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (filterStatus !== 'all') params.set('status', filterStatus)
      if (search.trim()) params.set('search', search.trim())
      const res = await apiGet<ResidentListResponse>(`/residents?${params}`)
      setResidents(res.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load residents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filterStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = residents.filter(r => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      displayName(r).toLowerCase().includes(q) ||
      (r.room_number ?? '').toLowerCase().includes(q) ||
      (r.ward ?? '').toLowerCase().includes(q) ||
      r.resident_number.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <PageHeader
        title="Residents"
        subtitle="All facility residents across all admission statuses"
        action={
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium"
            style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
          >
            <UserPlus size={14} />Add Resident
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#5a5a5a' }} aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            placeholder="Search by name, room or ward..."
            className="w-full pl-9 pr-3 py-2.5 rounded border text-sm outline-none"
            style={{ borderColor: '#ddd6c8', backgroundColor: '#ffffff', color: '#1a1a1a' }}
            onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
            onBlur={e => (e.target.style.borderColor = '#ddd6c8')}
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 rounded border text-sm outline-none"
          style={{ borderColor: '#ddd6c8', backgroundColor: '#ffffff', color: '#1a1a1a' }}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="discharged">Discharged</option>
          <option value="deceased">Deceased</option>
        </select>
      </div>

      {error && (
        <div className="px-4 py-3 rounded border text-sm mb-4" style={{ color: '#dc2626', backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
        <div className="hidden md:grid grid-cols-[1fr_100px_130px_130px_120px] gap-4 px-5 py-3 border-b" style={{ borderColor: '#ddd6c8', backgroundColor: '#F5F0E8' }}>
          {['Name', 'Room', 'Ward', 'Admission Date', 'Status'].map(col => (
            <span key={col} className="text-xs font-medium uppercase tracking-wider" style={{ color: '#5a5a5a' }}>{col}</span>
          ))}
        </div>

        {loading ? (
          <div className="divide-y" style={{ borderColor: '#f0ece3' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-3">
                <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-40" />
                  <div className="skeleton h-2.5 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: '#5a5a5a' }}>
              {residents.length === 0
                ? 'No residents added yet. Click "Add Resident" to get started.'
                : 'No residents match your search.'}
            </p>
          </div>
        ) : (
          filtered.map((resident, index) => {
            const sc = statusConfig[resident.status]
            const baseBg = index % 2 === 0 ? '#ffffff' : '#fafaf9'
            const name = displayName(resident)
            return (
              <Link
                key={resident.id}
                to={`/residents/${resident.id}`}
                className="grid grid-cols-1 md:grid-cols-[1fr_100px_130px_130px_120px] gap-2 md:gap-4 px-5 py-3.5 border-b last:border-b-0 items-center"
                style={{ borderColor: '#ddd6c8', backgroundColor: baseBg, textDecoration: 'none', cursor: 'pointer' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(30,58,47,0.04)')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = baseBg)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0"
                    style={{ backgroundColor: '#1E3A2F' }}
                    aria-hidden="true"
                  >
                    {name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <span className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{name}</span>
                    {resident.preferred_name && (
                      <span className="text-xs ml-1.5" style={{ color: '#9ca3af' }}>({resident.preferred_name})</span>
                    )}
                  </div>
                </div>
                <span className="text-sm" style={{ color: '#1a1a1a' }}>
                  {resident.room_number ? `Room ${resident.room_number}` : '—'}
                </span>
                <span className="text-sm" style={{ color: '#5a5a5a' }}>{resident.ward ?? '—'}</span>
                <span className="text-sm" style={{ color: '#5a5a5a' }}>{formatDate(resident.admission_date)}</span>
                <div>
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: sc.bg, color: sc.color }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.dot }} aria-hidden="true" />
                    {sc.label}
                  </span>
                </div>
              </Link>
            )
          })
        )}
      </div>

      <AddResidentModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => { setAddOpen(false); load() }}
      />
    </div>
  )
}
