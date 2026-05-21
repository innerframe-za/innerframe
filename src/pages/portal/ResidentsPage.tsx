import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/portal/PageHeader'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/auth/useUser'
import { AddResidentModal } from '@/components/portal/AddResidentModal'

type ResidentRow = {
  id: string
  full_name: string
  id_number: string | null
  room_number: string | null
  admission_date: string | null
  status: 'active' | 'discharged' | 'deceased'
}

const statusConfig = {
  active: { dot: '#16a34a', label: 'Active', bg: 'rgba(22,163,74,0.08)', color: '#15803d' },
  discharged: { dot: '#ca8a04', label: 'Discharged', bg: 'rgba(202,138,4,0.1)', color: '#a16207' },
  deceased: { dot: '#5a5a5a', label: 'Deceased', bg: 'rgba(90,90,90,0.1)', color: '#5a5a5a' },
}

function maskId(idNumber: string | null) {
  if (!idNumber) return '—'
  return '***' + idNumber.slice(-4)
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ResidentsPage() {
  const { user } = useUser()
  const [residents, setResidents] = useState<ResidentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [addOpen, setAddOpen] = useState(false)

  const load = async () => {
    if (!user?.orgId) return
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('patients')
      .select('id, full_name, id_number, room_number, admission_date, status')
      .eq('org_id', user.orgId)   // Residents are facility-scoped — always filter by org_id
      .order('full_name')
    setResidents((data ?? []) as ResidentRow[])
    setLoading(false)
  }

  useEffect(() => { load() }, [user?.orgId]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = residents.filter(r => {
    const matchSearch =
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (r.room_number ?? '').includes(search)
    const matchStatus = filterStatus === 'all' || r.status === filterStatus
    return matchSearch && matchStatus
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
            type="search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or room..."
            className="w-full pl-9 pr-3 py-2.5 rounded border text-sm outline-none"
            style={{ borderColor: '#ddd6c8', backgroundColor: '#ffffff', color: '#1a1a1a' }}
            onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
            onBlur={e => (e.target.style.borderColor = '#ddd6c8')}
          />
        </div>
        <select
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 rounded border text-sm outline-none"
          style={{ borderColor: '#ddd6c8', backgroundColor: '#ffffff', color: '#1a1a1a' }}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="discharged">Discharged</option>
          <option value="deceased">Deceased</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
        <div className="hidden md:grid grid-cols-[1fr_130px_100px_130px_120px_80px] gap-4 px-5 py-3 border-b" style={{ borderColor: '#ddd6c8', backgroundColor: '#F5F0E8' }}>
          {['Name', 'ID Number', 'Room', 'Admission Date', 'Status', 'Actions'].map(col => (
            <span key={col} className="text-xs font-medium uppercase tracking-wider" style={{ color: '#5a5a5a' }}>{col}</span>
          ))}
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <span className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(30,58,47,0.2)', borderTopColor: '#1E3A2F' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: '#5a5a5a' }}>
              {residents.length === 0 ? 'No residents added yet. Click "Add Resident" to get started.' : 'No residents match your search.'}
            </p>
          </div>
        ) : (
          filtered.map((resident, index) => {
            const sc = statusConfig[resident.status]
            return (
              <div
                key={resident.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_130px_100px_130px_120px_80px] gap-2 md:gap-4 px-5 py-3.5 border-b last:border-b-0 items-center"
                style={{ borderColor: '#ddd6c8', backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafaf9' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0"
                    style={{ backgroundColor: '#1E3A2F' }}
                    aria-hidden="true"
                  >
                    {resident.full_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{resident.full_name}</span>
                </div>
                <span className="text-sm font-mono" style={{ color: '#5a5a5a' }}>{maskId(resident.id_number)}</span>
                <span className="text-sm" style={{ color: '#1a1a1a' }}>
                  {resident.room_number ? `Room ${resident.room_number}` : '—'}
                </span>
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
                <Link
                  to={`/residents/${resident.id}`}
                  className="text-xs font-medium transition-colors"
                  style={{ color: '#1E3A2F' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#D4AF37')}
                  onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#1E3A2F')}
                >
                  View →
                </Link>
              </div>
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
