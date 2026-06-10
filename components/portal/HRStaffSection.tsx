import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/auth/useUser'
import {
  Plus, X, UserCheck, Phone, Mail, Calendar,
  Edit2, Trash2, ChevronDown,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────

type StaffRole =
  | 'nurse' | 'care_worker' | 'cook' | 'cleaning' | 'admin'
  | 'management' | 'security' | 'maintenance' | 'physiotherapist'
  | 'social_worker' | 'other'

type StaffStatus = 'active' | 'on_leave' | 'terminated'

type StaffMember = {
  id: string
  org_id: string
  full_name: string
  role: StaffRole
  id_number: string | null
  phone: string | null
  email: string | null
  employment_date: string | null
  status: StaffStatus
  notes: string | null
  created_at: string
}

// ── Constants ──────────────────────────────────────────────────────

const ROLES: { value: StaffRole; label: string }[] = [
  { value: 'nurse',           label: 'Nurse' },
  { value: 'care_worker',     label: 'Care Worker' },
  { value: 'cook',            label: 'Cook' },
  { value: 'cleaning',        label: 'Cleaning' },
  { value: 'admin',           label: 'Admin' },
  { value: 'management',      label: 'Management' },
  { value: 'security',        label: 'Security' },
  { value: 'maintenance',     label: 'Maintenance' },
  { value: 'physiotherapist', label: 'Physiotherapist' },
  { value: 'social_worker',   label: 'Social Worker' },
  { value: 'other',           label: 'Other' },
]

const ROLE_COLOURS: Record<StaffRole, { bg: string; color: string }> = {
  nurse:           { bg: 'rgba(37,99,235,0.1)',   color: '#2563eb' },
  care_worker:     { bg: 'rgba(22,163,74,0.1)',   color: '#16a34a' },
  cook:            { bg: 'rgba(234,88,12,0.1)',   color: '#ea580c' },
  cleaning:        { bg: 'rgba(124,58,237,0.1)',  color: '#7c3aed' },
  admin:           { bg: 'rgba(30,58,47,0.1)',    color: '#1E3A2F' },
  management:      { bg: 'rgba(212,175,55,0.15)', color: '#b45309' },
  security:        { bg: 'rgba(220,38,38,0.1)',   color: '#dc2626' },
  maintenance:     { bg: 'rgba(100,116,139,0.1)', color: '#475569' },
  physiotherapist: { bg: 'rgba(20,184,166,0.1)',  color: '#0d9488' },
  social_worker:   { bg: 'rgba(168,85,247,0.1)',  color: '#9333ea' },
  other:           { bg: 'rgba(90,90,90,0.1)',    color: '#5a5a5a' },
}

const STATUS_CONFIG: Record<StaffStatus, { label: string; color: string; bg: string }> = {
  active:     { label: 'Active',      color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
  on_leave:   { label: 'On Leave',    color: '#ca8a04', bg: 'rgba(202,138,4,0.1)' },
  terminated: { label: 'Terminated',  color: '#dc2626', bg: 'rgba(220,38,38,0.08)' },
}

const EMPTY_DRAFT = {
  full_name: '', role: 'nurse' as StaffRole, id_number: '', phone: '',
  email: '', employment_date: '', status: 'active' as StaffStatus, notes: '',
}

// Must be at module scope — defining inside StaffModal causes remount on every keystroke
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: '#5a5a5a' }}>{label}</label>
      {children}
    </div>
  )
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Add / Edit modal ───────────────────────────────────────────────

