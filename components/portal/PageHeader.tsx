/**
 * Consistent page header used across all portal pages.
 * Title with gold underline bar beneath it, optional subtitle.
 */
interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <div className="inline-block">
          <h1
            className="text-2xl font-medium"
            style={{ color: 'var(--color-if-text-heading)' }}
          >
            {title}
          </h1>
          {/* Gold underline bar */}
          <div
            className="mt-2"
            style={{
              width: '36px',
              height: '2px',
              backgroundColor: 'var(--color-if-gold-text)',
            }}
            aria-hidden="true"
          />
        </div>
        {subtitle && (
          <p className="mt-3 text-sm" style={{ color: 'var(--color-if-text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
