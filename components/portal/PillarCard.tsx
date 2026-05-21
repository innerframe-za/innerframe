import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

/**
 * Clickable pillar card used in the dashboard quick-nav row.
 * Dark green top border when active, gold on hover.
 */
interface PillarCardProps {
  name: string
  docCount?: number
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
        borderColor: '#ddd6c8',
        borderWidth: '0.5px',
        borderTopWidth: '3px',
        borderTopColor: isActive ? '#1E3A2F' : '#ddd6c8',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLAnchorElement
        if (!isActive) el.style.borderTopColor = '#D4AF37'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLAnchorElement
        if (!isActive) el.style.borderTopColor = '#ddd6c8'
      }}
      aria-current={isActive ? 'page' : undefined}
    >
      <div
        className="w-9 h-9 rounded flex items-center justify-center"
        style={{ backgroundColor: isActive ? 'rgba(30,58,47,0.1)' : 'rgba(30,58,47,0.05)' }}
      >
        <Icon
          size={18}
          style={{ color: isActive ? '#1E3A2F' : '#5a5a5a' }}
          aria-hidden="true"
        />
      </div>
      <div>
        <p
          className="text-xs font-medium leading-tight"
          style={{ color: isActive ? '#1E3A2F' : '#1a1a1a' }}
        >
          {name}
        </p>
        {docCount !== undefined && (
          <p className="text-xs mt-0.5" style={{ color: '#5a5a5a' }}>
            {docCount} docs
          </p>
        )}
      </div>
    </Link>
  )
}
