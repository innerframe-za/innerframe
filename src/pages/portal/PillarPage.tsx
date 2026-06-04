import { useState, useEffect, useCallback } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { PageHeader } from '@/components/portal/PageHeader'
import { SectionGroup } from '@/components/portal/SectionGroup'
import { UploadModal } from '@/components/portal/UploadModal'
import { usePermissions, PillarSlug } from '@/lib/auth/usePermissions'
import { useUser } from '@/lib/auth/useUser'
import { createClient } from '@/lib/supabase/client'
import { Lock, Upload, ChevronDown, ChevronUp } from 'lucide-react'
import { HRStaffSection } from '@/components/portal/HRStaffSection'

const PILLAR_MAP: Record<string, { name: string; description: string; dbKey: string }> = {
  admin: { name: 'Admin Office', description: 'The Structure Behind the Facility', dbKey: 'admin' },
  finance: { name: 'Finance', description: 'Financial Transparency & Sustainability', dbKey: 'finance' },
  kitchen: { name: 'Kitchen', description: 'Safe Nutrition. Safe Residents.', dbKey: 'kitchen' },
  medical: { name: 'Medical', description: 'Resident Safety & Clinical Compliance', dbKey: 'medical' },
  'board-governance': { name: 'Board Governance', description: 'Leadership, Accountability & Sustainability', dbKey: 'board_governance' },
  'medical-residence': { name: 'Medical Residence', description: 'Ongoing Residential Medical Care', dbKey: 'medical_residence' },
  hr: { name: 'HR', description: 'People. Structure. Compliance.', dbKey: 'hr' },
}

type PillarContent = {
  purpose: string
  focusAreas: string[]
  keySystems: { category: string; items: string[] }[]
}

