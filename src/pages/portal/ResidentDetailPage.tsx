import { useState, useEffect, useCallback } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/portal/PageHeader'
import { DocumentRow } from '@/components/portal/DocumentRow'
import { UploadModal } from '@/components/portal/UploadModal'
import {
  User, Calendar, Home, Heart, Pill, Stethoscope, Phone,
  Mail, Users, MessageSquare, Plus, Edit2, Save, X,
  AlertCircle, Clock, Flag,
} from 'lucide-react'
import { apiGet, apiPatch, apiPost, apiDelete } from '@/lib/api/client'

// ── Types ──────────────────────────────────────────────────────────────────

type Resident = {
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
  created_at: string
}

type MedicalInfo = {
  allergies: string[]
  diagnoses: string[]
  medication_notes: string | null
  attending_doctor: string | null
  nok_consent_signed: boolean
  advance_directive: boolean
}

type Contact = {
  id: string
  name: string
  relationship: string | null
  phone: string | null
  email: string | null
  is_primary: boolean
  is_emergency: boolean
  is_billing_contact: boolean
  can_collect: boolean
}

type NoteType = 'general' | 'nursing' | 'behaviour' | 'nutrition' | 'physio' | 'incident'

type CareNote = {
  id: string
  note_type: NoteType
  body: string
  flagged: boolean
  author_user_id: string
  author_role: string
  created_at: string
}

type Document = {
  id: string
  title: string
  category: string
  content_type: string
  size_bytes: number
  status: string
  created_at: string
}

// ── Constants ──────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  active:     { dot: '#16a34a', label: 'Active',     color: '#15803d', bg: 'rgba(22,163,74,0.08)' },
  discharged: { dot: '#ca8a04', label: 'Discharged', color: '#a16207', bg: 'rgba(202,138,4,0.1)' },
  deceased:   { dot: '#5a5a5a', label: 'Deceased',   color: '#5a5a5a', bg: 'rgba(90,90,90,0.1)' },
}

const NOTE_COLORS: Record<NoteType, { bg: string; color: string; label: string }> = {
  general:   { bg: 'rgba(90,90,90,0.1)',      color: '#5a5a5a', label: 'General' },
  nursing:   { bg: 'rgba(37,99,235,0.1)',     color: '#2563eb', label: 'Nursing' },
  behaviour: { bg: 'rgba(124,58,237,0.1)',    color: '#7c3aed', label: 'Behaviour' },
  nutrition: { bg: 'rgba(22,163,74,0.1)',     color: '#16a34a', label: 'Nutrition' },
  physio:    { bg: 'rgba(212,175,55,0.12)',   color: '#b45309', label: 'Physio' },
  incident:  { bg: 'rgba(220,38,38,0.1)',     color: '#dc2626', label: 'Incident' },
}

// ── Helpers ────────────────────────────────────────────────────────────────

function Field({ icon: Icon, label, value, editing, onChange }: {
  icon: React.ElementType
  label: string
  value: string | null
  editing?: boolean
  onChange?: (v: string) => void
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={12} style={{ color: '#5a5a5a' }} aria-hidden="true" />
        <span className="text-xs" style={{ color: '#5a5a5a' }}>{label}</span>
      </div>
      {editing && onChange ? (
        <input
          className="w-full text-sm border rounded px-2 py-1 outline-none"
          style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
        />
      ) : (
        <p className="text-sm font-medium" style={{ color: value ? '#1a1a1a' : '#9ca3af' }}>
          {value || '—'}
        </p>
      )}
    </div>
  )
}

function formatDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Main component ──────────────────────────────────────────────────────────

