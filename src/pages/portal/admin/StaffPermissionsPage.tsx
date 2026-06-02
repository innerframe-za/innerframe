import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/portal/PageHeader'
import { useUser } from '@/lib/auth/useUser'
import { createClient } from '@/lib/supabase/client'
import {
  updateStaffPermissions,
  useModulePermissions,
  type AppModule,
  type PermissionLevel,
} from '@/lib/permissions'

const MODULES: { module: AppModule; label: string; description: string }[] = [
  { module: 'admin',            label: 'Admin',            description: 'Facility settings and staff management' },
  { module: 'staff',            label: 'Staff',            description: 'Staff records and schedules' },
  { module: 'hr',               label: 'HR',               description: 'Human resources and payroll documents' },
  { module: 'board_governance', label: 'Board Governance', description: 'Board minutes and compliance documents' },
  { module: 'residence',        label: 'Residence',        description: 'Resident CRM and care plans' },
  { module: 'finance',          label: 'Finance',          description: 'Invoices, budgets, and financial reports' },
  { module: 'kitchen',          label: 'Kitchen',          description: 'Menus, orders, and dietary records' },
  { module: 'medical',          label: 'Medical',          description: 'Medical records and prescriptions' },
]

const LEVELS: { value: PermissionLevel; label: string; color: string }[] = [
  { value: 'none', label: 'No Access',  color: '#dc2626' },
  { value: 'view', label: 'View Only',  color: '#d97706' },
  { value: 'own',  label: 'Own Records', color: '#2563eb' },
  { value: 'full', label: 'Full Access', color: '#16a34a' },
]

function LevelBadge({ level }: { level: PermissionLevel }) {
  const def = LEVELS.find(l => l.value === level) ?? LEVELS[0]
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-xs font-medium"
      style={{ backgroundColor: `${def.color}15`, color: def.color, border: `1px solid ${def.color}30` }}
    >
      {def.label}
    </span>
  )
}

