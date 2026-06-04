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
  onDelete?: (id: string, fileUrl: string) => void
}

export function SectionGroup({
  title,
  documents,
  canDelete = false,
  onDelete,
}: SectionGroupProps) {
  return (
    <section className="mb-8">
      {/* Section heading */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2
            className="text-sm font-semibold"
            style={{ color: '#1E3A2F', fontFamily: "'Outfit', system-ui", letterSpacing: '-0.01em' }}
          >
            {title}
          </h2>
          <div
            style={{ width: '32px', height: '2px', backgroundColor: '#D4AF37', marginTop: '5px', borderRadius: '1px' }}
            aria-hidden="true"
          />
        </div>
        {documents.length > 0 && (
          <span className="text-xs tabular-nums" style={{ color: '#9ca3af' }}>
            {documents.length} {documents.length === 1 ? 'file' : 'files'}
          </span>
        )}
      </div>

      {documents.length === 0 ? (
        <p className="text-xs py-5 text-center" style={{ color: '#9ca3af' }}>
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
              onDelete={onDelete ? () => onDelete(doc.id, doc.fileUrl) : undefined}
            />
          ))}
        </div>
      )}
    </section>
  )
}
