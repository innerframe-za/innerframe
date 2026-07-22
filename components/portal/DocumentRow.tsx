import { FileText, FileSpreadsheet, Image as ImageIcon, File, Download, Trash2 } from 'lucide-react'
import { GlobalBadge } from './GlobalBadge'
import { apiGet } from '@/lib/api/client'

/**
 * A single document row. documentId is the backend document UUID.
 * Download/view requests a short-lived presigned R2 URL from the backend.
 */
interface DocumentRowProps {
  documentId: string
  fileName: string
  title?: string
  category?: string
  date: string
  isGlobal?: boolean
  canDelete?: boolean
  onDelete?: () => void
}

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (['pdf'].includes(ext))
    return { Icon: FileText, color: '#dc2626' }
  if (['doc', 'docx'].includes(ext))
    return { Icon: FileText, color: '#2563eb' }
  if (['xls', 'xlsx', 'csv'].includes(ext))
    return { Icon: FileSpreadsheet, color: '#16a34a' }
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext))
    return { Icon: ImageIcon, color: '#9333ea' }
  return { Icon: File, color: '#5a5a5a' }
}

export function DocumentRow({
  documentId,
  fileName,
  title,
  category,
  date,
  isGlobal = false,
  canDelete = false,
  onDelete,
}: DocumentRowProps) {
  const { Icon, color } = getFileIcon(fileName)
  const displayTitle = title || fileName

  const getDownloadUrl = async (): Promise<string | null> => {
    try {
      const data = await apiGet<{ url: string }>(`/documents/${documentId}/download-url`)
      return data.url
    } catch {
      return null
    }
  }

  const handleView = async () => {
    const url = await getDownloadUrl()
    if (!url) { alert('Could not open document. Please try again.'); return }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleDownload = async () => {
    const url = await getDownloadUrl()
    if (!url) { alert('Could not generate download link. Please try again.'); return }
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleView}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleView()}
      className="flex items-center gap-3 py-3 px-4 rounded-xl border group cursor-pointer transition-all duration-150 hover:shadow-sm hover:border-[rgba(30,58,47,0.2)] hover:bg-[rgba(30,58,47,0.02)]"
      style={{
        borderColor: '#ddd6c8',
        borderWidth: '0.5px',
        backgroundColor: '#ffffff',
      }}
      aria-label={`Open ${fileName}`}
      title="Click to open"
    >
      {/* File icon */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}12` }}
      >
        <Icon size={16} style={{ color }} aria-hidden="true" />
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: '#1a1a1a' }}
          title={displayTitle}
        >
          {displayTitle}
        </p>
        {title && title !== fileName && (
          <p className="text-xs truncate mt-0.5" style={{ color: '#9ca3af' }} title={fileName}>
            {fileName}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {category && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: 'rgba(30,58,47,0.07)', color: '#1E3A2F' }}
            >
              {category}
            </span>
          )}
          {isGlobal && <GlobalBadge />}
          <span className="text-xs" style={{ color: '#5a5a5a' }}>{date}</span>
        </div>
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-1 flex-shrink-0"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleDownload}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:bg-[rgba(30,58,47,0.07)]"
          style={{ color: '#5a5a5a' }}
          aria-label={`Download ${fileName}`}
          title="Download"
        >
          <Download size={14} />
        </button>
        {canDelete && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:bg-red-50 hover:text-red-500"
            style={{ color: '#5a5a5a' }}
            aria-label={`Delete ${fileName}`}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
