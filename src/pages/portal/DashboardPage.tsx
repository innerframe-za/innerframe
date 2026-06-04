import { useState, useEffect } from 'react'
import { Users, FileText, ClipboardCheck, BarChart2, ClipboardList, DollarSign, UtensilsCrossed, Stethoscope, Scale, HeartPulse, Briefcase } from 'lucide-react'
import { PageHeader } from '@/components/portal/PageHeader'
import { StatCard } from '@/components/portal/StatCard'
import { PillarCard } from '@/components/portal/PillarCard'
import { usePermissions, PillarSlug } from '@/lib/auth/usePermissions'
import { useUser } from '@/lib/auth/useUser'
import { createClient } from '@/lib/supabase/client'

const pillarCards = [
  { value: 'admin', name: 'Admin Office', icon: ClipboardList, href: '/pillar/admin' },
  { value: 'finance', name: 'Finance', icon: DollarSign, href: '/pillar/finance' },
  { value: 'kitchen', name: 'Kitchen', icon: UtensilsCrossed, href: '/pillar/kitchen' },
  { value: 'medical', name: 'Medical', icon: Stethoscope, href: '/pillar/medical' },
  { value: 'board_governance', name: 'Board Governance', icon: Scale, href: '/pillar/board-governance' },
  { value: 'medical_residence', name: 'Medical Residence', icon: HeartPulse, href: '/pillar/medical-residence' },
  { value: 'hr', name: 'HR', icon: Briefcase, href: '/pillar/hr' },
]

type Stats = { totalResidents: number; totalDocuments: number; pendingReviews: number; compliancePct: number | null }

export default function DashboardPage() {
  const { permissions } = usePermissions()
  const { user } = useUser()
  const [stats, setStats] = useState<Stats>({ totalResidents: 0, totalDocuments: 0, pendingReviews: 0, compliancePct: null })

  useEffect(() => {
    if (!user?.orgId) return
    const supabase = createClient()
    Promise.all([
      supabase.from('patients').select('*', { count: 'exact', head: true }).eq('org_id', user.orgId),
      supabase.from('documents_legacy').select('*', { count: 'exact', head: true }).eq('org_id', user.orgId),
      supabase.from('compliance_items').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('compliance_checks').select('id', { count: 'exact', head: true }).eq('org_id', user.orgId).eq('is_complete', true),
    ]).then(([residentsRes, docsRes, itemsRes, checksRes]) => {
      const total = itemsRes.count ?? 0
      const done  = checksRes.count ?? 0
      setStats({
        totalResidents: residentsRes.count ?? 0,
        totalDocuments: docsRes.count ?? 0,
        pendingReviews: 0,
        compliancePct:  total > 0 ? Math.round((done / total) * 100) : 0,
      })
    })
  }, [user?.orgId])

  const visiblePillars = pillarCards.filter(
    card => permissions[card.value as PillarSlug]?.canView !== false
  )

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Manage your facility's operations and compliance" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Residents" value={stats.totalResidents} icon={Users} />
        <StatCard label="Total Documents" value={stats.totalDocuments} icon={FileText} />
        <StatCard label="Pending Reviews" value={stats.pendingReviews} icon={ClipboardCheck} />
        <StatCard
          label="Compliance"
          value={stats.compliancePct !== null ? `${stats.compliancePct}%` : '—'}
          icon={BarChart2}
          href="/compliance"
        />
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

    </div>
  )
}
