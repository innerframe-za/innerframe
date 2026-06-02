import { useState, useEffect, useCallback } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/portal/PageHeader'
import { DocumentRow } from '@/components/portal/DocumentRow'
import { UploadModal } from '@/components/portal/UploadModal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  User, Calendar, Home, Hash, Heart, Pill, Stethoscope, Phone,
  Mail, Users, MessageSquare, ChevronDown, ChevronUp, Plus, Edit2, Save, X,
  AlertCircle, BookOpen, Utensils, Globe, Clock,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/auth/useUser'

// ── Types ──────────────────────────────────────────────────────────────────

type Patient = {
  id: string; org_id: string; full_name: string
  date_of_birth: string | null; id_number: string | null
  room_number: string | null; admission_date: string | null
  discharge_date: string | null; status: 'active' | 'discharged' | 'deceased'
  allergies: string | null; chronic_conditions: string | null
  current_medications: string | null; gp_name: string | null
  gp_contact: string | null; medical_aid_scheme: string | null
  medical_aid_member_number: string | null; religion: string | null
  language: string | null; dietary_requirements: string | null
}

type Contact = {
  id: string; full_name: string; relationship: string | null
  email: string | null; phone: string | null; is_primary: boolean
}

type NoteCategory = 'call' | 'visit' | 'incident' | 'update' | 'general'

type Note = {
  id: string; author_name: string; category: NoteCategory
  content: string; created_at: string
}

type Doc = {
  id: string; file_name: string; file_url: string
  pillar: string; created_at: string; is_global: boolean
  category_id: string | null
}

// ── Constants ──────────────────────────────────────────────────────────────

const PILLARS = [
  { value: 'admin', label: 'Admin' },
  { value: 'finance', label: 'Finance' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'medical', label: 'Medical' },
  { value: 'medical_residence', label: 'Med. Residence' },
  { value: 'hr', label: 'HR' },
  { value: 'board_governance', label: 'Governance' },
]

const STATUS_CONFIG = {
  active: { dot: '#16a34a', label: 'Active', color: '#15803d', bg: 'rgba(22,163,74,0.08)' },
  discharged: { dot: '#ca8a04', label: 'Discharged', color: '#a16207', bg: 'rgba(202,138,4,0.1)' },
  deceased: { dot: '#5a5a5a', label: 'Deceased', color: '#5a5a5a', bg: 'rgba(90,90,90,0.1)' },
}

const NOTE_COLORS: Record<NoteCategory, { bg: string; color: string; label: string }> = {
  incident: { bg: 'rgba(220,38,38,0.1)', color: '#dc2626', label: 'Incident' },
  call:     { bg: 'rgba(37,99,235,0.1)', color: '#2563eb', label: 'Call' },
  visit:    { bg: 'rgba(22,163,74,0.1)', color: '#16a34a', label: 'Visit' },
  update:   { bg: 'rgba(212,175,55,0.12)', color: '#b45309', label: 'Update' },
  general:  { bg: 'rgba(90,90,90,0.1)', color: '#5a5a5a', label: 'General' },
}

// ── Helpers ────────────────────────────────────────────────────────────────

