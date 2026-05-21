import { useParams, Navigate } from 'react-router-dom'
import { PageHeader } from '@/components/portal/PageHeader'
import { SectionGroup } from '@/components/portal/SectionGroup'
import { usePermissions, PillarSlug } from '@/lib/auth/usePermissions'
import { Lock } from 'lucide-react'

const PILLAR_MAP: Record<string, { name: string; description: string; dbKey: string }> = {
  admin: { name: 'Admin Office', description: 'The Structure Behind the Facility — policies, staff files, resident records, compliance systems', dbKey: 'admin' },
  finance: { name: 'Finance', description: 'Financial Transparency & Sustainability — budgets, DSD allocations, payroll, procurement', dbKey: 'finance' },
  kitchen: { name: 'Kitchen', description: 'Safe Nutrition. Safe Residents. — meal planning, food safety, hygiene, temperature controls', dbKey: 'kitchen' },
  medical: { name: 'Medical', description: 'Resident Safety & Clinical Compliance — medication management, care plans, incident reporting', dbKey: 'medical' },
  'board-governance': { name: 'Board Governance', description: 'Leadership, Accountability & Sustainability — governance structure, board docs, risk registers', dbKey: 'board_governance' },
  'medical-residence': { name: 'Medical Residence', description: 'Residential Medical Care — ongoing health monitoring, care assessments, clinical notes, chronic disease management', dbKey: 'medical_residence' },
  hr: { name: 'HR', description: 'Human Resources — staff records, contracts, training, performance management, leave administration', dbKey: 'hr' },
}

function getMockSections(dbKey: string) {
  return [
    {
      id: 'global-1',
      title: 'Innerframe Templates & Guidelines',
      documents: [
        { id: 'g1', fileName: `${dbKey}_master_index_template.pdf`, fileUrl: '#', category: 'Template', pillar: dbKey, date: '1 Jan 2025', isGlobal: true },
        { id: 'g2', fileName: `${dbKey}_policy_framework.pdf`, fileUrl: '#', category: 'Policy', pillar: dbKey, date: '1 Jan 2025', isGlobal: true },
      ],
    },
    {
      id: 'org-1',
      title: 'Facility Documents',
      documents: [
        { id: 'o1', fileName: `${dbKey}_facility_document_2025.pdf`, fileUrl: '#', category: 'Compliance', pillar: dbKey, date: '10 May 2025', isGlobal: false },
      ],
    },
    { id: 'org-2', title: 'Monthly Reports', documents: [] },
  ]
}

export default function PillarPage() {
  const { slug } = useParams<{ slug: string }>()
  const pillar = slug ? PILLAR_MAP[slug] : null
  const { permissions, loading } = usePermissions()

  if (!pillar) return <Navigate to="/dashboard" replace />

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <span className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(30,58,47,0.2)', borderTopColor: '#1E3A2F' }} />
      </div>
    )
  }

  const perm = permissions[pillar.dbKey as PillarSlug]
  if (!perm?.canView) {
    return (
      <div>
        <PageHeader title={pillar.name} subtitle={pillar.description} />
        <div className="bg-white rounded-xl border p-10 flex flex-col items-center gap-3 text-center" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
          <Lock size={32} style={{ color: '#D4AF37' }} />
          <p className="text-sm font-medium" style={{ color: '#1E3A2F' }}>Access Restricted</p>
          <p className="text-xs max-w-xs" style={{ color: '#5a5a5a' }}>
            You don't have permission to view this section. Contact your facility admin to request access.
          </p>
        </div>
      </div>
    )
  }

  const sections = getMockSections(pillar.dbKey)

  return (
    <div>
      <PageHeader title={pillar.name} subtitle={pillar.description} />
      <div className="space-y-2">
        {sections.map(section => (
          <SectionGroup key={section.id} title={section.title} documents={section.documents} canUpload={perm.canEdit} canDelete={perm.canEdit} />
        ))}
      </div>
    </div>
  )
}
