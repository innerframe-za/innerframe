import { useState } from 'react'
import { X, UserPlus, ChevronRight } from 'lucide-react'
import { apiPost } from '@/lib/api/client'

interface AddResidentModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

type Tab = 'personal' | 'medical' | 'contact'

// ── Validation helpers ─────────────────────────────────────────────

function validateSAId(id: string): string | null {
  if (!id.trim()) return null
  if (!/^\d{13}$/.test(id)) return 'SA ID must be exactly 13 digits'
  const mm = parseInt(id.slice(2, 4))
  const dd = parseInt(id.slice(4, 6))
  if (mm < 1 || mm > 12) return 'ID number contains an invalid month'
  if (dd < 1 || dd > 31) return 'ID number contains an invalid day'
  let sum = 0
  for (let i = 0; i < 12; i++) {
    let d = parseInt(id[i])
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9 }
    sum += d
  }
  if ((10 - (sum % 10)) % 10 !== parseInt(id[12])) return 'ID number is invalid (checksum failed)'
  return null
}

function validateSAPhone(phone: string): string | null {
  if (!phone.trim()) return null
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '')
  if (/^0\d{9}$/.test(cleaned)) return null
  if (/^\+27\d{9}$/.test(cleaned)) return null
  if (/^27\d{9}$/.test(cleaned)) return null
  return 'Enter a valid SA phone number (e.g. 082 555 0123)'
}

function validateEmail(email: string): string | null {
  if (!email.trim()) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return 'Enter a valid email address'
  return null
}

function validateDOB(dob: string): string | null {
  if (!dob) return null
  const d = new Date(dob)
  const now = new Date()
  if (isNaN(d.getTime())) return 'Enter a valid date'
  if (d > now) return 'Date of birth cannot be in the future'
  if (d.getFullYear() < 1900) return 'Date of birth seems too far in the past'
  return null
}

// ── Sub-components ─────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium mb-1" style={{ color: '#5a5a5a' }}>
      {children}
    </label>
  )
}

function FieldError({ msg }: { msg?: string | null }) {
  if (!msg) return null
  return <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{msg}</p>
}

function Input({
  value, onChange, onBlur, placeholder, type = 'text', error,
}: {
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  placeholder?: string
  type?: string
  error?: string | null
}) {
  const borderDefault = error ? '#dc2626' : '#ddd6c8'
  const borderFocus   = error ? '#dc2626' : '#1E3A2F'
  return (
    <>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={e => {
          e.target.style.borderColor = borderDefault
          onBlur?.()
        }}
        placeholder={placeholder}
        className="w-full text-sm border rounded px-2.5 py-1.5 outline-none"
        style={{ borderColor: borderDefault, color: '#1a1a1a' }}
        onFocus={e => (e.target.style.borderColor = borderFocus)}
      />
      <FieldError msg={error} />
    </>
  )
}

// ── Main modal ─────────────────────────────────────────────────────

