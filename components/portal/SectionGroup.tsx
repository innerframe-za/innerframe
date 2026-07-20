import { Plus } from 'lucide-react'
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
  onUpload?: () => void
}

export function SectionGroup({
  title,
  documents,
  canDelete = false,
  onDelete,
  onUpload,
}: SectionGroupProps) {
  return (
    <section className="mb-8">
      {/* Section heading */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2
            className="text-[15px] font-semibold"
            style={{ color: '#1E3A2F', fontFamily: "'Plus Jakarta Sans', system-ui", letterSpacing: '-0.015em' }}
          >
            {title}
          </h2>
          <div
            style={{ width: '32px', height: '2px', backgroundColor: '#D4AF37', marginTop: '6px', borderRadius: '1px' }}
            aria-hidden="true"
          />
        </div>
        <div className="flex items-center gap-2.5">
          {onUpload && (
            <button
              type="button"
              onClick={onUpload}
              aria-label={`Add document to ${title}`}
              className="flex items-center justify-center w-6 h-6 rounded-full transition-colors"
              style={{ color: '#1E3A2F', border: '1.5px solid rgba(30,58,47,0.3)', backgroundColor: 'transparent' }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(30,58,47,0.08)'
                e.currentTarget.style.borderColor = '#1E3A2F'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderColor = 'rgba(30,58,47,0.3)'
              }}
            >
              <Plus size={12} strokeWidth={2.5} />
            </button>
          )}
          {documents.length > 0 && (
            <span className="text-xs tabular-nums" style={{ color: '#9ca3af' }}>
              {documents.length} {documents.length === 1 ? 'file' : 'files'}
            </span>
          )}
        </div>
      </div>

      {documents.length === 0 ? (
        <div
          className="py-8 text-center rounded-xl border"
          style={{ borderColor: '#ddd6c8', borderWidth: '0.5px', borderStyle: 'dashed' }}
        >
          <p className="text-sm" style={{ color: '#9ca3af' }}>No documents yet</p>
          {onUpload && (
            <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>
              Use the + button above to upload the first file.
            </p>
          )}
        </div>
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
