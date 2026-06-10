import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser, type UserRole } from '@/lib/auth/useUser'
import { DocumentRow } from './DocumentRow'
import { UploadModal } from './UploadModal'
import {
  Plus, X, UserCheck, Phone, Mail, Calendar,
  Save, Trash2, ChevronDown, Upload, FileText,
  Hash, StickyNote, Briefcase,
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

type Doc = {
  id: string
  file_name: string
  file_url: string
  title: string | null
  pillar: string
  created_at: string
  is_global: boolean
  category_id: string | null
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

// ── Helpers ────────────────────────────────────────────────────────

// Must be at module scope — defining inside a component causes remount on every keystroke
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

function initials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

// ── Add Staff modal (create only) ──────────────────────────────────

function AddStaffModal({
  open, onClose, onSaved, orgId,
}: {
  open: boolean
  onClose: () => void
  onSaved: (member: StaffMember) => void
  orgId: string
}) {
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) { setDraft(EMPTY_DRAFT); setError(null) }
  }, [open])

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
      const { data, error: err } = await supabase
        .from('staff_members').insert(payload).select().single()
      if (err) throw err
      onSaved(data as StaffMember)
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
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#ddd6c8' }}>
          <h2 className="text-base font-semibold" style={{ color: '#1E3A2F' }}>Add Staff Member</h2>
          <button type="button" onClick={onClose} aria-label="Close"><X size={18} style={{ color: '#5a5a5a' }} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <F label="Full Name *">
                <input className={inputCls} style={inputStyle} value={draft.full_name}
                  onChange={e => set('full_name', e.target.value)} placeholder="e.g. Thandi Dlamini"
                  onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                  onBlur={e => (e.target.style.borderColor = '#ddd6c8')} />
              </F>
            </div>
            <F label="Role">
              <select className={inputCls} style={inputStyle} value={draft.role} onChange={e => set('role', e.target.value)}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </F>
            <F label="Employment Status">
              <select className={inputCls} style={inputStyle} value={draft.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </select>
            </F>
            <F label="SA ID Number">
              <input className={inputCls} style={inputStyle} value={draft.id_number}
                onChange={e => set('id_number', e.target.value.replace(/\D/g, '').slice(0, 13))}
                placeholder="13-digit SA ID"
                onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                onBlur={e => (e.target.style.borderColor = '#ddd6c8')} />
            </F>
            <F label="Employment Date">
              <input type="date" className={inputCls} style={inputStyle} value={draft.employment_date}
                onChange={e => set('employment_date', e.target.value)}
                onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                onBlur={e => (e.target.style.borderColor = '#ddd6c8')} />
            </F>
            <F label="Phone Number">
              <input className={inputCls} style={inputStyle} value={draft.phone}
                onChange={e => set('phone', e.target.value)} placeholder="e.g. 082 555 0123"
                onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                onBlur={e => (e.target.style.borderColor = '#ddd6c8')} />
            </F>
            <F label="Email Address">
              <input type="email" className={inputCls} style={inputStyle} value={draft.email}
                onChange={e => set('email', e.target.value)} placeholder="e.g. thandi@facility.co.za"
                onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                onBlur={e => (e.target.style.borderColor = '#ddd6c8')} />
            </F>
            <div className="sm:col-span-2">
              <F label="Notes">
                <textarea rows={2} className={`${inputCls} resize-none`} style={inputStyle} value={draft.notes}
                  onChange={e => set('notes', e.target.value)} placeholder="Any additional notes…"
                  onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                  onBlur={e => (e.target.style.borderColor = '#ddd6c8')} />
              </F>
            </div>
          </div>
          {error && <p className="mt-3 text-xs" style={{ color: '#dc2626' }}>{error}</p>}
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-2" style={{ borderColor: '#ddd6c8' }}>
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded border text-sm" style={{ borderColor: '#ddd6c8', color: '#5a5a5a' }}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={saving}
            className="px-4 py-2 rounded text-sm font-medium"
            style={{ backgroundColor: '#1E3A2F', color: '#ffffff', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Add Staff Member'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Staff Drawer ───────────────────────────────────────────────────
// Side panel that opens when a staff row is clicked.
// Has two tabs: Details (view/edit) and Documents (list + upload).

function StaffDrawer({
  member, onClose, onSaved, onDeleted, orgId, userRole,
}: {
  member: StaffMember | null
  onClose: () => void
  onSaved: (m: StaffMember) => void
  onDeleted: (id: string) => void
  orgId: string
  userRole?: UserRole
}) {
  const [tab, setTab] = useState<'details' | 'documents'>('details')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Partial<StaffMember>>({})
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const [documents, setDocuments] = useState<Doc[]>([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)

  const [deleting, setDeleting] = useState(false)

  // Reset when member changes
  useEffect(() => {
    setTab('details')
    setEditing(false)
    setDraft({})
    setDocuments([])
    setEditError(null)
  }, [member?.id])

  // Load docs when tab switches to documents
  useEffect(() => {
    if (tab !== 'documents' || !member) return
    setDocsLoading(true)
    const supabase = createClient()
    supabase
      .from('documents_legacy')
      .select('*')
      .eq('staff_member_id', member.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setDocuments((data ?? []) as Doc[])
        setDocsLoading(false)
      })
  }, [tab, member?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const open = member !== null
  const display = editing ? { ...member, ...draft } as StaffMember : member

  const startEdit = () => {
    if (!member) return
    setDraft({ ...member })
    setEditing(true)
    setEditError(null)
  }

  const cancelEdit = () => { setEditing(false); setDraft({}); setEditError(null) }

  const set = (k: keyof StaffMember, v: string) =>
    setDraft(d => ({ ...d, [k]: v || null }))

  const saveEdit = async () => {
    if (!member || !draft.full_name?.trim()) { setEditError('Full name is required.'); return }
    setSaving(true)
    setEditError(null)
    const supabase = createClient()
    try {
      const { data, error: err } = await supabase
        .from('staff_members')
        .update({ ...draft, updated_at: new Date().toISOString() })
        .eq('id', member.id)
        .select()
        .single()
      if (err) throw err
      onSaved(data as StaffMember)
      setEditing(false)
      setDraft({})
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!member) return
    if (!window.confirm(`Remove ${member.full_name}? This cannot be undone.`)) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('staff_members').delete().eq('id', member.id)
    onDeleted(member.id)
    onClose()
  }

  const handleDocDelete = async (docId: string, fileUrl: string) => {
    if (!window.confirm('Delete this document? This cannot be undone.')) return
    const supabase = createClient()
    const { error } = await supabase.from('documents_legacy').delete().eq('id', docId)
    if (error) { alert('Could not delete: ' + error.message); return }
    await supabase.storage.from('documents').remove([fileUrl])
    setDocuments(prev => prev.filter(d => d.id !== docId))
  }

  const inputCls = "w-full text-sm border rounded px-2.5 py-1.5 outline-none"
  const inputStyle = { borderColor: '#ddd6c8', color: '#1a1a1a' }

  if (!open || !display) return null

  const rc = ROLE_COLOURS[display.role]
  const sc = STATUS_CONFIG[display.status]
  const roleLabel = ROLES.find(r => r.value === display.role)?.label ?? display.role

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className="fixed inset-y-0 right-0 z-50 flex flex-col bg-white shadow-2xl"
        style={{ width: 'min(520px, 100vw)', borderLeft: '1px solid #ddd6c8' }}
        role="dialog"
        aria-modal="true"
        aria-label={`Staff member: ${display.full_name}`}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 py-5 border-b flex-shrink-0" style={{ borderColor: '#ddd6c8' }}>
          <div className="flex items-center gap-4 min-w-0">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
              style={{ backgroundColor: '#1E3A2F' }}
              aria-hidden="true"
            >
              {initials(display.full_name)}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold truncate" style={{ color: '#1a1a1a' }}>
                {display.full_name}
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
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
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 flex-shrink-0 ml-2">
            <X size={18} style={{ color: '#5a5a5a' }} />
          </button>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex border-b flex-shrink-0" style={{ borderColor: '#ddd6c8' }}>
          {(['details', 'documents'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => { if (editing && t !== 'details') return; setTab(t) }}
              className="flex-1 py-3 text-sm font-medium capitalize transition-colors"
              style={{
                color: tab === t ? '#1E3A2F' : '#5a5a5a',
                borderBottom: tab === t ? '2px solid #1E3A2F' : '2px solid transparent',
              }}
            >
              {t === 'documents' ? 'Documents' : 'Details'}
            </button>
          ))}
        </div>

        {/* ── Tab body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Details tab ── */}
          {tab === 'details' && (
            <div className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Full Name */}
                <div className="sm:col-span-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Briefcase size={12} style={{ color: '#5a5a5a' }} aria-hidden="true" />
                    <span className="text-xs" style={{ color: '#5a5a5a' }}>Full Name</span>
                  </div>
                  {editing ? (
                    <input className={inputCls} style={inputStyle} value={draft.full_name ?? ''}
                      onChange={e => set('full_name', e.target.value)}
                      onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                      onBlur={e => (e.target.style.borderColor = '#ddd6c8')} />
                  ) : (
                    <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{display.full_name}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <UserCheck size={12} style={{ color: '#5a5a5a' }} aria-hidden="true" />
                    <span className="text-xs" style={{ color: '#5a5a5a' }}>Role</span>
                  </div>
                  {editing ? (
                    <select className={inputCls} style={inputStyle}
                      value={(draft.role ?? display.role) as string}
                      onChange={e => set('role', e.target.value)}>
                      {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: rc.bg, color: rc.color }}>
                      {roleLabel}
                    </span>
                  )}
                </div>

                {/* Status */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs" style={{ color: '#5a5a5a' }}>Status</span>
                  </div>
                  {editing ? (
                    <select className={inputCls} style={inputStyle}
                      value={(draft.status ?? display.status) as string}
                      onChange={e => set('status', e.target.value)}>
                      <option value="active">Active</option>
                      <option value="on_leave">On Leave</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: sc.bg, color: sc.color }}>
                      {sc.label}
                    </span>
                  )}
                </div>

                {/* ID Number */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Hash size={12} style={{ color: '#5a5a5a' }} aria-hidden="true" />
                    <span className="text-xs" style={{ color: '#5a5a5a' }}>SA ID Number</span>
                  </div>
                  {editing ? (
                    <input className={inputCls} style={inputStyle}
                      value={draft.id_number ?? ''}
                      onChange={e => set('id_number', e.target.value.replace(/\D/g, '').slice(0, 13))}
                      placeholder="13-digit SA ID"
                      onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                      onBlur={e => (e.target.style.borderColor = '#ddd6c8')} />
                  ) : (
                    <p className="text-sm font-medium font-mono" style={{ color: display.id_number ? '#1a1a1a' : '#9ca3af' }}>
                      {display.id_number || '—'}
                    </p>
                  )}
                </div>

                {/* Employment Date */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar size={12} style={{ color: '#5a5a5a' }} aria-hidden="true" />
                    <span className="text-xs" style={{ color: '#5a5a5a' }}>Employment Date</span>
                  </div>
                  {editing ? (
                    <input type="date" className={inputCls} style={inputStyle}
                      value={draft.employment_date ?? ''}
                      onChange={e => set('employment_date', e.target.value)}
                      onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                      onBlur={e => (e.target.style.borderColor = '#ddd6c8')} />
                  ) : (
                    <p className="text-sm font-medium" style={{ color: display.employment_date ? '#1a1a1a' : '#9ca3af' }}>
                      {formatDate(display.employment_date)}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Phone size={12} style={{ color: '#5a5a5a' }} aria-hidden="true" />
                    <span className="text-xs" style={{ color: '#5a5a5a' }}>Phone</span>
                  </div>
                  {editing ? (
                    <input className={inputCls} style={inputStyle}
                      value={draft.phone ?? ''}
                      onChange={e => set('phone', e.target.value)}
                      placeholder="e.g. 082 555 0123"
                      onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                      onBlur={e => (e.target.style.borderColor = '#ddd6c8')} />
                  ) : (
                    <p className="text-sm font-medium" style={{ color: display.phone ? '#1a1a1a' : '#9ca3af' }}>
                      {display.phone
                        ? <a href={`tel:${display.phone}`} style={{ color: '#2563eb' }}>{display.phone}</a>
                        : '—'}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Mail size={12} style={{ color: '#5a5a5a' }} aria-hidden="true" />
                    <span className="text-xs" style={{ color: '#5a5a5a' }}>Email</span>
                  </div>
                  {editing ? (
                    <input type="email" className={inputCls} style={inputStyle}
                      value={draft.email ?? ''}
                      onChange={e => set('email', e.target.value)}
                      placeholder="e.g. thandi@facility.co.za"
                      onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                      onBlur={e => (e.target.style.borderColor = '#ddd6c8')} />
                  ) : (
                    <p className="text-sm font-medium" style={{ color: display.email ? '#1a1a1a' : '#9ca3af' }}>
                      {display.email
                        ? <a href={`mailto:${display.email}`} style={{ color: '#2563eb' }}>{display.email}</a>
                        : '—'}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <StickyNote size={12} style={{ color: '#5a5a5a' }} aria-hidden="true" />
                    <span className="text-xs" style={{ color: '#5a5a5a' }}>Notes</span>
                  </div>
                  {editing ? (
                    <textarea rows={3} className={`${inputCls} resize-none`} style={inputStyle}
                      value={draft.notes ?? ''}
                      onChange={e => set('notes', e.target.value)}
                      placeholder="Any additional notes…"
                      onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                      onBlur={e => (e.target.style.borderColor = '#ddd6c8')} />
                  ) : (
                    <p className="text-sm" style={{ color: display.notes ? '#1a1a1a' : '#9ca3af' }}>
                      {display.notes || '—'}
                    </p>
                  )}
                </div>
              </div>

              {editError && <p className="text-xs" style={{ color: '#dc2626' }}>{editError}</p>}
            </div>
          )}

          {/* ── Documents tab ── */}
          {tab === 'documents' && (
            <div className="px-6 py-5">
              {docsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <span className="w-5 h-5 rounded-full border-2 animate-spin"
                    style={{ borderColor: 'rgba(30,58,47,0.2)', borderTopColor: '#1E3A2F' }} />
                </div>
              ) : documents.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText size={32} className="mx-auto mb-3" style={{ color: '#ddd6c8' }} />
                  <p className="text-sm font-medium mb-1" style={{ color: '#5a5a5a' }}>No documents yet</p>
                  <p className="text-xs mb-4" style={{ color: '#9ca3af' }}>Upload employment contracts, certificates, or other HR files.</p>
                  <button
                    type="button"
                    onClick={() => setUploadOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-medium"
                    style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
                  >
                    <Upload size={13} />Upload Document
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map(doc => (
                    <DocumentRow
                      key={doc.id}
                      fileName={doc.file_name}
                      fileUrl={doc.file_url}
                      title={doc.title ?? undefined}
                      pillar={doc.pillar}
                      date={formatDate(doc.created_at)}
                      isGlobal={doc.is_global}
                      canDelete={true}
                      onDelete={() => handleDocDelete(doc.id, doc.file_url)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t flex-shrink-0" style={{ borderColor: '#ddd6c8', backgroundColor: '#fafaf8' }}>
          {/* Left: delete */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium"
            style={{ borderColor: '#fecaca', color: '#dc2626', opacity: deleting ? 0.7 : 1 }}
          >
            <Trash2 size={12} />{deleting ? 'Removing…' : 'Remove Staff Member'}
          </button>

          {/* Right: contextual actions */}
          {tab === 'details' ? (
            editing ? (
              <div className="flex items-center gap-2">
                <button type="button" onClick={cancelEdit}
                  className="px-3 py-1.5 rounded border text-xs font-medium"
                  style={{ borderColor: '#ddd6c8', color: '#5a5a5a' }}>
                  Cancel
                </button>
                <button type="button" onClick={saveEdit} disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-medium"
                  style={{ backgroundColor: '#1E3A2F', color: '#ffffff', opacity: saving ? 0.7 : 1 }}>
                  <Save size={12} />{saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <button type="button" onClick={startEdit}
                className="px-4 py-1.5 rounded border text-xs font-medium"
                style={{ borderColor: '#1E3A2F', color: '#1E3A2F' }}>
                Edit Details
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-medium"
              style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
            >
              <Upload size={12} />Upload Document
            </button>
          )}
        </div>
      </div>

      {/* Upload modal — pre-linked to this staff member */}
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        orgId={orgId}
        userRole={userRole}
        preselectedStaffMemberId={member?.id}
        defaultPillar="hr"
        onSuccess={() => {
          setUploadOpen(false)
          // Reload docs
          if (!member) return
          const supabase = createClient()
          supabase
            .from('documents_legacy')
            .select('*')
            .eq('staff_member_id', member.id)
            .order('created_at', { ascending: false })
            .then(({ data }) => setDocuments((data ?? []) as Doc[]))
        }}
      />
    </>
  )
}

// ── Main section ───────────────────────────────────────────────────

export function HRStaffSection() {
  const { user } = useUser()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState<StaffRole | 'all'>('all')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null)
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
    // Keep the drawer open with updated data
    setSelectedMember(member)
  }

  const handleDeleted = (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id))
    setSelectedMember(null)
  }

  const filtered = roleFilter === 'all'
    ? staff
    : staff.filter(s => s.role === roleFilter)

  const countFor = (role: StaffRole | 'all') =>
    role === 'all' ? staff.length : staff.filter(s => s.role === role).length

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
          onClick={() => setAddModalOpen(true)}
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
            <button type="button" onClick={() => setAddModalOpen(true)} className="mt-2 text-xs underline" style={{ color: '#1E3A2F' }}>
              Add your first staff member
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#ddd6c8' }}>
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1fr_120px_120px_130px_80px] gap-4 px-5 py-3 border-b text-xs font-medium"
            style={{ borderColor: '#ddd6c8', color: '#5a5a5a', backgroundColor: '#fafaf8' }}>
            <span>Name</span>
            <span>Role</span>
            <span>Phone</span>
            <span>Start Date</span>
            <span>Status</span>
          </div>

          {/* Rows */}
          <div className="divide-y" style={{ borderColor: '#f0ece3' }}>
            {filtered.map((member, index) => {
              const rc = ROLE_COLOURS[member.role]
              const sc = STATUS_CONFIG[member.status]
              const roleLabel = ROLES.find(r => r.value === member.role)?.label ?? member.role
              const baseBg = index % 2 === 0 ? '#ffffff' : '#fafaf9'
              const isExpanded = expandedId === member.id

              return (
                <div key={member.id}>
                  {/* Desktop row — full row is clickable */}
                  <button
                    type="button"
                    className="hidden sm:grid w-full grid-cols-[1fr_120px_120px_130px_80px] gap-4 px-5 py-3.5 items-center text-left transition-colors"
                    style={{ backgroundColor: baseBg }}
                    onClick={() => setSelectedMember(member)}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(30,58,47,0.04)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = baseBg)}
                  >
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
                  </button>

                  {/* Mobile card row — full card is clickable */}
                  <div className="sm:hidden">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                      style={{ backgroundColor: baseBg }}
                      onClick={() => setSelectedMember(member)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                          style={{ backgroundColor: '#1E3A2F' }}
                          aria-hidden="true"
                        >
                          {initials(member.full_name)}
                        </div>
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
                      <ChevronDown size={15} style={{ color: '#5a5a5a', flexShrink: 0 }} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add staff modal */}
      <AddStaffModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSaved={member => {
          handleSaved(member)
          setAddModalOpen(false)
        }}
        orgId={user?.orgId ?? ''}
      />

      {/* Staff detail drawer */}
      <StaffDrawer
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
        orgId={user?.orgId ?? ''}
        userRole={user?.role}
      />
    </div>
  )
}
