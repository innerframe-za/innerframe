import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, ArrowRight, Plus } from 'lucide-react'
import { apiGet } from '@/lib/api/client'
import { NewFacilityModal, type NewFacilityResult } from '@/components/superadmin/NewFacilityModal'

interface Organisation {
  id: string
  name: string
  slug: string
  country_code: string
  plan_code: string
  created_at: string
  tenant_database?: { status: string; schema_version: number } | null
}

export default function FacilitiesPage() {
  const navigate = useNavigate()

  const [orgs, setOrgs] = useState<Organisation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    apiGet<Organisation[]>('/organisations')
      .then(data => setOrgs(Array.isArray(data) ? data : []))
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false))
  }, [])

  function handleNewFacility(result: NewFacilityResult) {
    setOrgs(prev => [{ id: result.id, name: result.name, slug: result.slug, country_code: 'ZA', plan_code: 'standard', created_at: result.createdAt }, ...prev])
    setModalOpen(false)
  }

  return (
    <>
      <div>
        {/* Page header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: '#1E3A2F', fontFamily: "'Plus Jakarta Sans', system-ui", letterSpacing: '-0.02em' }}>
              All Facilities
            </h1>
            <div style={{ width: '36px', height: '2px', backgroundColor: '#D4AF37', marginTop: '6px' }} aria-hidden="true" />
            <p className="text-sm mt-2" style={{ color: '#5a5a5a' }}>
              Click a facility to manage its members and settings.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium flex-shrink-0 transition-colors"
            style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2D5A3D')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1E3A2F')}
          >
            <Plus size={15} />New Facility
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <span className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(30,58,47,0.2)', borderTopColor: '#1E3A2F' }} />
          </div>
        )}

        {error && (
          <div className="px-4 py-3 rounded-lg border text-sm mb-4" style={{ color: '#dc2626', backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {orgs.length === 0 ? (
              <div className="bg-white rounded-xl border p-12 flex flex-col items-center gap-3 text-center" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
                <Building2 size={28} style={{ color: '#D4AF37' }} />
                <p className="text-sm" style={{ color: '#5a5a5a' }}>No facilities yet. Create one above.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #ddd6c8', backgroundColor: '#F5F0E8' }}>
                        {['Facility', 'Slug', 'Plan', 'Country', 'DB Status', 'Since', ''].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-xs font-medium" style={{ color: '#5a5a5a', fontFamily: "'Outfit', system-ui" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orgs.map(org => (
                        <tr
                          key={org.id}
                          className="cursor-pointer transition-colors"
                          style={{ borderBottom: '0.5px solid #ddd6c8' }}
                          onClick={() => navigate(`/superadmin/facility/${org.id}`)}
                          onMouseEnter={e => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#F5F0E8')}
                          onMouseLeave={e => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent')}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(30,58,47,0.08)' }}>
                                <Building2 size={14} style={{ color: '#1E3A2F' }} />
                              </div>
                              <span className="font-medium" style={{ color: '#1a1a1a' }}>{org.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-mono" style={{ color: '#5a5a5a' }}>{org.slug}</td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: 'rgba(30,58,47,0.06)', color: '#1E3A2F' }}>
                              {org.plan_code}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs uppercase" style={{ color: '#5a5a5a' }}>{org.country_code}</td>
                          <td className="py-3.5 px-4">
                            {org.tenant_database ? (
                              <span
                                className="text-xs px-2 py-0.5 rounded-full capitalize"
                                style={{
                                  backgroundColor: org.tenant_database.status === 'ready' ? 'rgba(22,163,74,0.08)' : 'rgba(251,191,36,0.1)',
                                  color: org.tenant_database.status === 'ready' ? '#15803d' : '#b45309',
                                }}
                              >
                                {org.tenant_database.status}
                              </span>
                            ) : (
                              <span className="text-xs" style={{ color: '#9ca3af' }}>—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs" style={{ color: '#5a5a5a' }}>
                            {new Date(org.created_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short' })}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <ArrowRight size={16} style={{ color: '#D4AF37' }} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {modalOpen && (
        <NewFacilityModal onClose={() => setModalOpen(false)} onSuccess={handleNewFacility} />
      )}
    </>
  )
}
