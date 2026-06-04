import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

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
      className="relative bg-white rounded-xl p-4 flex flex-col items-center text-center gap-3 transition-all duration-200 border hover:shadow-sm hover:-translate-y-0.5"
      style={{
        borderColor: isActive ? 'rgba(30,58,47,0.25)' : '#ddd6c8',
        borderWidth: '0.5px',
      }}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Icon — circular, filled when active */}
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200"
        style={{
          backgroundColor: isActive ? '#1E3A2F' : 'rgba(30,58,47,0.07)',
        }}
      >
        <Icon
          size={20}
          style={{ color: isActive ? '#D4AF37' : '#1E3A2F' }}
          aria-hidden="true"
        />
      </div>

      <p
        className="text-xs font-medium leading-tight"
        style={{ color: isActive ? '#1E3A2F' : '#374151' }}
      >
        {name}
      </p>

      {docCount !== undefined && (
        <p className="text-xs" style={{ color: '#9ca3af' }}>
          {docCount} docs
        </p>
      )}

      {/* Active indicator dot at bottom */}
      {isActive && (
        <div
          className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: '#D4AF37' }}
          aria-hidden="true"
        />
      )}
    </Link>
  )
}
