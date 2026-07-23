import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Settings, ShieldCheck, Building2, Database } from 'lucide-react'
import { apiGet } from '@/lib/api/client'

type Tab = 'staff' | 'settings'

interface TenantDatabase {
  status: string
  schema_version: number
}

interface Organisation {
  id: string
  name: string
  slug: string
  status: string
  plan_code: string
  country_code: string
  created_at: string
  tenant_database: TenantDatabase | null
}

interface MemberUser {
  id: string
  email: string
  last_login_at: string | null
}

interface Member {
  id: string
  user_id: string
  role_code: string
  status: string
  created_at: string
  user: MemberUser
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === 'admin' || role === 'platform_admin'
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full capitalize"
      style={{
        backgroundColor: isAdmin ? 'rgba(212,175,55,0.12)' : 'rgba(30,58,47,0.06)',
        color: isAdmin ? '#92700a' : '#1E3A2F',
      }}
    >
      {role.replace(/_/g, ' ')}
    </span>
  )
}

function DbStatusBadge({ status }: { status: string }) {
  const isReady = status === 'ready'
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full capitalize"
      style={{
        backgroundColor: isReady ? 'rgba(22,163,74,0.08)' : 'rgba(251,191,36,0.1)',
        color: isReady ? '#15803d' : '#b45309',
      }}
    >
      {status}
    </span>
  )
}

export default function FacilityDetailPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<Tab>('staff')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [org, setOrg] = useState<Organisation | null>(null)
  const [members, setMembers] = useState<Member[]>([])

  useEffect(() => {
    if (!orgId) return
    Promise.all([
      apiGet<Organisation>(`/organisations/${orgId}`),
      apiGet<Member[]>(`/organisations/${orgId}/members`),
    ])
      .then(([orgData, memberData]) => {
        setOrg(orgData)
        setMembers(memberData)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load facility.'))
      .finally(() => setLoading(false))
  }, [orgId])

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <span
        className="w-6 h-6 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(30,58,47,0.2)', borderTopColor: '#1E3A2F' }}
      />
    </div>
  )

  if (error || !org) return (
    <div className="px-4 py-3 rounded border text-sm" style={{ color: '#dc2626', backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
      {error ?? 'Facility not found.'}
    </div>
  )

  const adminCount = members.filter(m => m.role_code === 'admin' || m.role_code === 'platform_admin').length

  const tabs: { key: Tab; label: string; icon: typeof Users }[] = [
    { key: 'staff',    label: 'Staff',    icon: Users },
    { key: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div>
      {/* Back + header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate('/superadmin')}
          className="inline-flex items-center gap-1.5 text-xs mb-4 transition-colors"
          style={{ color: '#5a5a5a' }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#1E3A2F')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#5a5a5a')}
        >
          <ArrowLeft size={13} />All Facilities
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(30,58,47,0.1)' }}>
            <Building2 size={20} style={{ color: '#1E3A2F' }} />
          </div>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: '#1E3A2F' }}>{org.name}</h1>
            <p className="text-xs font-mono" style={{ color: '#5a5a5a' }}>/{org.slug}</p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {([
          { label: 'Members',   value: members.length, icon: Users },
          { label: 'Admins',    value: adminCount,     icon: ShieldCheck },
          { label: 'DB Status', value: org.tenant_database?.status ?? '—', icon: Database },
        ] as const).map(stat => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border p-4 flex items-center gap-3"
            style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(30,58,47,0.08)' }}>
              <stat.icon size={16} style={{ color: '#1E3A2F' }} />
            </div>
            <div>
              <p className="text-xl font-semibold" style={{ color: '#1E3A2F' }}>{stat.value}</p>
              <p className="text-xs" style={{ color: '#5a5a5a' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b" style={{ borderColor: '#ddd6c8' }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.key
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors"
              style={{ borderBottomColor: isActive ? '#1E3A2F' : 'transparent', color: isActive ? '#1E3A2F' : '#5a5a5a' }}
            >
              <Icon size={14} />{tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Staff tab ── */}
      {activeTab === 'staff' && (
        <div className="space-y-2">
          <p className="text-xs mb-1" style={{ color: '#5a5a5a' }}>
            {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
          {members.length === 0 && (
            <div
              className="bg-white rounded-xl border py-10 text-center text-sm"
              style={{ borderColor: '#ddd6c8', borderWidth: '0.5px', color: '#5a5a5a' }}
            >
              No members yet.
            </div>
          )}
          {members.map(m => {
            const initials = m.user.email.split('@')[0].slice(0, 2).toUpperCase()
            return (
              <div
                key={m.id}
                className="bg-white rounded-xl border p-4 flex items-center gap-3"
                style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                  style={{ backgroundColor: '#1E3A2F' }}
                >
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{m.user.email}</p>
                    <RoleBadge role={m.role_code} />
                    {m.status !== 'active' && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
                        {m.status}
                      </span>
                    )}
                  </div>
                  {m.user.last_login_at && (
                    <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>
                      Last login {new Date(m.user.last_login_at).toLocaleDateString('en-ZA')}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Settings tab ── */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
          <h2 className="text-base font-medium mb-1" style={{ color: '#1E3A2F' }}>Facility Settings</h2>
          <div style={{ width: '36px', height: '2px', backgroundColor: '#D4AF37', marginBottom: '20px' }} aria-hidden="true" />
          <div className="space-y-3 max-w-xl">
            {[
              { label: 'Facility Name', value: org.name },
              { label: 'Slug',          value: org.slug },
              { label: 'Plan',          value: org.plan_code },
              { label: 'Country',       value: org.country_code },
              { label: 'Status',        value: org.status },
              { label: 'Created',       value: new Date(org.created_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }) },
            ].map(field => (
              <div key={field.label} className="flex items-center gap-4">
                <span className="text-xs font-medium w-28 flex-shrink-0" style={{ color: '#5a5a5a' }}>{field.label}</span>
                <span className="text-sm capitalize" style={{ color: '#1a1a1a' }}>{field.value}</span>
              </div>
            ))}
            {org.tenant_database && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium w-28 flex-shrink-0" style={{ color: '#5a5a5a' }}>DB Status</span>
                <DbStatusBadge status={org.tenant_database.status} />
              </div>
            )}
          </div>
          <p className="text-xs mt-6" style={{ color: '#9ca3af' }}>
            Edit facility settings via the platform admin API.
          </p>
        </div>
      )}
    </div>
  )
}