function Field({ icon: Icon, label, value, editing, name, onChange }: {
  icon: React.ElementType; label: string; value: string | null
  editing?: boolean; name?: string; onChange?: (v: string) => void
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={12} style={{ color: '#5a5a5a' }} aria-hidden="true" />
        <span className="text-xs" style={{ color: '#5a5a5a' }}>{label}</span>
      </div>
      {editing && name ? (
        <input
          className="w-full text-sm border rounded px-2 py-1 outline-none"
          style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
          value={value ?? ''}
          onChange={e => onChange?.(e.target.value)}
          name={name}
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
  const d = new Date(iso)
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Main component ──────────────────────────────────────────────────────────

export default function ResidentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useUser()
  const navigate = useNavigate()

  const [resident, setResident] = useState<Patient | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [documents, setDocuments] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Edit mode state
  const [editing, setEditing] = useState(false)
  const [editDraft, setEditDraft] = useState<Partial<Patient>>({})
  const [saving, setSaving] = useState(false)

  // Note form
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteCategory, setNoteCategory] = useState<NoteCategory>('general')
  const [noteContent, setNoteContent] = useState('')
  const [noteSubmitting, setNoteSubmitting] = useState(false)

  // Contact form
  const [contactFormOpen, setContactFormOpen] = useState(false)
  const [contactDraft, setContactDraft] = useState({ full_name: '', relationship: '', email: '', phone: '', is_primary: false })
  const [contactSaving, setContactSaving] = useState(false)

  // Upload modal
  const [uploadOpen, setUploadOpen] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    const supabase = createClient()
    const [patientRes, contactsRes, notesRes, docsRes] = await Promise.all([
      supabase.from('patients').select('*').eq('id', id).single(),
      supabase.from('patient_contacts').select('*').eq('patient_id', id).order('is_primary', { ascending: false }),
      supabase.from('patient_notes').select('*').eq('patient_id', id).order('created_at', { ascending: false }),
      supabase.from('documents_legacy').select('*').eq('patient_id', id).order('created_at', { ascending: false }),
    ])
    if (!patientRes.data) { setNotFound(true); setLoading(false); return }
    setResident(patientRes.data as Patient)
    setContacts((contactsRes.data ?? []) as Contact[])
    setNotes((notesRes.data ?? []) as Note[])
    setDocuments((docsRes.data ?? []) as Doc[])
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const handleDocDelete = async (docId: string, fileUrl: string) => {
    if (!window.confirm('Delete this document? This cannot be undone.')) return
    const supabase = createClient()
    const { error } = await supabase.from('documents').delete().eq('id', docId)
    if (error) { alert('Could not delete document: ' + error.message); return }
    await supabase.storage.from('documents').remove([fileUrl])
    setDocuments(prev => prev.filter(d => d.id !== docId))
  }

  if (notFound) return <Navigate to="/residents" replace />

  if (loading || !resident) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <span className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(30,58,47,0.2)', borderTopColor: '#1E3A2F' }} />
      </div>
    )
  }

  const sc = STATUS_CONFIG[resident.status]

  // Edit helpers
  const startEdit = () => { setEditDraft({ ...resident }); setEditing(true) }
  const cancelEdit = () => { setEditDraft({}); setEditing(false) }
  const setField = (k: keyof Patient, v: string) => setEditDraft(d => ({ ...d, [k]: v || null }))

  const saveEdit = async () => {
    if (!id) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('patients').update(editDraft).eq('id', id)
    setResident(r => r ? { ...r, ...editDraft } as Patient : r)
    setSaving(false)
    setEditing(false)
  }

  // Note submit
  const submitNote = async () => {
    if (!noteContent.trim() || !user || !id) return
    setNoteSubmitting(true)
    const supabase = createClient()
    const { data } = await supabase.from('patient_notes').insert({
      patient_id: id,
      org_id: resident.org_id,
      user_id: user.id,
      author_name: user.fullName,
      category: noteCategory,
      content: noteContent.trim(),
    }).select().single()
    if (data) setNotes(n => [data as Note, ...n])
    setNoteContent('')
    setNoteCategory('general')
    setNoteOpen(false)
    setNoteSubmitting(false)
  }

  // Contact submit
  const submitContact = async () => {
    if (!contactDraft.full_name.trim() || !id) return
    setContactSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('patient_contacts').insert({
      patient_id: id,
      org_id: resident.org_id,
      ...contactDraft,
    }).select().single()
    if (data) setContacts(c => [...c, data as Contact])
    setContactDraft({ full_name: '', relationship: '', email: '', phone: '', is_primary: false })
    setContactFormOpen(false)
    setContactSaving(false)
  }

  const displayResident = editing ? { ...resident, ...editDraft } as Patient : resident

  return (
    <div className="space-y-4">
      <PageHeader
        title={editing ? (editDraft.full_name ?? resident.full_name) : resident.full_name}
        subtitle={`Room ${resident.room_number ?? '—'} · Admitted ${formatDate(resident.admission_date) ?? '—'}`}
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

      {/* ── Card 1: Personal Details ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold" style={{ color: '#1E3A2F' }}>Personal Details</h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: sc.bg, color: sc.color }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.dot }} aria-hidden="true" />
            {editing ? (
              <select
                value={editDraft.status ?? resident.status}
                onChange={e => setField('status', e.target.value)}
                className="bg-transparent text-xs outline-none"
                style={{ color: sc.color }}
              >
                <option value="active">Active</option>
                <option value="discharged">Discharged</option>
                <option value="deceased">Deceased</option>
              </select>
            ) : sc.label}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field icon={User} label="Full Name" value={displayResident.full_name} editing={editing} name="full_name" onChange={v => setField('full_name', v)} />
          <Field icon={Calendar} label="Date of Birth" value={formatDate(displayResident.date_of_birth) ?? displayResident.date_of_birth} editing={editing} name="date_of_birth" onChange={v => setField('date_of_birth', v)} />
          <Field icon={Hash} label="ID Number" value={displayResident.id_number} editing={editing} name="id_number" onChange={v => setField('id_number', v)} />
          <Field icon={Home} label="Room Number" value={displayResident.room_number} editing={editing} name="room_number" onChange={v => setField('room_number', v)} />
          <Field icon={Calendar} label="Admission Date" value={formatDate(displayResident.admission_date) ?? displayResident.admission_date} editing={editing} name="admission_date" onChange={v => setField('admission_date', v)} />
          <Field icon={Calendar} label="Discharge Date" value={formatDate(displayResident.discharge_date) ?? displayResident.discharge_date} editing={editing} name="discharge_date" onChange={v => setField('discharge_date', v)} />
          <Field icon={Globe} label="Language" value={displayResident.language} editing={editing} name="language" onChange={v => setField('language', v)} />
          <Field icon={BookOpen} label="Religion" value={displayResident.religion} editing={editing} name="religion" onChange={v => setField('religion', v)} />
          <Field icon={Utensils} label="Dietary Requirements" value={displayResident.dietary_requirements} editing={editing} name="dietary_requirements" onChange={v => setField('dietary_requirements', v)} />

        </div>

        {/* Medical Information — own sub-card */}
        <div className="mt-5 rounded-lg border p-5" style={{ borderColor: '#ddd6c8', backgroundColor: '#fafaf8' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#1E3A2F' }}>Medical Information</span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#ddd6c8' }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field icon={AlertCircle} label="Allergies" value={displayResident.allergies} editing={editing} name="allergies" onChange={v => setField('allergies', v)} />
            <Field icon={Heart} label="Chronic Conditions" value={displayResident.chronic_conditions} editing={editing} name="chronic_conditions" onChange={v => setField('chronic_conditions', v)} />
            <Field icon={Pill} label="Current Medications" value={displayResident.current_medications} editing={editing} name="current_medications" onChange={v => setField('current_medications', v)} />
            <Field icon={Stethoscope} label="GP / Doctor Name" value={displayResident.gp_name} editing={editing} name="gp_name" onChange={v => setField('gp_name', v)} />
            <Field icon={Phone} label="GP Contact" value={displayResident.gp_contact} editing={editing} name="gp_contact" onChange={v => setField('gp_contact', v)} />
            <Field icon={BookOpen} label="Medical Aid Scheme" value={displayResident.medical_aid_scheme} editing={editing} name="medical_aid_scheme" onChange={v => setField('medical_aid_scheme', v)} />
            <Field icon={Hash} label="Medical Aid Member No." value={displayResident.medical_aid_member_number} editing={editing} name="medical_aid_member_number" onChange={v => setField('medical_aid_member_number', v)} />
          </div>
        </div>
      </div>

      {/* ── Card 2: Contact Persons ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
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
            {(
              [
                { label: 'Full Name *', key: 'full_name' as const },
                { label: 'Relationship', key: 'relationship' as const },
                { label: 'Email', key: 'email' as const },
                { label: 'Phone', key: 'phone' as const },
              ] as const
            ).map(f => (
              <div key={f.key}>
                <label className="text-xs mb-1 block" style={{ color: '#5a5a5a' }}>{f.label}</label>
                <input
                  className="w-full text-sm border rounded px-2 py-1.5 outline-none"
                  style={{ borderColor: '#ddd6c8' }}
                  value={contactDraft[f.key] ?? ''}
                  onChange={e => setContactDraft(d => ({ ...d, [f.key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="sm:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="is_primary" checked={contactDraft.is_primary} onChange={e => setContactDraft(d => ({ ...d, is_primary: e.target.checked }))} />
              <label htmlFor="is_primary" className="text-xs" style={{ color: '#5a5a5a' }}>Primary contact</label>
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
                  {['Full Name', 'Relationship', 'Email', 'Phone', ''].map(h => (
                    <th key={h} className="text-left pb-2 pr-4 text-xs font-medium" style={{ color: '#5a5a5a' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contacts.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f5f0e8' }}>
                    <td className="py-2.5 pr-4 font-medium" style={{ color: '#1a1a1a' }}>
                      {c.full_name}
                      {c.is_primary && <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(212,175,55,0.12)', color: '#b45309' }}>Primary</span>}
                    </td>
                    <td className="py-2.5 pr-4" style={{ color: '#5a5a5a' }}>{c.relationship ?? '—'}</td>
                    <td className="py-2.5 pr-4" style={{ color: '#5a5a5a' }}>
                      {c.email ? <a href={`mailto:${c.email}`} style={{ color: '#2563eb' }}>{c.email}</a> : '—'}
                    </td>
                    <td className="py-2.5 pr-4" style={{ color: '#5a5a5a' }}>
                      {c.phone ? <a href={`tel:${c.phone}`} style={{ color: '#2563eb' }}>{c.phone}</a> : '—'}
                    </td>
                    <td className="py-2.5">
                      <Mail size={13} style={{ color: '#ddd6c8' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Card 3: Documents ────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: '#1E3A2F' }}>Documents</h2>
            <div style={{ width: '36px', height: '2px', backgroundColor: '#D4AF37', marginTop: '4px' }} aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded text-xs font-medium"
            style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
          >
            <Plus size={12} />Upload Document
          </button>
        </div>
        <Tabs defaultValue="medical">
          <TabsList className="mb-4 flex-wrap">
            {PILLARS.map(p => <TabsTrigger key={p.value} value={p.value} className="text-xs">{p.label}</TabsTrigger>)}
          </TabsList>
          {PILLARS.map(p => {
            const docs = documents.filter(d => d.pillar === p.value)
            return (
              <TabsContent key={p.value} value={p.value}>
                {docs.length === 0 ? (
                  <p className="text-sm py-6 text-center" style={{ color: '#5a5a5a' }}>No documents uploaded for {p.label} yet.</p>
                ) : (
                  <div className="space-y-2">
                    {docs.map(doc => (
                      <DocumentRow
                        key={doc.id}
                        fileName={doc.file_name}
                        fileUrl={doc.file_url}
                        category={doc.category_id ?? ''}
                        pillar={doc.pillar}
                        date={formatDate(doc.created_at) ?? doc.created_at}
                        isGlobal={doc.is_global}
                        canDelete={true}
                        onDelete={() => handleDocDelete(doc.id, doc.file_url)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </div>

      {/* ── Card 4: Activity Log ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold" style={{ color: '#1E3A2F' }}>Activity Log</h2>
          <button
            type="button"
            onClick={() => setNoteOpen(o => !o)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium"
            style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
          >
            {noteOpen ? <ChevronUp size={12} /> : <Plus size={12} />}
            {noteOpen ? 'Cancel' : 'Add Note'}
          </button>
        </div>

        {/* Add note form */}
        {noteOpen && (
          <div className="mb-4 p-4 rounded-lg border space-y-3" style={{ borderColor: '#ddd6c8', backgroundColor: '#fafaf8' }}>
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#5a5a5a' }}>Category</label>
              <select
                value={noteCategory}
                onChange={e => setNoteCategory(e.target.value as NoteCategory)}
                className="text-sm border rounded px-2 py-1.5 outline-none"
                style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
              >
                <option value="general">General</option>
                <option value="call">Call</option>
                <option value="visit">Visit</option>
                <option value="update">Update</option>
                <option value="incident">Incident</option>
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#5a5a5a' }}>Note *</label>
              <textarea
                rows={3}
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                placeholder="Enter note details…"
                className="w-full text-sm border rounded px-2 py-1.5 outline-none resize-none"
                style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setNoteOpen(false); setNoteContent('') }} className="px-3 py-1.5 rounded border text-xs" style={{ borderColor: '#ddd6c8', color: '#5a5a5a' }}>Cancel</button>
              <button type="button" onClick={submitNote} disabled={noteSubmitting || !noteContent.trim()} className="px-4 py-1.5 rounded text-xs font-medium" style={{ backgroundColor: '#1E3A2F', color: '#ffffff', opacity: noteSubmitting ? 0.7 : 1 }}>
                {noteSubmitting ? 'Saving…' : 'Save Note'}
              </button>
            </div>
          </div>
        )}

        {notes.length === 0 ? (
          <div className="py-8 text-center">
            <MessageSquare size={28} className="mx-auto mb-2" style={{ color: '#ddd6c8' }} />
            <p className="text-sm" style={{ color: '#9ca3af' }}>No activity logged yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map(note => {
              const nc = NOTE_COLORS[note.category]
              return (
                <div key={note.id} className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: nc.bg, color: nc.color }}>
                      {nc.label}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium" style={{ color: '#1a1a1a' }}>{note.author_name}</span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: '#9ca3af' }}>
                        <Clock size={10} />
                        {new Date(note.created_at).toLocaleString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: '#5a5a5a' }}>{note.content}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Upload modal — pre-linked to this resident */}
      <UploadModal
        open={uploadOpen}
        onClose={() => { setUploadOpen(false); load() }}
        orgId={resident.org_id}
        userRole={user?.role}
        preselectedPatientId={id}
        onSuccess={load}
      />
    </div>
  )
}
