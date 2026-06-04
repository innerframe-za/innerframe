import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, Users, ShieldCheck, Bell, Lock, Plug2,
  ClipboardList, AlertTriangle, Plus, Trash2, UserMinus,
  ChevronDown, KeyRound, Check, Download, Info,
  AlertCircle, Loader2, FolderOpen,
} from 'lucide-react'
import { useUser } from '@/lib/auth/useUser'
import { createClient } from '@/lib/supabase/client'
import type { PillarSlug } from '@/lib/auth/usePermissions'
import { InviteStaffModal } from '@/components/portal/InviteStaffModal'

// ── Types ──────────────────────────────────────────────────────────
type NewMember = { id: string; fullName: string; email: string; role: string; username: string }
type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error'

interface StaffMember {
  id: string; fullName: string; email: string; role: string; username: string | null
}
interface StaffPerms {
  [pillarSlug: string]: { canView: boolean; canEdit: boolean }
}

const ALL_PILLARS: { slug: PillarSlug; label: string }[] = [
  { slug: 'admin', label: 'Admin Office' },
  { slug: 'finance', label: 'Finance' },
  { slug: 'kitchen', label: 'Kitchen' },
  { slug: 'medical', label: 'Medical' },
  { slug: 'medical_residence', label: 'Medical Residence' },
  { slug: 'hr', label: 'HR' },
  { slug: 'board_governance', label: 'Board Governance' },
]

const SIDEBAR_SECTIONS = [
  { id: 'facility', label: 'Facility Profile', icon: Building2 },
  { id: 'staff', label: 'Staff & Roles', icon: Users },
  { id: 'categories', label: 'Document Categories', icon: FolderOpen },
  { id: 'access', label: 'Access Control', icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'integrations', label: 'Integrations', icon: Plug2 },
  { id: 'audit', label: 'Audit Log', icon: ClipboardList },
]

// ── Primitives ─────────────────────────────────────────────────────

