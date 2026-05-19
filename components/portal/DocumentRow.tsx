import { FileText, FileSpreadsheet, Image as ImageIcon, File, Download, Trash2 } from 'lucide-react'
import { GlobalBadge } from './GlobalBadge'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

/**
 * A single document row used in pillar pages and section groups.
 * fileUrl is the Supabase storage path (not a public URL).
 * Downloads generate a short-lived signed URL so the bucket stays private.
 */
interface DocumentRowProps {
  fileName: string
  fileUrl: string
  category?: string
  pillar?: string
  date: string
  isGlobal?: boolean
  canDelete?: boolean
  onDelete?: () => void
}

/** Map file extension to icon and color (semantic file-type colors — not brand colors) */
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
  return { Icon: File, color: 'var(--color-if-text-muted)' }
}

/* Pillar accent colors mapped to new brand palette */
const pillarColors: Record<string, string> = {
  admin:            'var(--color-if-primary)',
  finance:          'var(--color-if-secondary)',
  kitchen:          'var(--color-if-tertiary)',
  medical:          'var(--color-if-accent-light)',
  board_governance: 'var(--color-if-gold-text)',
}

export function DocumentRow({
  fileName,
  fileUrl,
  category,
  pillar,
  date,
  isGlobal = false,
  canDelete = false,
  onDelete,
}: DocumentRowProps) {
  const { Icon, color } = getFileIcon(fileName)
  const pillarColor = pillar ? (pillarColors[pillar] ?? 'var(--color-if-text-muted)') : 'var(--color-if-text-muted)'

  /** Office docs need Google Docs Viewer; PDFs/images open directly */
  const isOfficeDoc = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() ?? ''
    return ['doc', 'docx', 'xls', 'xlsx'].includes(ext)
  }

  const getSignedUrl = async (): Promise<string | null> => {
    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(fileUrl, 300) // 5-min window — enough for Docs Viewer to fetch
    if (error || !data?.signedUrl) return null
    return data.signedUrl
  }

  const handleView = async () => {
    if (!isSupabaseConfigured) {
      alert('Document preview is not available in demo mode.')
      return
    }
    const signedUrl = await getSignedUrl()
    if (!signedUrl) {
      alert('Could not open document. Please try again.')
      return
    }
    if (isOfficeDoc(fileName)) {
      // Google Docs Viewer handles DOC/DOCX/XLS/XLSX
      window.open(
        `https://docs.google.com/viewer?url=${encodeURIComponent(signedUrl)}`,
        '_blank',
        'noopener,noreferrer'
      )
    } else {
      window.open(signedUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleDownload = async () => {
    if (!isSupabaseConfigured) {
      alert('Document downloads are not available in demo mode.')
      return
    }
    const signedUrl = await getSignedUrl()
    if (!signedUrl) {
      alert('Could not generate download link. Please try again.')
      return
    }
    // Force download via anchor with download attribute
    const a = document.createElement('a')
    a.href = signedUrl
    a.download = fileName
    a.rel = 'noopener noreferrer'
    a.click()
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleView}
      onKeyDown={e => e.key === 'Enter' && handleView()}
      className="flex items-center gap-3 py-3 px-4 rounded-lg border group cursor-pointer transition-colors"
      style={{
        borderColor: 'var(--color-if-border)',
        borderWidth: '0.5px',
        backgroundColor: '#ffffff',
      }}
      onMouseEnter={e =>
        ((e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(47, 67, 55, 0.03)')
      }
      onMouseLeave={e =>
        ((e.currentTarget as HTMLDivElement).style.backgroundColor = '#ffffff')
      }
      aria-label={`Open ${fileName}`}
      title={isOfficeDoc(fileName) ? 'Open in Google Docs Viewer' : 'Click to open'}
    >
      {/* File icon */}
      <div
        className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}12` }}
      >
        <Icon size={16} style={{ color }} aria-hidden="true" />
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: 'var(--color-if-text)' }}
          title={fileName}
        >
          {fileName}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {category && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: 'rgba(47, 67, 55, 0.07)',
                color: 'var(--color-if-primary)',
              }}
            >
              {category}
            </span>
          )}
          {pillar && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: 'rgba(47, 67, 55, 0.07)',
                color: pillarColor,
              }}
            >
              {pillar.replace('_', ' ')}
            </span>
          )}
          {isGlobal && <GlobalBadge />}
          <span className="text-xs" style={{ color: 'var(--color-if-text-muted)' }}>
            {date}
          </span>
        </div>
      </div>

      {/* Actions — stop propagation so clicks don't also trigger row open */}
      <div
        className="flex items-center gap-1 flex-shrink-0"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleDownload}
          className="w-7 h-7 rounded flex items-center justify-center transition-colors"
          style={{ color: 'var(--color-if-text-muted)' }}
          onMouseEnter={e =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'rgba(47, 67, 55, 0.07)')
          }
          onMouseLeave={e =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'transparent')
          }
          aria-label={`Download ${fileName}`}
          title="Download"
        >
          <Download size={14} />
        </button>
        {canDelete && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="w-7 h-7 rounded flex items-center justify-center transition-colors"
            style={{ color: 'var(--color-if-text-muted)' }}
            onMouseEnter={e =>
              /* Error state uses semantic error red per design principles */
              ((e.currentTarget as HTMLButtonElement).style.color = '#8B3A3A')
            }
            onMouseLeave={e =>
              ((e.currentTarget as HTMLButtonElement).style.color = 'var(--color-if-text-muted)')
            }
            aria-label={`Delete ${fileName}`}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
