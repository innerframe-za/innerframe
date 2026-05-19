import { Upload } from 'lucide-react'
import { DocumentRow } from './DocumentRow'

interface Document {
  id: string
  fileName: string
  fileUrl: string
  category?: string
  pillar?: string
  date: string
  isGlobal?: boolean
}

/**
 * A document section group: section heading with gold underline,
 * list of DocumentRow items, and an Upload button.
 */
interface SectionGroupProps {
  title: string
  documents: Document[]
  canUpload?: boolean
  canDelete?: boolean
  onUpload?: () => void
  onDelete?: (id: string) => void
}

export function SectionGroup({
  title,
  documents,
  canUpload = false,
  canDelete = false,
  onUpload,
  onDelete,
}: SectionGroupProps) {
  return (
    <section className="mb-8">
      {/* Section heading with gold underline */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium" style={{ color: 'var(--color-if-primary)' }}>
            {title}
          </h2>
          <div
            style={{ width: '36px', height: '2px', backgroundColor: 'var(--color-if-gold-text)', marginTop: '4px' }}
            aria-hidden="true"
          />
        </div>
        {canUpload && (
          <button
            type="button"
            onClick={onUpload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors"
            style={{
              borderColor: 'var(--color-if-primary)',
              color: 'var(--color-if-primary)',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.backgroundColor = 'var(--color-if-primary)'
              el.style.color = 'var(--color-if-text-on-dark)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.backgroundColor = 'transparent'
              el.style.color = 'var(--color-if-primary)'
            }}
          >
            <Upload size={12} />
            Upload
          </button>
        )}
      </div>

      {/* Documents */}
      {documents.length === 0 ? (
        <p className="text-xs py-4 text-center" style={{ color: 'var(--color-if-text-muted)' }}>
          No documents in this section yet.
        </p>
      ) : (
        <div className="space-y-2">
          {documents.map(doc => (
            <DocumentRow
              key={doc.id}
              fileName={doc.fileName}
              fileUrl={doc.fileUrl}
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
