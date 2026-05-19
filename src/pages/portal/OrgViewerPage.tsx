import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, Users, FileText, UserCircle } from 'lucide-react'

// TODO: replace mock data with Supabase queries filtered by orgId
// supabase.from('organisations').select('*').eq('id', orgId).single()
const mockOrg = {
  name: 'Sunrise Old Age Home',
  address: '14 Garden Road, Pretoria, 0001',
  contactEmail: 'admin@sunrisecare.co.za',
  contactPhone: '012 345 6789',
  createdAt: '2024-03-15',
}

// supabase.from('patients').select('*').eq('org_id', orgId)
const mockResidents = [
  { id: 'r1', fullName: 'Margaret Dlamini', roomNumber: '12A', status: 'active', admissionDate: '2023-08-20' },
  { id: 'r2', fullName: 'Johan van der Merwe', roomNumber: '7B', status: 'active', admissionDate: '2022-11-05' },
  { id: 'r3', fullName: 'Beatrice Nkosi', roomNumber: '3C', status: 'discharged', admissionDate: '2024-01-12' },
]

// supabase.from('documents').select('*, users(full_name)').eq('org_id', orgId)
const mockDocuments = [
  { id: 'd1', fileName: 'Care_Plan_Dlamini.pdf', pillar: 'medical', uploadedBy: 'Jane Nurse', createdAt: '2024-02-10' },
  { id: 'd2', fileName: 'Budget_Q1_2024.xlsx', pillar: 'finance', uploadedBy: 'Admin User', createdAt: '2024-03-01' },
  { id: 'd3', fileName: 'Fire_Safety_Policy.pdf', pillar: 'admin', uploadedBy: 'Admin User', createdAt: '2024-01-20' },
]

// supabase.from('users').select('*').eq('org_id', orgId)
const mockStaff = [
  { id: 's1', fullName: 'Admin User', email: 'admin@sunrisecare.co.za', role: 'home_admin', active: true },
  { id: 's2', fullName: 'Jane Nurse', email: 'jane@sunrisecare.co.za', role: 'staff', active: true },
  { id: 's3', fullName: 'Peter Kitchen', email: 'peter@sunrisecare.co.za', role: 'staff', active: false },
]

const PILLAR_LABELS: Record<string, string> = {
  admin: 'Admin Office', finance: 'Finance', kitchen: 'Kitchen',
  medical: 'Medical', board_governance: 'Board Governance',
}

const STATUS_COLOURS: Record<string, { bg: string; text: string }> = {
  active: { bg: 'rgba(22,163,74,0.08)', text: '#15803d' },
  discharged: { bg: 'rgba(90,90,90,0.08)', text: '#5a5a5a' },
  deceased: { bg: 'rgba(220,38,38,0.08)', text: '#dc2626' },
}

type Tab = 'overview' | 'residents' | 'documents' | 'staff'

const TABS: { value: Tab; label: string; icon: typeof Building2 }[] = [
  { value: 'overview', label: 'Overview', icon: Building2 },
  { value: 'residents', label: 'Residents', icon: Users },
  { value: 'documents', label: 'Documents', icon: FileText },
  { value: 'staff', label: 'Staff', icon: UserCircle },
]

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 py-2.5" style={{ borderBottom: '0.5px solid #ddd6c8' }}>
      <span className="w-36 text-xs font-medium shrink-0" style={{ color: '#5a5a5a' }}>{label}</span>
      <span className="text-sm" style={{ color: '#1a1a1a' }}>{value}</span>
    </div>
  )
}

/**
 * Org detail viewer — accessible to super_admin only (enforced by ProtectedRoute + RLS).
 * Shows overview, residents, documents, and staff for any organisation.
 */
