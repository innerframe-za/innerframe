import { Plus } from 'lucide-react'
import { DocumentRow } from './DocumentRow'

interface Document {
  id: string
  fileName: string
  documentId: string
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
  onDelete?: (id: string, documentId: string) => void
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
    <section className="mb-10">
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
              className="flex items-center justify-center w-6 h-6 rounded-full border border-[rgba(30,58,47,0.3)] text-[#1E3A2F] hover:bg-[rgba(30,58,47,0.08)] hover:border-[#1E3A2F] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#698169] focus-visible:ring-offset-1"
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
          style={{ borderColor: '#ddd6c8', borderWidth: '0.5px', borderStyle: 'dashed', backgroundColor: 'rgba(255,255,255,0.5)' }}
        >
          <p className="text-sm" style={{ color: '#5a5a5a' }}>No documents yet</p>
          {onUpload && (
            <p className="text-xs mt-1" style={{ color: '#5a5a5a' }}>
              Select the + next to the heading to add the first document.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map(doc => (
            <DocumentRow
              key={doc.id}
              fileName={doc.fileName}
              documentId={doc.documentId}
              title={doc.title}
              category={doc.category}
              date={doc.date}
              isGlobal={doc.isGlobal}
              canDelete={canDelete && !doc.isGlobal}
              onDelete={onDelete ? () => onDelete(doc.id, doc.documentId) : undefined}
            />
          ))}
        </div>
      )}
    </section>
  )
}