// Structured pillar content sourced from the InnerFrame website headers guide
const PILLAR_CONTENT: Record<string, PillarContent> = {
  admin: {
    purpose: 'To ensure the facility runs in an organised, compliant, audit-ready, and professional manner.',
    focusAreas: [
      'Policies & Procedures', 'Staff Files', 'Resident Files',
      'Admission & Discharge', 'Daily Operational Control',
      'Compliance Systems', 'Communication Systems', 'Reporting Structure',
    ],
    keySystems: [
      {
        category: 'Administration File Structure',
        items: ['Master Index File', 'Policies & Procedures File', 'Staff Records File', 'Resident Administration File', 'Incident & Complaints File', 'Visitor Register', 'Maintenance Register', 'Asset Register'],
      },
      {
        category: 'Daily Controls',
        items: ['Attendance registers', 'Shift handover books', 'Daily task checklists', 'Visitor sign-in systems', 'Maintenance reporting system'],
      },
      {
        category: 'Compliance Requirements',
        items: ['DSD-ready filing', 'Updated organogram', 'Job descriptions', 'Employment contracts', 'Disciplinary procedures', 'Leave tracking'],
      },
    ],
  },
  finance: {
    purpose: 'To ensure the facility remains financially healthy, accountable, transparent, and aligned with DSD funding structures.',
    focusAreas: [
      'Budgeting', 'Cash Flow Management', 'DSD Allocations', 'Petty Cash',
      'Procurement', 'Financial Reporting', 'Payroll Controls', 'Stock Accountability',
    ],
    keySystems: [
      {
        category: 'Financial Controls',
        items: ['Monthly budget tracking', 'Departmental budgets', 'DSD vs Private funding tracking', 'Petty cash procedures', 'Supplier approval systems'],
      },
      {
        category: 'Reporting',
        items: ['Monthly financial reports', 'Board finance reports', 'Variance analysis', 'Cost framework alignment', 'Quarterly reporting packs'],
      },
      {
        category: 'Payroll & HR Finance',
        items: ['Timesheet verification', 'Overtime control', 'Sunday/public holiday structure', 'Leave calculations', 'UIF compliance'],
      },
      {
        category: 'Procurement Controls',
        items: ['Stock issuing system', 'Purchase request forms', 'Invoice approval workflow', 'Asset tracking'],
      },
    ],
  },
  kitchen: {
    purpose: 'To ensure food safety, hygiene, nutritional compliance, and proper kitchen operational control.',
    focusAreas: [
      'Meal Planning', 'Food Safety', 'Hygiene', 'Temperature Control',
      'Expiry Date Management', 'Stock Issuing', 'Cleaning Schedules', 'Dietary Monitoring',
    ],
    keySystems: [
      {
        category: 'Kitchen Controls',
        items: ['Daily temperature logs', 'Fridge/freezer monitoring', 'Cleaning schedules', 'Deep cleaning schedule', 'Pest control monitoring'],
      },
      {
        category: 'Food Management',
        items: ['Weekly menus', 'Special diet lists', 'Resident dietary requirements', 'Food receiving procedures', 'FIFO stock rotation'],
      },
      {
        category: 'Stock Systems',
        items: ['Cleaning material issue system', 'Food stock issue sheets', 'Monthly stock counts', 'Waste control tracking'],
      },
      {
        category: 'Hygiene Standards',
        items: ['Handwashing procedures', 'PPE usage', 'Dishwashing systems', 'Sanitising controls'],
      },
    ],
  },
  medical: {
    purpose: 'To ensure resident care, medication management, and health monitoring systems are safe, compliant, and resident-focused.',
    focusAreas: [
      'Medication Management', 'Care Plans', 'Incident Reporting', 'Fall Prevention',
      'Health Monitoring', 'Infection Control', 'Nursing Documentation', 'Resident Well-being',
    ],
    keySystems: [
      {
        category: 'Medical Documentation',
        items: ['Resident care plans', 'Medication charts', 'Observation charts', 'Weight monitoring', 'Fluid balance charts', 'Doctor visit records'],
      },
      {
        category: 'Safety Systems',
        items: ['Incident reports', 'Fall registers', 'Emergency procedures', 'Hospital transfer procedures', 'Oxygen monitoring logs'],
      },
      {
        category: 'Infection Control',
        items: ['PPE protocols', 'Isolation procedures', 'Cleaning controls', 'Waste disposal systems'],
      },
      {
        category: 'Shift Controls',
        items: ['Nursing handovers', 'Day/night reports', 'Medication checks', 'Resident monitoring systems'],
      },
    ],
  },
  board_governance: {
    purpose: "To ensure leadership structures are professional, accountable, sustainable, and aligned with the facility's mission and compliance obligations.",
    focusAreas: [
      'Governance Structure', 'Board Oversight', 'Strategic Planning', 'Policy Approval',
      'Financial Accountability', 'Risk Management', 'Compliance Oversight', 'Sustainability Planning',
    ],
    keySystems: [
      {
        category: 'Governance Structure',
        items: ['Board organogram', 'Terms of reference', 'Board meeting schedule', 'Committee structure'],
      },
      {
        category: 'Board Documentation',
        items: ['Board packs', 'Minutes', 'Strategic plans', 'Risk registers', 'Annual reports'],
      },
      {
        category: 'Oversight Systems',
        items: ['Financial oversight', 'Operational reporting', 'Compliance monitoring', 'DSD reporting oversight'],
      },
      {
        category: 'Sustainability Planning',
        items: ['Fundraising strategies', 'Maintenance planning', 'Staffing sustainability', 'Growth planning'],
      },
    ],
  },
  medical_residence: {
    purpose: 'To ensure continuous health monitoring, care assessments, and chronic disease management for all residents in residential care.',
    focusAreas: [
      'Care Assessments', 'Chronic Disease Management', 'Clinical Notes',
      'Health Monitoring', 'Therapy & Rehabilitation', 'Palliative Care',
      'Family Communication', 'Well-being Tracking',
    ],
    keySystems: [
      {
        category: 'Residential Care Documentation',
        items: ['Admission assessments', 'Ongoing care plans', 'Clinical progress notes', 'Chronic medication lists', 'Specialist referral records'],
      },
      {
        category: 'Monitoring & Review',
        items: ['Monthly care reviews', 'Weight & vital signs tracking', 'Therapy session records', 'Family feedback forms'],
      },
      {
        category: 'Communication Systems',
        items: ['Family communication logs', 'MDT meeting records', 'Discharge planning', 'End-of-life documentation'],
      },
    ],
  },
  hr: {
    purpose: 'To ensure all human resources are effectively managed, contracted, trained, and compliant with South African labour law.',
    focusAreas: [
      'Staff Records', 'Employment Contracts', 'Training & Development',
      'Performance Management', 'Leave Administration', 'Labour Law Compliance',
      'Disciplinary Procedures', 'Payroll Integration',
    ],
    keySystems: [
      {
        category: 'Staff Records',
        items: ['Employment contracts', 'Job descriptions', 'ID & qualification copies', 'Police clearance records', 'Emergency contact details'],
      },
      {
        category: 'Leave & Attendance',
        items: ['Leave application forms', 'Leave balance tracking', 'Attendance registers', 'Sick leave records', 'Maternity/paternity documentation'],
      },
      {
        category: 'Training & Development',
        items: ['Induction records', 'Training certificates', 'CPD tracking', 'Competency assessments', 'Skills development plans'],
      },
      {
        category: 'Compliance & Discipline',
        items: ['BCEA compliance checklist', 'Disciplinary records', 'Grievance records', 'CCMA documentation', 'UIF registration'],
      },
    ],
  },
}