function StaffModal({
  open, onClose, onSaved, orgId, editing,
}: {
  open: boolean
  onClose: () => void
  onSaved: (member: StaffMember) => void
  orgId: string
  editing: StaffMember | null
}) {
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (editing) {
      setDraft({
        full_name:       editing.full_name,
        role:            editing.role,
        id_number:       editing.id_number ?? '',
        phone:           editing.phone ?? '',
        email:           editing.email ?? '',
        employment_date: editing.employment_date ?? '',
        status:          editing.status,
        notes:           editing.notes ?? '',
      })
    } else {
      setDraft(EMPTY_DRAFT)
    }
    setError(null)
  }, [editing, open])

  if (!open) return null

  const set = (k: keyof typeof EMPTY_DRAFT, v: string) =>
    setDraft(d => ({ ...d, [k]: v }))

  const handleSave = async () => {
    if (!draft.full_name.trim()) { setError('Full name is required.'); return }
    setSaving(true)
    setError(null)
    const supabase = createClient()

    const payload = {
      org_id:          orgId,
      full_name:       draft.full_name.trim(),
      role:            draft.role,
      id_number:       draft.id_number || null,
      phone:           draft.phone || null,
      email:           draft.email || null,
      employment_date: draft.employment_date || null,
      status:          draft.status,
      notes:           draft.notes || null,
      updated_at:      new Date().toISOString(),
    }

    try {
      if (editing) {
        const { data, error: err } = await supabase
          .from('staff_members')
          .update(payload)
          .eq('id', editing.id)
          .select()
          .single()
        if (err) throw err
        onSaved(data as StaffMember)
      } else {
        const { data, error: err } = await supabase
          .from('staff_members')
          .insert(payload)
          .select()
          .single()
        if (err) throw err
        onSaved(data as StaffMember)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = "w-full text-sm border rounded px-2.5 py-1.5 outline-none"
  const inputStyle = { borderColor: '#ddd6c8', color: '#1a1a1a' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#ddd6c8' }}>
          <h2 className="text-base font-semibold" style={{ color: '#1E3A2F' }}>
            {editing ? 'Edit Staff Member' : 'Add Staff Member'}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={18} style={{ color: '#5a5a5a' }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <F label="Full Name *">
                <input className={inputCls} style={inputStyle} value={draft.full_name}
                  onChange={e => set('full_name', e.target.value)}
                  placeholder="e.g. Thandi Dlamini"
                  onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                  onBlur={e => (e.target.style.borderColor = '#ddd6c8')} />
              </F>
            </div>

            <F label="Role">
              <select className={inputCls} style={inputStyle}
                value={draft.role} onChange={e => set('role', e.target.value)}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </F>

            <F label="Employment Status">
              <select className={inputCls} style={inputStyle}
                value={draft.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </select>
            </F>

            <F label="SA ID Number">
              <input className={inputCls} style={inputStyle}
                value={draft.id_number}
                onChange={e => set('id_number', e.target.value.replace(/\D/g, '').slice(0, 13))}
                placeholder="13-digit SA ID"
                onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                onBlur={e => (e.target.style.borderColor = '#ddd6c8')} />
            </F>

            <F label="Employment Date">
              <input type="date" className={inputCls} style={inputStyle}
                value={draft.employment_date}
                onChange={e => set('employment_date', e.target.value)}
                onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                onBlur={e => (e.target.style.borderColor = '#ddd6c8')} />
            </F>

            <F label="Phone Number">
              <input className={inputCls} style={inputStyle}
                value={draft.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="e.g. 082 555 0123"
                onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                onBlur={e => (e.target.style.borderColor = '#ddd6c8')} />
            </F>

            <F label="Email Address">
              <input type="email" className={inputCls} style={inputStyle}
                value={draft.email}
                onChange={e => set('email', e.target.value)}
                placeholder="e.g. thandi@facility.co.za"
                onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                onBlur={e => (e.target.style.borderColor = '#ddd6c8')} />
            </F>

            <div className="sm:col-span-2">
              <F label="Notes">
                <textarea rows={2} className={`${inputCls} resize-none`} style={inputStyle}
                  value={draft.notes}
                  onChange={e => set('notes', e.target.value)}
                  placeholder="Any additional notes…"
                  onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                  onBlur={e => (e.target.style.borderColor = '#ddd6c8')} />
              </F>
            </div>
          </div>
          {error && <p className="mt-3 text-xs" style={{ color: '#dc2626' }}>{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-2" style={{ borderColor: '#ddd6c8' }}>
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded border text-sm" style={{ borderColor: '#ddd6c8', color: '#5a5a5a' }}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={saving}
            className="px-4 py-2 rounded text-sm font-medium"
            style={{ backgroundColor: '#1E3A2F', color: '#ffffff', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Staff Member'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main section ───────────────────────────────────────────────────

export function HRStaffSection() {
  const { user } = useUser()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState<StaffRole | 'all'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<StaffMember | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user?.orgId) return
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('staff_members')
      .select('*')
      .eq('org_id', user.orgId)
      .order('full_name')
    setStaff((data ?? []) as StaffMember[])
    setLoading(false)
  }, [user?.orgId])

  useEffect(() => { load() }, [load])

  const handleSaved = (member: StaffMember) => {
    setStaff(prev => {
      const exists = prev.find(s => s.id === member.id)
      return exists
        ? prev.map(s => s.id === member.id ? member : s)
        : [member, ...prev]
    })
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this staff member? This cannot be undone.')) return
    const supabase = createClient()
    await supabase.from('staff_members').delete().eq('id', id)
    setStaff(prev => prev.filter(s => s.id !== id))
  }

  const openAdd  = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (m: StaffMember) => { setEditing(m); setModalOpen(true) }

  const filtered = roleFilter === 'all'
    ? staff
    : staff.filter(s => s.role === roleFilter)

  // Role counts for filter pills
  const countFor = (role: StaffRole | 'all') =>
    role === 'all' ? staff.length : staff.filter(s => s.role === role).length

  // Only show roles that have members, plus "all"
  const activeRoles = ROLES.filter(r => countFor(r.value) > 0)

  return (
    <div className="mt-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck size={16} style={{ color: '#1E3A2F' }} />
            <h2 className="text-sm font-semibold" style={{ color: '#1E3A2F' }}>Staff Directory</h2>
          </div>
          <div style={{ width: '36px', height: '2px', backgroundColor: '#D4AF37', marginTop: '4px' }} />
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-medium"
          style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#2D5A3D')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#1E3A2F')}
        >
          <Plus size={14} />Add Staff Member
        </button>
      </div>

      {/* Role filter pills */}
      {staff.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {/* All pill */}
          <button
            type="button"
            onClick={() => setRoleFilter('all')}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{
              backgroundColor: roleFilter === 'all' ? '#1E3A2F' : 'rgba(30,58,47,0.07)',
              color: roleFilter === 'all' ? '#ffffff' : '#1E3A2F',
            }}
          >
            All ({staff.length})
          </button>
          {activeRoles.map(r => {
            const active = roleFilter === r.value
            const c = ROLE_COLOURS[r.value]
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setRoleFilter(r.value)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{
                  backgroundColor: active ? c.color : c.bg,
                  color: active ? '#ffffff' : c.color,
                }}
              >
                {r.label} ({countFor(r.value)})
              </button>
            )
          })}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="w-5 h-5 rounded-full border-2 animate-spin"
            style={{ borderColor: 'rgba(30,58,47,0.2)', borderTopColor: '#1E3A2F' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border py-12 text-center" style={{ borderColor: '#ddd6c8' }}>
          <UserCheck size={32} className="mx-auto mb-3" style={{ color: '#ddd6c8' }} />
          <p className="text-sm font-medium mb-1" style={{ color: '#5a5a5a' }}>
            {staff.length === 0 ? 'No staff members added yet' : `No ${ROLES.find(r => r.value === roleFilter)?.label ?? ''} staff found`}
          </p>
          {staff.length === 0 && (
            <button type="button" onClick={openAdd} className="mt-2 text-xs underline" style={{ color: '#1E3A2F' }}>
              Add your first staff member
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#ddd6c8' }}>
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1fr_120px_120px_130px_80px_72px] gap-4 px-5 py-3 border-b text-xs font-medium"
            style={{ borderColor: '#ddd6c8', color: '#5a5a5a', backgroundColor: '#fafaf8' }}>
            <span>Name</span>
            <span>Role</span>
            <span>Phone</span>
            <span>Start Date</span>
            <span>Status</span>
            <span />
          </div>

          {/* Rows */}
          <div className="divide-y" style={{ borderColor: '#f0ece3' }}>
            {filtered.map(member => {
              const rc = ROLE_COLOURS[member.role]
              const sc = STATUS_CONFIG[member.status]
              const roleLabel = ROLES.find(r => r.value === member.role)?.label ?? member.role
              const isExpanded = expandedId === member.id

              return (
                <div key={member.id}>
                  {/* Main row — desktop grid / mobile flex */}
                  <div className="hidden sm:grid grid-cols-[1fr_120px_120px_130px_80px_72px] gap-4 px-5 py-3.5 items-center hover:bg-[#fafaf8] transition-colors">
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{member.full_name}</p>
                      {member.email && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: '#5a5a5a' }}>{member.email}</p>
                      )}
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-fit"
                      style={{ backgroundColor: rc.bg, color: rc.color }}>
                      {roleLabel}
                    </span>
                    <span className="text-sm flex items-center gap-1.5" style={{ color: '#5a5a5a' }}>
                      {member.phone ? <><Phone size={11} />{member.phone}</> : '—'}
                    </span>
                    <span className="text-sm flex items-center gap-1.5" style={{ color: '#5a5a5a' }}>
                      {member.employment_date ? <><Calendar size={11} />{formatDate(member.employment_date)}</> : '—'}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-fit"
                      style={{ backgroundColor: sc.bg, color: sc.color }}>
                      {sc.label}
                    </span>
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => openEdit(member)}
                        className="p-1.5 rounded transition-colors"
                        style={{ color: '#5a5a5a' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#1E3A2F')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#5a5a5a')}
                        title="Edit">
                        <Edit2 size={13} />
                      </button>
                      <button type="button" onClick={() => handleDelete(member.id)}
                        className="p-1.5 rounded transition-colors"
                        style={{ color: '#5a5a5a' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#dc2626')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#5a5a5a')}
                        title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Mobile card row */}
                  <div className="sm:hidden">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                      onClick={() => setExpandedId(isExpanded ? null : member.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: '#1a1a1a' }}>{member.full_name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ backgroundColor: rc.bg, color: rc.color }}>
                              {roleLabel}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ backgroundColor: sc.bg, color: sc.color }}>
                              {sc.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronDown size={15} style={{ color: '#5a5a5a', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s cubic-bezier(0.23, 1, 0.32, 1)', flexShrink: 0 }} />
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-2 border-t" style={{ borderColor: '#f0ece3', backgroundColor: '#fafaf8' }}>
                        {member.phone && (
                          <p className="text-xs flex items-center gap-2" style={{ color: '#5a5a5a' }}>
                            <Phone size={11} />{member.phone}
                          </p>
                        )}
                        {member.email && (
                          <p className="text-xs flex items-center gap-2" style={{ color: '#5a5a5a' }}>
                            <Mail size={11} />{member.email}
                          </p>
                        )}
                        {member.employment_date && (
                          <p className="text-xs flex items-center gap-2" style={{ color: '#5a5a5a' }}>
                            <Calendar size={11} />Started {formatDate(member.employment_date)}
                          </p>
                        )}
                        {member.notes && (
                          <p className="text-xs" style={{ color: '#5a5a5a' }}>{member.notes}</p>
                        )}
                        <div className="flex gap-2 pt-1">
                          <button type="button" onClick={() => openEdit(member)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded border text-xs font-medium"
                            style={{ borderColor: '#ddd6c8', color: '#1E3A2F' }}>
                            <Edit2 size={11} />Edit
                          </button>
                          <button type="button" onClick={() => handleDelete(member.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded border text-xs font-medium"
                            style={{ borderColor: '#fecaca', color: '#dc2626' }}>
                            <Trash2 size={11} />Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <StaffModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        orgId={user?.orgId ?? ''}
        editing={editing}
      />
    </div>
  )
}