export default function ResidentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [resident, setResident] = useState<Resident | null>(null)
  const [medical, setMedical] = useState<MedicalInfo | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [notes, setNotes] = useState<CareNote[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Active tab
  const [tab, setTab] = useState<'profile' | 'medical' | 'documents'>('profile')

  // Edit mode
  const [editing, setEditing] = useState(false)
  const [editDraft, setEditDraft] = useState<Partial<Resident>>({})
  const [saving, setSaving] = useState(false)

  // Note form
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteType, setNoteType] = useState<NoteType>('general')
  const [noteBody, setNoteBody] = useState('')
  const [noteFlagged, setNoteFlagged] = useState(false)
  const [noteSubmitting, setNoteSubmitting] = useState(false)

  // Contact form
  const [contactFormOpen, setContactFormOpen] = useState(false)
  const [contactDraft, setContactDraft] = useState({ name: '', relationship: '', email: '', phone: '', is_primary: false, is_emergency: true })
  const [contactSaving, setContactSaving] = useState(false)

  // Upload modal
  const [uploadOpen, setUploadOpen] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const [res, contactsRes, notesRes, docsRes] = await Promise.all([
        apiGet<Resident>(`/residents/${id}`),
        apiGet<Contact[]>(`/residents/${id}/contacts`),
        apiGet<CareNote[]>(`/residents/${id}/care-notes`),
        apiGet<Document[]>(`/residents/${id}/documents`),
      ])
      setResident(res)
      setContacts(contactsRes)
      setNotes(notesRes)
      setDocuments(docsRes)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('404') || msg.includes('not found')) setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [id])

  // Load medical separately when that tab opens (it's audited)
  const loadMedical = useCallback(async () => {
    if (!id || medical) return
    try {
      const data = await apiGet<MedicalInfo>(`/residents/${id}/medical`)
      setMedical(data)
    } catch { /* non-fatal */ }
  }, [id, medical])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (tab === 'medical') loadMedical()
  }, [tab, loadMedical])

  const handleDocDelete = async (docId: string) => {
    if (!window.confirm('Delete this document? This cannot be undone.')) return
    try {
      await apiDelete(`/documents/${docId}`)
      setDocuments(prev => prev.filter(d => d.id !== docId))
    } catch (err) {
      alert('Could not delete document: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  if (notFound) return <Navigate to="/residents" replace />

  if (loading || !resident) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-9 w-56 mb-2" />
        <div className="skeleton h-0.5 w-12 mb-8" />
        <div className="bg-white rounded-2xl border p-6 space-y-4" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
          <div className="skeleton h-4 w-32" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="skeleton h-2.5 w-16" />
                <div className="skeleton h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const sc = STATUS_CONFIG[resident.status]
  const fullName = `${resident.first_name} ${resident.last_name}`

  const startEdit = () => { setEditDraft({ ...resident }); setEditing(true) }
  const cancelEdit = () => { setEditDraft({}); setEditing(false) }
  const setField = (k: keyof Resident, v: string) => setEditDraft(d => ({ ...d, [k]: v || null }))

  const saveEdit = async () => {
    if (!id) return
    setSaving(true)
    try {
      await apiPatch(`/residents/${id}`, {
        first_name:   editDraft.first_name,
        last_name:    editDraft.last_name,
        preferred_name: editDraft.preferred_name || undefined,
        room_number:  editDraft.room_number || undefined,
        ward:         editDraft.ward || undefined,
      })
      setResident(r => r ? { ...r, ...editDraft } as Resident : r)
      setEditing(false)
    } catch (err) {
      alert('Save failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const submitNote = async () => {
    if (!noteBody.trim() || !id) return
    setNoteSubmitting(true)
    try {
      const note = await apiPost<CareNote>(`/residents/${id}/care-notes`, {
        note_type: noteType,
        body: noteBody.trim(),
        flagged: noteFlagged,
      })
      setNotes(n => [note, ...n])
      setNoteBody('')
      setNoteType('general')
      setNoteFlagged(false)
      setNoteOpen(false)
    } catch (err) {
      alert('Could not save note: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setNoteSubmitting(false)
    }
  }

  const submitContact = async () => {
    if (!contactDraft.name.trim() || !id) return
    setContactSaving(true)
    try {
      const contact = await apiPost<Contact>(`/residents/${id}/contacts`, {
        ...contactDraft,
        is_billing_contact: false,
        can_collect: false,
      })
      setContacts(c => [...c, contact])
      setContactDraft({ name: '', relationship: '', email: '', phone: '', is_primary: false, is_emergency: true })
      setContactFormOpen(false)
    } catch (err) {
      alert('Could not save contact: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setContactSaving(false)
    }
  }

  const display = editing ? { ...resident, ...editDraft } as Resident : resident

  return (
    <div className="space-y-4">
      <PageHeader
        title={editing ? `${editDraft.first_name ?? resident.first_name} ${editDraft.last_name ?? resident.last_name}` : fullName}
        subtitle={`${resident.resident_number} · Room ${resident.room_number ?? '—'} · Admitted ${formatDate(resident.admission_date) ?? '—'}`}
        action={
          editing ? (
            <div className="flex items-center gap-2">
              <button type="button" onClick={cancelEdit} className="px-3 py-2 rounded border text-sm font-medium flex items-center gap-1.5" style={{ borderColor: '#ddd6c8', color: '#5a5a5a' }}>
                <X size={13} />Cancel
              </button>
              <button type="button" onClick={saveEdit} disabled={saving} className="px-4 py-2 rounded text-sm font-medium flex items-center gap-1.5" style={{ backgroundColor: '#1E3A2F', color: '#ffffff', opacity: saving ? 0.7 : 1 }}>
                <Save size={13} />{saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          ) : (
            <button type="button" onClick={startEdit} className="px-4 py-2 rounded border text-sm font-medium flex items-center gap-1.5" style={{ borderColor: '#1E3A2F', color: '#1E3A2F' }}>
              <Edit2 size={13} />Edit Resident
            </button>
          )
        }
      />

      {/* ── Tab bar ── */}
      <div className="flex border-b overflow-x-auto" style={{ borderColor: '#ddd6c8' }}>
        {([
          { key: 'profile',   label: 'Profile & Contacts' },
          { key: 'medical',   label: 'Medical' },
          { key: 'documents', label: `Documents (${documents.length})` },
        ] as { key: typeof tab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className="px-5 py-3 text-sm font-medium relative whitespace-nowrap flex-shrink-0"
            style={{ color: tab === key ? '#1E3A2F' : '#5a5a5a' }}
          >
            {label}
            {tab === key && <span className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: '#D4AF37' }} />}
          </button>
        ))}
      </div>

      {/* ── Profile Tab ── */}
      {tab === 'profile' && (
        <>
          {/* Personal Details card */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold" style={{ color: '#1E3A2F' }}>Personal Details</h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: sc.bg, color: sc.color }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.dot }} aria-hidden="true" />
                {sc.label}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field icon={User}     label="First Name"       value={display.first_name}     editing={editing} onChange={v => setField('first_name', v)} />
              <Field icon={User}     label="Last Name"        value={display.last_name}      editing={editing} onChange={v => setField('last_name', v)} />
              <Field icon={User}     label="Preferred Name"   value={display.preferred_name} editing={editing} onChange={v => setField('preferred_name', v)} />
              <Field icon={Calendar} label="Date of Birth"    value={formatDate(display.date_of_birth)} />
              <Field icon={Home}     label="Room Number"      value={display.room_number}    editing={editing} onChange={v => setField('room_number', v)} />
              <Field icon={Home}     label="Ward"             value={display.ward}           editing={editing} onChange={v => setField('ward', v)} />
              <Field icon={Calendar} label="Admission Date"   value={formatDate(display.admission_date)} />
            </div>
          </div>

          {/* Contacts card */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold" style={{ color: '#1E3A2F' }}>Contact Persons</h2>
              <button
                type="button"
                onClick={() => setContactFormOpen(o => !o)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium"
                style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
              >
                <Plus size={12} />Add Contact
              </button>
            </div>

            {contactFormOpen && (
              <div className="mb-4 p-4 rounded-lg border grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ borderColor: '#ddd6c8', backgroundColor: '#fafaf8' }}>
                {([
                  { label: 'Full Name *', key: 'name' as const },
                  { label: 'Relationship', key: 'relationship' as const },
                  { label: 'Email', key: 'email' as const },
                  { label: 'Phone', key: 'phone' as const },
                ] as const).map(f => (
                  <div key={f.key}>
                    <label className="text-xs mb-1 block" style={{ color: '#5a5a5a' }}>{f.label}</label>
                    <input
                      className="w-full text-sm border rounded px-2 py-1.5 outline-none"
                      style={{ borderColor: '#ddd6c8' }}
                      value={(contactDraft[f.key] as string) ?? ''}
                      onChange={e => setContactDraft(d => ({ ...d, [f.key]: e.target.value }))}
                    />
                  </div>
                ))}
                <div className="sm:col-span-2 flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: '#5a5a5a' }}>
                    <input type="checkbox" checked={contactDraft.is_primary} onChange={e => setContactDraft(d => ({ ...d, is_primary: e.target.checked }))} />
                    Primary contact
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: '#5a5a5a' }}>
                    <input type="checkbox" checked={contactDraft.is_emergency} onChange={e => setContactDraft(d => ({ ...d, is_emergency: e.target.checked }))} />
                    Emergency contact
                  </label>
                </div>
                <div className="sm:col-span-2 flex gap-2 justify-end">
                  <button type="button" onClick={() => setContactFormOpen(false)} className="px-3 py-1.5 rounded border text-xs" style={{ borderColor: '#ddd6c8', color: '#5a5a5a' }}>Cancel</button>
                  <button type="button" onClick={submitContact} disabled={contactSaving} className="px-4 py-1.5 rounded text-xs font-medium" style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}>
                    {contactSaving ? 'Saving…' : 'Save Contact'}
                  </button>
                </div>
              </div>
            )}

            {contacts.length === 0 ? (
              <div className="py-8 text-center">
                <Users size={28} className="mx-auto mb-2" style={{ color: '#ddd6c8' }} />
                <p className="text-sm" style={{ color: '#9ca3af' }}>No contact persons recorded</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #ddd6c8' }}>
                      {['Name', 'Relationship', 'Email', 'Phone', 'Tags'].map(h => (
                        <th key={h} className="text-left pb-2 pr-4 text-xs font-medium" style={{ color: '#5a5a5a' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f5f0e8' }}>
                        <td className="py-2.5 pr-4 font-medium" style={{ color: '#1a1a1a' }}>{c.name}</td>
                        <td className="py-2.5 pr-4" style={{ color: '#5a5a5a' }}>{c.relationship ?? '—'}</td>
                        <td className="py-2.5 pr-4" style={{ color: '#5a5a5a' }}>
                          {c.email ? <a href={`mailto:${c.email}`} style={{ color: '#2563eb' }}>{c.email}</a> : '—'}
                        </td>
                        <td className="py-2.5 pr-4" style={{ color: '#5a5a5a' }}>
                          {c.phone ? <a href={`tel:${c.phone}`} style={{ color: '#2563eb' }}>{c.phone}</a> : '—'}
                        </td>
                        <td className="py-2.5">
                          <div className="flex gap-1 flex-wrap">
                            {c.is_primary   && <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(212,175,55,0.12)', color: '#b45309' }}>Primary</span>}
                            {c.is_emergency && <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>Emergency</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Care Notes card */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold" style={{ color: '#1E3A2F' }}>Care Notes</h2>
              <button
                type="button"
                onClick={() => setNoteOpen(o => !o)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium"
                style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
              >
                <Plus size={12} />{noteOpen ? 'Cancel' : 'Add Note'}
              </button>
            </div>

            {noteOpen && (
              <div className="mb-4 p-4 rounded-lg border space-y-3" style={{ borderColor: '#ddd6c8', backgroundColor: '#fafaf8' }}>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs mb-1 block" style={{ color: '#5a5a5a' }}>Note Type</label>
                    <select
                      value={noteType}
                      onChange={e => setNoteType(e.target.value as NoteType)}
                      className="text-sm border rounded px-2 py-1.5 outline-none w-full"
                      style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
                    >
                      <option value="general">General</option>
                      <option value="nursing">Nursing</option>
                      <option value="behaviour">Behaviour</option>
                      <option value="nutrition">Nutrition</option>
                      <option value="physio">Physio</option>
                      <option value="incident">Incident</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: '#5a5a5a' }}>
                      <input type="checkbox" checked={noteFlagged} onChange={e => setNoteFlagged(e.target.checked)} className="w-4 h-4" />
                      <Flag size={12} />Flag for follow-up
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: '#5a5a5a' }}>Note *</label>
                  <textarea
                    rows={3}
                    value={noteBody}
                    onChange={e => setNoteBody(e.target.value)}
                    placeholder="Enter note details…"
                    className="w-full text-sm border rounded px-2 py-1.5 outline-none resize-none"
                    style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => { setNoteOpen(false); setNoteBody('') }} className="px-3 py-1.5 rounded border text-xs" style={{ borderColor: '#ddd6c8', color: '#5a5a5a' }}>Cancel</button>
                  <button type="button" onClick={submitNote} disabled={noteSubmitting || !noteBody.trim()} className="px-4 py-1.5 rounded text-xs font-medium" style={{ backgroundColor: '#1E3A2F', color: '#ffffff', opacity: noteSubmitting ? 0.7 : 1 }}>
                    {noteSubmitting ? 'Saving…' : 'Save Note'}
                  </button>
                </div>
              </div>
            )}

            {notes.length === 0 ? (
              <div className="py-8 text-center">
                <MessageSquare size={28} className="mx-auto mb-2" style={{ color: '#ddd6c8' }} />
                <p className="text-sm" style={{ color: '#9ca3af' }}>No care notes recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map(note => {
                  const nc = NOTE_COLORS[note.note_type]
                  return (
                    <div key={note.id} className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5 flex items-center gap-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: nc.bg, color: nc.color }}>
                          {nc.label}
                        </span>
                        {note.flagged && <Flag size={12} style={{ color: '#dc2626' }} aria-label="Flagged" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-medium" style={{ color: '#1a1a1a' }}>{note.author_role}</span>
                          <span className="flex items-center gap-1 text-xs" style={{ color: '#9ca3af' }}>
                            <Clock size={10} />
                            {new Date(note.created_at).toLocaleString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm" style={{ color: '#5a5a5a' }}>{note.body}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Medical Tab ── */}
      {tab === 'medical' && (
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
          <h2 className="text-sm font-semibold mb-5" style={{ color: '#1E3A2F' }}>Medical Information</h2>
          {!medical ? (
            <div className="flex items-center justify-center py-10 gap-2" style={{ color: '#5a5a5a' }}>
              <span className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(30,58,47,0.2)', borderTopColor: '#1E3A2F' }} />
              Loading medical records…
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs mb-1" style={{ color: '#5a5a5a' }}>Allergies</p>
                <p className="text-sm font-medium" style={{ color: medical.allergies.length ? '#dc2626' : '#9ca3af' }}>
                  {medical.allergies.length ? medical.allergies.join(', ') : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: '#5a5a5a' }}>Diagnoses</p>
                <p className="text-sm font-medium" style={{ color: medical.diagnoses.length ? '#1a1a1a' : '#9ca3af' }}>
                  {medical.diagnoses.length ? medical.diagnoses.join(', ') : '—'}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs mb-1" style={{ color: '#5a5a5a' }}>Medication Notes</p>
                <p className="text-sm font-medium" style={{ color: medical.medication_notes ? '#1a1a1a' : '#9ca3af' }}>
                  {medical.medication_notes ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: '#5a5a5a' }}>Attending Doctor</p>
                <p className="text-sm font-medium" style={{ color: medical.attending_doctor ? '#1a1a1a' : '#9ca3af' }}>
                  {medical.attending_doctor ?? '—'}
                </p>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs" style={{ color: '#5a5a5a' }}>
                  <input type="checkbox" readOnly checked={medical.nok_consent_signed} className="w-4 h-4" />
                  NOK consent signed
                </label>
                <label className="flex items-center gap-2 text-xs" style={{ color: '#5a5a5a' }}>
                  <input type="checkbox" readOnly checked={medical.advance_directive} className="w-4 h-4" />
                  Advance directive
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Documents Tab ── */}
      {tab === 'documents' && (
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#ddd6c8' }}>
            <h2 className="text-sm font-semibold" style={{ color: '#1E3A2F' }}>Documents</h2>
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded text-xs font-medium"
              style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
            >
              <Plus size={12} />Upload Document
            </button>
          </div>
          <div className="p-4">
            {documents.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm" style={{ color: '#9ca3af' }}>No documents uploaded yet.</p>
                <button type="button" onClick={() => setUploadOpen(true)} className="mt-3 text-xs underline" style={{ color: '#5a5a5a' }}>
                  Upload one now
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map(doc => (
                  <DocumentRow
                    key={doc.id}
                    documentId={doc.id}
                    fileName={doc.title}
                    title={doc.title}
                    category={doc.category}
                    date={formatDate(doc.created_at) ?? doc.created_at}
                    canDelete={true}
                    onDelete={() => handleDocDelete(doc.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload modal */}
      <UploadModal
        open={uploadOpen}
        onClose={() => { setUploadOpen(false); load() }}
        residentId={id!}
        onSuccess={load}
      />
    </div>
  )
}
