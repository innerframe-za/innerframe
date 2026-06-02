import { useState, useEffect, useCallback } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { PageHeader } from '@/components/portal/PageHeader'
import { SectionGroup } from '@/components/portal/SectionGroup'
import { UploadModal } from '@/components/portal/UploadModal'
import { usePermissions, PillarSlug } from '@/lib/auth/usePermissions'
import { useUser } from '@/lib/auth/useUser'
import { createClient } from '@/lib/supabase/client'
import { Lock, Upload } from 'lucide-react'

const PILLAR_MAP: Record<string, { name: string; description: string; dbKey: string }> = {
  admin: { name: 'Admin Office', description: 'The Structure Behind the Facility — policies, staff files, resident records, compliance systems', dbKey: 'admin' },
  finance: { name: 'Finance', description: 'Financial Transparency & Sustainability — budgets, DSD allocations, payroll, procurement', dbKey: 'finance' },
  kitchen: { name: 'Kitchen', description: 'Safe Nutrition. Safe Residents. — meal planning, food safety, hygiene, temperature controls', dbKey: 'kitchen' },
  medical: { name: 'Medical', description: 'Resident Safety & Clinical Compliance — medication management, care plans, incident reporting', dbKey: 'medical' },
  'board-governance': { name: 'Board Governance', description: 'Leadership, Accountability & Sustainability — governance structure, board docs, risk registers', dbKey: 'board_governance' },
  'medical-residence': { name: 'Medical Residence', description: 'Residential Medical Care — ongoing health monitoring, care assessments, clinical notes, chronic disease management', dbKey: 'medical_residence' },
  hr: { name: 'HR', description: 'Human Resources — staff records, contracts, training, performance management, leave administration', dbKey: 'hr' },
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

    // Group documents into display sections
    const globalDocs = fetchedDocs.filter(d => d.is_global).map(toDisplayDoc)
    const unsectionedFacilityDocs = fetchedDocs
      .filter(d => !d.is_global && !d.section_id)
      .map(toDisplayDoc)

    const built: DisplaySection[] = []

    // 1. Global / Innerframe templates section (always shown)
    built.push({ id: 'global', title: 'Innerframe Templates & Guidelines', documents: globalDocs })

    // 2. Per-section facility buckets (from document_sections table)
    for (const sec of fetchedSections) {
      const docs = fetchedDocs
        .filter(d => d.section_id === sec.id)
        .map(toDisplayDoc)
      built.push({ id: sec.id, title: sec.title, documents: docs })
    }

    // 3. Unsectioned facility documents
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
    const { error } = await supabase.from('documents').delete().eq('id', docId)
    if (error) {
      alert('Could not delete document: ' + error.message)
      return
    }
    await supabase.storage.from('documents').remove([fileUrl])
    load()
  }

  // Section items for the UploadModal section selector
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