function SectionCard({ id, children, danger = false }: {
  id: string; children: React.ReactNode; danger?: boolean
}) {
  return (
    <section
      id={id}
      className="bg-white rounded-2xl border scroll-mt-8 overflow-hidden"
      style={{
        borderColor: danger ? 'rgba(220,38,38,0.2)' : '#ddd6c8',
        borderWidth: '0.5px',
      }}
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
        <h2
          className="text-sm font-semibold"
          style={{
            color: danger ? '#dc2626' : '#1E3A2F',
            fontFamily: "'Outfit', system-ui",
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0 ml-4">{action}</div>}
    </div>
  )
}

function FormField({ label, helper, children }: {
  label: string; helper?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label
        className="block text-xs font-medium mb-1.5"
        style={{ color: '#1a1a1a', fontFamily: "'Outfit', system-ui" }}
      >
        {label}
      </label>
      {children}
      {helper && (
        <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>{helper}</p>
      )}
    </div>
  )
}

function Field({ value, onChange, placeholder, type = 'text' }: {
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
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  const base = "inline-flex items-center gap-1.5 font-medium transition-all duration-150 rounded-lg disabled:opacity-50 cursor-pointer"
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" }
  const variants = {
    primary:   "bg-[#1E3A2F] text-white hover:bg-[#2D5040]",
    secondary: "border text-[#1a1a1a] hover:bg-[#fafaf8]",
    danger:    "bg-red-600 text-white hover:bg-red-700",
    ghost:     "text-[#5a5a5a] hover:text-[#1E3A2F] hover:bg-[rgba(30,58,47,0.06)]",
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]}`}
      style={variant === 'secondary' ? { borderColor: '#ddd6c8' } : {}}
    >
      {children}
    </button>
  )
}

function ToggleRow({ enabled, onChange, label, helper }: {
  enabled: boolean; onChange: (v: boolean) => void; label: string; helper?: string
}) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <div className="flex-1 pr-6 min-w-0">
        <p className="text-sm font-medium" style={{ color: '#1a1a1a', fontFamily: "'Outfit', system-ui" }}>{label}</p>
        {helper && <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{helper}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className="relative flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A2F] focus-visible:ring-offset-2"
        style={{ width: '40px', height: '22px', backgroundColor: enabled ? '#1E3A2F' : '#e5e7eb' }}
      >
        <span
          className="absolute rounded-full bg-white shadow-sm transition-transform duration-200"
          style={{
            width: '18px', height: '18px',
            top: '2px', left: '2px',
            transform: enabled ? 'translateX(18px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  )
}

function SaveBadge({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null
  const map = {
    unsaved: { text: 'Unsaved changes', color: '#b45309', bg: 'rgba(180,83,9,0.08)', icon: <AlertCircle size={11} /> },
    saving:  { text: 'Saving...', color: '#2563eb', bg: 'rgba(37,99,235,0.08)', icon: <Loader2 size={11} className="animate-spin" /> },
    saved:   { text: 'Saved', color: '#059669', bg: 'rgba(5,150,105,0.08)', icon: <Check size={11} /> },
    error:   { text: 'Save failed', color: '#dc2626', bg: 'rgba(220,38,38,0.08)', icon: <AlertCircle size={11} /> },
  }
  const c = map[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
      style={{ backgroundColor: c.bg, color: c.color, fontFamily: "'Outfit', system-ui" }}
    >
      {c.icon}{c.text}
    </span>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────
function Sidebar({ active, onNav }: { active: string; onNav: (id: string) => void }) {
  return (
    <aside
      className="hidden lg:flex flex-col flex-shrink-0 sticky self-start"
      style={{ width: '220px', top: '108px', maxHeight: 'calc(100dvh - 130px)', overflowY: 'auto' }}
    >
      <p
        className="text-[10px] font-semibold tracking-[0.14em] mb-3 px-2"
        style={{ color: '#9ca3af', fontFamily: "'Outfit', system-ui" }}
      >
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
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                  style={{ width: '2.5px', height: '16px', backgroundColor: '#D4AF37' }}
                  aria-hidden="true"
                />
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
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
              style={{ width: '2.5px', height: '16px', backgroundColor: '#dc2626' }}
              aria-hidden="true"
            />
          )}
          <AlertTriangle size={14} style={{ color: active === 'danger' ? '#dc2626' : '#fca5a5', flexShrink: 0 }} />
          <span>Danger Zone</span>
        </button>
      </nav>
    </aside>
  )
}

// ── StaffPermissionRow ─────────────────────────────────────────────
function StaffRow({
  member, onPromote, onDeactivate,
}: {
  member: StaffMember
  onPromote: (id: string, role: string) => void
  onDeactivate: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [perms, setPerms] = useState<StaffPerms>({})
  const [permsLoading, setPermsLoading] = useState(false)
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const isAdmin = member.role === 'home_admin'

  const loadPerms = useCallback(async () => {
    setPermsLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('staff_permissions')
        .select('pillar_slug, can_view, can_edit')
        .eq('user_id', member.id)
      const map: StaffPerms = {}
      for (const row of data ?? []) map[row.pillar_slug] = { canView: row.can_view, canEdit: row.can_edit }
      setPerms(map)
    } catch { /* ignore */ }
    setPermsLoading(false)
  }, [member.id])

  const togglePerm = async (slug: PillarSlug, field: 'canView' | 'canEdit', val: boolean) => {
    const cur = perms[slug] ?? { canView: true, canEdit: false }
    const next = { ...cur, [field]: val }
    if (field === 'canView' && !val) next.canEdit = false
    setPerms(p => ({ ...p, [slug]: next }))
    try {
      const supabase = createClient()
      await supabase.from('staff_permissions').upsert({
        user_id: member.id, pillar_slug: slug,
        can_view: next.canView, can_edit: next.canEdit,
      }, { onConflict: 'user_id,pillar_slug' })
    } catch { /* ignore */ }
  }

  const handleExpand = () => {
    if (!expanded) loadPerms()
    setExpanded(v => !v)
  }

  const handleReset = async () => {
    setResetStatus('sending')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(member.email)
      setResetStatus(error ? 'error' : 'sent')
    } catch { setResetStatus('error') }
    setTimeout(() => setResetStatus('idle'), 4000)
  }

  const initials = member.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div
      className="border rounded-xl overflow-hidden transition-shadow duration-150 hover:shadow-sm"
      style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
          style={{
            backgroundColor: isAdmin ? '#1E3A2F' : 'rgba(30,58,47,0.09)',
            color: isAdmin ? '#D4AF37' : '#1E3A2F',
            fontFamily: "'Outfit', system-ui",
          }}
          aria-hidden="true"
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium" style={{ color: '#1a1a1a', fontFamily: "'Outfit', system-ui" }}>
              {member.fullName}
            </p>
            <span
              className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{
                backgroundColor: isAdmin ? 'rgba(212,175,55,0.12)' : 'rgba(30,58,47,0.07)',
                color: isAdmin ? '#b45309' : '#1E3A2F',
              }}
            >
              {isAdmin ? 'Home Admin' : 'Staff'}
            </span>
          </div>
          <p className="text-xs mt-0.5 truncate" style={{ color: '#9ca3af' }}>
            {member.username && <span style={{ color: '#5a5a5a' }}>{member.username} · </span>}
            {member.email}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Btn variant="secondary" size="sm" onClick={() => onPromote(member.id, member.role)}>
            {isAdmin ? 'Demote' : 'Promote'}
          </Btn>
          <button
            type="button"
            onClick={() => onDeactivate(member.id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-150 hover:bg-red-50 hover:text-red-500"
            style={{ color: '#9ca3af' }}
            aria-label={`Remove ${member.fullName}`}
          >
            <UserMinus size={14} />
          </button>
          <button
            type="button"
            onClick={handleExpand}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-150 hover:bg-[rgba(30,58,47,0.06)]"
            style={{ color: expanded ? '#1E3A2F' : '#9ca3af' }}
            aria-label={expanded ? 'Collapse' : 'Expand permissions'}
          >
            <ChevronDown
              size={14}
              style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
            />
          </button>
        </div>
      </div>

      {/* Expanded permissions panel */}
      {expanded && (
        <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: '#f0ece3', backgroundColor: '#fafaf8' }}>
          <p
            className="text-[10px] font-semibold tracking-[0.12em] mb-3"
            style={{ color: '#9ca3af', fontFamily: "'Outfit', system-ui" }}
          >
            PILLAR ACCESS
          </p>
          {permsLoading ? (
            <div className="flex items-center justify-center py-4">
              <span className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(30,58,47,0.15)', borderTopColor: '#1E3A2F' }} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-4">
              {ALL_PILLARS.map(({ slug, label }) => {
                const p = perms[slug] ?? { canView: true, canEdit: false }
                return (
                  <div
                    key={slug}
                    className="flex items-center justify-between px-3 py-2 rounded-lg border"
                    style={{ borderColor: '#ddd6c8', borderWidth: '0.5px', backgroundColor: '#ffffff' }}
                  >
                    <span className="text-xs font-medium" style={{ color: '#1a1a1a', fontFamily: "'Outfit', system-ui" }}>{label}</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={p.canView}
                          onChange={e => togglePerm(slug, 'canView', e.target.checked)}
                          className="w-3.5 h-3.5 accent-[#1E3A2F]"
                        />
                        <span className="text-xs" style={{ color: '#5a5a5a' }}>View</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={p.canEdit}
                          disabled={!p.canView}
                          onChange={e => togglePerm(slug, 'canEdit', e.target.checked)}
                          className="w-3.5 h-3.5 accent-[#1E3A2F] disabled:opacity-40"
                        />
                        <span className="text-xs" style={{ color: p.canView ? '#5a5a5a' : '#d1d5db' }}>Edit</span>
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #f0ece3' }}>
            <div>
              <p className="text-xs font-medium" style={{ color: '#1a1a1a', fontFamily: "'Outfit', system-ui" }}>Reset password</p>
              <p className="text-xs" style={{ color: '#9ca3af' }}>Send a reset link to {member.email}</p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              disabled={resetStatus === 'sending' || resetStatus === 'sent'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150 disabled:opacity-60"
              style={{
                borderColor: resetStatus === 'sent' ? '#059669' : resetStatus === 'error' ? '#dc2626' : '#ddd6c8',
                color: resetStatus === 'sent' ? '#059669' : resetStatus === 'error' ? '#dc2626' : '#5a5a5a',
                fontFamily: "'Outfit', system-ui",
              }}
            >
              <KeyRound size={12} />
              {resetStatus === 'sending' ? 'Sending...' : resetStatus === 'sent' ? 'Email sent' : resetStatus === 'error' ? 'Failed - try again' : 'Send reset link'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Integration card ───────────────────────────────────────────────
function IntegrationCard({ name, desc, connected }: { name: string; desc: string; connected: boolean }) {
  const abbr = name.slice(0, 2).toUpperCase()
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 hover:shadow-sm"
      style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
        style={{ backgroundColor: 'rgba(30,58,47,0.07)', color: '#1E3A2F', fontFamily: "'Plus Jakarta Sans', system-ui" }}
      >
        {abbr}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: '#1a1a1a', fontFamily: "'Outfit', system-ui" }}>{name}</p>
        <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{desc}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className="text-xs px-2 py-0.5 rounded font-medium"
          style={{
            backgroundColor: connected ? 'rgba(5,150,105,0.08)' : 'rgba(156,163,175,0.12)',
            color: connected ? '#059669' : '#9ca3af',
          }}
        >
          {connected ? 'Connected' : 'Not connected'}
        </span>
        <Btn variant="secondary" size="sm">{connected ? 'Manage' : 'Connect'}</Btn>
      </div>
    </div>
  )
}

// ── Audit log entry ────────────────────────────────────────────────
function AuditEntry({ action, by, at, type }: {
  action: string; by: string; at: string; type: 'info' | 'warning' | 'success'
}) {
  const c = {
    info:    { dot: '#2563eb', text: '#2563eb', bg: 'rgba(37,99,235,0.1)',   label: 'Info' },
    warning: { dot: '#d97706', text: '#d97706', bg: 'rgba(217,119,6,0.1)',   label: 'Change' },
    success: { dot: '#059669', text: '#059669', bg: 'rgba(5,150,105,0.1)',   label: 'Action' },
  }[type]
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex-shrink-0 w-4 flex justify-center mt-1.5">
        <span className="w-1.5 h-1.5 rounded-full block" style={{ backgroundColor: c.dot }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ color: '#1a1a1a', fontFamily: "'Outfit', system-ui" }}>{action}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs" style={{ color: '#9ca3af' }}>{by}</span>
          <span className="text-xs" style={{ color: '#e5e7eb' }}>·</span>
          <span className="text-xs" style={{ color: '#9ca3af' }}>{at}</span>
        </div>
      </div>
      <span
        className="text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0"
        style={{ backgroundColor: c.bg, color: c.text }}
      >
        {c.label}
      </span>
    </div>
  )
}

// ── Danger row ─────────────────────────────────────────────────────
function DangerRow({ title, desc, action, actionLabel, variant = 'secondary' }: {
  title: string; desc: string; action: () => void; actionLabel: string; variant?: 'secondary' | 'danger'
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium" style={{ color: variant === 'danger' ? '#dc2626' : '#1a1a1a', fontFamily: "'Outfit', system-ui" }}>
          {title}
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{desc}</p>
      </div>
      <Btn variant={variant} size="sm" onClick={action}>{actionLabel}</Btn>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user } = useUser()
  const navigate = useNavigate()
  const isSuperAdmin = user?.role === 'super_admin'

  const [activeSection, setActiveSection] = useState('facility')

  // Facility profile
  const [orgForm, setOrgForm] = useState({ name: '', address: '', contactEmail: '', contactPhone: '' })
  const [orgSaved, setOrgSaved] = useState({ name: '', address: '', contactEmail: '', contactPhone: '' })
  const [orgLoading, setOrgLoading] = useState(true)
  const [orgStatus, setOrgStatus] = useState<SaveStatus>('idle')

  // Staff
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [inviteOpen, setInviteOpen] = useState(false)

  // Document categories
  const [categories, setCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState('')

  // Toggle groups (UI state — wire to Supabase as needed)
  const [access, setAccess] = useState({
    staffCanInvite: false, staffCanExport: false,
    staffCanDelete: false, sensitiveFields: false, crossFacility: false,
  })
  const [notifs, setNotifs] = useState({
    emailAlerts: true, weeklyDigest: false,
    roleAlerts: true, inviteAlerts: true, complianceReport: false,
  })
  const [security, setSecurity] = useState({
    twoFactor: false, sessionTimeout: true,
    passwordExpiry: false, confirmHighRisk: true,
  })

  // Super admin orgs
  const [orgs, setOrgs] = useState<{
    id: string; name: string; contactEmail: string | null
    residents: number; documents: number; createdAt: string
  }[]>([])

  // ── Scroll-spy ─────────────────────────────────────────────────
  const spyIds = [...SIDEBAR_SECTIONS.map(s => s.id), 'danger']
  const obsRef = useRef<IntersectionObserver[]>([])

  useEffect(() => {
    obsRef.current.forEach(o => o.disconnect())
    obsRef.current = []

    spyIds.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActiveSection(id) },
        { rootMargin: '-15% 0px -75% 0px', threshold: 0 }
      )
      obs.observe(el)
      obsRef.current.push(obs)
    })

    return () => obsRef.current.forEach(o => o.disconnect())
  }, [orgLoading]) // re-run after content renders

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ── Data loading ───────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    let supabase: ReturnType<typeof createClient>
    try { supabase = createClient() } catch { setOrgLoading(false); return }

    async function load() {
      const { data: orgData } = await supabase
        .from('organisations')
        .select('name, address, contact_email, contact_phone')
        .eq('id', user!.orgId).single()

      if (orgData) {
        const f = {
          name: orgData.name ?? '', address: orgData.address ?? '',
          contactEmail: orgData.contact_email ?? '', contactPhone: orgData.contact_phone ?? '',
        }
        setOrgForm(f); setOrgSaved(f)
      }

      let { data: staffData, error: se } = await supabase
        .from('users').select('id, full_name, email, role, username')
        .eq('org_id', user!.orgId).neq('role', 'super_admin').neq('id', user!.id).order('full_name')

      if (se) {
        const r = await supabase.from('users').select('id, full_name, email, role')
          .eq('org_id', user!.orgId).neq('role', 'super_admin').neq('id', user!.id).order('full_name')
        staffData = r.data as unknown as typeof staffData
      }

      setStaff((staffData ?? []).map(u => ({
        id: u.id, fullName: u.full_name, email: u.email, role: u.role,
        username: (u as { username?: string | null }).username ?? null,
      })))

      const { data: cats } = await supabase
        .from('document_categories').select('name').eq('org_id', user!.orgId).order('name')
      setCategories((cats ?? []).map(c => c.name))
      setOrgLoading(false)
    }

    async function loadSuperAdmin() {
      const { data: orgsData } = await supabase
        .from('organisations').select('id, name, contact_email, created_at')
        .neq('id', '00000000-0000-0000-0000-000000000001').order('name')
      if (!orgsData) return setOrgs([])

      const ids = orgsData.map(o => o.id)
      const [pr, dr] = await Promise.all([
        supabase.from('patients').select('org_id').in('org_id', ids),
        supabase.from('documents_legacy').select('org_id').in('org_id', ids),
      ])
      const pc: Record<string, number> = {}; const dc: Record<string, number> = {}
      for (const r of pr.data ?? []) pc[r.org_id] = (pc[r.org_id] ?? 0) + 1
      for (const r of dr.data ?? []) dc[r.org_id] = (dc[r.org_id] ?? 0) + 1
      setOrgs(orgsData.map(o => ({
        id: o.id, name: o.name, contactEmail: o.contact_email,
        residents: pc[o.id] ?? 0, documents: dc[o.id] ?? 0, createdAt: o.created_at,
      })))
    }

    load().catch(() => setOrgLoading(false))
    if (isSuperAdmin) loadSuperAdmin().catch(() => {})
  }, [user, isSuperAdmin])

  // ── Unsaved changes detection ──────────────────────────────────
  useEffect(() => {
    if (orgLoading) return
    const changed = JSON.stringify(orgForm) !== JSON.stringify(orgSaved)
    if (changed && orgStatus === 'idle') setOrgStatus('unsaved')
    else if (!changed && orgStatus === 'unsaved') setOrgStatus('idle')
  }, [orgForm, orgSaved, orgLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ───────────────────────────────────────────────────
  const saveOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    setOrgStatus('saving')
    try {
      const supabase = createClient()
      await supabase.from('organisations').update({
        name: orgForm.name, address: orgForm.address,
        contact_email: orgForm.contactEmail, contact_phone: orgForm.contactPhone,
      }).eq('id', user!.orgId)
      setOrgSaved({ ...orgForm })
      setOrgStatus('saved')
      setTimeout(() => setOrgStatus('idle'), 3000)
    } catch { setOrgStatus('error') }
  }

  const promote = async (id: string, role: string) => {
    const next = role === 'staff' ? 'home_admin' : 'staff'
    try {
      const supabase = createClient()
      await supabase.from('users').update({ role: next }).eq('id', id)
      setStaff(p => p.map(m => m.id === id ? { ...m, role: next } : m))
    } catch { /* ignore */ }
  }

  const deactivate = async (id: string) => {
    setStaff(p => p.filter(m => m.id !== id))
    try {
      const supabase = createClient()
      await supabase.from('users').delete().eq('id', id)
    } catch { /* ignore */ }
  }

  const addCategory = async () => {
    const val = newCategory.trim()
    if (!val || categories.includes(val)) return
    setCategories(p => [...p, val]); setNewCategory('')
    try {
      const supabase = createClient()
      await supabase.from('document_categories').insert({ org_id: user!.orgId, name: val })
    } catch { /* ignore */ }
  }

  const removeCategory = async (cat: string) => {
    setCategories(p => p.filter(c => c !== cat))
    try {
      const supabase = createClient()
      await supabase.from('document_categories').delete().eq('org_id', user!.orgId).eq('name', cat)
    } catch { /* ignore */ }
  }

  // ── Render ──────────────────────────────────────────────────────
  return (
    <>
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            className="font-semibold tracking-tight"
            style={{
              fontFamily: "'Plus Jakarta Sans', system-ui",
              fontSize: 'clamp(1.5rem, 3vw, 1.875rem)',
              color: '#1E3A2F', letterSpacing: '-0.025em',
            }}
          >
            Settings
          </h1>
          <div className="mt-2" style={{ width: '48px', height: '2px', backgroundColor: '#D4AF37', borderRadius: '1px' }} aria-hidden="true" />
          <p className="mt-2.5 text-sm" style={{ color: '#5a5a5a' }}>
            Facility profile, staff access, and system preferences
          </p>
        </div>
        <SaveBadge status={orgStatus} />
      </div>

      {/* Two-column layout */}
      <div className="flex gap-10 items-start">
        <Sidebar active={activeSection} onNav={scrollTo} />

        <div className="flex-1 min-w-0 space-y-5">

          {/* ── Facility Profile ───────────────────────────── */}
          <SectionCard id="facility">
            <SectionHead
              title="Facility Profile"
              subtitle="Name, contact details, and address"
              action={<SaveBadge status={orgStatus} />}
            />
            <div className="px-6 py-5">
              {orgLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i}><div className="skeleton h-3 w-24 mb-2" /><div className="skeleton h-9 w-full" /></div>
                  ))}
                </div>
              ) : (
                <form onSubmit={saveOrg} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Facility name">
                      <Field value={orgForm.name} onChange={v => setOrgForm(p => ({ ...p, name: v }))} placeholder="Sunrise Care Home" />
                    </FormField>
                    <FormField label="Phone number">
                      <Field type="tel" value={orgForm.contactPhone} onChange={v => setOrgForm(p => ({ ...p, contactPhone: v }))} placeholder="011 555 0100" />
                    </FormField>
                    <FormField label="Contact email" helper="Used for billing and compliance notifications">
                      <Field type="email" value={orgForm.contactEmail} onChange={v => setOrgForm(p => ({ ...p, contactEmail: v }))} placeholder="admin@facility.co.za" />
                    </FormField>
                    <div className="sm:col-span-2">
                      <FormField label="Address">
                        <Field value={orgForm.address} onChange={v => setOrgForm(p => ({ ...p, address: v }))} placeholder="123 Main Street, Johannesburg, 2000" />
                      </FormField>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <Btn type="submit" variant="primary" disabled={orgStatus === 'saving' || orgStatus === 'saved'}>
                      {orgStatus === 'saving' ? (
                        <><span className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />Saving</>
                      ) : orgStatus === 'saved' ? (
                        <><Check size={14} />Saved</>
                      ) : 'Save changes'}
                    </Btn>
                    {orgStatus === 'error' && (
                      <p className="text-xs" style={{ color: '#dc2626' }}>Changes could not be saved. Please try again.</p>
                    )}
                  </div>
                </form>
              )}
            </div>
          </SectionCard>

          {/* ── Staff & Roles ──────────────────────────────── */}
          <SectionCard id="staff">
            <SectionHead
              title="Staff & Roles"
              subtitle="Manage team members, roles, and pillar access"
              action={
                <Btn variant="primary" size="sm" onClick={() => setInviteOpen(true)}>
                  <Plus size={13} />Invite staff
                </Btn>
              }
            />
            <div className="px-6 py-5">
              {staff.length > 0 && (
                <div className="flex items-center gap-5 mb-5 pb-5" style={{ borderBottom: '1px solid #f0ece3' }}>
                  {[
                    { count: staff.length, label: 'total' },
                    { count: staff.filter(s => s.role === 'home_admin').length, label: 'admins' },
                    { count: staff.filter(s => s.role === 'staff').length, label: 'staff' },
                  ].map(({ count, label }, i) => (
                    <div key={label} className="flex items-baseline gap-1.5">
                      {i > 0 && <div className="w-px h-6 mr-3" style={{ backgroundColor: '#ddd6c8' }} />}
                      <span className="text-2xl font-semibold tabular-nums" style={{ color: '#1E3A2F', fontFamily: "'Plus Jakarta Sans', system-ui" }}>{count}</span>
                      <span className="text-sm" style={{ color: '#9ca3af' }}>{label}</span>
                    </div>
                  ))}
                </div>
              )}

              {staff.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'rgba(30,58,47,0.07)' }}>
                    <Users size={22} style={{ color: '#1E3A2F' }} />
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#1E3A2F' }}>No staff members yet</p>
                  <p className="text-xs mb-4" style={{ color: '#9ca3af' }}>Invite team members to collaborate on resident care</p>
                  <Btn variant="primary" size="sm" onClick={() => setInviteOpen(true)}>
                    <Plus size={13} />Invite your first staff member
                  </Btn>
                </div>
              ) : (
                <div className="space-y-2">
                  {staff.map(m => (
                    <StaffRow key={m.id} member={m} onPromote={promote} onDeactivate={deactivate} />
                  ))}
                </div>
              )}

              <p className="text-xs mt-3 flex items-center gap-1.5" style={{ color: '#9ca3af' }}>
                <Info size={11} />
                Expand a staff member to configure per-pillar access and reset their password.
              </p>
            </div>
          </SectionCard>

          {/* ── Document Categories ─────────────────────────── */}
          <SectionCard id="categories">
            <SectionHead
              title="Document categories"
              subtitle="Custom labels for organising uploaded documents"
            />
            <div className="px-6 py-5">
              <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
                {categories.length === 0 ? (
                  <p className="text-xs" style={{ color: '#9ca3af' }}>No categories yet. Add one below.</p>
                ) : categories.map(cat => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium"
                    style={{ borderColor: '#ddd6c8', color: '#1a1a1a', backgroundColor: '#fafaf8', fontFamily: "'Outfit', system-ui" }}
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() => removeCategory(cat)}
                      aria-label={`Remove ${cat}`}
                      className="transition-colors duration-150 hover:text-red-500"
                      style={{ color: '#9ca3af' }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCategory()}
                  placeholder="New category name..."
                  className="flex-1 px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
                  style={{ borderColor: '#ddd6c8', color: '#1a1a1a', fontFamily: "'Outfit', system-ui" }}
                  onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                  onBlur={e => (e.target.style.borderColor = '#ddd6c8')}
                />
                <Btn variant="primary" onClick={addCategory}><Plus size={14} />Add</Btn>
              </div>
            </div>
          </SectionCard>

          {/* ── Access Control ──────────────────────────────── */}
          <SectionCard id="access">
            <SectionHead
              title="Access Control"
              subtitle="Define what staff members can see and do"
            />
            <div className="px-6 divide-y" style={{ borderColor: '#f0ece3' }}>
              <ToggleRow enabled={access.staffCanInvite} onChange={v => setAccess(p => ({ ...p, staffCanInvite: v }))} label="Staff can invite new members" helper="Allow non-admin staff to send invitations" />
              <ToggleRow enabled={access.staffCanExport} onChange={v => setAccess(p => ({ ...p, staffCanExport: v }))} label="Staff can export resident data" helper="Allow staff to export CSV or PDF reports" />
              <ToggleRow enabled={access.staffCanDelete} onChange={v => setAccess(p => ({ ...p, staffCanDelete: v }))} label="Staff can delete records" helper="Allow staff to permanently remove documents or notes" />
              <ToggleRow enabled={access.sensitiveFields} onChange={v => setAccess(p => ({ ...p, sensitiveFields: v }))} label="Show sensitive fields to all staff" helper="ID numbers, medical aid details, and emergency contacts" />
              <ToggleRow enabled={access.crossFacility} onChange={v => setAccess(p => ({ ...p, crossFacility: v }))} label="Cross-facility visibility" helper="Allow users to view data from linked facilities" />
            </div>
            <div className="px-6 pb-4 pt-3">
              <p className="text-xs flex items-center gap-1.5" style={{ color: '#9ca3af' }}>
                <Info size={11} />
                Access control changes apply immediately to all active sessions.
              </p>
            </div>
          </SectionCard>

          {/* ── Notifications ───────────────────────────────── */}
          <SectionCard id="notifications">
            <SectionHead
              title="Notifications"
              subtitle="Email alerts, activity digests, and compliance reports"
            />
            <div className="px-6 divide-y" style={{ borderColor: '#f0ece3' }}>
              <ToggleRow enabled={notifs.emailAlerts} onChange={v => setNotifs(p => ({ ...p, emailAlerts: v }))} label="Email notifications" helper="Receive email alerts for important activity" />
              <ToggleRow enabled={notifs.weeklyDigest} onChange={v => setNotifs(p => ({ ...p, weeklyDigest: v }))} label="Weekly activity digest" helper="A summary of resident and compliance activity sent each Monday" />
              <ToggleRow enabled={notifs.roleAlerts} onChange={v => setNotifs(p => ({ ...p, roleAlerts: v }))} label="Role change alerts" helper="Notify admins when a staff member's role is changed" />
              <ToggleRow enabled={notifs.inviteAlerts} onChange={v => setNotifs(p => ({ ...p, inviteAlerts: v }))} label="Invitation notifications" helper="Notify when an invitation is sent or accepted" />
              <ToggleRow enabled={notifs.complianceReport} onChange={v => setNotifs(p => ({ ...p, complianceReport: v }))} label="Compliance report emails" helper="Receive a weekly compliance status report by email" />
            </div>
          </SectionCard>

          {/* ── Security ────────────────────────────────────── */}
          <SectionCard id="security">
            <SectionHead
              title="Security"
              subtitle="Authentication, sessions, and login controls"
            />
            <div className="px-6 divide-y" style={{ borderColor: '#f0ece3' }}>
              <ToggleRow enabled={security.twoFactor} onChange={v => setSecurity(p => ({ ...p, twoFactor: v }))} label="Require two-factor authentication" helper="Enforce 2FA for all admin accounts" />
              <ToggleRow enabled={security.sessionTimeout} onChange={v => setSecurity(p => ({ ...p, sessionTimeout: v }))} label="Session timeout after inactivity" helper="Automatically sign out after 30 minutes of inactivity" />
              <ToggleRow enabled={security.passwordExpiry} onChange={v => setSecurity(p => ({ ...p, passwordExpiry: v }))} label="Force password expiry every 90 days" helper="Prompt users to update their password periodically" />
              <ToggleRow enabled={security.confirmHighRisk} onChange={v => setSecurity(p => ({ ...p, confirmHighRisk: v }))} label="Confirm before high-risk actions" helper="Require confirmation before deleting records or changing roles" />
            </div>
            <div className="px-6 pb-5 pt-4">
              <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: '#fafaf8', border: '0.5px solid #ddd6c8' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1a1a1a', fontFamily: "'Outfit', system-ui" }}>Reset your password</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Send a password reset link to {user?.email ?? 'your account email'}</p>
                </div>
                <Btn variant="secondary" size="sm"><KeyRound size={13} />Send reset link</Btn>
              </div>
            </div>
          </SectionCard>

          {/* ── Integrations ────────────────────────────────── */}
          <SectionCard id="integrations">
            <SectionHead title="Integrations" subtitle="Connect Innerframe to external services" />
            <div className="px-6 py-5 space-y-3">
              <IntegrationCard name="n8n Automations" desc="Workflow automation for notifications and onboarding" connected={true} />
              <IntegrationCard name="Google Drive" desc="Sync facility documents to Google Drive folders" connected={false} />
              <IntegrationCard name="DocuSign" desc="Electronic signatures for admission forms and consents" connected={false} />
              <IntegrationCard name="WhatsApp Business" desc="Send automated family notifications via WhatsApp" connected={false} />
            </div>
          </SectionCard>

          {/* ── Audit Log ───────────────────────────────────── */}
          <SectionCard id="audit">
            <SectionHead
              title="Audit Log"
              subtitle="Recent administrative actions and permission changes"
              action={<Btn variant="secondary" size="sm"><Download size={13} />Export</Btn>}
            />
            <div className="px-6 py-4">
              <div className="divide-y" style={{ borderColor: '#f0ece3' }}>
                <AuditEntry action="Staff member invited: Lerato Dlamini (lerato@facility.co.za)" by="You" at="Today, 09:14" type="success" />
                <AuditEntry action="Role changed: Sipho Mokoena promoted to Home Admin" by="You" at="Yesterday, 14:38" type="warning" />
                <AuditEntry action="Facility profile updated: contact email changed" by="You" at="Mon 2 Jun, 11:22" type="info" />
                <AuditEntry action="Document deleted: Room 8 discharge summary" by="Sipho Mokoena" at="Fri 30 May, 16:07" type="warning" />
                <AuditEntry action="Staff member removed: Thabo Khumalo" by="You" at="Thu 29 May, 10:51" type="info" />
              </div>
              <p className="text-xs mt-4" style={{ color: '#9ca3af' }}>Showing the 5 most recent actions. Export to view the full log.</p>
            </div>
          </SectionCard>

          {/* ── Organisations (super admin) ─────────────────── */}
          {isSuperAdmin && (
            <SectionCard id="organisations">
              <SectionHead title="Organisations" subtitle="All subscribed facilities across the platform" />
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f0ece3', backgroundColor: '#fafaf8' }}>
                      {['Facility', 'Contact email', 'Residents', 'Documents', 'Created', ''].map(h => (
                        <th key={h} className="text-left py-3 px-5 text-xs font-medium" style={{ color: '#9ca3af', fontFamily: "'Outfit', system-ui" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orgs.map(org => (
                      <tr key={org.id} style={{ borderBottom: '0.5px solid #f0ece3' }} className="transition-colors hover:bg-[#fafaf8]">
                        <td className="py-3.5 px-5 font-medium" style={{ color: '#1a1a1a', fontFamily: "'Outfit', system-ui" }}>{org.name}</td>
                        <td className="py-3.5 px-5" style={{ color: '#5a5a5a' }}>{org.contactEmail ?? '-'}</td>
                        <td className="py-3.5 px-5 tabular-nums text-center" style={{ color: '#1a1a1a' }}>{org.residents}</td>
                        <td className="py-3.5 px-5 tabular-nums text-center" style={{ color: '#1a1a1a' }}>{org.documents}</td>
                        <td className="py-3.5 px-5" style={{ color: '#5a5a5a' }}>
                          {new Date(org.createdAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short' })}
                        </td>
                        <td className="py-3.5 px-5">
                          <Btn variant="secondary" size="sm" onClick={() => navigate(`/superadmin/facility/${org.id}`)}>View</Btn>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {/* ── Danger Zone ─────────────────────────────────── */}
          <SectionCard id="danger" danger>
            <SectionHead
              title="Danger Zone"
              subtitle="Irreversible actions. Proceed with caution."
              danger
            />
            <div style={{ backgroundColor: 'rgba(254,242,242,0.4)' }}>
              <div className="divide-y" style={{ borderColor: 'rgba(220,38,38,0.08)' }}>
                <DangerRow
                  title="Revoke all pending invitations"
                  desc="Cancel all outstanding staff invitations immediately."
                  actionLabel="Revoke all"
                  variant="secondary"
                  action={() => { if (window.confirm('Revoke all pending invitations? This cannot be undone.')) { /* handle */ } }}
                />
                <DangerRow
                  title="Reset all pillar access rules"
                  desc="Restore default permissions for every staff member."
                  actionLabel="Reset access"
                  variant="secondary"
                  action={() => { if (window.confirm('Reset all access rules to defaults? This affects all staff members.')) { /* handle */ } }}
                />
                <DangerRow
                  title="Archive this facility"
                  desc="Suspend access and archive all data. Can be restored by a super admin."
                  actionLabel="Archive facility"
                  variant="danger"
                  action={() => { if (window.confirm('Archive this facility? All users will lose access immediately.')) { /* handle */ } }}
                />
              </div>
            </div>
          </SectionCard>

        </div>
      </div>

      {inviteOpen && user && (
        <InviteStaffModal
          orgId={user.orgId}
          onClose={() => setInviteOpen(false)}
          onSuccess={(member: NewMember) => {
            setStaff(p => [...p, member])
            setInviteOpen(false)
          }}
        />
      )}
    </>
  )
}
