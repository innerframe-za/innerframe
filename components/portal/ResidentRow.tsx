import { Link } from 'react-router-dom'

/**
 * A single resident row shown in the dashboard panel and residents list.
 * Avatar with initials, name, room number, status dot.
 */
interface ResidentRowProps {
  id: string
  name: string
  roomNumber?: string
  status: 'active' | 'discharged' | 'deceased'
}

/* Status dot colors use semantic meanings — green/amber/muted — not brand colors */
const statusConfig = {
  active:     { dot: '#16a34a', label: 'Active' },
  discharged: { dot: '#ca8a04', label: 'Discharged' },
  deceased:   { dot: 'var(--color-if-text-muted)', label: 'Deceased' },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function ResidentRow({ id, name, roomNumber, status }: ResidentRowProps) {
  const { dot, label } = statusConfig[status] ?? statusConfig.active

  return (
    <Link
      to={`/residents/${id}`}
      className="flex items-center gap-3 py-2.5 px-3 rounded-lg border group transition-colors"
      style={{
        borderColor: 'var(--color-if-border)',
        borderWidth: '0.5px',
        backgroundColor: '#ffffff',
      }}
      onMouseEnter={e =>
        ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
          'var(--color-if-bg)')
      }
      onMouseLeave={e =>
        ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
          '#ffffff')
      }
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium text-white"
        style={{ backgroundColor: 'var(--color-if-primary)' }}
        aria-hidden="true"
      >
        {getInitials(name)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: 'var(--color-if-text)' }}
        >
          {name}
        </p>
        {roomNumber && (
          <p className="text-xs" style={{ color: 'var(--color-if-text-muted)' }}>
            Room {roomNumber}
          </p>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: dot }}
          aria-hidden="true"
        />
        <span className="text-xs" style={{ color: 'var(--color-if-text-muted)' }}>
          {label}
        </span>
      </div>
    </Link>
  )
}
