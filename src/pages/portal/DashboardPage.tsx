import { useState, useEffect } from 'react'
import { Users, FileText, ClipboardCheck, BarChart2, ClipboardList, DollarSign, UtensilsCrossed, Stethoscope, Scale, Briefcase } from 'lucide-react'
import { PageHeader } from '@/components/portal/PageHeader'
import { StatCard } from '@/components/portal/StatCard'
import { PillarCard } from '@/components/portal/PillarCard'
import { usePermissions, PillarSlug } from '@/lib/auth/usePermissions'
import { useUser } from '@/lib/auth/useUser'
import { createClient } from '@/lib/supabase/client'

const pillarCards = [
  { value: 'admin', name: 'Admin Office', description: 'The structure behind the facility', icon: ClipboardList, href: '/pillar/admin' },
  { value: 'finance', name: 'Finance', description: 'Financial transparency & sustainability', icon: DollarSign, href: '/pillar/finance' },
  { value: 'kitchen', name: 'Kitchen', description: 'Safe nutrition. Safe residents.', icon: UtensilsCrossed, href: '/pillar/kitchen' },
  { value: 'medical', name: 'Medical', description: 'Resident safety & clinical compliance', icon: Stethoscope, href: '/pillar/medical' },
  { value: 'board_governance', name: 'Board Governance', description: 'Leadership, accountability & sustainability', icon: Scale, href: '/pillar/board-governance' },
  { value: 'hr', name: 'HR', description: 'People. Structure. Compliance.', icon: Briefcase, href: '/pillar/hr' },
]

type Stats = { totalResidents: number; totalDocuments: number; pendingReviews: number; compliancePct: number | null }

export default function DashboardPage() {
  const { permissions } = usePermissions()
  const { user } = useUser()
  const [stats, setStats] = useState<Stats>({ totalResidents: 0, totalDocuments: 0, pendingReviews: 0, compliancePct: null })
  const [loading, setLoading] = useState(true)

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
        compliancePct: total > 0 ? Math.round((done / total) * 100) : 0,
      })
      setLoading(false)
    })
  }, [user?.orgId])

  const visiblePillars = pillarCards.filter(
    card => permissions[card.value as PillarSlug]?.canView !== false
  )

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Manage your facility's operations and compliance"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
                <div className="skeleton h-3 w-20 mb-4" />
                <div className="skeleton h-9 w-16 mb-2" />
                <div className="skeleton h-0.5 w-8 mt-5" />
              </div>
            ))}
          </>
        ) : (
          <>
            <StatCard label="Total residents" value={stats.totalResidents} icon={Users} />
            <StatCard label="Total documents" value={stats.totalDocuments} icon={FileText} />
            <StatCard label="Pending reviews" value={stats.pendingReviews} icon={ClipboardCheck} />
            <StatCard
              label="Compliance score"
              value={stats.compliancePct !== null ? `${stats.compliancePct}%` : '—'}
              icon={BarChart2}
              href="/compliance"
            />
          </>
        )}
      </div>

      {/* Pillar navigation */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2
              className="text-base font-semibold"
              style={{ color: '#1E3A2F', fontFamily: "'Plus Jakarta Sans', system-ui", letterSpacing: '-0.02em' }}
            >
              Pillars
            </h2>
            <div
              style={{ width: '32px', height: '2px', backgroundColor: '#D4AF37', marginTop: '6px', borderRadius: '1px' }}
              aria-hidden="true"
            />
          </div>
          {visiblePillars.length < pillarCards.length && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ color: '#5a5a5a', backgroundColor: 'rgba(30,58,47,0.06)' }}
            >
              {visiblePillars.length} of {pillarCards.length} accessible
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {visiblePillars.map(card => (
            <PillarCard
              key={card.value}
              name={card.name}
              description={card.description}
              icon={card.icon}
              href={card.href}
              isActive={false}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
