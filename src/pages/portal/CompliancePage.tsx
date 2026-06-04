import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/auth/useUser'
import { PageHeader } from '@/components/portal/PageHeader'
import { ArrowLeft, CheckCircle2, Circle, ChevronDown } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────

type ComplianceItem = {
  id: string
  category: string
  title: string
  description: string | null
  frequency: string
  sort_order: number
}

type ComplianceCheck = {
  id: string
  item_id: string
  is_complete: boolean
  completed_at: string | null
  notes: string | null
}

type ItemWithState = ComplianceItem & {
  is_complete: boolean
  completed_at: string | null
  check_id: string | null
  notes: string | null
}

// ── Constants ──────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  admin:             'Admin Office',
  finance:           'Finance',
  kitchen:           'Kitchen',
  medical:           'Medical',
  board_governance:  'Board Governance',
  medical_residence: 'Medical Residence',
  hr:                'HR',
}

const CATEGORY_ORDER = ['admin', 'finance', 'kitchen', 'medical', 'board_governance', 'medical_residence', 'hr']

const FREQUENCY_COLOURS: Record<string, { bg: string; text: string }> = {
  daily:     { bg: 'rgba(220,38,38,0.08)',   text: '#dc2626' },
  weekly:    { bg: 'rgba(234,88,12,0.08)',   text: '#ea580c' },
  monthly:   { bg: 'rgba(37,99,235,0.08)',   text: '#2563eb' },
  quarterly: { bg: 'rgba(124,58,237,0.08)',  text: '#7c3aed' },
  annual:    { bg: 'rgba(5,150,105,0.08)',   text: '#059669' },
  ongoing:   { bg: 'rgba(100,116,139,0.08)', text: '#64748b' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Score ring ─────────────────────────────────────────────────────

function ScoreRing({ percent }: { percent: number }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const dash = (percent / 100) * circ
  const colour = percent >= 80 ? '#059669' : percent >= 50 ? '#D4AF37' : '#dc2626'

  return (
    <svg width="100" height="100" viewBox="0 0 100 100" aria-label={`${percent}% compliant`}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="#ddd6c8" strokeWidth="8" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke={colour} strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dasharray 0.5s cubic-bezier(0.23, 1, 0.32, 1)' }}
      />
      <text x="50" y="46" textAnchor="middle" fontSize="18" fontWeight="600" fill={colour}>{percent}%</text>
      <text x="50" y="60" textAnchor="middle" fontSize="9" fill="#5a5a5a">compliant</text>
    </svg>
  )
}

// ── Category section ───────────────────────────────────────────────

function CategorySection({
  category,
  items,
  onToggle,
}: {
  category: string
  items: ItemWithState[]
  onToggle: (item: ItemWithState) => void
}) {
  const [open, setOpen] = useState(true)
  const done = items.filter(i => i.is_complete).length
  const pct = Math.round((done / items.length) * 100)
  const barColour = pct >= 80 ? '#059669' : pct >= 50 ? '#D4AF37' : '#dc2626'

  return (
    <div className="rounded-2xl border overflow-hidden transition-shadow duration-200 hover:shadow-sm" style={{ borderColor: '#ddd6c8', backgroundColor: '#ffffff', borderWidth: '0.5px' }}>
      {/* Category header */}
      <button
        type="button"
        className="w-full flex items-center justify-between gap-3 px-5 py-4"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-sm font-semibold" style={{ color: '#1E3A2F' }}>
            {CATEGORY_LABELS[category] ?? category}
          </span>
          <span className="text-xs" style={{ color: '#5a5a5a' }}>
            {done} / {items.length}
          </span>
          {/* Mini progress bar */}
          <div className="flex-1 max-w-[120px] h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#ddd6c8' }}>
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${pct}%`, backgroundColor: barColour }}
            />
          </div>
          <span className="text-xs font-medium" style={{ color: barColour }}>{pct}%</span>
        </div>
        <ChevronDown
          size={16}
          style={{
            color: '#698169',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        />
      </button>

      {/* Items */}
      {open && (
        <div className="border-t divide-y" style={{ borderColor: '#f0ece3' }}>
          {items.map(item => {
            const freq = FREQUENCY_COLOURS[item.frequency] ?? FREQUENCY_COLOURS.ongoing
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-colors"
                style={{ backgroundColor: item.is_complete ? 'rgba(5,150,105,0.03)' : 'transparent' }}
                onClick={() => onToggle(item)}
                role="checkbox"
                aria-checked={item.is_complete}
                tabIndex={0}
                onKeyDown={e => e.key === ' ' && onToggle(item)}
              >
                {/* Checkbox icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {item.is_complete
                    ? <CheckCircle2 size={18} style={{ color: '#059669' }} />
                    : <Circle size={18} style={{ color: '#ddd6c8' }} />
                  }
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm leading-snug"
                    style={{
                      color: item.is_complete ? '#5a5a5a' : '#1a1a1a',
                      textDecoration: item.is_complete ? 'line-through' : 'none',
                    }}
                  >
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#5a5a5a' }}>
                      {item.description}
                    </p>
                  )}
                  {item.is_complete && item.completed_at && (
                    <p className="text-xs mt-1" style={{ color: '#059669' }}>
                      Completed {formatDate(item.completed_at)}
                    </p>
                  )}
                </div>

                {/* Frequency badge */}
                <span
                  className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium capitalize mt-0.5"
                  style={{ backgroundColor: freq.bg, color: freq.text }}
                >
                  {item.frequency}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────

export default function CompliancePage() {
  const navigate = useNavigate()
  const { user } = useUser()

  const [items, setItems] = useState<ItemWithState[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null) // item_id being saved

  const load = useCallback(async () => {
    if (!user?.orgId) return
    setLoading(true)
    const supabase = createClient()

    const [itemsRes, checksRes] = await Promise.all([
      supabase
        .from('compliance_items')
        .select('id, category, title, description, frequency, sort_order')
        .eq('is_active', true)
        .order('sort_order'),
      supabase
        .from('compliance_checks')
        .select('id, item_id, is_complete, completed_at, notes')
        .eq('org_id', user.orgId),
    ])

    const allItems: ComplianceItem[] = (itemsRes.data ?? []) as ComplianceItem[]
    const checks: ComplianceCheck[] = (checksRes.data ?? []) as ComplianceCheck[]

    const checkMap = new Map(checks.map(c => [c.item_id, c]))

    const merged: ItemWithState[] = allItems.map(item => {
      const check = checkMap.get(item.id)
      return {
        ...item,
        is_complete:  check?.is_complete  ?? false,
        completed_at: check?.completed_at ?? null,
        check_id:     check?.id           ?? null,
        notes:        check?.notes        ?? null,
      }
    })

    setItems(merged)
    setLoading(false)
  }, [user?.orgId])

  useEffect(() => { load() }, [load])

  const handleToggle = async (item: ItemWithState) => {
    if (!user?.orgId || saving) return
    setSaving(item.id)

    const supabase = createClient()
    const newComplete = !item.is_complete

    // Optimistic update
    setItems(prev =>
      prev.map(i =>
        i.id === item.id
          ? { ...i, is_complete: newComplete, completed_at: newComplete ? new Date().toISOString() : null }
          : i
      )
    )

    if (item.check_id) {
      // Row exists — update it
      await supabase
        .from('compliance_checks')
        .update({
          is_complete:  newComplete,
          completed_at: newComplete ? new Date().toISOString() : null,
          completed_by: newComplete ? user.id : null,
          updated_at:   new Date().toISOString(),
        })
        .eq('id', item.check_id)
    } else {
      // No row yet — insert
      const { data } = await supabase
        .from('compliance_checks')
        .insert({
          org_id:       user.orgId,
          item_id:      item.id,
          is_complete:  newComplete,
          completed_at: newComplete ? new Date().toISOString() : null,
          completed_by: newComplete ? user.id : null,
        })
        .select('id')
        .single()

      // Patch the check_id in state so future toggles update instead of insert
      if (data?.id) {
        setItems(prev =>
          prev.map(i => i.id === item.id ? { ...i, check_id: data.id } : i)
        )
      }
    }

    setSaving(null)
  }

  // ── Derived stats ────────────────────────────────────────────────
  const total   = items.length
  const done    = items.filter(i => i.is_complete).length
  const percent = total > 0 ? Math.round((done / total) * 100) : 0

  const grouped = CATEGORY_ORDER.reduce<Record<string, ItemWithState[]>>((acc, cat) => {
    const catItems = items.filter(i => i.category === cat)
    if (catItems.length > 0) acc[cat] = catItems
    return acc
  }, {})

  if (loading) {
    return (
      <div>
        <div className="skeleton h-8 w-48 mb-2" />
        <div className="skeleton h-0.5 w-12 mb-8" />
        <div className="bg-white rounded-2xl border p-5 mb-6 flex gap-6 items-center" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
          <div className="skeleton w-24 h-24 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="skeleton h-5 w-48" />
            <div className="skeleton h-3 w-64" />
            <div className="grid grid-cols-4 gap-4 mt-2">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-6 w-full" />)}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 w-full rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1.5 text-xs mb-4 transition-colors"
        style={{ color: '#5a5a5a' }}
        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#1E3A2F')}
        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#5a5a5a')}
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </button>

      <PageHeader
        title="Compliance Tracker"
        subtitle="Track all regulatory and operational compliance requirements for your facility"
      />

      {/* Score summary card */}
      <div
        className="rounded-2xl border p-6 mb-6 flex flex-col sm:flex-row items-center gap-6"
        style={{ borderColor: '#ddd6c8', backgroundColor: '#ffffff', borderWidth: '0.5px' }}
      >
        <ScoreRing percent={percent} />
        <div className="flex-1">
          <p className="text-lg font-semibold mb-1" style={{ color: '#1E3A2F' }}>
            {done} of {total} items complete
          </p>
          <p className="text-sm mb-3" style={{ color: '#5a5a5a' }}>
            {percent < 50 && 'Significant compliance gaps — prioritise outstanding items.'}
            {percent >= 50 && percent < 80 && 'Good progress — a few areas still need attention.'}
            {percent >= 80 && percent < 100 && 'Almost there — minor items outstanding.'}
            {percent === 100 && 'All compliance items complete. Well done!'}
          </p>
          {/* Per-category mini bars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2">
            {CATEGORY_ORDER.map(cat => {
              const catItems = items.filter(i => i.category === cat)
              if (catItems.length === 0) return null
              const catDone = catItems.filter(i => i.is_complete).length
              const catPct  = Math.round((catDone / catItems.length) * 100)
              const c = catPct >= 80 ? '#059669' : catPct >= 50 ? '#D4AF37' : '#dc2626'
              return (
                <div key={cat}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ color: '#5a5a5a' }}>{CATEGORY_LABELS[cat]}</span>
                    <span className="text-xs font-medium" style={{ color: c }}>{catPct}%</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#ddd6c8' }}>
                    <div className="h-full rounded-full" style={{ width: `${catPct}%`, backgroundColor: c }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Checklist by category */}
      <div className="space-y-3">
        {Object.entries(grouped).map(([cat, catItems]) => (
          <CategorySection
            key={cat}
            category={cat}
            items={catItems}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  )
}
