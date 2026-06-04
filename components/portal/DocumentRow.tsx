import { FileText, FileSpreadsheet, Image as ImageIcon, File, Download, Trash2 } from 'lucide-react'
import { GlobalBadge } from './GlobalBadge'
import { createClient } from '@/lib/supabase/client'

/**
 * A single document row used in pillar pages and section groups.
 * fileUrl is the Supabase storage path (not a public URL).
 * Downloads generate a short-lived signed URL so the bucket stays private.
 */
interface DocumentRowProps {
  fileName: string
  fileUrl: string
  title?: string
  category?: string
  pillar?: string
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

const pillarColors: Record<string, string> = {
  admin: '#1E3A2F',
  finance: '#2D5A3D',
  kitchen: '#3B6B4A',
  medical: '#8AAF8E',
  medical_residence: '#5B8C6B',
  hr: '#7A6B4A',
  board_governance: '#D4AF37',
}

const pillarLabels: Record<string, string> = {
  admin: 'Admin',
  finance: 'Finance',
  kitchen: 'Kitchen',
  medical: 'Medical',
  medical_residence: 'Medical Residence',
  hr: 'HR',
  board_governance: 'Board Governance',
}

function friendlyPillar(p: string) {
  return pillarLabels[p] ?? p.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function DocumentRow({
  fileName,
  fileUrl,
  title,
  category,
  pillar,
  date,
  isGlobal = false,
  canDelete = false,
  onDelete,
}: DocumentRowProps) {
  const { Icon, color } = getFileIcon(fileName)
  const pillarColor = pillar ? (pillarColors[pillar] ?? '#5a5a5a') : '#5a5a5a'
  const displayTitle = title || fileName

  const fetchFileBlob = async (): Promise<Blob | null> => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return null

    const res = await fetch(`/api/files/${fileUrl}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    if (!res.ok) return null
    return res.blob()
  }

  const handleView = async () => {
    const blob = await fetchFileBlob()
    if (!blob) { alert('Could not open document. Please try again.'); return }
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank', 'noopener,noreferrer')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  const handleDownload = async () => {
    const blob = await fetchFileBlob()
    if (!blob) { alert('Could not generate download link. Please try again.'); return }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1_000)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleView}
      onKeyDown={e => e.key === 'Enter' && handleView()}
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
          {pillar && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${pillarColor}12`, color: pillarColor }}
            >
              {friendlyPillar(pillar)}
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