type DbSection = { id: string; title: string; sort_order: number; is_global: boolean }

type DbDocument = {
  id: string
  title: string | null
  file_name: string
  file_url: string
  pillar: string
  section_id: string | null
  is_global: boolean
  created_at: string
  category_id: string | null
}

type DisplayDoc = {
  id: string
  title?: string
  fileName: string
  fileUrl: string
  pillar: string
  category?: string
  date: string
  isGlobal: boolean
}

type DisplaySection = {
  id: string
  title: string
  documents: DisplayDoc[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

function toDisplayDoc(d: DbDocument): DisplayDoc {
  return {
    id: d.id,
    title: d.title ?? undefined,
    fileName: d.file_name,
    fileUrl: d.file_url,
    pillar: d.pillar,
    date: formatDate(d.created_at),
    isGlobal: d.is_global,
  }
}

// Collapsible pillar overview card sourced from the InnerFrame headers guide
function PillarOverview({ dbKey }: { dbKey: string }) {
  const [expanded, setExpanded] = useState(false)
  const content = PILLAR_CONTENT[dbKey]
  if (!content) return null

  return (
    <div
      className="rounded-xl border mb-6 overflow-hidden"
      style={{ borderColor: '#ddd6c8', backgroundColor: '#ffffff' }}
    >
      {/* Header row — always visible */}
      <button
        type="button"
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium mb-1" style={{ color: '#D4AF37', letterSpacing: '0.05em' }}>
            PILLAR PURPOSE
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#1E3A2F' }}>
            {content.purpose}
          </p>
        </div>
        <div className="flex-shrink-0 mt-0.5" style={{ color: '#698169' }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Focus areas — always visible */}
      <div className="px-5 pb-4 flex flex-wrap gap-1.5">
        {content.focusAreas.map(area => (
          <span
            key={area}
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ backgroundColor: 'rgba(30,58,47,0.07)', color: '#1E3A2F' }}
          >
            {area}
          </span>
        ))}
      </div>

      {/* Key systems — expanded only */}
      {expanded && (
        <div className="border-t px-5 py-4" style={{ borderColor: '#ddd6c8', backgroundColor: '#FAFAF8' }}>
          <p className="text-xs font-semibold mb-3" style={{ color: '#5a5a5a', letterSpacing: '0.05em' }}>
            KEY SYSTEMS TO IMPLEMENT
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {content.keySystems.map(sys => (
              <div key={sys.category}>
                <p className="text-xs font-semibold mb-1.5" style={{ color: '#1E3A2F' }}>
                  {sys.category}
                </p>
                <ul className="space-y-0.5">
                  {sys.items.map(item => (
                    <li key={item} className="text-xs flex gap-2" style={{ color: '#5a5a5a' }}>
                      <span style={{ color: '#D4AF37' }}>•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PillarPage() {
  const { slug } = useParams<{ slug: string }>()
  const pillar = slug ? PILLAR_MAP[slug] : null
  const { permissions, loading: permLoading } = usePermissions()
  const { user } = useUser()

  const [sections, setSections] = useState<DisplaySection[]>([])
  const [dbSections, setDbSections] = useState<DbSection[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)

  const load = useCallback(async () => {
    if (!pillar || !user?.orgId) return
    setLoading(true)
    const supabase = createClient()

    const [sectionsRes, docsRes] = await Promise.all([
      supabase
        .from('document_sections')
        .select('id, title, sort_order, is_global')
        .eq('pillar', pillar.dbKey)
        .or(`org_id.eq.${user.orgId},is_global.eq.true`)
        .order('sort_order'),
      supabase
        .from('documents_legacy')
        .select('id, title, file_name, file_url, pillar, section_id, is_global, created_at, category_id')
        .eq('pillar', pillar.dbKey)
        .or(`org_id.eq.${user.orgId},is_global.eq.true`)
        .order('created_at', { ascending: false }),
    ])

    const fetchedSections: DbSection[] = (sectionsRes.data ?? []) as DbSection[]
    const fetchedDocs: DbDocument[] = (docsRes.data ?? []) as DbDocument[]
    setDbSections(fetchedSections)

    // Only unsectioned global docs belong in "Innerframe Templates & Guidelines";
    // global docs with a section_id are rendered under their named section below.
    const globalDocs = fetchedDocs.filter(d => d.is_global && !d.section_id).map(toDisplayDoc)
    const unsectionedFacilityDocs = fetchedDocs
      .filter(d => !d.is_global && !d.section_id)
      .map(toDisplayDoc)

    const built: DisplaySection[] = []
    built.push({ id: 'global', title: 'Innerframe Templates & Guidelines', documents: globalDocs })

    for (const sec of fetchedSections) {
      const docs = fetchedDocs.filter(d => d.section_id === sec.id).map(toDisplayDoc)
      built.push({ id: sec.id, title: sec.title, documents: docs })
    }

    built.push({ id: 'unsectioned', title: 'Facility Documents', documents: unsectionedFacilityDocs })
    setSections(built)
    setLoading(false)
  }, [pillar, user?.orgId])

  useEffect(() => { load() }, [load])

  if (!pillar) return <Navigate to="/dashboard" replace />

  if (permLoading || loading) {
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

  const handleDelete = async (docId: string, fileUrl: string) => {
    if (!window.confirm('Delete this document? This cannot be undone.')) return
    const supabase = createClient()
    const { error } = await supabase.from('documents_legacy').delete().eq('id', docId)
    if (error) {
      alert('Could not delete document: ' + error.message)
      return
    }
    await supabase.storage.from('documents').remove([fileUrl])
    load()
  }

  const uploadSections = dbSections.map(s => ({ id: s.id, title: s.title }))

  return (
    <div>
      <PageHeader
        title={pillar.name}
        subtitle={pillar.description}
        action={perm.canEdit ? (
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium"
            style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2D5A3D')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1E3A2F')}
          >
            <Upload size={14} />Upload Document
          </button>
        ) : undefined}
      />

      <PillarOverview dbKey={pillar.dbKey} />

      <div className="space-y-2">
        {sections.map(section => (
          <SectionGroup
            key={section.id}
            title={section.title}
            documents={section.documents}
            canDelete={perm.canEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {pillar.dbKey === 'hr' && <HRStaffSection />}

      {user?.orgId && (
        <UploadModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          orgId={user.orgId}
          userRole={user.role}
          defaultPillar={pillar.dbKey}
          sections={uploadSections}
          onSuccess={() => { setUploadOpen(false); load() }}
        />
      )}
    </div>
  )
}
