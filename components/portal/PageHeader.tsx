interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1
          className="font-semibold tracking-tight"
          style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontSize: 'clamp(1.5rem, 3vw, 1.875rem)',
            color: '#1E3A2F',
            letterSpacing: '-0.025em',
          }}
        >
          {title}
        </h1>
        {/* Gold underline — slightly wider than before */}
        <div
          className="mt-2"
          style={{ width: '48px', height: '2px', backgroundColor: '#D4AF37', borderRadius: '1px' }}
          aria-hidden="true"
        />
        {subtitle && (
          <p className="mt-2.5 text-sm leading-relaxed" style={{ color: '#6b7280', maxWidth: '520px' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0 ml-4">{action}</div>}
    </div>
  )
}
