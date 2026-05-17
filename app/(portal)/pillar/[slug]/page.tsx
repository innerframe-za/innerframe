export const runtime = 'edge'

import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/portal/PageHeader'
import { SectionGroup } from '@/components/portal/SectionGroup'

/** Maps URL slug to pillar display data */
const PILLAR_MAP: Record<string, { name: string; description: string; dbKey: string }> = {
  admin: {
    name: 'Admin Office',
    description: 'The Structure Behind the Facility — policies, staff files, resident records, compliance systems',
    dbKey: 'admin',
  },
  finance: {
    name: 'Finance',
    description: 'Financial Transparency & Sustainability — budgets, DSD allocations, payroll, procurement',
    dbKey: 'finance',
  },
  kitchen: {
    name: 'Kitchen',
    description: 'Safe Nutrition. Safe Residents. — meal planning, food safety, hygiene, temperature controls',
    dbKey: 'kitchen',
  },
  medical: {
    name: 'Medical',
    description: 'Resident Safety & Clinical Compliance — medication management, care plans, incident reporting',
    dbKey: 'medical',
  },
  'board-governance': {
    name: 'Board Governance',
    description: 'Leadership, Accountability & Sustainability — governance structure, board docs, risk registers',
    dbKey: 'board_governance',
  },
}

// TODO: replace all mock data below with Supabase queries
// Query sections: supabase.from('document_sections').select('*')
//   .eq('pillar', pillar.dbKey)
//   .or(`is_global.eq.true,org_id.eq.${orgId}`)
//   .order('sort_order')
// Query documents: supabase.from('documents').select('*')
//   .eq('pillar', pillar.dbKey)
//   .or(`is_global.eq.true,org_id.eq.${orgId}`)
function getMockSections(dbKey: string) {
  const base = [
    {
      id: 'global-1',
      title: 'Innerframe Templates & Guidelines',
      documents: [
        {
          id: 'g1',
          fileName: `${dbKey}_master_index_template.pdf`,
          fileUrl: '#',
          category: 'Template',
          pillar: dbKey,
          date: '1 Jan 2025',
          isGlobal: true,
        },
        {
          id: 'g2',
          fileName: `${dbKey}_policy_framework.pdf`,
          fileUrl: '#',
          category: 'Policy',
          pillar: dbKey,
          date: '1 Jan 2025',
          isGlobal: true,
        },
      ],
    },
    {
      id: 'org-1',
      title: 'Facility Documents',
      documents: [
        {
          id: 'o1',
          fileName: `${dbKey}_facility_document_2025.pdf`,
          fileUrl: '#',
          category: 'Compliance',
          pillar: dbKey,
          date: '10 May 2025',
          isGlobal: false,
        },
      ],
    },
    {
      id: 'org-2',
      title: 'Monthly Reports',
      documents: [],
    },
  ]
  return base
}

interface PillarPageProps {
  params: Promise<{ slug: string }>
}

/**
 * Dynamic pillar page — renders document sections for the given pillar.
 * Shared template for all 5 pillars, driven by the [slug] param.
 */
export default async function PillarPage({ params }: PillarPageProps) {
  const { slug } = await params
  const pillar = PILLAR_MAP[slug]

  if (!pillar) notFound()

  // TODO: fetch real sections + documents from Supabase
  const sections = getMockSections(pillar.dbKey)

  return (
    <div>
      <PageHeader title={pillar.name} subtitle={pillar.description} />

      <div className="space-y-2">
        {sections.map(section => (
          <SectionGroup
            key={section.id}
            title={section.title}
            documents={section.documents}
            canUpload={true}
            canDelete={true}
          />
        ))}
      </div>
    </div>
  )
}

