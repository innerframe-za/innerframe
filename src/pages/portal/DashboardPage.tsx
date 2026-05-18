import { Users, FileText, ClipboardCheck, BarChart2, ClipboardList, DollarSign, UtensilsCrossed, Stethoscope, Scale, Upload, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/portal/PageHeader'
import { StatCard } from '@/components/portal/StatCard'
import { PillarCard } from '@/components/portal/PillarCard'
import { DocumentRow } from '@/components/portal/DocumentRow'
import { ResidentRow } from '@/components/portal/ResidentRow'

const mockStats = { totalResidents: 24, totalDocuments: 87, pendingReviews: 3, compliancePercent: 78 }

const mockPillarCounts = { admin: 22, finance: 18, kitchen: 15, medical: 20, board_governance: 12 }

const mockDocuments = [
  { id: '1', fileName: 'Staff_Policies_2025.pdf', fileUrl: '#', category: 'Policies', pillar: 'admin', date: '12 May 2025', isGlobal: false },
  { id: '2', fileName: 'Q1_Finance_Report.xlsx', fileUrl: '#', category: 'Reports', pillar: 'finance', date: '10 May 2025', isGlobal: false },
  { id: '3', fileName: 'Kitchen_Cleaning_Schedule.pdf', fileUrl: '#', category: 'Procedures', pillar: 'kitchen', date: '8 May 2025', isGlobal: true },
  { id: '4', fileName: 'Resident_Care_Plans_Template.docx', fileUrl: '#', category: 'Templates', pillar: 'medical', date: '5 May 2025', isGlobal: true },
]

const mockResidents = [
  { id: '1', name: 'Margaret Johnson', roomNumber: '12', status: 'active' as const },
  { id: '2', name: 'Thomas van der Merwe', roomNumber: '7', status: 'active' as const },
  { id: '3', name: 'Edith Nkosi', roomNumber: '3', status: 'active' as const },
  { id: '4', name: 'Samuel Pretorius', roomNumber: '15', status: 'discharged' as const },
]

const pillarCards = [
  { value: 'admin', name: 'Admin Office', icon: ClipboardList, href: '/pillar/admin' },
  { value: 'finance', name: 'Finance', icon: DollarSign, href: '/pillar/finance' },
  { value: 'kitchen', name: 'Kitchen', icon: UtensilsCrossed, href: '/pillar/kitchen' },
  { value: 'medical', name: 'Medical', icon: Stethoscope, href: '/pillar/medical' },
  { value: 'board_governance', name: 'Board Governance', icon: Scale, href: '/pillar/board-governance' },
]

export default function DashboardPage() {
  return (
    <div>
      <PageHeader title="Admin Office" subtitle="Manage your facility's operations and compliance" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Residents" value={mockStats.totalResidents} icon={Users} />
        <StatCard label="Total Documents" value={mockStats.totalDocuments} icon={FileText} />
        <StatCard label="Pending Reviews" value={mockStats.pendingReviews} icon={ClipboardCheck} />
        <StatCard label="Compliance" value={`${mockStats.compliancePercent}%`} icon={BarChart2} />
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-medium mb-3" style={{ color: '#5a5a5a' }}>Pillar Overview</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {pillarCards.map(card => (
            <PillarCard
              key={card.value}
              name={card.name}
              docCount={mockPillarCounts[card.value as keyof typeof mockPillarCounts]}
              icon={card.icon}
              href={card.href}
              isActive={card.value === 'admin'}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-5 border" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
          <div className="mb-4">
            <h3 className="text-sm font-medium" style={{ color: '#1E3A2F' }}>Recent Documents</h3>
            <div style={{ width: '36px', height: '2px', backgroundColor: '#D4AF37', marginTop: '4px' }} aria-hidden="true" />
          </div>
          <div className="space-y-2">
            {mockDocuments.map(doc => (
              <DocumentRow key={doc.id} fileName={doc.fileName} fileUrl={doc.fileUrl} category={doc.category} pillar={doc.pillar} date={doc.date} isGlobal={doc.isGlobal} canDelete={false} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
          <div className="mb-4">
            <h3 className="text-sm font-medium" style={{ color: '#1E3A2F' }}>Residents</h3>
            <div style={{ width: '36px', height: '2px', backgroundColor: '#D4AF37', marginTop: '4px' }} aria-hidden="true" />
          </div>
          <div className="space-y-2">
            {mockResidents.map(resident => (
              <ResidentRow key={resident.id} id={resident.id} name={resident.name} roomNumber={resident.roomNumber} status={resident.status} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" className="inline-flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-colors" style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2D5A3D')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1E3A2F')}>
          <Upload size={14} />Upload Document
        </button>
        <button type="button" className="inline-flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium border transition-colors" style={{ borderColor: '#1E3A2F', color: '#1E3A2F', backgroundColor: 'transparent' }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.backgroundColor = '#1E3A2F'; el.style.color = '#ffffff' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.backgroundColor = 'transparent'; el.style.color = '#1E3A2F' }}>
          <UserPlus size={14} />Add Resident
        </button>
      </div>
    </div>
  )
}
