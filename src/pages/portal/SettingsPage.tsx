import { useState, useEffect, useRef } from 'react'
import {
  Building2, Users, ShieldCheck, Bell, Lock, Plug2,
  ClipboardList, AlertTriangle, Plus, Trash2, UserMinus,
  Check, AlertCircle, Loader2, Info,
} from 'lucide-react'
import { useUser } from '@/lib/auth/useUser'
import { apiGet, apiPatch, apiDelete } from '@/lib/api/client'
import { InviteStaffModal } from '@/components/portal/InviteStaffModal'

// ── Types ──────────────────────────────────────────────────────────

type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error'

interface OrgData {
  id: string
  name: string
  country_code: string
  plan_code: string
  created_at: string
}

interface Member {
  membership_id: string
  user_id: string
  email: string
  role_code: string
  status: string
  joined_at: string
}

// ── Constants ──────────────────────────────────────────────────────

const SIDEBAR_SECTIONS = [
  { id: 'facility',      label: 'Facility Profile',      icon: Building2 },
  { id: 'staff',         label: 'Staff & Roles',         icon: Users },
  { id: 'access',        label: 'Access Control',        icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications',         icon: Bell },
  { id: 'security',      label: 'Security',              icon: Lock },
  { id: 'integrations',  label: 'Integrations',         icon: Plug2 },
  { id: 'audit',         label: 'Audit Log',             icon: ClipboardList },
]

// ── Primitives ─────────────────────────────────────────────────────

function SectionCard({ id, children, danger = false }: {
  id: string; children: React.ReactNode; danger?: boolean
}) {
  return (
    <section
      id={id}
      className="bg-white rounded-2xl border scroll-mt-8 overflow-hidden"
      style={{ borderColor: danger ? 'rgba(220,38,38,0.2)' : '#ddd6c8', borderWidth: '0.5px' }}
    >
      {children}
    </section>
  )
}

function SectionHead({ title, subtitle, action, danger = false }: {
  title: string; subtitle?: string; action?: React.ReactNode; danger?: boolean
}) {
  return (
    <div
      className="flex items-start justify-between px-6 pt-5 pb-4 border-b"
      style={{ borderColor: danger ? 'rgba(220,38,38,0.1)' : '#f0ece3' }}
    >
      <div>
        <h2 className="text-sm font-semibold" style={{ color: danger ? '#dc2626' : '#1E3A2F', fontFamily: "'Outfit', system-ui", letterSpacing: '-0.01em' }}>
          {title}
        </h2>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0 ml-4">{action}</div>}
    </div>
  )
}

function FormField({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a', fontFamily: "'Outfit', system-ui" }}>
        {label}
      </label>
      {children}
      {helper && <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>{helper}</p>}
    </div>
  )
}

function FieldInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
      style={{ borderColor: '#ddd6c8', color: '#1a1a1a', fontFamily: "'Outfit', system-ui" }}
      onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
      onBlur={e => (e.target.style.borderColor = '#ddd6c8')}
    />
  )
}

