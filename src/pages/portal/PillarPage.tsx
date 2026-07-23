import { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { PageHeader } from '@/components/portal/PageHeader'
import { usePermissions, PillarSlug } from '@/lib/auth/usePermissions'
import { Lock, ChevronDown, ChevronUp, FileText } from 'lucide-react'

const PILLAR_MAP: Record<string, { name: string; description: string; dbKey: string }> = {
  admin:            { name: 'Admin Office',     description: 'The Structure Behind the Facility',             dbKey: 'admin' },
  finance:          { name: 'Finance',          description: 'Financial Transparency & Sustainability',       dbKey: 'finance' },
  kitchen:          { name: 'Kitchen',          description: 'Safe Nutrition. Safe Residents.',               dbKey: 'kitchen' },
  medical:          { name: 'Medical',          description: 'Resident Safety & Clinical Compliance',         dbKey: 'medical' },
  'board-governance': { name: 'Board Governance', description: 'Leadership, Accountability & Sustainability', dbKey: 'board_governance' },
  hr:               { name: 'HR',              description: 'People. Structure. Compliance.',                dbKey: 'hr' },
}

type PillarContent = {
  purpose: string
  focusAreas: string[]
  keySystems: { category: string; items: string[] }[]
}

const PILLAR_CONTENT: Record<string, PillarContent> = {
  admin: {
    purpose: 'To ensure the facility runs in an organised, compliant, audit-ready, and professional manner.',
    focusAreas: ['Policies & Procedures', 'Staff Files', 'Resident Files', 'Admission & Discharge', 'Daily Operational Control', 'Compliance Systems', 'Communication Systems', 'Reporting Structure'],
    keySystems: [
      { category: 'Administration File Structure', items: ['Master Index File', 'Policies & Procedures File', 'Staff Records File', 'Resident Administration File', 'Incident & Complaints File', 'Visitor Register', 'Maintenance Register', 'Asset Register'] },
      { category: 'Daily Controls', items: ['Attendance registers', 'Shift handover books', 'Daily task checklists', 'Visitor sign-in systems', 'Maintenance reporting system'] },
      { category: 'Compliance Requirements', items: ['DSD-ready filing', 'Updated organogram', 'Job descriptions', 'Employment contracts', 'Disciplinary procedures', 'Leave tracking'] },
    ],
  },
  finance: {
    purpose: 'To ensure the facility remains financially healthy, accountable, transparent, and aligned with DSD funding structures.',
    focusAreas: ['Budgeting', 'Cash Flow Management', 'DSD Allocations', 'Petty Cash', 'Procurement', 'Financial Reporting', 'Payroll Controls', 'Stock Accountability'],
    keySystems: [
      { category: 'Financial Controls', items: ['Monthly budget tracking', 'Departmental budgets', 'DSD vs Private funding tracking', 'Petty cash procedures', 'Supplier approval systems'] },
      { category: 'Reporting', items: ['Monthly financial reports', 'Board finance reports', 'Variance analysis', 'Cost framework alignment', 'Quarterly reporting packs'] },
      { category: 'Payroll & HR Finance', items: ['Timesheet verification', 'Overtime control', 'Sunday/public holiday structure', 'Leave calculations', 'UIF compliance'] },
      { category: 'Procurement Controls', items: ['Stock issuing system', 'Purchase request forms', 'Invoice approval workflow', 'Asset tracking'] },
    ],
  },
  kitchen: {
    purpose: 'To ensure food safety, hygiene, nutritional compliance, and proper kitchen operational control.',
    focusAreas: ['Meal Planning', 'Food Safety', 'Hygiene', 'Temperature Control', 'Expiry Date Management', 'Stock Issuing', 'Cleaning Schedules', 'Dietary Monitoring'],
    keySystems: [
      { category: 'Kitchen Controls', items: ['Daily temperature logs', 'Fridge/freezer monitoring', 'Cleaning schedules', 'Deep cleaning schedule', 'Pest control monitoring'] },
      { category: 'Food Management', items: ['Weekly menus', 'Special diet lists', 'Resident dietary requirements', 'Food receiving procedures', 'FIFO stock rotation'] },
      { category: 'Stock Systems', items: ['Cleaning material issue system', 'Food stock issue sheets', 'Monthly stock counts', 'Waste control tracking'] },
      { category: 'Hygiene Standards', items: ['Handwashing procedures', 'PPE usage', 'Dishwashing systems', 'Sanitising controls'] },
    ],
  },
  medical: {
    purpose: 'To ensure resident care, medication management, and health monitoring systems are safe, compliant, and resident-focused.',
    focusAreas: ['Medication Management', 'Care Plans', 'Incident Reporting', 'Fall Prevention', 'Health Monitoring', 'Infection Control', 'Nursing Documentation', 'Resident Well-being'],
    keySystems: [
      { category: 'Medical Documentation', items: ['Resident care plans', 'Medication charts', 'Observation charts', 'Weight monitoring', 'Fluid balance charts', 'Doctor visit records'] },
      { category: 'Safety Systems', items: ['Incident reports', 'Fall registers', 'Emergency procedures', 'Hospital transfer procedures', 'Oxygen monitoring logs'] },
      { category: 'Infection Control', items: ['PPE protocols', 'Isolation procedures', 'Cleaning controls', 'Waste disposal systems'] },
      { category: 'Shift Controls', items: ['Nursing handovers', 'Day/night reports', 'Medication checks', 'Resident monitoring systems'] },
    ],
  },
  board_governance: {
    purpose: "To ensure leadership structures are professional, accountable, sustainable, and aligned with the facility's mission and compliance obligations.",
    focusAreas: ['Governance Structure', 'Board Oversight', 'Strategic Planning', 'Policy Approval', 'Financial Accountability', 'Risk Management', 'Compliance Oversight', 'Sustainability Planning'],
    keySystems: [
      { category: 'Governance Structure', items: ['Board organogram', 'Terms of reference', 'Board meeting schedule', 'Committee structure'] },
      { category: 'Board Documentation', items: ['Board packs', 'Minutes', 'Strategic plans', 'Risk registers', 'Annual reports'] },
      { category: 'Oversight Systems', items: ['Financial oversight', 'Operational reporting', 'Compliance monitoring', 'DSD reporting oversight'] },
      { category: 'Sustainability Planning', items: ['Fundraising strategies', 'Maintenance planning', 'Staffing sustainability', 'Growth planning'] },
    ],
  },
  hr: {
    purpose: 'To ensure all human resources are effectively managed, contracted, trained, and compliant with South African labour law.',
    focusAreas: ['Staff Records', 'Employment Contracts', 'Training & Development', 'Performance Management', 'Leave Administration', 'Labour Law Compliance', 'Disciplinary Procedures', 'Payroll Integration'],
    keySystems: [
      { category: 'Staff Records', items: ['Employment contracts', 'Job descriptions', 'ID & qualification copies', 'Police clearance records', 'Emergency contact details'] },
      { category: 'Leave & Attendance', items: ['Leave application forms', 'Leave balance tracking', 'Attendance registers', 'Sick leave records', 'Maternity/paternity documentation'] },
      { category: 'Training & Development', items: ['Induction records', 'Training certificates', 'CPD tracking', 'Competency assessments', 'Skills development plans'] },
      { category: 'Compliance & Discipline', items: ['BCEA compliance checklist', 'Disciplinary records', 'Grievance records', 'CCMA documentation', 'UIF registration'] },
    ],
  },
}

export default function PillarPage() {
  const { slug: pillar } = useParams<{ slug: string }>()
  const { permissions } = usePermissions()
  const [contentOpen, setContentOpen] = useState(false)

  if (!pillar || !PILLAR_MAP[pillar]) return <Navigate to="/dashboard" replace />

  const { name, description, dbKey } = PILLAR_MAP[pillar]
  const content = PILLAR_CONTENT[dbKey] ?? PILLAR_CONTENT[pillar]
  const pillarSlug = dbKey.replace('_', '_') as PillarSlug
  const canView = permissions[pillarSlug]?.canView !== false

  if (!canView) {
    return (
      <div>
        <PageHeader title={name} subtitle={description} />
        <div
          className="bg-white rounded-2xl border p-12 flex flex-col items-center text-center gap-4"
          style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}
        >
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(220,38,38,0.06)' }}>
            <Lock size={24} style={{ color: '#dc2626' }} />
          </div>
          <div>
            <p className="text-base font-semibold mb-1.5" style={{ color: '#1a1a1a' }}>Access restricted</p>
            <p className="text-sm max-w-sm" style={{ color: '#5a5a5a' }}>
              You don't have permission to view the {name} pillar. Contact your administrator.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader title={name} subtitle={description} />

      {/* Pillar purpose & focus areas */}
      {content && (
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
          <button
            type="button"
            className="w-full flex items-center justify-between px-6 py-4 text-left"
            onClick={() => setContentOpen(o => !o)}
          >
            <span className="text-sm font-semibold" style={{ color: '#1E3A2F' }}>About this pillar</span>
            {contentOpen ? <ChevronUp size={16} style={{ color: '#5a5a5a' }} /> : <ChevronDown size={16} style={{ color: '#5a5a5a' }} />}
          </button>

          {contentOpen && (
            <div className="px-6 pb-6 space-y-5" style={{ borderTop: '1px solid #f0ece3' }}>
              <p className="text-sm pt-4" style={{ color: '#5a5a5a' }}>{content.purpose}</p>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#1E3A2F' }}>Focus Areas</p>
                <div className="flex flex-wrap gap-2">
                  {content.focusAreas.map(area => (
                    <span
                      key={area}
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(30,58,47,0.07)', color: '#1E3A2F' }}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.keySystems.map(sys => (
                  <div key={sys.category} className="p-4 rounded-lg" style={{ backgroundColor: '#F5F0E8' }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: '#1E3A2F' }}>{sys.category}</p>
                    <ul className="space-y-1">
                      {sys.items.map(item => (
                        <li key={item} className="text-xs flex items-start gap-1.5" style={{ color: '#5a5a5a' }}>
                          <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: '#D4AF37' }} aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Documents — pillar-level documents not yet in backend */}
      <div
        className="bg-white rounded-2xl border p-10 flex flex-col items-center text-center gap-3"
        style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}
      >
        <FileText size={28} style={{ color: '#ddd6c8' }} />
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: '#5a5a5a' }}>Pillar documents coming soon</p>
          <p className="text-xs max-w-sm" style={{ color: '#9ca3af' }}>
            Pillar-level document management is being migrated to the new backend. Resident documents are available on each resident's profile.
          </p>
        </div>
      </div>
    </div>
  )
}
