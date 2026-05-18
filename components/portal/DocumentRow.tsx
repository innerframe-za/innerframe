import { FileText, FileSpreadsheet, Image as ImageIcon, File, Download, Trash2, Eye } from 'lucide-react'
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

/** Map file extension to icon and color */
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

const pillarColors: Record<string, string> = {
  admin: '#1E3A2F',
  finance: '#2D5A3D',
  kitchen: '#3B6B4A',
  medical: '#8AAF8E',
  board_governance: '#D4AF37',
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
  const pillarColor = pillar ? (pillarColors[pillar] ?? '#5a5a5a') : '#5a5a5a'

  /** Returns true for file types the browser can render natively */
  const isViewable = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() ?? ''
    return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
  }

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
      className="flex items-center gap-3 py-3 px-4 rounded-lg border group"
      style={{
        borderColor: '#ddd6c8',
        borderWidth: '0.5px',
        backgroundColor: '#ffffff',
      }}
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
          style={{ color: '#1a1a1a' }}
          title={fileName}
        >
          {fileName}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {category && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: 'rgba(30,58,47,0.07)',
                color: '#1E3A2F',
              }}
            >
              {category}
            </span>
          )}
          {pillar && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: `${pillarColor}12`,
                color: pillarColor,
              }}
            >
              {pillar.replace('_', ' ')}
            </span>
          )}
          {isGlobal && <GlobalBadge />}
          <span className="text-xs" style={{ color: '#5a5a5a' }}>
            {date}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* View button — shown for all file types */}
        <button
          type="button"
          onClick={handleView}
          className="w-7 h-7 rounded flex items-center justify-center transition-colors"
          style={{ color: '#5a5a5a' }}
          onMouseEnter={e =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'rgba(30,58,47,0.07)')
          }
          onMouseLeave={e =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'transparent')
          }
          aria-label={`Open ${fileName}`}
          title={isOfficeDoc(fileName) ? 'Open in Google Docs Viewer' : 'Open in browser'}
        >
          <Eye size={14} />
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="w-7 h-7 rounded flex items-center justify-center transition-colors"
          style={{ color: '#5a5a5a' }}
          onMouseEnter={e =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'rgba(30,58,47,0.07)')
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
            style={{ color: '#5a5a5a' }}
            onMouseEnter={e =>
              ((e.currentTarget as HTMLButtonElement).style.color = '#dc2626')
            }
            onMouseLeave={e =>
              ((e.currentTarget as HTMLButtonElement).style.color = '#5a5a5a')
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