function Btn({ children, variant = 'primary', size = 'md', onClick, disabled, type = 'button' }: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md'
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' }
  const variants = {
    primary:   'bg-[#1E3A2F] text-white hover:bg-[#2D5040]',
    secondary: 'border text-[#1a1a1a] hover:bg-[#fafaf8]',
    danger:    'bg-red-600 text-white hover:bg-red-700',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 font-medium transition-all duration-150 rounded-lg disabled:opacity-50 cursor-pointer ${sizes[size]} ${variants[variant]}`}
      style={variant === 'secondary' ? { borderColor: '#ddd6c8' } : {}}
    >
      {children}
    </button>
  )
}

function SaveBadge({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null
  const map: Record<string, { text: string; color: string; bg: string; icon: React.ReactNode }> = {
    unsaved: { text: 'Unsaved changes', color: '#b45309', bg: 'rgba(180,83,9,0.08)', icon: <AlertCircle size={11} /> },
    saving:  { text: 'Saving...',       color: '#2563eb', bg: 'rgba(37,99,235,0.08)', icon: <Loader2 size={11} className="animate-spin" /> },
    saved:   { text: 'Saved',           color: '#059669', bg: 'rgba(5,150,105,0.08)', icon: <Check size={11} /> },
    error:   { text: 'Save failed',     color: '#dc2626', bg: 'rgba(220,38,38,0.08)', icon: <AlertCircle size={11} /> },
  }
  const c = map[status]
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: c.bg, color: c.color, fontFamily: "'Outfit', system-ui" }}>
      {c.icon}{c.text}
    </span>
  )
}

function ComingSoonBox({ label }: { label: string }) {
  return (
    <div className="px-6 py-10 flex flex-col items-center gap-3 text-center">
      <Info size={22} style={{ color: '#ddd6c8' }} />
      <p className="text-sm" style={{ color: '#9ca3af' }}>
        {label} — coming in a future release.
      </p>
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────

function Sidebar({ active, onNav }: { active: string; onNav: (id: string) => void }) {
  return (
    <aside
      className="hidden lg:flex flex-col flex-shrink-0 sticky self-start"
      style={{ width: '220px', top: '108px', maxHeight: 'calc(100dvh - 130px)', overflowY: 'auto' }}
    >
      <p className="text-[10px] font-semibold tracking-[0.14em] mb-3 px-2" style={{ color: '#9ca3af', fontFamily: "'Outfit', system-ui" }}>
        SETTINGS
      </p>
      <nav className="flex flex-col gap-0.5">
        {SIDEBAR_SECTIONS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNav(id)}
              className="relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 text-left w-full"
              style={{
                color: isActive ? '#1E3A2F' : '#5a5a5a',
                backgroundColor: isActive ? 'rgba(30,58,47,0.06)' : 'transparent',
                fontFamily: "'Outfit', system-ui",
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full" style={{ width: '2.5px', height: '16px', backgroundColor: '#D4AF37' }} aria-hidden="true" />
              )}
              <Icon size={14} style={{ color: isActive ? '#1E3A2F' : '#9ca3af', flexShrink: 0 }} />
              <span className="truncate">{label}</span>
            </button>
          )
        })}

        <div className="my-2 mx-2 h-px" style={{ backgroundColor: '#f0ece3' }} />

        <button
          type="button"
          onClick={() => onNav('danger')}
          className="relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 text-left w-full"
          style={{
            color: active === 'danger' ? '#dc2626' : '#9ca3af',
            backgroundColor: active === 'danger' ? 'rgba(220,38,38,0.05)' : 'transparent',
            fontFamily: "'Outfit', system-ui",
          }}
        >
          {active === 'danger' && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full" style={{ width: '2.5px', height: '16px', backgroundColor: '#dc2626' }} aria-hidden="true" />
          )}
          <AlertTriangle size={14} style={{ color: active === 'danger' ? '#dc2626' : '#fca5a5', flexShrink: 0 }} />
          <span>Danger Zone</span>
        </button>
      </nav>
    </aside>
  )
}

// ── Main page ──────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user } = useUser()
  const orgId = user?.orgId ?? ''

  const [activeSection, setActiveSection] = useState('facility')
  const contentRef = useRef<HTMLDivElement>(null)

  // Org / facility profile
  const [org, setOrg] = useState<OrgData | null>(null)
  const [orgLoading, setOrgLoading] = useState(true)
  const [orgName, setOrgName] = useState('')
  const [orgSaveStatus, setOrgSaveStatus] = useState<SaveStatus>('idle')

  // Members / staff
  const [members, setMembers] = useState<Member[]>([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)

  useEffect(() => {
    if (!orgId) return
    apiGet<OrgData>(`/organisations/${orgId}`)
      .then(data => { setOrg(data); setOrgName(data.name) })
      .catch(() => {})
      .finally(() => setOrgLoading(false))
  }, [orgId])

  useEffect(() => {
    if (!orgId) return
    apiGet<{ data: Member[] }>(`/organisations/${orgId}/members`)
      .then(res => setMembers(Array.isArray(res) ? res : (res.data ?? [])))
      .catch(() => {})
      .finally(() => setMembersLoading(false))
  }, [orgId])

  const handleNav = (id: string) => {
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const saveFacilityProfile = async () => {
    if (!orgId || !orgName.trim()) return
    setOrgSaveStatus('saving')
    try {
      await apiPatch(`/organisations/${orgId}`, { name: orgName.trim() })
      setOrgSaveStatus('saved')
      setTimeout(() => setOrgSaveStatus('idle'), 2500)
    } catch {
      setOrgSaveStatus('error')
    }
  }

  const handleRemoveMember = async (membershipId: string, email: string) => {
    if (!window.confirm(`Remove ${email} from this organisation? They will lose access immediately.`)) return
    try {
      await apiDelete(`/memberships/${membershipId}`)
      setMembers(m => m.filter(x => x.membership_id !== membershipId))
    } catch (err) {
      alert('Could not remove member: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  return (
    <div>
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: '#1E3A2F', fontFamily: "'Plus Jakarta Sans', system-ui", letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <div style={{ width: '36px', height: '2px', backgroundColor: '#D4AF37', marginTop: '6px' }} aria-hidden="true" />
      </div>

      <div className="flex gap-8 items-start">
        <Sidebar active={activeSection} onNav={handleNav} />

        <div ref={contentRef} className="flex-1 min-w-0 space-y-5">

          {/* ── Facility Profile ── */}
          <SectionCard id="facility">
            <SectionHead
              title="Facility Profile"
              subtitle="Basic information about your care facility"
              action={<SaveBadge status={orgSaveStatus} />}
            />
            <div className="px-6 py-5 space-y-4">
              {orgLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 w-32 rounded" style={{ backgroundColor: '#f0ece3' }} />
                  <div className="h-10 rounded-lg" style={{ backgroundColor: '#f0ece3' }} />
                </div>
              ) : (
                <>
                  <FormField label="Facility Name">
                    <FieldInput
                      value={orgName}
                      onChange={v => { setOrgName(v); setOrgSaveStatus('unsaved') }}
                      placeholder="e.g. Sunrise Care Home"
                    />
                  </FormField>
                  {org && (
                    <div className="grid grid-cols-2 gap-3 text-xs" style={{ color: '#5a5a5a' }}>
                      <div><span style={{ color: '#9ca3af' }}>Country: </span>{org.country_code}</div>
                      <div><span style={{ color: '#9ca3af' }}>Plan: </span>{org.plan_code}</div>
                    </div>
                  )}
                  <div className="flex justify-end pt-1">
                    <Btn
                      variant="primary"
                      size="sm"
                      onClick={saveFacilityProfile}
                      disabled={orgSaveStatus === 'saving' || !orgName.trim()}
                    >
                      <Check size={13} />Save Changes
                    </Btn>
                  </div>
                </>
              )}
            </div>
          </SectionCard>

          {/* ── Staff & Roles ── */}
          <SectionCard id="staff">
            <SectionHead
              title="Staff & Roles"
              subtitle="Manage staff accounts and role assignments"
              action={
                <Btn size="sm" onClick={() => setInviteOpen(true)}>
                  <Plus size={13} />Invite Staff
                </Btn>
              }
            />
            <div className="divide-y" style={{ borderColor: '#f0ece3' }}>
              {membersLoading ? (
                <div className="px-6 py-4 animate-pulse space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#f0ece3' }} />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-32 rounded" style={{ backgroundColor: '#f0ece3' }} />
                        <div className="h-2.5 w-20 rounded" style={{ backgroundColor: '#f0ece3' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : members.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm" style={{ color: '#9ca3af' }}>
                  No staff members found.
                </div>
              ) : (
                members.map(m => {
                  const initials = m.email.split('@')[0].slice(0, 2).toUpperCase()
                  const isCurrentUser = m.user_id === user?.id
                  return (
                    <div key={m.membership_id} className="flex items-center gap-3 px-6 py-3.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                        style={{ backgroundColor: 'rgba(30,58,47,0.09)', color: '#1E3A2F' }}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: '#1a1a1a' }}>
                          {m.email}
                          {isCurrentUser && <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(212,175,55,0.12)', color: '#b45309' }}>You</span>}
                        </p>
                        <p className="text-xs mt-0.5 capitalize" style={{ color: '#9ca3af' }}>
                          {m.role_code} · {m.status}
                        </p>
                      </div>
                      {!isCurrentUser && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(m.membership_id, m.email)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-red-50 hover:text-red-500"
                          style={{ color: '#9ca3af' }}
                          aria-label={`Remove ${m.email}`}
                          title="Remove member"
                        >
                          <UserMinus size={14} />
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </SectionCard>

          {/* ── Access Control (stub) ── */}
          <SectionCard id="access">
            <SectionHead title="Access Control" subtitle="Per-pillar staff permissions" />
            <ComingSoonBox label="Per-pillar staff permissions are being migrated to the new backend" />
          </SectionCard>

          {/* ── Notifications (stub) ── */}
          <SectionCard id="notifications">
            <SectionHead title="Notifications" subtitle="Alert preferences and channels" />
            <ComingSoonBox label="Notification settings" />
          </SectionCard>

          {/* ── Security (stub) ── */}
          <SectionCard id="security">
            <SectionHead title="Security" subtitle="Password and authentication settings" />
            <ComingSoonBox label="Password reset and MFA settings" />
          </SectionCard>

          {/* ── Integrations (stub) ── */}
          <SectionCard id="integrations">
            <SectionHead title="Integrations" subtitle="Connect external services" />
            <ComingSoonBox label="Integrations" />
          </SectionCard>

          {/* ── Audit Log (stub) ── */}
          <SectionCard id="audit">
            <SectionHead title="Audit Log" subtitle="Recent system events" />
            <ComingSoonBox label="Audit log" />
          </SectionCard>

          {/* ── Danger Zone ── */}
          <SectionCard id="danger" danger>
            <SectionHead
              title="Danger Zone"
              subtitle="Irreversible actions — proceed with extreme caution"
              danger
            />
            <div className="px-6 py-5">
              <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'rgba(220,38,38,0.08)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>Delete this facility</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Permanently removes all data. Contact support to proceed.</p>
                </div>
                <Btn variant="danger" size="sm" disabled>
                  <Trash2 size={13} />Delete Facility
                </Btn>
              </div>
            </div>
          </SectionCard>

        </div>
      </div>

      {/* Invite modal */}
      {inviteOpen && (
        <InviteStaffModal
          orgId={orgId}
          onClose={() => setInviteOpen(false)}
          onSuccess={member => {
            setMembers(m => [...m, {
              membership_id: member.id,
              user_id: '',
              email: member.email,
              role_code: member.role,
              status: 'invited',
              joined_at: new Date().toISOString(),
            }])
            setInviteOpen(false)
          }}
        />
      )}
    </div>
  )
}