export default function OrgViewerPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  void orgId // will be used in real Supabase queries

  return (
    <div className="max-w-4xl">
      {/* Back link */}
      <button type="button" onClick={() => navigate('/settings')}
        className="inline-flex items-center gap-1.5 text-xs mb-5 transition-colors"
        style={{ color: '#5a5a5a' }}
        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#1E3A2F')}
        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#5a5a5a')}>
        <ArrowLeft size={13} />Back to Settings
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-medium" style={{ color: '#1E3A2F' }}>{mockOrg.name}</h1>
        <div style={{ width: '36px', height: '2px', backgroundColor: '#D4AF37', marginTop: '4px' }} aria-hidden="true" />
        <p className="text-sm mt-2" style={{ color: '#5a5a5a' }}>Viewing as Innerframe super admin — support mode</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: Users, label: 'Residents', value: mockResidents.length },
          { icon: FileText, label: 'Documents', value: mockDocuments.length },
          { icon: UserCircle, label: 'Staff', value: mockStaff.length },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white rounded-xl border p-4 flex items-center gap-3" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(30,58,47,0.08)' }}>
              <Icon size={16} style={{ color: '#1E3A2F' }} />
            </div>
            <div>
              <p className="text-lg font-medium leading-none" style={{ color: '#1E3A2F' }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: '#5a5a5a' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-0 mb-5" style={{ borderBottom: '1px solid #ddd6c8' }}>
        {TABS.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.value
          return (
            <button key={tab.value} type="button" onClick={() => setActiveTab(tab.value)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-colors"
              style={{ borderColor: active ? '#D4AF37' : 'transparent', color: active ? '#1E3A2F' : '#5a5a5a', backgroundColor: 'transparent', marginBottom: '-1px' }}>
              <Icon size={13} />{tab.label}
            </button>
          )
        })}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
          <InfoRow label="Facility Name" value={mockOrg.name} />
          <InfoRow label="Address" value={mockOrg.address} />
          <InfoRow label="Contact Email" value={mockOrg.contactEmail} />
          <InfoRow label="Phone" value={mockOrg.contactPhone} />
          <InfoRow label="Subscribed Since" value={mockOrg.createdAt} />
        </div>
      )}

      {/* Residents */}
      {activeTab === 'residents' && (
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd6c8', backgroundColor: '#F5F0E8' }}>
                {['Name', 'Room', 'Status', 'Admission Date'].map(h => (
                  <th key={h} className="text-left py-2.5 px-4 text-xs font-medium" style={{ color: '#5a5a5a' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockResidents.map(r => {
                const colours = STATUS_COLOURS[r.status] ?? STATUS_COLOURS.active
                return (
                  <tr key={r.id} style={{ borderBottom: '0.5px solid #ddd6c8' }}>
                    <td className="py-3 px-4 font-medium" style={{ color: '#1a1a1a' }}>{r.fullName}</td>
                    <td className="py-3 px-4" style={{ color: '#5a5a5a' }}>{r.roomNumber}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: colours.bg, color: colours.text }}>{r.status}</span>
                    </td>
                    <td className="py-3 px-4" style={{ color: '#5a5a5a' }}>{r.admissionDate}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd6c8', backgroundColor: '#F5F0E8' }}>
                {['File Name', 'Pillar', 'Uploaded By', 'Date'].map(h => (
                  <th key={h} className="text-left py-2.5 px-4 text-xs font-medium" style={{ color: '#5a5a5a' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockDocuments.map(doc => (
                <tr key={doc.id} style={{ borderBottom: '0.5px solid #ddd6c8' }}>
                  <td className="py-3 px-4 font-medium" style={{ color: '#1a1a1a' }}>{doc.fileName}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(30,58,47,0.08)', color: '#1E3A2F' }}>
                      {PILLAR_LABELS[doc.pillar] ?? doc.pillar}
                    </span>
                  </td>
                  <td className="py-3 px-4" style={{ color: '#5a5a5a' }}>{doc.uploadedBy}</td>
                  <td className="py-3 px-4" style={{ color: '#5a5a5a' }}>{doc.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Staff */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-xl border p-4 space-y-2" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
          {mockStaff.map(member => (
            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white shrink-0" style={{ backgroundColor: member.active ? '#1E3A2F' : '#8AAF8E' }} aria-hidden="true">
                  {member.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{member.fullName}</p>
                  <p className="text-xs" style={{ color: '#5a5a5a' }}>
                    {member.email} · <span style={{ color: member.role === 'home_admin' ? '#D4AF37' : '#5a5a5a' }}>{member.role === 'home_admin' ? 'Home Admin' : 'Staff'}</span>
                  </p>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: member.active ? 'rgba(22,163,74,0.08)' : 'rgba(90,90,90,0.08)', color: member.active ? '#15803d' : '#5a5a5a' }}>
                {member.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
