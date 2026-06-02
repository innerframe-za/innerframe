import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/portal/PageHeader'
import { Plus, Trash2, UserMinus, ChevronDown, ChevronUp } from 'lucide-react'
import { useUser } from '@/lib/auth/useUser'
import { createClient } from '@/lib/supabase/client'
import { PillarSlug } from '@/lib/auth/usePermissions'
import { InviteStaffModal } from '@/components/portal/InviteStaffModal'

type NewMember = { id: string; fullName: string; email: string; role: string }

const ALL_PILLARS: { slug: PillarSlug; label: string }[] = [
  { slug: 'admin', label: 'Admin Office' },
  { slug: 'finance', label: 'Finance' },
  { slug: 'kitchen', label: 'Kitchen' },
  { slug: 'medical', label: 'Medical' },
  { slug: 'medical_residence', label: 'Medical Residence' },
  { slug: 'hr', label: 'HR' },
  { slug: 'board_governance', label: 'Board Governance' },
]

interface StaffMember {
  id: string
  fullName: string
  email: string
  role: string
}

interface StaffPerms {
  [pillarSlug: string]: { canView: boolean; canEdit: boolean }
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-medium" style={{ color: '#1E3A2F' }}>{title}</h2>
      <div style={{ width: '36px', height: '2px', backgroundColor: '#D4AF37', marginTop: '4px' }} aria-hidden="true" />
    </div>
  )
}

