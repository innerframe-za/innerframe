import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Users, FileText, Building2, Settings, UserCheck, UserX,
  ShieldCheck, Trash2, UserPlus, Lock,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { InviteStaffModal } from '@/components/portal/InviteStaffModal'
import type { PermissionLevel } from '@/lib/permissions'

type Tab = 'residents' | 'staff' | 'settings'

// ── New-system types (facilities / facility_memberships) ──────────────────
interface NewFacility {
  id: string; name: string; slug: string; facilityType: string | null
  subscriptionTier: string; isActive: boolean
}

interface FacilityMember {
  id: string; userId: string; fullName: string; email: string; role: string
  permAdmin: PermissionLevel; permMedical: PermissionLevel; permFinance: PermissionLevel
  status: string
}

// ── Legacy types (organisations / users) ─────────────────────────────────
interface LegacyOrg {
  id: string; name: string; address: string | null
  contactEmail: string | null; contactPhone: string | null
}

interface LegacyStaff {
  id: string; fullName: string; email: string; role: string; createdAt: string; username: string | null
}

interface Resident {
  id: string; fullName: string; roomNumber: string | null
  status: string; admissionDate: string | null
}

const ROLE_LABEL: Record<string, string> = {
  super_admin: 'Super Admin', facility_admin: 'Facility Admin', hr_manager: 'HR Manager',
  finance_officer: 'Finance Officer', medical_staff: 'Medical Staff',
  board_member: 'Board Member', kitchen_staff: 'Kitchen Staff', general_staff: 'General Staff',
  home_admin: 'Home Admin', staff: 'Staff',
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === 'facility_admin' || role === 'super_admin' || role === 'home_admin'
  return (
    <span className="text-xs px-2 py-0.5 rounded-full" style={{
      backgroundColor: isAdmin ? 'rgba(212,175,55,0.12)' : 'rgba(30,58,47,0.06)',
      color: isAdmin ? '#92700a' : '#1E3A2F',
    }}>
      {ROLE_LABEL[role] ?? role}
    </span>
  )
}

