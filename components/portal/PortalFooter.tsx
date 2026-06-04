export function PortalFooter() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ backgroundColor: '#1E3A2F' }}>
      {/* POPIA notice strip */}
      <div
        className="px-6 py-2 text-center text-xs border-b"
        style={{ color: 'rgba(255,255,255,0.45)', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        Personal information is collected and processed in accordance with the{' '}
        <strong style={{ color: 'rgba(255,255,255,0.6)' }}>
          Protection of Personal Information Act (POPIA), Act 4 of 2013
        </strong>
        . All resident data is confidential and access-controlled.
      </div>

      {/* Main footer bar */}
      <div className="px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          © {year} Innerframe Care Solutions ·{' '}
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>Made by Cortex Analytics</span>
        </p>

        <div className="flex items-center gap-4">
          {['Privacy Policy', 'Terms of Service', 'Medical Disclaimer', 'Confidentiality'].map(link => (
            <span
              key={link}
              className="text-xs cursor-default"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              title="Legal documentation coming soon"
            >
              {link}
            </span>
          ))}
        </div>
      </div>

      {/* Medical disclaimer — small print */}
      <div
        className="px-6 pb-3 text-xs text-center"
        style={{ color: 'rgba(255,255,255,0.25)' }}
      >
        This platform is a care management and document tool. It does not constitute medical advice.
        All clinical decisions must be made by qualified healthcare professionals.
      </div>
    </footer>
  )
}
