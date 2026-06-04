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
      {/* Icon — circular */}
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200"
        style={{
          backgroundColor: isActive ? 'rgba(30,58,47,0.1)' : 'rgba(30,58,47,0.05)',
        }}
      >
        <Icon
          size={20}
          style={{ color: isActive ? '#1E3A2F' : '#5a5a5a' }}
          aria-hidden="true"
        />
      </div>

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
