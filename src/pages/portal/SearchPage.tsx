import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { PageHeader } from '@/components/portal/PageHeader'
import { DocumentRow } from '@/components/portal/DocumentRow'
import { ResidentRow } from '@/components/portal/ResidentRow'

function getMockResults(q: string) {
  const query = q.toLowerCase()
  const documents = [
    { id: '1', fileName: 'Staff_Policies_2025.pdf', fileUrl: '#', category: 'Policies', pillar: 'admin', date: '12 May 2025', isGlobal: false },
    { id: '2', fileName: 'Q1_Finance_Report.xlsx', fileUrl: '#', category: 'Reports', pillar: 'finance', date: '10 May 2025', isGlobal: false },
    { id: '3', fileName: 'Kitchen_Cleaning_Schedule.pdf', fileUrl: '#', category: 'Procedures', pillar: 'kitchen', date: '8 May 2025', isGlobal: true },
    { id: '4', fileName: 'Resident_Care_Plans.docx', fileUrl: '#', category: 'Templates', pillar: 'medical', date: '5 May 2025', isGlobal: true },
    { id: '5', fileName: 'Board_Meeting_Minutes_April.pdf', fileUrl: '#', category: 'Minutes', pillar: 'board_governance', date: '1 May 2025', isGlobal: false },
  ].filter(d => d.fileName.toLowerCase().includes(query) || d.category.toLowerCase().includes(query))

  const residents = [
    { id: '1', name: 'Margaret Johnson', roomNumber: '12', status: 'active' as const },
    { id: '2', name: 'Thomas van der Merwe', roomNumber: '7', status: 'active' as const },
    { id: '3', name: 'Edith Nkosi', roomNumber: '3', status: 'active' as const },
  ].filter(r => r.name.toLowerCase().includes(query))

  const sections = [
    { id: 's1', title: 'Policies & Procedures', pillar: 'admin' },
    { id: 's2', title: 'Monthly Financial Reports', pillar: 'finance' },
    { id: 's3', title: 'Kitchen Hygiene Records', pillar: 'kitchen' },
  ].filter(s => s.title.toLowerCase().includes(query))

  return { documents, residents, sections }
}

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''

  const { documents, residents, sections } = query
    ? getMockResults(query)
    : { documents: [], residents: [], sections: [] }

  const totalResults = documents.length + residents.length + sections.length

  return (
    <div>
      <PageHeader
        title="Search Results"
        subtitle={query ? `Showing results for "${query}"` : 'Enter a search term to begin'}
      />

      {!query && (
        <div className="bg-white rounded-xl border py-16 flex flex-col items-center text-center" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
          <Search size={32} className="mb-4" style={{ color: '#ddd6c8' }} />
          <p className="text-sm font-medium" style={{ color: '#1E3A2F' }}>Nothing to show yet</p>
          <p className="text-xs mt-1" style={{ color: '#5a5a5a' }}>Use the search bar in the navigation to search across documents, residents, and sections.</p>
        </div>
      )}

      {query && totalResults === 0 && (
        <div className="bg-white rounded-xl border py-16 flex flex-col items-center text-center" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
          <Search size={32} className="mb-4" style={{ color: '#ddd6c8' }} />
          <p className="text-sm font-medium" style={{ color: '#1E3A2F' }}>No results found</p>
          <p className="text-xs mt-1" style={{ color: '#5a5a5a' }}>Try a different search term.</p>
        </div>
      )}

      {query && totalResults > 0 && (
        <div className="space-y-8">
          {documents.length > 0 && (
            <section>
              <div className="mb-3">
                <h2 className="text-sm font-medium" style={{ color: '#1E3A2F' }}>Documents <span className="font-normal" style={{ color: '#5a5a5a' }}>({documents.length})</span></h2>
                <div style={{ width: '36px', height: '2px', backgroundColor: '#D4AF37', marginTop: '4px' }} aria-hidden="true" />
              </div>
              <div className="space-y-2">
                {documents.map(doc => <DocumentRow key={doc.id} fileName={doc.fileName} fileUrl={doc.fileUrl} category={doc.category} pillar={doc.pillar} date={doc.date} isGlobal={doc.isGlobal} canDelete={false} />)}
              </div>
            </section>
          )}

          {residents.length > 0 && (
            <section>
              <div className="mb-3">
                <h2 className="text-sm font-medium" style={{ color: '#1E3A2F' }}>Residents <span className="font-normal" style={{ color: '#5a5a5a' }}>({residents.length})</span></h2>
                <div style={{ width: '36px', height: '2px', backgroundColor: '#D4AF37', marginTop: '4px' }} aria-hidden="true" />
              </div>
              <div className="space-y-2">
                {residents.map(r => <ResidentRow key={r.id} id={r.id} name={r.name} roomNumber={r.roomNumber} status={r.status} />)}
              </div>
            </section>
          )}

          {sections.length > 0 && (
            <section>
              <div className="mb-3">
                <h2 className="text-sm font-medium" style={{ color: '#1E3A2F' }}>Sections <span className="font-normal" style={{ color: '#5a5a5a' }}>({sections.length})</span></h2>
                <div style={{ width: '36px', height: '2px', backgroundColor: '#D4AF37', marginTop: '4px' }} aria-hidden="true" />
              </div>
              <div className="space-y-2">
                {sections.map(s => (
                  <div key={s.id} className="bg-white rounded-lg border px-4 py-3 flex items-center justify-between" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{s.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#5a5a5a' }}>{s.pillar.replace('_', ' ')}</p>
                    </div>
                    <a href={`/pillar/${s.pillar.replace('_', '-')}`} className="text-xs font-medium" style={{ color: '#1E3A2F' }}>View →</a>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
