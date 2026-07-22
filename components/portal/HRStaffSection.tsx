import { Briefcase } from 'lucide-react'

// Staff members module is being migrated to the new backend.
export function HRStaffSection() {
  return (
    <div
      className="bg-white rounded-2xl border p-12 flex flex-col items-center text-center gap-4"
      style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}
    >
      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(30,58,47,0.06)' }}>
        <Briefcase size={24} style={{ color: '#1E3A2F' }} />
      </div>
      <div>
        <p className="text-base font-semibold mb-1.5" style={{ color: '#1E3A2F' }}>Staff module coming soon</p>
        <p className="text-sm max-w-md" style={{ color: '#5a5a5a' }}>
          The staff directory and HR records feature is being migrated to the new backend. It will be available in a future release.
        </p>
      </div>
    </div>
  )
}
