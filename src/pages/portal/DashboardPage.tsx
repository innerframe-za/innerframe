import { useState } from 'react'
import { Users, FileText, ClipboardCheck, BarChart2, ClipboardList, DollarSign, UtensilsCrossed, Stethoscope, Scale, Upload, UserPlus, HeartPulse, Briefcase } from 'lucide-react'
import { PageHeader } from '@/components/portal/PageHeader'
import { StatCard } from '@/components/portal/StatCard'
import { PillarCard } from '@/components/portal/PillarCard'
import { UploadModal } from '@/components/portal/UploadModal'
import { AddResidentModal } from '@/components/portal/AddResidentModal'
import { usePermissions, PillarSlug } from '@/lib/auth/usePermissions'
import { useUser } from '@/lib/auth/useUser'

const mockStats = { totalResidents: 24, totalDocuments: 87, pendingReviews: 3, compliancePercent: 78 }

const pillarCards = [
  { value: 'admin', name: 'Admin Office', icon: ClipboardList, href: '/pillar/admin' },
  { value: 'finance', name: 'Finance', icon: DollarSign, href: '/pillar/finance' },
  { value: 'kitchen', name: 'Kitchen', icon: UtensilsCrossed, href: '/pillar/kitchen' },
  { value: 'medical', name: 'Medical', icon: Stethoscope, href: '/pillar/medical' },
  { value: 'board_governance', name: 'Board Governance', icon: Scale, href: '/pillar/board-governance' },
  { value: 'medical_residence', name: 'Medical Residence', icon: HeartPulse, href: '/pillar/medical-residence' },
  { value: 'hr', name: 'HR', icon: Briefcase, href: '/pillar/hr' },
]

export default function DashboardPage() {
  const { permissions } = usePermissions()
  const { user } = useUser()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [addResidentOpen, setAddResidentOpen] = useState(false)

  const visiblePillars = pillarCards.filter(
    card => permissions[card.value as PillarSlug]?.canView !== false
  )

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Manage your facility's operations and compliance" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Residents" value={mockStats.totalResidents} icon={Users} />
        <StatCard label="Total Documents" value={mockStats.totalDocuments} icon={FileText} />
        <StatCard label="Pending Reviews" value={mockStats.pendingReviews} icon={ClipboardCheck} />
        <StatCard label="Compliance" value={`${mockStats.compliancePercent}%`} icon={BarChart2} />
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-medium mb-3" style={{ color: '#5a5a5a' }}>Pillar Overview</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {visiblePillars.map(card => (
            <PillarCard
              key={card.value}
              name={card.name}
              icon={card.icon}
              href={card.href}
              isActive={false}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-colors"
          style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2D5A3D')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1E3A2F')}
        >
          <Upload size={14} />Upload Document
        </button>
        <button
          type="button"
          onClick={() => setAddResidentOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium border transition-colors"
          style={{ borderColor: '#1E3A2F', color: '#1E3A2F', backgroundColor: 'transparent' }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.backgroundColor = '#1E3A2F'; el.style.color = '#ffffff' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.backgroundColor = 'transparent'; el.style.color = '#1E3A2F' }}
        >
          <UserPlus size={14} />Add Resident
        </button>
      </div>

      {/* Modals */}
      {user?.orgId && (
        <UploadModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          orgId={user.orgId}
          userRole={user.role}
          onSuccess={() => setUploadOpen(false)}
        />
      )}
      <AddResidentModal
        open={addResidentOpen}
        onClose={() => setAddResidentOpen(false)}
        onSuccess={() => setAddResidentOpen(false)}
      />
    </div>
  )
}