export function AddResidentModal({ open, onClose, onSuccess }: AddResidentModalProps) {
  const [tab, setTab] = useState<Tab>('personal')
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Personal fields — backend uses first_name + last_name, not full_name
  const [firstName,      setFirstName]      = useState('')
  const [lastName,       setLastName]       = useState('')
  const [dob,            setDob]            = useState('')
  const [nationalId,     setNationalId]     = useState('')
  const [roomNumber,     setRoomNumber]     = useState('')
  const [ward,           setWard]           = useState('')
  const [admissionDate,  setAdmissionDate]  = useState('')
  const [gender,         setGender]         = useState('')
  const [language,       setLanguage]       = useState('')

  // Medical fields — stored encrypted in backend
  const [allergies,      setAllergies]      = useState('')
  const [diagnoses,      setDiagnoses]      = useState('')
  const [medicationNotes, setMedicationNotes] = useState('')
  const [attendingDoctor, setAttendingDoctor] = useState('')

  // Contact person
  const [contactName,         setContactName]         = useState('')
  const [contactRelationship, setContactRelationship] = useState('')
  const [contactEmail,        setContactEmail]        = useState('')
  const [contactPhone,        setContactPhone]        = useState('')
  const [contactPrimary,      setContactPrimary]      = useState(true)
  const [contactEmergency,    setContactEmergency]    = useState(true)

  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const setFieldError = (field: string, msg: string | null) =>
    setErrors(prev => ({ ...prev, [field]: msg }))

  const validateAll = () => ({
    firstName:    firstName.trim().length < 1 ? 'First name is required' : null,
    lastName:     lastName.trim().length < 1 ? 'Last name is required' : null,
    dob:          validateDOB(dob),
    nationalId:   validateSAId(nationalId),
    contactPhone: validateSAPhone(contactPhone),
    contactEmail: validateEmail(contactEmail),
  })

  const FIELD_TAB: Record<string, Tab> = {
    firstName: 'personal', lastName: 'personal', dob: 'personal', nationalId: 'personal',
    contactPhone: 'contact', contactEmail: 'contact',
  }

  if (!open) return null

  const resetForm = () => {
    setTab('personal')
    setFirstName(''); setLastName(''); setDob(''); setNationalId('')
    setRoomNumber(''); setWard(''); setAdmissionDate(''); setGender(''); setLanguage('')
    setAllergies(''); setDiagnoses(''); setMedicationNotes(''); setAttendingDoctor('')
    setContactName(''); setContactRelationship(''); setContactEmail('')
    setContactPhone(''); setContactPrimary(true); setContactEmergency(true)
    setErrors({}); setSubmitError(null)
  }

  const handleClose = () => { resetForm(); onClose() }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validateAll()
    setErrors(newErrors)

    const firstBad = Object.entries(newErrors).find(([, msg]) => msg !== null)
    if (firstBad) {
      setTab(FIELD_TAB[firstBad[0]] ?? 'personal')
      return
    }

    setSaving(true)
    setSubmitError(null)

    try {
      const resident = await apiPost<{ id: string }>('/residents', {
        first_name:     firstName.trim(),
        last_name:      lastName.trim(),
        date_of_birth:  dob || undefined,
        national_id:    nationalId || undefined,
        room_number:    roomNumber || undefined,
        ward:           ward || undefined,
        admission_date: admissionDate || undefined,
        gender:         gender || undefined,
        primary_language: language || undefined,
      })

      // Medical info patch (optional — skip if all fields empty)
      const hasmedical = allergies || diagnoses || medicationNotes || attendingDoctor
      if (hasmedical) {
        await apiPost(`/residents/${resident.id}/medical`, {
          allergies:        allergies ? allergies.split(',').map(s => s.trim()).filter(Boolean) : undefined,
          diagnoses:        diagnoses ? diagnoses.split(',').map(s => s.trim()).filter(Boolean) : undefined,
          medication_notes: medicationNotes || undefined,
          attending_doctor: attendingDoctor || undefined,
        }).catch(() => { /* non-fatal */ })
      }

      // Contact person (optional)
      if (contactName.trim()) {
        await apiPost(`/residents/${resident.id}/contacts`, {
          name:         contactName.trim(),
          relationship: contactRelationship || undefined,
          email:        contactEmail || undefined,
          phone:        contactPhone || undefined,
          is_primary:   contactPrimary,
          is_emergency: contactEmergency,
          is_billing_contact: false,
          can_collect:  false,
        }).catch(() => { /* non-fatal */ })
      }

      resetForm()
      onSuccess()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save resident. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#ddd6c8' }}>
          <div className="flex items-center gap-2">
            <UserPlus size={16} style={{ color: '#1E3A2F' }} />
            <h2 className="text-base font-semibold" style={{ color: '#1E3A2F' }}>Add New Resident</h2>
          </div>
          <button type="button" onClick={handleClose} aria-label="Close">
            <X size={18} style={{ color: '#5a5a5a' }} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b overflow-x-auto" style={{ borderColor: '#ddd6c8' }}>
          {([
            { key: 'personal', label: 'Personal Details' },
            { key: 'medical',  label: 'Medical Information' },
            { key: 'contact',  label: 'Contact Person' },
          ] as { key: Tab; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className="px-5 py-3 text-sm font-medium transition-colors relative whitespace-nowrap flex-shrink-0"
              style={{ color: tab === key ? '#1E3A2F' : '#5a5a5a' }}
            >
              {label}
              {tab === key && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: '#D4AF37' }} />
              )}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* ── Personal Details ── */}
            {tab === 'personal' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>First Name *</Label>
                  <Input
                    value={firstName}
                    onChange={v => { setFirstName(v); if (errors.firstName) setFieldError('firstName', null) }}
                    onBlur={() => setFieldError('firstName', firstName.trim().length < 1 ? 'First name is required' : null)}
                    placeholder="e.g. Margaret"
                    error={errors.firstName}
                  />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input
                    value={lastName}
                    onChange={v => { setLastName(v); if (errors.lastName) setFieldError('lastName', null) }}
                    onBlur={() => setFieldError('lastName', lastName.trim().length < 1 ? 'Last name is required' : null)}
                    placeholder="e.g. Johnson"
                    error={errors.lastName}
                  />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={dob}
                    onChange={setDob}
                    onBlur={() => setFieldError('dob', validateDOB(dob))}
                    error={errors.dob}
                  />
                </div>
                <div>
                  <Label>SA ID Number</Label>
                  <Input
                    value={nationalId}
                    onChange={v => { setNationalId(v.replace(/\D/g, '').slice(0, 13)); if (errors.nationalId) setFieldError('nationalId', null) }}
                    onBlur={() => setFieldError('nationalId', validateSAId(nationalId))}
                    placeholder="13-digit SA ID number"
                    error={errors.nationalId}
                  />
                </div>
                <div>
                  <Label>Room Number</Label>
                  <Input value={roomNumber} onChange={setRoomNumber} placeholder="e.g. 12A" />
                </div>
                <div>
                  <Label>Ward</Label>
                  <Input value={ward} onChange={setWard} placeholder="e.g. North Wing" />
                </div>
                <div>
                  <Label>Admission Date</Label>
                  <Input type="date" value={admissionDate} onChange={setAdmissionDate} />
                </div>
                <div>
                  <Label>Gender</Label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full text-sm border rounded px-2.5 py-1.5 outline-none"
                    style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
                  >
                    <option value="">— Not specified —</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label>Primary Language</Label>
                  <Input value={language} onChange={setLanguage} placeholder="e.g. Afrikaans" />
                </div>
              </div>
            )}

            {/* ── Medical Information ── */}
            {tab === 'medical' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <p className="sm:col-span-2 text-xs" style={{ color: '#5a5a5a' }}>
                  Medical information is stored encrypted. Separate multiple items with commas.
                </p>
                <div className="sm:col-span-2">
                  <Label>Allergies</Label>
                  <Input value={allergies} onChange={setAllergies} placeholder="e.g. Penicillin, latex, nuts" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Diagnoses / Chronic Conditions</Label>
                  <Input value={diagnoses} onChange={setDiagnoses} placeholder="e.g. Hypertension, Type 2 Diabetes" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Medication Notes</Label>
                  <Input value={medicationNotes} onChange={setMedicationNotes} placeholder="e.g. Metformin 500mg twice daily" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Attending Doctor</Label>
                  <Input value={attendingDoctor} onChange={setAttendingDoctor} placeholder="Dr. van der Merwe" />
                </div>
              </div>
            )}

            {/* ── Contact Person ── */}
            {tab === 'contact' && (
              <div className="space-y-4">
                <p className="text-xs" style={{ color: '#5a5a5a' }}>
                  Add an emergency contact or next of kin. You can add more contacts after saving.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label>Full Name</Label>
                    <Input value={contactName} onChange={setContactName} placeholder="Contact person's full name" />
                  </div>
                  <div>
                    <Label>Relationship</Label>
                    <Input value={contactRelationship} onChange={setContactRelationship} placeholder="e.g. Daughter, Son, Spouse" />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      value={contactPhone}
                      onChange={v => { setContactPhone(v); if (errors.contactPhone) setFieldError('contactPhone', null) }}
                      onBlur={() => setFieldError('contactPhone', validateSAPhone(contactPhone))}
                      placeholder="e.g. 082 555 0123"
                      error={errors.contactPhone}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={contactEmail}
                      onChange={v => { setContactEmail(v); if (errors.contactEmail) setFieldError('contactEmail', null) }}
                      onBlur={() => setFieldError('contactEmail', validateEmail(contactEmail))}
                      placeholder="contact@example.com"
                      error={errors.contactEmail}
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: '#5a5a5a' }}>
                      <input type="checkbox" checked={contactPrimary} onChange={e => setContactPrimary(e.target.checked)} className="w-4 h-4" />
                      Primary contact
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: '#5a5a5a' }}>
                      <input type="checkbox" checked={contactEmergency} onChange={e => setContactEmergency(e.target.checked)} className="w-4 h-4" />
                      Emergency contact
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t flex items-center justify-between gap-3" style={{ borderColor: '#ddd6c8' }}>
            <div className="flex-1">
              {submitError && <p className="text-xs" style={{ color: '#dc2626' }}>{submitError}</p>}
              {!submitError && tab === 'personal' && (
                <button type="button" onClick={() => setTab('medical')} className="flex items-center gap-1 text-xs" style={{ color: '#5a5a5a' }}>
                  Next: Medical Information <ChevronRight size={12} />
                </button>
              )}
              {!submitError && tab === 'medical' && (
                <button type="button" onClick={() => setTab('contact')} className="flex items-center gap-1 text-xs" style={{ color: '#5a5a5a' }}>
                  Next: Contact Person <ChevronRight size={12} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded border text-sm"
                style={{ borderColor: '#ddd6c8', color: '#5a5a5a' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded text-sm font-medium flex items-center gap-1.5"
                style={{ backgroundColor: '#1E3A2F', color: '#ffffff', opacity: saving ? 0.7 : 1 }}
              >
                <UserPlus size={13} />
                {saving ? 'Saving…' : 'Add Resident'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
