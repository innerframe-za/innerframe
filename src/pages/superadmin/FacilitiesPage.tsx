import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, ArrowRight, Users, Plus, Trash2, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { NewFacilityModal, type NewFacilityResult } from '@/components/superadmin/NewFacilityModal'

// ── New-system facility (from `facilities` table) ──────────────────────────
interface NewFacility {
  id: string
  name: string
  slug: string
  facilityType: string | null
  subscriptionTier: string
  isActive: boolean
  createdAt: string
  memberCount: number
  adminCount: number
}

// ── Legacy facility (from `organisations` table) ───────────────────────────
interface LegacyFacility {
  id: string
  name: string
  contactEmail: string | null
  contactPhone: string | null
  createdAt: string
  staffCount: number
  residentCount: number
}

function SectionHeading({ title, count }: { title: string; count?: number }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold" style={{ color: '#1E3A2F' }}>{title}</h2>
        {count !== undefined && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(30,58,47,0.08)', color: '#1E3A2F' }}>
            {count}
          </span>
        )}
      </div>
      <div style={{ width: '36px', height: '2px', backgroundColor: '#D4AF37', marginTop: '4px' }} aria-hidden="true" />
    </div>
  )
}

export default function FacilitiesPage() {
  const navigate = useNavigate()

  const [newFacilities, setNewFacilities]     = useState<NewFacility[]>([])
  const [legacyFacilities, setLegacyFacilities] = useState<LegacyFacility[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; system: 'new' | 'legacy' } | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function loadAll() {
    const supabase = createClient()

    // New-system facilities
    const { data: facilitiesData, error: facilitiesErr } = await supabase
      .from('facilities')
      .select('id, name, slug, facility_type, subscription_tier, is_active, created_at')
      .order('name')

    if (facilitiesErr) throw facilitiesErr

    const facilityIds = (facilitiesData ?? []).map(f => f.id)

    const [membersRes, adminsRes] = facilityIds.length > 0
      ? await Promise.all([
          supabase.from('facility_memberships').select('facility_id').in('facility_id', facilityIds).eq('status', 'active'),
          supabase.from('facility_memberships').select('facility_id').in('facility_id', facilityIds).eq('status', 'active').eq('perm_admin', 'full'),
        ])
      : [{ data: [] }, { data: [] }]

    const memberCounts: Record<string, number> = {}
    const adminCounts: Record<string, number> = {}
    for (const r of membersRes.data ?? []) memberCounts[r.facility_id] = (memberCounts[r.facility_id] ?? 0) + 1
    for (const r of adminsRes.data ?? []) adminCounts[r.facility_id]   = (adminCounts[r.facility_id]   ?? 0) + 1

    setNewFacilities(
      (facilitiesData ?? []).map(f => ({
        id: f.id, name: f.name, slug: f.slug, facilityType: f.facility_type,
        subscriptionTier: f.subscription_tier, isActive: f.is_active, createdAt: f.created_at,
        memberCount: memberCounts[f.id] ?? 0,
        adminCount:  adminCounts[f.id]  ?? 0,
      }))
    )

    // Legacy organisations
    const { data: orgs, error: orgsErr } = await supabase
      .from('organisations')
      .select('id, name, contact_email, contact_phone, created_at')
      .neq('id', '00000000-0000-0000-0000-000000000001')
      .order('name')

    if (orgsErr) throw orgsErr
    if (!orgs || orgs.length === 0) { setLegacyFacilities([]); setLoading(false); return }

    const orgIds = orgs.map(o => o.id)
    const [staffRes, residentRes] = await Promise.all([
      supabase.from('users').select('org_id').in('org_id', orgIds).neq('role', 'super_admin'),
      supabase.from('patients').select('org_id').in('org_id', orgIds),
    ])

    const staffCounts: Record<string, number> = {}
    const residentCounts: Record<string, number> = {}
    for (const r of staffRes.data ?? [])   staffCounts[r.org_id]   = (staffCounts[r.org_id]   ?? 0) + 1
    for (const r of residentRes.data ?? []) residentCounts[r.org_id] = (residentCounts[r.org_id] ?? 0) + 1

    setLegacyFacilities(orgs.map(o => ({
      id: o.id, name: o.name, contactEmail: o.contact_email, contactPhone: o.contact_phone,
      createdAt: o.created_at, staffCount: staffCounts[o.id] ?? 0, residentCount: residentCounts[o.id] ?? 0,
    })))
    setLoading(false)
  }

  useEffect(() => {
    try { loadAll() } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load.'
      setError(msg); setLoading(false)
    }
  }, [])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const supabase = createClient()
      const table = deleteTarget.system === 'new' ? 'facilities' : 'organisations'
      const { error } = await supabase.from(table).delete().eq('id', deleteTarget.id)
      if (error) throw error

      if (deleteTarget.system === 'new') {
        setNewFacilities(prev => prev.filter(f => f.id !== deleteTarget.id))
      } else {
        setLegacyFacilities(prev => prev.filter(f => f.id !== deleteTarget.id))
      }
      setDeleteTarget(null)
    } catch { /* stay open so user can retry */ }
    finally { setDeleting(false) }
  }

  function handleNewFacility(facility: NewFacilityResult) {
    // NewFacilityModal creates in organisations — add to legacy list
    setLegacyFacilities(prev => [{
      id: facility.id, name: facility.name, contactEmail: facility.contactEmail,
      contactPhone: facility.contactPhone, createdAt: facility.createdAt,
      staffCount: facility.staffCount, residentCount: facility.residentCount,
    }, ...prev])
    setModalOpen(false)
  }

  return (
    <>
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: '#1E3A2F' }}>All Facilities</h1>
          <div style={{ width: '36px', height: '2px', backgroundColor: '#D4AF37', marginTop: '6px' }} aria-hidden="true" />
          <p className="text-sm mt-2" style={{ color: '#5a5a5a' }}>
            Click a facility to manage its members, permissions, and settings.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium flex-shrink-0 transition-colors"
          style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2D5A3D')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1E3A2F')}
        >
          <Plus size={15} />
          New Facility
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <span className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(30,58,47,0.2)', borderTopColor: '#1E3A2F' }} />
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded border text-sm mb-4" style={{ color: '#dc2626', backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ── New-system facilities ── */}
          <section className="mb-8">
            <SectionHeading title="Permission-System Facilities" count={newFacilities.length} />

            {newFacilities.length === 0 ? (
              <div className="bg-white rounded-xl border p-8 flex flex-col items-center gap-3 text-center" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
                <Building2 size={28} style={{ color: '#D4AF37' }} />
                <p className="text-sm" style={{ color: '#5a5a5a' }}>No new-system facilities yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #ddd6c8', backgroundColor: '#F5F0E8' }}>
                        {['Facility', 'Type', 'Tier', 'Members', 'Admins', 'Status', 'Since', ''].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-xs font-medium" style={{ color: '#5a5a5a' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {newFacilities.map(f => (
                        <tr
                          key={f.id}
                          className="transition-colors cursor-pointer"
                          style={{ borderBottom: '0.5px solid #ddd6c8' }}
                          onClick={() => navigate(`/superadmin/facility/${f.id}`)}
                          onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#F5F0E8'}
                          onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent'}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(30,58,47,0.08)' }}>
                                <Building2 size={14} style={{ color: '#1E3A2F' }} />
                              </div>
                              <div>
                                <p className="font-medium" style={{ color: '#1a1a1a' }}>{f.name}</p>
                                <p className="text-xs" style={{ color: '#5a5a5a' }}>{f.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-xs capitalize" style={{ color: '#5a5a5a' }}>{f.facilityType ?? '—'}</td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: 'rgba(30,58,47,0.06)', color: '#1E3A2F' }}>
                              {f.subscriptionTier}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5" style={{ color: '#1a1a1a' }}>
                              <Users size={12} style={{ color: '#5a5a5a' }} />{f.memberCount}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5" style={{ color: '#1a1a1a' }}>
                              <ShieldCheck size={12} style={{ color: '#5a5a5a' }} />{f.adminCount}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{
                              backgroundColor: f.isActive ? 'rgba(22,163,74,0.08)' : 'rgba(90,90,90,0.08)',
                              color: f.isActive ? '#15803d' : '#5a5a5a',
                            }}>
                              {f.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs" style={{ color: '#5a5a5a' }}>
                            {new Date(f.createdAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short' })}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3 justify-end">
                              <button
                                type="button"
                                onClick={e => { e.stopPropagation(); setDeleteTarget({ id: f.id, name: f.name, system: 'new' }) }}
                                aria-label={`Delete ${f.name}`}
                                className="w-7 h-7 flex items-center justify-center rounded transition-colors"
                                style={{ color: 'rgba(220,38,38,0.4)' }}
                                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#dc2626')}
                                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(220,38,38,0.4)')}
                              >
                                <Trash2 size={14} />
                              </button>
                              <ArrowRight size={16} style={{ color: '#D4AF37' }} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* ── Legacy organisations ── */}
          <section>
            <SectionHeading title="Legacy Organisations" count={legacyFacilities.length} />
            <p className="text-xs mb-3" style={{ color: '#5a5a5a' }}>
              Created before the new permission system. Staff and permissions are managed per-pillar.
            </p>

            {legacyFacilities.length === 0 ? (
              <div className="bg-white rounded-xl border p-6 text-sm text-center" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px', color: '#5a5a5a' }}>
                No legacy organisations.
              </div>
            ) : (
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
                      {legacyFacilities.map(f => (
                        <tr
                          key={f.id}
                          className="transition-colors cursor-pointer"
                          style={{ borderBottom: '0.5px solid #ddd6c8' }}
                          onClick={() => navigate(`/superadmin/facility/${f.id}`)}
                          onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#F5F0E8'}
                          onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent'}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(212,175,55,0.1)' }}>
                                <Building2 size={14} style={{ color: '#D4AF37' }} />
                              </div>
                              <span className="font-medium" style={{ color: '#1a1a1a' }}>{f.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4" style={{ color: '#5a5a5a' }}>{f.contactEmail ?? '—'}</td>
                          <td className="py-3.5 px-4" style={{ color: '#5a5a5a' }}>{f.contactPhone ?? '—'}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5" style={{ color: '#1a1a1a' }}>
                              <Users size={12} style={{ color: '#5a5a5a' }} />{f.staffCount}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-xs" style={{ color: '#1a1a1a' }}>{f.residentCount}</td>
                          <td className="py-3.5 px-4 text-xs" style={{ color: '#5a5a5a' }}>
                            {new Date(f.createdAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short' })}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3 justify-end">
                              <button
                                type="button"
                                onClick={e => { e.stopPropagation(); setDeleteTarget({ id: f.id, name: f.name, system: 'legacy' }) }}
                                aria-label={`Delete ${f.name}`}
                                className="w-7 h-7 flex items-center justify-center rounded transition-colors"
                                style={{ color: 'rgba(220,38,38,0.4)' }}
                                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#dc2626')}
                                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(220,38,38,0.4)')}
                              >
                                <Trash2 size={14} />
                              </button>
                              <ArrowRight size={16} style={{ color: '#D4AF37' }} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>

    {/* New Facility modal */}
    {modalOpen && (
      <NewFacilityModal onClose={() => setModalOpen(false)} onSuccess={handleNewFacility} />
    )}

    {/* Delete confirmation */}
    {deleteTarget && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="bg-white rounded-xl border shadow-xl w-full max-w-sm p-6" style={{ borderColor: '#ddd6c8' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fef2f2' }}>
              <Trash2 size={18} style={{ color: '#dc2626' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>Delete Facility</p>
              <p className="text-xs" style={{ color: '#5a5a5a' }}>This cannot be undone</p>
            </div>
          </div>
          <p className="text-sm mb-5" style={{ color: '#5a5a5a' }}>
            Permanently delete <strong style={{ color: '#1a1a1a' }}>{deleteTarget.name}</strong> and all its associated data?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
            >
              {deleting
                ? <><span className="w-3.5 h-3.5 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#ffffff' }} />Deleting...</>
                : <><Trash2 size={13} />Delete</>
              }
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="flex-1 py-2.5 rounded border text-sm font-medium transition-colors disabled:opacity-60"
              style={{ borderColor: '#ddd6c8', color: '#5a5a5a' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
