import { DocumentRow } from './DocumentRow'

interface Document {
  id: string
  fileName: string
  fileUrl: string
  title?: string
  category?: string
  pillar?: string
  date: string
  isGlobal?: boolean
}

interface SectionGroupProps {
  title: string
  documents: Document[]
  canDelete?: boolean
  onDelete?: (id: string) => void
}

export function SectionGroup({
  title,
  documents,
  canDelete = false,
  onDelete,
}: SectionGroupProps) {
  return (
    <section className="mb-8">
      {/* Section heading with gold underline */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium" style={{ color: '#1E3A2F' }}>
            {title}
          </h2>
          <div
            style={{ width: '36px', height: '2px', backgroundColor: '#D4AF37', marginTop: '4px' }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Documents */}
      {documents.length === 0 ? (
        <p className="text-xs py-4 text-center" style={{ color: '#5a5a5a' }}>
          No documents in this section yet.
        </p>
      ) : (
        <div className="space-y-2">
          {documents.map(doc => (
            <DocumentRow
              key={doc.id}
              fileName={doc.fileName}
              fileUrl={doc.fileUrl}
              title={doc.title}
              category={doc.category}
              pillar={doc.pillar}
              date={doc.date}
              isGlobal={doc.isGlobal}
              canDelete={canDelete && !doc.isGlobal}
              onDelete={onDelete ? () => onDelete(doc.id) : undefined}
            />
          ))}
        </div>
      )}
    </section>
  )
}
