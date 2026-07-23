import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Upload, X, File } from 'lucide-react'
import { apiPost } from '@/lib/api/client'

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
] as const

type AcceptedMime = typeof ACCEPTED_TYPES[number]

const MAX_FILE_SIZE_MB = 20

const CATEGORIES = [
  'General',
  'Medical',
  'Admin',
  'Finance',
  'Kitchen',
  'HR',
  'Governance',
  'Legal',
  'Other',
]

interface UploadModalProps {
  open: boolean
  onClose: () => void
  /** API path prefix, e.g. '/residents/:id/documents' or '/pillars/admin/documents' */
  uploadPath: string
  categories?: string[]
  onSuccess?: () => void
}

/** Compute SHA-256 hex of a file using the Web Crypto API. */
async function sha256Hex(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export function UploadModal({ open, onClose, uploadPath, categories = CATEGORIES, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('General')
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset when modal opens
  useEffect(() => {
    if (!open) {
      setFile(null); setTitle(''); setCategory('General')
      setError(null); setProgress(0)
    }
  }, [open])

  const validateFile = (f: File): string | null => {
    if (!(ACCEPTED_TYPES as readonly string[]).includes(f.type))
      return 'File type not supported. Use PDF, DOC, DOCX, XLS, XLSX, JPG, or PNG.'
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024)
      return `File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`
    return null
  }

  const handleFile = (f: File) => {
    const err = validateFile(f)
    if (err) { setError(err); return }
    setError(null)
    setFile(f)
    if (!title) {
      const stem = f.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim()
      setTitle(stem)
    }
  }

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title])

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      setError('Please select a file and enter a title.')
      return
    }
    setUploading(true)
    setError(null)
    setProgress(10)

    try {
      // Step 1: compute SHA-256 and request upload intent
      const hash = await sha256Hex(file)
      setProgress(20)

      const intent = await apiPost<{ document_id: string; upload_url: string }>(
        `/${uploadPath}/upload-intent`,
        {
          title: title.trim(),
          category,
          content_type: file.type as AcceptedMime,
          size_bytes: file.size,
          sha256: hash,
        }
      )
      setProgress(40)

      // Step 2: PUT file directly to presigned R2 URL (no auth header)
      const r2Res = await fetch(intent.upload_url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      if (!r2Res.ok) throw new Error(`Storage upload failed (${r2Res.status})`)
      setProgress(80)

      // Step 3: notify backend that the upload is complete
      await apiPost(`/documents/${intent.document_id}/complete-upload`)
      setProgress(100)

      onSuccess?.()
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleClose = () => {
    if (uploading) return
    setFile(null); setTitle(''); setCategory('General')
    setError(null); setProgress(0)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && handleClose()}>
      <DialogContent className="max-w-md" style={{ backgroundColor: '#ffffff' }}>
        <DialogHeader>
          <DialogTitle style={{ color: '#1E3A2F' }}>Upload Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Drag-drop zone */}
          <div
            className="rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors"
            style={{
              borderColor: dragging ? '#1E3A2F' : '#ddd6c8',
              backgroundColor: dragging ? 'rgba(30,58,47,0.03)' : '#F5F0E8',
            }}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
            aria-label="Upload file — click or drag and drop"
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <File size={20} style={{ color: '#1E3A2F' }} />
                <span className="text-sm font-medium" style={{ color: '#1E3A2F' }}>
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setFile(null) }}
                  aria-label="Remove file"
                >
                  <X size={16} style={{ color: '#5a5a5a' }} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={24} className="mx-auto mb-3" style={{ color: '#5a5a5a' }} />
                <p className="text-sm font-medium" style={{ color: '#1E3A2F' }}>
                  Click to browse or drag a file here
                </p>
                <p className="text-xs mt-1" style={{ color: '#5a5a5a' }}>
                  PDF, DOC, DOCX, XLS, XLSX, JPG, PNG — max {MAX_FILE_SIZE_MB}MB
                </p>
              </>
            )}
          </div>

          {/* Document title */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>
              Document Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Admission Consent Form"
              className="w-full px-3 py-2.5 rounded border text-sm outline-none"
              style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
              onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
              onBlur={e => (e.target.style.borderColor = '#ddd6c8')}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded border text-sm outline-none"
              style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Progress bar */}
          {uploading && (
            <div
              className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: '#ddd6c8' }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, backgroundColor: '#D4AF37' }}
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <p
              className="text-xs p-3 rounded border"
              style={{ color: '#dc2626', backgroundColor: '#fef2f2', borderColor: '#fecaca' }}
              role="alert"
            >
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="flex-1 px-4 py-2.5 rounded border text-sm font-medium transition-colors"
              style={{ borderColor: '#ddd6c8', color: '#5a5a5a' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 px-4 py-2.5 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