export default function StaffPermissionsPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { user: currentUser, loading: userLoading } = useUser()

  const [facilityId, setFacilityId] = useState<string | undefined>(undefined)
  const [targetMember, setTargetMember] = useState<{ fullName: string; email: string; role: string } | null>(null)
  const [targetLoading, setTargetLoading] = useState(true)

  const { permissions: callerPerms, loading: permsLoading } = useModulePermissions(facilityId, currentUser?.id)

  // Draft state — edited locally, saved on submit
  const [draft, setDraft] = useState<Record<AppModule, PermissionLevel>>({
    admin: 'none', staff: 'none', hr: 'none', board_governance: 'none',
    residence: 'none', finance: 'none', kitchen: 'none', medical: 'none',
  })
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // 1. Find the caller's facility where they are a full admin
  useEffect(() => {
    if (!currentUser) return

    const supabase = createClient()
    supabase
      .from('facility_memberships')
      .select('facility_id')
      .eq('user_id', currentUser.id)
      .eq('status', 'active')
      .eq('perm_admin', 'full')
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setFacilityId(data.facility_id)
      })
  }, [currentUser])

  // 2. Load target staff member's current membership permissions + profile
  useEffect(() => {
    if (!userId || !facilityId) return

    const supabase = createClient()

    Promise.all([
      supabase
        .from('facility_memberships')
        .select('role, perm_admin, perm_staff, perm_hr, perm_board, perm_residence, perm_finance, perm_kitchen, perm_medical')
        .eq('facility_id', facilityId)
        .eq('user_id', userId)
        .single(),
      supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single(),
    ]).then(([memberRes, profileRes]) => {
      if (!memberRes.data) { setTargetLoading(false); return }

      setTargetMember({
        fullName: profileRes.data?.full_name ?? 'Unknown',
        email:    profileRes.data?.email     ?? '',
        role:     memberRes.data.role,
      })
      setDraft({
        admin:            memberRes.data.perm_admin     as PermissionLevel,
        staff:            memberRes.data.perm_staff     as PermissionLevel,
        hr:               memberRes.data.perm_hr        as PermissionLevel,
        board_governance: memberRes.data.perm_board     as PermissionLevel,
        residence:        memberRes.data.perm_residence as PermissionLevel,
        finance:          memberRes.data.perm_finance   as PermissionLevel,
        kitchen:          memberRes.data.perm_kitchen   as PermissionLevel,
        medical:          memberRes.data.perm_medical   as PermissionLevel,
      })
      setTargetLoading(false)
    }).catch(() => setTargetLoading(false))
  }, [userId, facilityId])

  const isLoading = userLoading || permsLoading || targetLoading

  // Redirect if not an admin
  const isNotAdmin = !isLoading && callerPerms?.perm_admin !== 'full'
  useEffect(() => {
    if (isNotAdmin) navigate('/dashboard', { replace: true })
  }, [isNotAdmin, navigate])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!facilityId || !userId) return

    setSaveStatus('saving')
    try {
      await updateStaffPermissions(facilityId, userId, draft)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2500)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="w-6 h-6 rounded-full border-2 animate-spin"
          style={{ borderColor: 'rgba(30,58,47,0.2)', borderTopColor: '#1E3A2F' }} />
      </div>
    )
  }

  if (!targetMember) {
    return (
      <div className="max-w-2xl mx-auto">
        <PageHeader title="Staff Permissions" subtitle="Staff member not found in this facility." />
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm px-4 py-2 rounded"
          style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
        >
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Edit Permissions"
        subtitle={`Module access for ${targetMember.fullName}`}
      />

      {/* Member card */}
      <div
        className="flex items-center gap-4 bg-white rounded-xl border p-5 mb-6"
        style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
          style={{ backgroundColor: '#1E3A2F' }}
          aria-hidden="true"
        >
          {targetMember.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-medium" style={{ color: '#1a1a1a' }}>{targetMember.fullName}</p>
          <p className="text-sm" style={{ color: '#5a5a5a' }}>
            {targetMember.email}
            {' · '}
            <span className="capitalize">{targetMember.role.replace('_', ' ')}</span>
          </p>
        </div>
      </div>

      {/* Permission editor */}
      <form onSubmit={handleSave}>
        <div
          className="bg-white rounded-xl border p-6 mb-6"
          style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}
        >
          <div className="mb-5">
            <h2 className="text-base font-medium" style={{ color: '#1E3A2F' }}>Module Permissions</h2>
            <div style={{ width: '36px', height: '2px', backgroundColor: '#D4AF37', marginTop: '4px' }} aria-hidden="true" />
          </div>

          <div className="space-y-3">
            {MODULES.map(({ module, label, description }) => (
              <div
                key={module}
                className="flex items-center justify-between gap-4 p-3 rounded-lg"
                style={{ backgroundColor: '#fafaf9', border: '0.5px solid #ddd6c8' }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{label}</p>
                  <p className="text-xs" style={{ color: '#5a5a5a' }}>{description}</p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <LevelBadge level={draft[module]} />
                  <select
                    value={draft[module]}
                    onChange={e => setDraft(prev => ({ ...prev, [module]: e.target.value as PermissionLevel }))}
                    className="text-sm rounded border px-2 py-1 outline-none transition-colors"
                    style={{ borderColor: '#ddd6c8', color: '#1a1a1a', minWidth: '130px' }}
                    onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                    onBlur={e => (e.target.style.borderColor = '#ddd6c8')}
                    aria-label={`${label} permission level`}
                  >
                    {LEVELS.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm px-4 py-2.5 rounded border transition-colors"
            style={{ borderColor: '#ddd6c8', color: '#5a5a5a' }}
            onMouseEnter={e => { const b = e.currentTarget; b.style.borderColor = '#1E3A2F'; b.style.color = '#1E3A2F' }}
            onMouseLeave={e => { const b = e.currentTarget; b.style.borderColor = '#ddd6c8'; b.style.color = '#5a5a5a' }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saveStatus === 'saving'}
            className="text-sm px-5 py-2.5 rounded font-medium transition-colors disabled:opacity-60"
            style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2D5A3D'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1E3A2F'}
          >
            {saveStatus === 'saving' ? 'Saving…'
              : saveStatus === 'saved'  ? 'Saved!'
              : saveStatus === 'error'  ? 'Error — try again'
              : 'Save Permissions'}
          </button>
        </div>
      </form>

      {/* Audit note */}
      <p className="text-xs mt-4 text-center" style={{ color: '#5a5a5a' }}>
        All permission changes are logged to the facility audit trail.
      </p>
    </div>
  )
}
