import type { LucideIcon } from 'lucide-react'

/**
 * Metric card for the dashboard stats row.
 * Flat white card on cream page background — no shadows.
 */
interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
}

export function StatCard({ label, value, icon: Icon, trend }: StatCardProps) {
  return (
    <div
      className="bg-white rounded-xl p-5 border"
      style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#5a5a5a' }}>
          {label}
        </p>
        <div
          className="w-8 h-8 rounded flex items-center justify-center"
          style={{ backgroundColor: 'rgba(30,58,47,0.07)' }}
        >
          <Icon size={16} style={{ color: '#1E3A2F' }} aria-hidden="true" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <p
          className="text-3xl font-medium"
          style={{ color: '#1E3A2F' }}
        >
          {value}
        </p>
        {trend && (
          <p className="text-xs mb-1" style={{ color: '#5a5a5a' }}>
            {trend}
          </p>
        )}
      </div>
    </div>
  )
}
