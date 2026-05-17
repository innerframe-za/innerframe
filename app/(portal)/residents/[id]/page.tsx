export const runtime = 'edge'

import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/portal/PageHeader'
import { DocumentRow } from '@/components/portal/DocumentRow'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Calendar, Home, Hash, Upload } from 'lucide-react'

// TODO: replace with Supabase query:
// supabase.from('patients').select('*').eq('id', id).eq('org_id', orgId).single()
async function getMockResident(id: string) {
  const residents: Record<string, {
    id: string
    name: string
    dob: string
    idNumber: string
    roomNumber: string
    admissionDate: string
    status: 'active' | 'discharged' | 'deceased'
  }> = {
    '1': { id: '1', name: 'Margaret Johnson', dob: '12 Apr 1942', idNumber: '4204120012348', roomNumber: '12', admissionDate: '3 Jan 2024', status: 'active' },
    '2': { id: '2', name: 'Thomas van der Merwe', dob: '8 Sep 1939', idNumber: '3909085012347', roomNumber: '7', admissionDate: '15 Mar 2024', status: 'active' },
  }
  return residents[id] ?? null
}

// TODO: replace with Supabase query:
// supabase.from('documents').select('*').eq('patient_id', id).eq('pillar', pillar)
function getMockDocs(pillar: string) {
  if (pillar === 'medical') {
    return [
      { id: 'd1', fileName: 'Care_Plan_2025.pdf', fileUrl: '#', category: 'Care Plan', pillar: 'medical', date: '10 Jan 2025', isGlobal: false },
      { id: 'd2', fileName: 'Medication_Chart_May2025.pdf', fileUrl: '#', category: 'Medication', pillar: 'medical', date: '1 May 2025', isGlobal: false },
    ]
  }
  if (pillar === 'admin') {
    return [
      { id: 'd3', fileName: 'Admission_Form_2024.pdf', fileUrl: '#', category: 'Admission', pillar: 'admin', date: '3 Jan 2024', isGlobal: false },
    ]
  }
  return []
}

const PILLARS = [
  { value: 'admin', label: 'Admin' },
  { value: 'finance', label: 'Finance' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'medical', label: 'Medical' },
  { value: 'board_governance', label: 'Governance' },
]

interface ResidentProfileProps {
  params: Promise<{ id: string }>
}

/**
 * Resident profile page — personal details + tabbed document sections per pillar.
 */
export default async function ResidentProfilePage({ params }: ResidentProfileProps) {
  const { id } = await params
  const resident = await getMockResident(id)

  if (!resident) notFound()

  const statusConfig = {
    active: { dot: '#16a34a', label: 'Active', color: '#15803d', bg: 'rgba(22,163,74,0.08)' },
    discharged: { dot: '#ca8a04', label: 'Discharged', color: '#a16207', bg: 'rgba(202,138,4,0.1)' },
    deceased: { dot: '#5a5a5a', label: 'Deceased', color: '#5a5a5a', bg: 'rgba(90,90,90,0.1)' },
  }
  const sc = statusConfig[resident.status]

  return (
    <div>
      <PageHeader
        title={resident.name}
        subtitle={`Room ${resident.roomNumber} · Admitted ${resident.admissionDate}`}
        action={
          <button
            type="button"
            className="px-4 py-2 rounded border text-sm font-medium transition-colors"
            style={{ borderColor: '#1E3A2F', color: '#1E3A2F' }}
          >
            Edit Resident
          </button>
        }
      />

      {/* Personal details card */}
      <div
        className="bg-white rounded-xl border p-6 mb-6"
        style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium" style={{ color: '#1E3A2F' }}>
            Personal Details
          </h2>
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: sc.bg, color: sc.color }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: sc.dot }}
              aria-hidden="true"
            />
            {sc.label}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: User, label: 'Full Name', value: resident.name },
            { icon: Calendar, label: 'Date of Birth', value: resident.dob },
            { icon: Hash, label: 'ID Number', value: resident.idNumber },
            { icon: Home, label: 'Room Number', value: resident.roomNumber },
          ].map(field => {
            const Icon = field.icon
            return (
              <div key={field.label}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={12} style={{ color: '#5a5a5a' }} aria-hidden="true" />
                  <span className="text-xs" style={{ color: '#5a5a5a' }}>
                    {field.label}
                  </span>
                </div>
                <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>
                  {field.value}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tabbed documents */}
      <div
        className="bg-white rounded-xl border p-6"
        style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-medium" style={{ color: '#1E3A2F' }}>
              Documents
            </h2>
            <div
              style={{ width: '36px', height: '2px', backgroundColor: '#D4AF37', marginTop: '4px' }}
              aria-hidden="true"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-colors"
            style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
          >
            <Upload size={12} />
            Upload Document
          </button>
        </div>

        <Tabs defaultValue="medical">
          <TabsList className="mb-4">
            {PILLARS.map(p => (
              <TabsTrigger key={p.value} value={p.value} className="text-xs">
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {PILLARS.map(p => {
            const docs = getMockDocs(p.value)
            return (
              <TabsContent key={p.value} value={p.value}>
                {docs.length === 0 ? (
                  <p className="text-sm py-6 text-center" style={{ color: '#5a5a5a' }}>
                    No documents uploaded for {p.label} yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {docs.map(doc => (
                      <DocumentRow
                        key={doc.id}
                        fileName={doc.fileName}
                        fileUrl={doc.fileUrl}
                        category={doc.category}
                        pillar={doc.pillar}
                        date={doc.date}
                        isGlobal={doc.isGlobal}
                        canDelete={true}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </div>
  )
}
