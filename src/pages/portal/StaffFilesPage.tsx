import { PageHeader } from '@/components/portal/PageHeader'
import { HRStaffSection } from '@/components/portal/HRStaffSection'

export default function StaffFilesPage() {
  return (
    <div>
      <PageHeader
        title="Staff Files"
        subtitle="Staff directory and employment records"
      />
      <HRStaffSection />
    </div>
  )
}
