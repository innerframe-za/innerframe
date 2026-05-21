import { useState } from 'react'
import { X, UserPlus, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/auth/useUser'

interface AddResidentModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

type Tab = 'personal' | 'contact'

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium mb-1" style={{ color: '#5a5a5a' }}>{children}</label>
}

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full text-sm border rounded px-2.5 py-1.5 outline-none"
      style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
      onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
      onBlur={e => (e.target.style.borderColor = '#ddd6c8')}
    />
  )
}

export function AddResidentModal({ open, onClose, onSuccess }: AddResidentModalProps) {
  const { user } = useUser()
  const [tab, setTab] = useState<Tab>('personal')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Personal details
  const [fullName, setFullName] = useState('')
  const [dob, setDob] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [roomNumber, setRoomNumber] = useState('')
  const [admissionDate, setAdmissionDate] = useState('')
  const [status, setStatus] = useState<'active' | 'discharged' | 'deceased'>('active')
  const [language, setLanguage] = useState('')
  const [religion, setReligion] = useState('')
  const [dietary, setDietary] = useState('')
  const [allergies, setAllergies] = useState('')
  const [chronicConditions, setChronicConditions] = useState('')
  const [medications, setMedications] = useState('')
  const [gpName, setGpName] = useState('')
  const [gpContact, setGpContact] = useState('')
  const [medAidScheme, setMedAidScheme] = useState('')
  const [medAidNumber, setMedAidNumber] = useState('')

  // Contact person
  const [contactName, setContactName] = useState('')
  const [contactRelationship, setContactRelationship] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactPrimary, setContactPrimary] = useState(true)

  if (!open) return null

  const resetForm = () => {
    setTab('personal')
    setFullName(''); setDob(''); setIdNumber(''); setRoomNumber('')
    setAdmissionDate(''); setStatus('active'); setLanguage('')
    setReligion(''); setDietary(''); setAllergies(''); setChronicConditions('')
    setMedications(''); setGpName(''); setGpContact(''); setMedAidScheme('')
    setMedAidNumber(''); setContactName(''); setContactRelationship('')
    setContactEmail(''); setContactPhone(''); setContactPrimary(true)
    setError(null)
  }

  const handleClose = () => { resetForm(); onClose() }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) { setError('Full name is required.'); setTab('personal'); return }
    if (!user?.orgId) { setError('Session error — please refresh and try again.'); return }

    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()

      // Always include org_id so this resident belongs to the correct facility
      const { data: patient, error: patientErr } = await supabase
        .from('patients')
        .insert({
          org_id: user.orgId,
          full_name: fullName.trim(),
          date_of_birth: dob || null,
          id_number: idNumber || null,
          room_number: roomNumber || null,
          admission_date: admissionDate || null,
          status,
          language: language || null,
          religion: religion || null,
          dietary_requirements: dietary || null,
          allergies: allergies || null,
          chronic_conditions: chronicConditions || null,
          current_medications: medications || null,
          gp_name: gpName || null,
          gp_contact: gpContact || null,
          medical_aid_scheme: medAidScheme || null,
          medical_aid_member_number: medAidNumber || null,
        })
        .select('id')
        .single()

      if (patientErr || !patient) throw patientErr ?? new Error('Failed to create resident')

      // If a contact person was provided, insert them linked to this resident and facility
      if (contactName.trim()) {
        await supabase.from('patient_contacts').insert({
          patient_id: patient.id,
          org_id: user.orgId,   // Contact is scoped to the same facility
          full_name: contactName.trim(),
          relationship: contactRelationship || null,
          email: contactEmail || null,
          phone: contactPhone || null,
          is_primary: contactPrimary,
        })
      }

      resetForm()
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save resident. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" style={{ borderColor: '#ddd6c8' }}>
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

        {/* Tab switcher */}
        <div className="flex border-b" style={{ borderColor: '#ddd6c8' }}>
          {(['personal', 'contact'] as Tab[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="px-6 py-3 text-sm font-medium transition-colors relative"
              style={{ color: tab === t ? '#1E3A2F' : '#5a5a5a' }}
            >
              {t === 'personal' ? 'Personal Details' : 'Contact Person'}
              {tab === t && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: '#D4AF37' }} />
              )}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {tab === 'personal' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label>Full Name *</Label>
                    <Input value={fullName} onChange={setFullName} placeholder="e.g. Margaret Johnson" />
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <Input type="date" value={dob} onChange={setDob} />
                  </div>
                  <div>
                    <Label>ID Number</Label>
                    <Input value={idNumber} onChange={setIdNumber} placeholder="South African ID number" />
                  </div>
                  <div>
                    <Label>Room Number</Label>
                    <Input value={roomNumber} onChange={setRoomNumber} placeholder="e.g. 12" />
                  </div>
                  <div>
                    <Label>Admission Date</Label>
                    <Input type="date" value={admissionDate} onChange={setAdmissionDate} />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as typeof status)}
                      className="w-full text-sm border rounded px-2.5 py-1.5 outline-none"
                      style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
                    >
                      <option value="active">Active</option>
                      <option value="discharged">Discharged</option>
                      <option value="deceased">Deceased</option>
                    </select>
                  </div>
                  <div>
                    <Label>Language</Label>
                    <Input value={language} onChange={setLanguage} placeholder="e.g. Afrikaans" />
                  </div>
                  <div>
                    <Label>Religion</Label>
                    <Input value={religion} onChange={setReligion} placeholder="e.g. Christian" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Dietary Requirements</Label>
                    <Input value={dietary} onChange={setDietary} placeholder="e.g. Diabetic, low sodium" />
                  </div>
                </div>

                {/* Medical Information — own card block */}
                <div className="rounded-lg border p-4 space-y-4" style={{ borderColor: '#ddd6c8', backgroundColor: '#fafaf8' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#1E3A2F' }}>Medical Information</span>
                    <div className="flex-1 h-px" style={{ backgroundColor: '#ddd6c8' }} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label>Allergies</Label>
                      <Input value={allergies} onChange={setAllergies} placeholder="e.g. Penicillin, latex" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Chronic Conditions</Label>
                      <Input value={chronicConditions} onChange={setChronicConditions} placeholder="e.g. Hypertension, Type 2 Diabetes" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Current Medications</Label>
                      <Input value={medications} onChange={setMedications} placeholder="e.g. Metformin 500mg, Amlodipine 5mg" />
                    </div>
                    <div>
                      <Label>GP / Doctor Name</Label>
                      <Input value={gpName} onChange={setGpName} placeholder="Dr. van der Merwe" />
                    </div>
                    <div>
                      <Label>GP Contact</Label>
                      <Input value={gpContact} onChange={setGpContact} placeholder="011 555 0100" />
                    </div>
                    <div>
                      <Label>Medical Aid Scheme</Label>
                      <Input value={medAidScheme} onChange={setMedAidScheme} placeholder="e.g. Discovery Health" />
                    </div>
                    <div>
                      <Label>Member Number</Label>
                      <Input value={medAidNumber} onChange={setMedAidNumber} placeholder="e.g. 1234567890" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'contact' && (
              <div className="space-y-4">
                <p className="text-xs" style={{ color: '#5a5a5a' }}>
                  Add an emergency contact or next of kin for this resident. You can add more contacts after saving.
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
                    <Input value={contactPhone} onChange={setContactPhone} placeholder="e.g. 082 555 0123" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Email Address</Label>
                    <Input type="email" value={contactEmail} onChange={setContactEmail} placeholder="contact@example.com" />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="add-primary"
                      checked={contactPrimary}
                      onChange={e => setContactPrimary(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="add-primary" className="text-xs cursor-pointer" style={{ color: '#5a5a5a' }}>
                      Mark as primary contact
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t flex items-center justify-between gap-3" style={{ borderColor: '#ddd6c8' }}>
            {error && <p className="text-xs flex-1" style={{ color: '#dc2626' }}>{error}</p>}
            {!error && tab === 'personal' && (
              <button type="button" onClick={() => setTab('contact')} className="flex items-center gap-1 text-xs" style={{ color: '#5a5a5a' }}>
                Next: Contact Person <ChevronRight size={12} />
              </button>
            )}
            {!error && tab === 'contact' && <span />}
            <div className="flex items-center gap-2 ml-auto">
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
