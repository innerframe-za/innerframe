import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
  href?: string
}

export function StatCard({ label, value, icon: Icon, trend, href }: StatCardProps) {
  const inner = (
    <div className="relative">
      {/* Icon — positioned top-right in a tinted circle */}
      <div
        className="absolute top-0 right-0 w-11 h-11 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'rgba(30,58,47,0.08)' }}
      >
        <Icon size={19} style={{ color: '#1E3A2F' }} aria-hidden="true" />
      </div>

      {/* Label */}
      <p className="text-xs font-medium mb-3 pr-12" style={{ color: '#6b7280', letterSpacing: '0.01em' }}>
        {label}
      </p>

      {/* Value — large and prominent with tabular nums */}
      <p
        className="text-4xl font-semibold tabular-nums leading-none mb-1"
        style={{ color: '#1E3A2F', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", letterSpacing: '-0.02em' }}
      >
        {value}
      </p>

      {trend && (
        <p className="text-xs mt-1.5" style={{ color: '#6b7280' }}>{trend}</p>
      )}

      {/* Gold accent bar */}
      <div
        className="mt-5 w-8 h-0.5 rounded-full"
        style={{ backgroundColor: '#D4AF37' }}
        aria-hidden="true"
      />
    </div>
  )

  if (href) {
    return (
      <Link
        to={href}
        className="block bg-white rounded-2xl p-6 border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}
      >
        {inner}
      </Link>
    )
  }

  return (
    <div
      className="bg-white rounded-2xl p-6 border"
      style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}
    >
      {inner}
    </div>
  )
}
