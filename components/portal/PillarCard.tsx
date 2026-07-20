import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface PillarCardProps {
  name: string
  description?: string
  docCount?: number
  icon: LucideIcon
  href: string
  isActive?: boolean
}

export function PillarCard({
  name,
  description,
  docCount,
  icon: Icon,
  href,
  isActive = false,
}: PillarCardProps) {
  if (description) {
    return (
      <Link
        to={href}
        className="group relative bg-white rounded-xl p-4 flex items-center gap-3.5 border transition-all duration-150 hover:shadow-sm hover:-translate-y-px"
        style={{
          borderColor: isActive ? 'rgba(30,58,47,0.22)' : '#ddd6c8',
          borderWidth: '0.5px',
        }}
        aria-current={isActive ? 'page' : undefined}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: isActive ? 'rgba(30,58,47,0.1)' : 'rgba(30,58,47,0.06)' }}
        >
          <Icon
            size={18}
            style={{ color: isActive ? '#1E3A2F' : '#698169' }}
            aria-hidden="true"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight" style={{ color: '#1E3A2F' }}>
            {name}
          </p>
          <p className="text-xs mt-0.5 leading-snug line-clamp-2" style={{ color: '#5a5a5a' }}>
            {description}
          </p>
        </div>

        <ChevronRight
          size={14}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150"
          style={{ color: '#698169' }}
          aria-hidden="true"
        />

        {isActive && (
          <span
            className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full"
            style={{ backgroundColor: '#D4AF37' }}
            aria-hidden="true"
          />
        )}
      </Link>
    )
  }

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
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200"
        style={{ backgroundColor: isActive ? 'rgba(30,58,47,0.1)' : 'rgba(30,58,47,0.05)' }}
      >
        <Icon
          size={20}
          style={{ color: isActive ? '#1E3A2F' : '#5a5a5a' }}
          aria-hidden="true"
        />
      </div>

      <p className="text-xs font-medium leading-tight" style={{ color: isActive ? '#1E3A2F' : '#1a1a1a' }}>
        {name}
      </p>

      {docCount !== undefined && (
        <p className="text-xs mt-0.5" style={{ color: '#5a5a5a' }}>
          {docCount} docs
        </p>
      )}

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
