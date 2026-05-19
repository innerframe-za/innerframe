import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

/**
 * Clickable pillar card used in the dashboard quick-nav row.
 * Primary green top border when active, gold accent on hover.
 */
interface PillarCardProps {
  name: string
  docCount: number
  icon: LucideIcon
  href: string
  isActive?: boolean
}

export function PillarCard({
  name,
  docCount,
  icon: Icon,
  href,
  isActive = false,
}: PillarCardProps) {
  return (
    <Link
      to={href}
      className="bg-white rounded-xl p-4 border flex flex-col items-center text-center gap-2 transition-colors group"
      style={{
        borderColor: 'var(--color-if-border)',
        borderWidth: '0.5px',
        borderTopWidth: '3px',
        borderTopColor: isActive ? 'var(--color-if-primary)' : 'var(--color-if-border)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLAnchorElement
        if (!isActive) el.style.borderTopColor = 'var(--color-if-accent)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLAnchorElement
        if (!isActive) el.style.borderTopColor = 'var(--color-if-border)'
      }}
      aria-current={isActive ? 'page' : undefined}
    >
      <div
        className="w-9 h-9 rounded flex items-center justify-center"
        style={{ backgroundColor: isActive ? 'rgba(47, 67, 55, 0.1)' : 'rgba(47, 67, 55, 0.05)' }}
      >
        <Icon
          size={18}
          style={{ color: isActive ? 'var(--color-if-primary)' : 'var(--color-if-text-muted)' }}
          aria-hidden="true"
        />
      </div>
      <div>
        <p
          className="text-xs font-medium leading-tight"
          style={{ color: isActive ? 'var(--color-if-primary)' : 'var(--color-if-text)' }}
        >
          {name}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-if-text-muted)' }}>
          {docCount} docs
        </p>
      </div>
    </Link>
  )
}