export default function FacilityDetailPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const navigate  = useNavigate()

  // Shared state
  const [activeTab, setActiveTab] = useState<Tab>('residents')
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'confirming' | 'deleting'>('idle')

  // New-system state
  const [newFacility, setNewFacility] = useState<NewFacility | null>(null)
  const [members, setMembers]         = useState<FacilityMember[]>([])

  // Legacy state
  const [legacyOrg, setLegacyOrg]   = useState<LegacyOrg | null>(null)
  const [legacyStaff, setLegacyStaff] = useState<LegacyStaff[]>([])
  const [residents, setResidents]   = useState<Resident[]>([])
  const [orgForm, setOrgForm] = useState({ name: '', address: '', contactEmail: '', contactPhone: '' })
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  const isNewSystem = newFacility !== null

  useEffect(() => {
    if (!orgId) return
    const supabase = createClient()

    async function load() {
      const id = orgId!   // narrowed — outer `if (!orgId) return` guards this

      // 1. Try the new `facilities` table first
      const { data: facilityData } = await supabase
        .from('facilities')
        .select('id, name, slug, facility_type, subscription_tier, is_active')
        .eq('id', id)
        .single()

      if (facilityData) {
        setNewFacility({
          id: facilityData.id, name: facilityData.name, slug: facilityData.slug,
          facilityType: facilityData.facility_type, subscriptionTier: facilityData.subscription_tier,
          isActive: facilityData.is_active,
        })

        // Load facility_memberships + profiles
        const { data: memberData } = await supabase
          .from('facility_memberships')
          .select('id, user_id, role, status, perm_admin, perm_medical, perm_finance')
          .eq('facility_id', id)
          .order('role')

        const userIds = (memberData ?? []).map(m => m.user_id)
        const { data: profileData } = userIds.length > 0
          ? await supabase.from('profiles').select('id, full_name, email').in('id', userIds)
          : { data: [] }

        const profileMap: Record<string, { full_name: string | null; email: string | null }> = {}
        for (const p of profileData ?? []) profileMap[p.id] = p

        setMembers((memberData ?? []).map(m => ({
          id: m.id, userId: m.user_id,
          fullName: profileMap[m.user_id]?.full_name ?? 'Unknown',
          email:    profileMap[m.user_id]?.email    ?? '',
          role: m.role, status: m.status,
          permAdmin:   m.perm_admin   as PermissionLevel,
          permMedical: m.perm_medical as PermissionLevel,
          permFinance: m.perm_finance as PermissionLevel,
        })))

        setLoading(false)
        return
      }

      // 2. Fall back to legacy `organisations` table
      const [orgRes, staffRes, residentRes] = await Promise.all([
        supabase.from('organisations').select('*').eq('id', id).single(),
        supabase.from('users').select('id, full_name, email, role, created_at, username').eq('org_id', id).neq('role', 'super_admin').order('full_name'),
        supabase.from('patients').select('id, full_name, room_number, status, admission_date').eq('org_id', id).order('full_name'),
      ])

      if (orgRes.error) throw orgRes.error
      const o = orgRes.data
      setLegacyOrg({ id: o.id, name: o.name, address: o.address, contactEmail: o.contact_email, contactPhone: o.contact_phone })
      setOrgForm({ name: o.name ?? '', address: o.address ?? '', contactEmail: o.contact_email ?? '', contactPhone: o.contact_phone ?? '' })

      // If the username column doesn't exist yet (migration 018 not applied), fall back
      let resolvedStaffData = staffRes.data
      if (staffRes.error) {
        const fallback = await supabase
          .from('users')
          .select('id, full_name, email, role, created_at')
          .eq('org_id', id)
          .neq('role', 'super_admin')
          .order('full_name')
        resolvedStaffData = fallback.data as unknown as typeof resolvedStaffData
      }
      setLegacyStaff((resolvedStaffData ?? []).map(u => ({ id: u.id, fullName: u.full_name, email: u.email, role: u.role, createdAt: u.created_at, username: (u as { username?: string | null }).username ?? null })))
      setResidents((residentRes.data ?? []).map(r => ({ id: r.id, fullName: r.full_name, roomNumber: r.room_number, status: r.status, admissionDate: r.admission_date })))
      setLoading(false)
    }

    load().catch(err => { setError(err?.message ?? 'Failed to load facility.'); setLoading(false) })
  }, [orgId])

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveStatus('saving')
    try {
      const supabase = createClient()
      await supabase.from('organisations').update({ name: orgForm.name, address: orgForm.address, contact_email: orgForm.contactEmail, contact_phone: orgForm.contactPhone }).eq('id', orgId!)
      setLegacyOrg(prev => prev ? { ...prev, name: orgForm.name, address: orgForm.address, contactEmail: orgForm.contactEmail, contactPhone: orgForm.contactPhone } : prev)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch { setSaveStatus('idle') }
  }

  const handleDeleteFacility = async () => {
    setDeleteStatus('deleting')
    try {
      const supabase = createClient()
      const table = isNewSystem ? 'facilities' : 'organisations'
      const { error } = await supabase.from(table).delete().eq('id', orgId!)
      if (error) throw error
      navigate('/superadmin')
    } catch { setDeleteStatus('confirming') }
  }

  const handlePromoteLegacy = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'staff' ? 'home_admin' : 'staff'
    try {
      const supabase = createClient()
      await supabase.from('users').update({ role: newRole }).eq('id', userId)
      setLegacyStaff(prev => prev.map(m => m.id === userId ? { ...m, role: newRole } : m))
    } catch { /* ignore */ }
  }

  const facilityName = isNewSystem ? newFacility!.name : (legacyOrg?.name ?? '…')

  const tabs: { key: Tab; label: string; icon: typeof Users }[] = [
    ...(!isNewSystem ? [{ key: 'residents' as Tab, label: 'Residents', icon: Users }] : []),
    { key: 'staff',    label: 'Staff',    icon: UserCheck },
    { key: 'settings', label: 'Settings', icon: Settings },
  ]

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <span className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(30,58,47,0.2)', borderTopColor: '#1E3A2F' }} />
    </div>
  )

  if (error || (!isNewSystem && !legacyOrg)) return (
    <div className="px-4 py-3 rounded border text-sm" style={{ color: '#dc2626', backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
      {error ?? 'Facility not found.'}
    </div>
  )

  return (
    <>
    <div>
      {/* Back + header */}
      <div className="mb-6">
        <button type="button" onClick={() => navigate('/superadmin')}
          className="inline-flex items-center gap-1.5 text-xs mb-4 transition-colors" style={{ color: '#5a5a5a' }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#1E3A2F')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#5a5a5a')}>
          <ArrowLeft size={13} />All Facilities
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(30,58,47,0.1)' }}>
            <Building2 size={20} style={{ color: '#1E3A2F' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold" style={{ color: '#1E3A2F' }}>{facilityName}</h1>
              {isNewSystem && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(22,163,74,0.08)', color: '#15803d' }}>
                  New System
                </span>
              )}
              {!isNewSystem && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(212,175,55,0.1)', color: '#92700a' }}>
                  Legacy
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: '#5a5a5a' }}>
              {isNewSystem ? `/${newFacility!.slug}` : (legacyOrg?.contactEmail ?? 'No email set')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      {(() => {
        const stats = isNewSystem
          ? [
              { label: 'Members',  value: members.length,                                        icon: Users },
              { label: 'Admins',   value: members.filter(m => m.permAdmin === 'full').length,    icon: ShieldCheck },
              { label: 'Contacts', value: '—' as string | number,                               icon: FileText },
            ]
          : [
              { label: 'Staff',     value: legacyStaff.length,                                         icon: Users },
              { label: 'Residents', value: residents.length,                                           icon: FileText },
              { label: 'Admins',    value: legacyStaff.filter(s => s.role === 'home_admin').length,    icon: ShieldCheck },
            ]
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {stats.map(stat => (
              <div key={stat.label} className="bg-white rounded-xl border p-4 flex items-center gap-3" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(30,58,47,0.08)' }}>
                  <stat.icon size={16} style={{ color: '#1E3A2F' }} />
                </div>
                <div>
                  <p className="text-xl font-semibold" style={{ color: '#1E3A2F' }}>{stat.value}</p>
                  <p className="text-xs" style={{ color: '#5a5a5a' }}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        )
      })()}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b" style={{ borderColor: '#ddd6c8' }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.key
          const Icon = tab.icon
          return (
            <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors"
              style={{ borderBottomColor: isActive ? '#1E3A2F' : 'transparent', color: isActive ? '#1E3A2F' : '#5a5a5a' }}>
              <Icon size={14} />{tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Residents tab (legacy only) ── */}
      {activeTab === 'residents' && !isNewSystem && (
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
          {residents.length === 0 ? (
            <div className="py-10 text-center text-sm" style={{ color: '#5a5a5a' }}>No residents found.</div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd6c8', backgroundColor: '#F5F0E8' }}>
                  {['Name', 'Room', 'Status', 'Admitted'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-medium" style={{ color: '#5a5a5a' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {residents.map(r => (
                  <tr key={r.id} style={{ borderBottom: '0.5px solid #ddd6c8' }}>
                    <td className="py-3 px-4 font-medium" style={{ color: '#1a1a1a' }}>{r.fullName}</td>
                    <td className="py-3 px-4" style={{ color: '#5a5a5a' }}>{r.roomNumber ?? '—'}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{
                        backgroundColor: r.status === 'active' ? 'rgba(22,163,74,0.08)' : 'rgba(90,90,90,0.08)',
                        color: r.status === 'active' ? '#15803d' : '#5a5a5a',
                      }}>{r.status}</span>
                    </td>
                    <td className="py-3 px-4 text-xs" style={{ color: '#5a5a5a' }}>
                      {r.admissionDate ? new Date(r.admissionDate).toLocaleDateString('en-ZA') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Staff tab — new system ── */}
      {activeTab === 'staff' && isNewSystem && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs" style={{ color: '#5a5a5a' }}>{members.length} member{members.length !== 1 ? 's' : ''}</p>
          </div>

          {members.length === 0 && (
            <div className="bg-white rounded-xl border py-10 text-center text-sm" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px', color: '#5a5a5a' }}>
              No members yet.
            </div>
          )}

          {members.map(m => (
            <div key={m.id} className="bg-white rounded-xl border p-4 flex items-center justify-between gap-3" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0" style={{ backgroundColor: '#1E3A2F' }}>
                  {m.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{m.fullName}</p>
                    <RoleBadge role={m.role} />
                    {m.status !== 'active' && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>{m.status}</span>
                    )}
                  </div>
                  <p className="text-xs truncate" style={{ color: '#5a5a5a' }}>{m.email}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {(['Admin', 'Medical', 'Finance'] as const).map(label => {
                      const perm = label === 'Admin' ? m.permAdmin : label === 'Medical' ? m.permMedical : m.permFinance
                      const color = perm === 'full' ? '#15803d' : perm === 'none' ? '#9ca3af' : '#d97706'
                      return (
                        <span key={label} className="text-xs flex items-center gap-1" style={{ color }}>
                          <Lock size={10} />{label}: {perm}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>

              <Link
                to={`/admin/staff/${m.userId}/permissions`}
                onClick={e => e.stopPropagation()}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors"
                style={{ borderColor: '#ddd6c8', color: '#5a5a5a', textDecoration: 'none' }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = '#1E3A2F'; el.style.color = '#1E3A2F' }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = '#ddd6c8'; el.style.color = '#5a5a5a' }}
              >
                <ShieldCheck size={12} />Edit Permissions
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* ── Staff tab — legacy system ── */}
      {activeTab === 'staff' && !isNewSystem && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs" style={{ color: '#5a5a5a' }}>{legacyStaff.length} member{legacyStaff.length !== 1 ? 's' : ''}</p>
            <button type="button" onClick={() => setInviteOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors"
              style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2D5A3D')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1E3A2F')}>
              <UserPlus size={13} />Add Staff
            </button>
          </div>
          {legacyStaff.length === 0 && (
            <div className="bg-white rounded-xl border py-10 text-center text-sm" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px', color: '#5a5a5a' }}>
              No staff members found.
            </div>
          )}
          {legacyStaff.map(member => (
            <div key={member.id} className="bg-white rounded-xl border p-4 flex items-center justify-between" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0" style={{ backgroundColor: '#1E3A2F' }}>
                  {member.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{member.fullName}</p>
                  <p className="text-xs" style={{ color: '#5a5a5a' }}>
                    {member.username && <><span style={{ color: '#1a1a1a' }}>{member.username}</span> · </>}
                    {member.email} ·{' '}
                    <span style={{ color: member.role === 'home_admin' ? '#D4AF37' : '#5a5a5a' }}>
                      {member.role === 'home_admin' ? 'Home Admin' : 'Staff'}
                    </span>
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => handlePromoteLegacy(member.id, member.role)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors"
                style={{ borderColor: '#ddd6c8', color: '#5a5a5a' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = '#1E3A2F'; el.style.color = '#1E3A2F' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = '#ddd6c8'; el.style.color = '#5a5a5a' }}>
                {member.role === 'home_admin' ? <><UserX size={12} />Demote</> : <><UserCheck size={12} />Promote</>}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Settings tab ── */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
          <h2 className="text-base font-medium mb-1" style={{ color: '#1E3A2F' }}>Facility Settings</h2>
          <div style={{ width: '36px', height: '2px', backgroundColor: '#D4AF37', marginBottom: '20px' }} aria-hidden="true" />

          {isNewSystem ? (
            <div className="space-y-3 max-w-xl">
              {[
                { label: 'Facility Name', value: newFacility!.name },
                { label: 'Slug',          value: newFacility!.slug },
                { label: 'Type',          value: newFacility!.facilityType ?? '—' },
                { label: 'Subscription',  value: newFacility!.subscriptionTier },
              ].map(field => (
                <div key={field.label} className="flex items-center gap-4">
                  <span className="text-xs font-medium w-28 flex-shrink-0" style={{ color: '#5a5a5a' }}>{field.label}</span>
                  <span className="text-sm" style={{ color: '#1a1a1a' }}>{field.value}</span>
                </div>
              ))}
              <p className="text-xs pt-2" style={{ color: '#5a5a5a' }}>
                Edit new-system facility settings via the Supabase dashboard or a future admin UI.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSaveOrg} className="space-y-4 max-w-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'sa-name', label: 'Facility Name', key: 'name' as const, type: 'text' },
                  { id: 'sa-phone', label: 'Phone Number', key: 'contactPhone' as const, type: 'tel' },
                  { id: 'sa-email', label: 'Contact Email', key: 'contactEmail' as const, type: 'email' },
                ].map(field => (
                  <div key={field.id}>
                    <label htmlFor={field.id} className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>{field.label}</label>
                    <input id={field.id} type={field.type} value={orgForm[field.key]}
                      onChange={e => setOrgForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded border text-sm outline-none transition-colors"
                      style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
                      onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                      onBlur={e => (e.target.style.borderColor = '#ddd6c8')}
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label htmlFor="sa-address" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>Address</label>
                  <input id="sa-address" type="text" value={orgForm.address}
                    onChange={e => setOrgForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded border text-sm outline-none transition-colors"
                    style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
                    onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                    onBlur={e => (e.target.style.borderColor = '#ddd6c8')}
                  />
                </div>
              </div>
              <button type="submit" disabled={saveStatus === 'saving'}
                className="px-4 py-2.5 rounded text-sm font-medium transition-colors disabled:opacity-60"
                style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}>
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* Danger zone */}
          <div className="mt-8 pt-6 border-t" style={{ borderColor: '#ddd6c8' }}>
            <h3 className="text-sm font-medium mb-1" style={{ color: '#dc2626' }}>Danger Zone</h3>
            <p className="text-xs mb-4" style={{ color: '#5a5a5a' }}>
              Permanently deletes this facility and all associated data. Cannot be undone.
            </p>
            {deleteStatus === 'idle' && (
              <button type="button" onClick={() => setDeleteStatus('confirming')}
                className="flex items-center gap-2 px-4 py-2.5 rounded border text-sm font-medium transition-colors"
                style={{ borderColor: '#fecaca', color: '#dc2626' }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fef2f2')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent')}>
                <Trash2 size={14} />Delete Facility
              </button>
            )}
            {(deleteStatus === 'confirming' || deleteStatus === 'deleting') && (
              <div className="p-4 rounded border" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
                <p className="text-sm font-medium mb-3" style={{ color: '#dc2626' }}>
                  Are you sure? This will permanently delete <strong>{facilityName}</strong> and all its data.
                </p>
                <div className="flex gap-3">
                  <button type="button" onClick={handleDeleteFacility} disabled={deleteStatus === 'deleting'}
                    className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium disabled:opacity-60"
                    style={{ backgroundColor: '#dc2626', color: '#ffffff' }}>
                    {deleteStatus === 'deleting'
                      ? <><span className="w-3.5 h-3.5 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#ffffff' }} />Deleting...</>
                      : <><Trash2 size={13} />Yes, delete permanently</>}
                  </button>
                  <button type="button" onClick={() => setDeleteStatus('idle')} disabled={deleteStatus === 'deleting'}
                    className="px-4 py-2 rounded border text-sm font-medium transition-colors disabled:opacity-60"
                    style={{ borderColor: '#ddd6c8', color: '#5a5a5a' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>

    {inviteOpen && orgId && !isNewSystem && (
      <InviteStaffModal orgId={orgId} onClose={() => setInviteOpen(false)}
        onSuccess={member => {
          setLegacyStaff(prev => [...prev, { id: member.id, fullName: member.fullName, email: member.email, role: member.role, createdAt: new Date().toISOString(), username: member.username }])
          setInviteOpen(false)
        }}
      />
    )}
    </>
  )
}
