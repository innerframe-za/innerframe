import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, ArrowRight, Users, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface FacilityRow {
  id: string
  name: string
  contactEmail: string | null
  contactPhone: string | null
  createdAt: string
  staffCount: number
  residentCount: number
}

export default function FacilitiesPage() {
  const navigate = useNavigate()
  const [facilities, setFacilities] = useState<FacilityRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let supabase: ReturnType<typeof createClient>
    try {
      supabase = createClient()
    } catch {
      setError('Supabase is not configured.')
      setLoading(false)
      return
    }

    async function load() {
      // Fetch all orgs except the super_admin placeholder org
      const { data: orgs, error: orgsErr } = await supabase
        .from('organisations')
        .select('id, name, contact_email, contact_phone, created_at')
        .neq('id', '00000000-0000-0000-0000-000000000001')
        .order('name')

      if (orgsErr) throw orgsErr
      if (!orgs) { setFacilities([]); setLoading(false); return }

      // Fetch staff and resident counts per org
      const orgIds = orgs.map(o => o.id)

      const [staffRes, residentRes] = await Promise.all([
        supabase.from('users').select('org_id').in('org_id', orgIds).neq('role', 'super_admin'),
        supabase.from('patients').select('org_id').in('org_id', orgIds),
      ])

      const staffCounts: Record<string, number> = {}
      const residentCounts: Record<string, number> = {}

      for (const row of staffRes.data ?? []) {
        staffCounts[row.org_id] = (staffCounts[row.org_id] ?? 0) + 1
      }
      for (const row of residentRes.data ?? []) {
        residentCounts[row.org_id] = (residentCounts[row.org_id] ?? 0) + 1
      }

      setFacilities(
        orgs.map(org => ({
          id: org.id,
          name: org.name,
          contactEmail: org.contact_email,
          contactPhone: org.contact_phone,
          createdAt: org.created_at,
          staffCount: staffCounts[org.id] ?? 0,
          residentCount: residentCounts[org.id] ?? 0,
        }))
      )
      setLoading(false)
    }

    load().catch(err => {
      setError(err?.message ?? 'Failed to load facilities.')
      setLoading(false)
    })
  }, [])

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: '#1E3A2F' }}>All Facilities</h1>
        <div style={{ width: '36px', height: '2px', backgroundColor: '#D4AF37', marginTop: '6px' }} aria-hidden="true" />
        <p className="text-sm mt-2" style={{ color: '#5a5a5a' }}>
          Click a facility to view its residents, staff, and settings.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <span className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(30,58,47,0.2)', borderTopColor: '#1E3A2F' }} />
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded border text-sm" style={{ color: '#dc2626', backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
          {error}
        </div>
      )}

      {!loading && !error && facilities.length === 0 && (
        <div className="bg-white rounded-xl border p-10 flex flex-col items-center gap-3 text-center" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
          <Building2 size={32} style={{ color: '#D4AF37' }} />
          <p className="text-sm font-medium" style={{ color: '#1E3A2F' }}>No facilities yet</p>
          <p className="text-xs" style={{ color: '#5a5a5a' }}>Facilities will appear here once they're added to the system.</p>
        </div>
      )}

      {!loading && !error && facilities.length > 0 && (
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd6c8', backgroundColor: '#F5F0E8' }}>
                  {['Facility', 'Contact Email', 'Phone', 'Staff', 'Residents', 'Since', ''].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-medium" style={{ color: '#5a5a5a' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {facilities.map(facility => (
                  <tr
                    key={facility.id}
                    className="transition-colors cursor-pointer"
                    style={{ borderBottom: '0.5px solid #ddd6c8' }}
                    onClick={() => navigate(`/superadmin/facility/${facility.id}`)}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#F5F0E8'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent'}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(30,58,47,0.08)' }}>
                          <Building2 size={15} style={{ color: '#1E3A2F' }} />
                        </div>
                        <span className="font-medium" style={{ color: '#1a1a1a' }}>{facility.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4" style={{ color: '#5a5a5a' }}>{facility.contactEmail ?? '—'}</td>
                    <td className="py-3.5 px-4" style={{ color: '#5a5a5a' }}>{facility.contactPhone ?? '—'}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5" style={{ color: '#1a1a1a' }}>
                        <Users size={13} style={{ color: '#5a5a5a' }} />
                        {facility.staffCount}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5" style={{ color: '#1a1a1a' }}>
                        <FileText size={13} style={{ color: '#5a5a5a' }} />
                        {facility.residentCount}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs" style={{ color: '#5a5a5a' }}>
                      {new Date(facility.createdAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <ArrowRight size={16} style={{ color: '#D4AF37' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