// Expanded row for a single staff member's pillar permissions
function StaffPermissionRow({
  member,
  onPromote,
  onDeactivate,
}: {
  member: StaffMember
  onPromote: (id: string, currentRole: string) => void
  onDeactivate: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [perms, setPerms] = useState<StaffPerms>({})
  const [permsLoading, setPermsLoading] = useState(false)

  const loadPerms = useCallback(async () => {
    setPermsLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('staff_permissions')
        .select('pillar_slug, can_view, can_edit')
        .eq('user_id', member.id)
      const map: StaffPerms = {}
      for (const row of data ?? []) {
        map[row.pillar_slug] = { canView: row.can_view, canEdit: row.can_edit }
      }
      setPerms(map)
    } catch { /* ignore */ }
    setPermsLoading(false)
  }, [member.id, member.role])

  const handleToggle = async (pillarSlug: PillarSlug, field: 'canView' | 'canEdit', value: boolean) => {
    const current = perms[pillarSlug] ?? { canView: true, canEdit: false }
    const updated = { ...current, [field]: value }
    // Disable edit if view is turned off
    if (field === 'canView' && !value) updated.canEdit = false

    setPerms(prev => ({ ...prev, [pillarSlug]: updated }))

    try {
      const supabase = createClient()
      await supabase.from('staff_permissions').upsert({
        user_id: member.id,
        pillar_slug: pillarSlug,
        can_view: updated.canView,
        can_edit: updated.canEdit,
      }, { onConflict: 'user_id,pillar_slug' })
    } catch { /* ignore — optimistic update stays */ }
  }

  const handleExpand = () => {
    if (!expanded) loadPerms()
    setExpanded(!expanded)
  }

  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0"
            style={{ backgroundColor: '#1E3A2F' }}
            aria-hidden="true"
          >
            {member.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{member.fullName}</p>
            <p className="text-xs" style={{ color: '#5a5a5a' }}>
              {member.email} ·{' '}
              <span style={{ color: member.role === 'home_admin' ? '#D4AF37' : '#5a5a5a' }}>
                {member.role === 'home_admin' ? 'Home Admin' : 'Staff'}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPromote(member.id, member.role)}
            className="text-xs px-2.5 py-1 rounded border transition-colors"
            style={{ borderColor: '#ddd6c8', color: '#5a5a5a' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = '#1E3A2F'; el.style.color = '#1E3A2F' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = '#ddd6c8'; el.style.color = '#5a5a5a' }}
            title={member.role === 'home_admin' ? 'Demote to Staff' : 'Promote to Admin'}
          >
            {member.role === 'home_admin' ? 'Demote' : 'Promote'}
          </button>
          <button
            type="button"
            onClick={() => onDeactivate(member.id)}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors"
            style={{ color: '#5a5a5a' }}
            aria-label={`Remove ${member.fullName}`}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#dc2626')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#5a5a5a')}
          >
            <UserMinus size={14} />
          </button>
          <button
            type="button"
            onClick={handleExpand}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors"
            style={{ color: '#5a5a5a' }}
            aria-label={expanded ? 'Collapse permissions' : 'Expand permissions'}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Per-pillar toggles */}
      {expanded && (
        <div className="border-t px-3 pb-3 pt-3" style={{ borderColor: '#ddd6c8', backgroundColor: '#fafaf9' }}>
          <p className="text-xs font-medium mb-3" style={{ color: '#5a5a5a' }}>Pillar Access</p>
          {permsLoading ? (
            <div className="flex items-center justify-center py-4">
              <span className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(30,58,47,0.2)', borderTopColor: '#1E3A2F' }} />
            </div>
          ) : (
            <div className="space-y-2">
              {ALL_PILLARS.map(({ slug, label }) => {
                const p = perms[slug] ?? { canView: true, canEdit: false }
                return (
                  <div key={slug} className="flex items-center justify-between py-1.5 px-2 rounded" style={{ backgroundColor: '#ffffff', border: '0.5px solid #ddd6c8' }}>
                    <span className="text-xs font-medium" style={{ color: '#1a1a1a' }}>{label}</span>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={p.canView}
                          onChange={e => handleToggle(slug, 'canView', e.target.checked)}
                          className="w-3.5 h-3.5 accent-[#1E3A2F]"
                        />
                        <span className="text-xs" style={{ color: '#5a5a5a' }}>View</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={p.canEdit}
                          disabled={!p.canView}
                          onChange={e => handleToggle(slug, 'canEdit', e.target.checked)}
                          className="w-3.5 h-3.5 accent-[#1E3A2F] disabled:opacity-40"
                        />
                        <span className="text-xs" style={{ color: p.canView ? '#5a5a5a' : '#aaa' }}>Edit</span>
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const { user } = useUser()
  const navigate = useNavigate()
  const isSuperAdmin = user?.role === 'super_admin'

  // Facility profile
  const [orgForm, setOrgForm] = useState({ name: '', address: '', contactEmail: '', contactPhone: '' })
  const [orgLoading, setOrgLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Staff
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [inviteOpen, setInviteOpen] = useState(false)

  // Document categories
  const [categories, setCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState('')

  // Super admin: all orgs
  const [orgs, setOrgs] = useState<{ id: string; name: string; contactEmail: string | null; residents: number; documents: number; createdAt: string }[]>([])

  useEffect(() => {
    if (!user) return
    let supabase: ReturnType<typeof createClient>
    try { supabase = createClient() } catch { setOrgLoading(false); return }

    async function loadOrgData() {
      // Load org profile
      const { data: orgData } = await supabase
        .from('organisations')
        .select('name, address, contact_email, contact_phone')
        .eq('id', user!.orgId)
        .single()

      if (orgData) {
        setOrgForm({
          name: orgData.name ?? '',
          address: orgData.address ?? '',
          contactEmail: orgData.contact_email ?? '',
          contactPhone: orgData.contact_phone ?? '',
        })
      }

      // Load staff
      const { data: staffData } = await supabase
        .from('users')
        .select('id, full_name, email, role')
        .eq('org_id', user!.orgId)
        .neq('role', 'super_admin')
        .neq('id', user!.id)
        .order('full_name')

      setStaff((staffData ?? []).map(u => ({ id: u.id, fullName: u.full_name, email: u.email, role: u.role })))

      // Load document categories from document_categories table
      const { data: catData } = await supabase
        .from('document_categories')
        .select('name')
        .eq('org_id', user!.orgId)
        .order('name')

      setCategories((catData ?? []).map(c => c.name))

      setOrgLoading(false)
    }

    async function loadSuperAdminData() {
      const { data: orgsData } = await supabase
        .from('organisations')
        .select('id, name, contact_email, created_at')
        .neq('id', '00000000-0000-0000-0000-000000000001')
        .order('name')

      if (!orgsData) { setOrgs([]); return }

      const orgIds = orgsData.map(o => o.id)
      const [patientsRes, docsRes] = await Promise.all([
        supabase.from('patients').select('org_id').in('org_id', orgIds),
        supabase.from('documents_legacy').select('org_id').in('org_id', orgIds),
      ])

      const patCounts: Record<string, number> = {}
      const docCounts: Record<string, number> = {}
      for (const r of patientsRes.data ?? []) patCounts[r.org_id] = (patCounts[r.org_id] ?? 0) + 1
      for (const r of docsRes.data ?? []) docCounts[r.org_id] = (docCounts[r.org_id] ?? 0) + 1

      setOrgs(orgsData.map(o => ({
        id: o.id, name: o.name, contactEmail: o.contact_email,
        residents: patCounts[o.id] ?? 0, documents: docCounts[o.id] ?? 0,
        createdAt: o.created_at,
      })))
    }

    loadOrgData().catch(() => setOrgLoading(false))
    if (isSuperAdmin) loadSuperAdminData().catch(() => {})
  }, [user, isSuperAdmin])

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveStatus('saving')
    try {
      const supabase = createClient()
      await supabase.from('organisations').update({
        name: orgForm.name,
        address: orgForm.address,
        contact_email: orgForm.contactEmail,
        contact_phone: orgForm.contactPhone,
      }).eq('id', user!.orgId)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('idle')
    }
  }

  const handlePromote = async (memberId: string, currentRole: string) => {
    const newRole = currentRole === 'staff' ? 'home_admin' : 'staff'
    try {
      const supabase = createClient()
      await supabase.from('users').update({ role: newRole }).eq('id', memberId)
      setStaff(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m))
    } catch { /* ignore */ }
  }

  const handleDeactivate = async (memberId: string) => {
    // Remove from local list; a full delete would require a Supabase admin call or soft-delete column
    setStaff(prev => prev.filter(m => m.id !== memberId))
    try {
      const supabase = createClient()
      await supabase.from('users').delete().eq('id', memberId)
    } catch { /* ignore */ }
  }

  const handleAddCategory = async () => {
    const val = newCategory.trim()
    if (!val || categories.includes(val)) return
    setCategories(prev => [...prev, val])
    setNewCategory('')
    try {
      const supabase = createClient()
      await supabase.from('document_categories').insert({ org_id: user!.orgId, name: val })
    } catch { /* ignore */ }
  }

  const handleRemoveCategory = async (cat: string) => {
    setCategories(prev => prev.filter(c => c !== cat))
    try {
      const supabase = createClient()
      await supabase.from('document_categories').delete().eq('org_id', user!.orgId).eq('name', cat)
    } catch { /* ignore */ }
  }

  return (
    <>
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Settings" subtitle="Facility profile, staff management, and document categories" />

      {/* 1. Facility Profile */}
      <section className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
        <SectionHeading title="Facility Profile" />
        {orgLoading ? (
          <div className="flex items-center justify-center py-8">
            <span className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(30,58,47,0.2)', borderTopColor: '#1E3A2F' }} />
          </div>
        ) : (
          <form onSubmit={handleSaveOrg} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'name', label: 'Facility Name', key: 'name' as const, type: 'text' },
                { id: 'phone', label: 'Phone Number', key: 'contactPhone' as const, type: 'tel' },
                { id: 'email', label: 'Contact Email', key: 'contactEmail' as const, type: 'email' },
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
                <label htmlFor="address" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>Address</label>
                <input id="address" type="text" value={orgForm.address}
                  onChange={e => setOrgForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded border text-sm outline-none transition-colors"
                  style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
                  onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                  onBlur={e => (e.target.style.borderColor = '#ddd6c8')}
                />
              </div>
            </div>
            <button type="submit" disabled={saveStatus === 'saving'} className="px-4 py-2.5 rounded text-sm font-medium transition-colors disabled:opacity-60" style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}>
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
            </button>
          </form>
        )}
      </section>

      {/* 2. Staff Management */}
      <section className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-base font-medium" style={{ color: '#1E3A2F' }}>Staff Management</h2>
            <div style={{ width: '36px', height: '2px', backgroundColor: '#D4AF37', marginTop: '4px' }} aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors"
            style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2D5A3D')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1E3A2F')}
          >
            <Plus size={12} />Invite Staff
          </button>
        </div>
        {staff.length === 0 && !orgLoading && (
          <p className="text-sm text-center py-4" style={{ color: '#5a5a5a' }}>No staff members found.</p>
        )}
        <div className="space-y-2">
          {staff.map(member => (
            <StaffPermissionRow
              key={member.id}
              member={member}
              onPromote={handlePromote}
              onDeactivate={handleDeactivate}
            />
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: '#5a5a5a' }}>
          Click the <ChevronDown size={10} className="inline" /> icon on a staff member to configure per-pillar access.
        </p>
      </section>

      {/* 3. Document Categories */}
      <section className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
        <SectionHeading title="Document Categories" />
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(cat => (
            <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium" style={{ borderColor: '#ddd6c8', color: '#1a1a1a', backgroundColor: '#F5F0E8' }}>
              {cat}
              <button type="button" onClick={() => handleRemoveCategory(cat)} aria-label={`Remove ${cat}`} style={{ color: '#5a5a5a' }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#dc2626')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#5a5a5a')}>
                <Trash2 size={10} />
              </button>
            </span>
          ))}
          {categories.length === 0 && <p className="text-xs" style={{ color: '#5a5a5a' }}>No categories yet.</p>}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
            placeholder="New category name..."
            className="flex-1 px-3 py-2 rounded border text-sm outline-none transition-colors"
            style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
            onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
            onBlur={e => (e.target.style.borderColor = '#ddd6c8')}
          />
          <button type="button" onClick={handleAddCategory} className="inline-flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium" style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}>
            <Plus size={14} />Add
          </button>
        </div>
      </section>

      {/* 4. Organisations — super_admin only */}
      {isSuperAdmin && (
        <section className="bg-white rounded-xl border p-6" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
          <SectionHeading title="Organisations" />
          <p className="text-xs mb-4" style={{ color: '#5a5a5a' }}>
            All subscribed facilities. Go to the <strong>Super Admin portal</strong> for full facility management.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd6c8' }}>
                  {['Facility', 'Contact Email', 'Residents', 'Documents', 'Created', ''].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-medium" style={{ color: '#5a5a5a' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orgs.map(org => (
                  <tr key={org.id} style={{ borderBottom: '0.5px solid #ddd6c8' }} className="transition-colors hover:bg-[#F5F0E8]">
                    <td className="py-3 px-3 font-medium" style={{ color: '#1a1a1a' }}>{org.name}</td>
                    <td className="py-3 px-3" style={{ color: '#5a5a5a' }}>{org.contactEmail ?? '—'}</td>
                    <td className="py-3 px-3 text-center" style={{ color: '#1a1a1a' }}>{org.residents}</td>
                    <td className="py-3 px-3 text-center" style={{ color: '#1a1a1a' }}>{org.documents}</td>
                    <td className="py-3 px-3" style={{ color: '#5a5a5a' }}>
                      {new Date(org.createdAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-3 px-3">
                      <button type="button" onClick={() => navigate(`/superadmin/facility/${org.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                        style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>

    {inviteOpen && user && (
      <InviteStaffModal
        orgId={user.orgId}
        onClose={() => setInviteOpen(false)}
        onSuccess={(member: NewMember) => {
          setStaff(prev => [...prev, member])
          setInviteOpen(false)
        }}
      />
    )}
    </>
  )
}
