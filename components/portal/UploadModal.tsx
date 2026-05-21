import { useState, useRef, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Upload, X, File, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/lib/auth/useUser'

// Fixed UUID for the Innerframe internal organisation — global docs are stored here
const INNERFRAME_ORG_ID = '00000000-0000-0000-0000-000000000001'

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
]

const MAX_FILE_SIZE_MB = 20

const PILLARS = [
  { value: 'admin', label: 'Admin Office' },
  { value: 'finance', label: 'Finance' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'medical', label: 'Medical' },
  { value: 'medical_residence', label: 'Medical Residence' },
  { value: 'hr', label: 'HR' },
  { value: 'board_governance', label: 'Board Governance' },
]

interface Section {
  id: string
  title: string
}

interface Patient {
  id: string
  fullName: string
}

interface UploadModalProps {
  open: boolean
  onClose: () => void
  orgId: string
  userRole?: UserRole
  defaultPillar?: string
  sections?: Section[]
  patients?: Patient[]
  onSuccess?: () => void
  // When set, locks the resident selector to this patient (e.g. from the resident detail page)
  preselectedPatientId?: string
}

/**
 * Drag-and-drop file upload modal.
 * Uploads to Supabase Storage at {orgId}/{pillar}/{fileName},
 * then inserts a row into the documents table.
 */
export function UploadModal({
  open,
  onClose,
  orgId,
  userRole,
  defaultPillar,
  sections = [],
  patients = [],
  onSuccess,
  preselectedPatientId,
}: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [pillar, setPillar] = useState(defaultPillar ?? 'admin')
  const [sectionId, setSectionId] = useState('')
  const [patientId, setPatientId] = useState(preselectedPatientId ?? '')
  const [isGlobal, setIsGlobal] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isSuperAdmin = userRole === 'super_admin'

  const validateFile = (f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type))
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
  }

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError(null)
    setProgress(10)

    try {
      const supabase = createClient()

      // Build storage path: orgId/pillar/uid_filename
      const uid = crypto.randomUUID().slice(0, 8)
      const safeFileName = `${uid}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      const storagePath = `${orgId}/${pillar}/${safeFileName}`

      setProgress(30)

      // TODO: replace with Supabase Storage upload once credentials are configured
      const { error: storageError } = await supabase.storage
        .from('documents')
        .upload(storagePath, file, { upsert: false })

      if (storageError) throw storageError

      setProgress(70)

      // Store the storage path — NOT a public URL.
      // Bucket must be private; download links are generated as signed URLs at read time.
      // Global documents are stored under the Innerframe internal org.
      const { error: dbError } = await supabase.from('documents').insert({
        org_id: isGlobal ? INNERFRAME_ORG_ID : orgId,
        pillar,
        file_name: file.name,
        file_url: storagePath,
        section_id: sectionId || null,
        patient_id: patientId || null,
        is_global: isGlobal,
      })

      if (dbError) throw dbError

      setProgress(100)
      onSuccess?.()
      handleClose()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Upload failed. Please try again.'
      )
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleClose = () => {
    if (uploading) return
    setFile(null)
    setError(null)
    setProgress(0)
    setPillar(defaultPillar ?? 'admin')
    setSectionId('')
    setPatientId('')
    setIsGlobal(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={open => !open && handleClose()}>
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
              onChange={handleInputChange}
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

          {/* Pillar selector */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: '#1a1a1a' }}
            >
              Pillar
            </label>
            <select
              value={pillar}
              onChange={e => setPillar(e.target.value)}
              className="w-full px-3 py-2.5 rounded border text-sm outline-none"
              style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
            >
              {PILLARS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Section selector */}
          {sections.length > 0 && (
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: '#1a1a1a' }}
              >
                Section (optional)
              </label>
              <select
                value={sectionId}
                onChange={e => setSectionId(e.target.value)}
                className="w-full px-3 py-2.5 rounded border text-sm outline-none"
                style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
              >
                <option value="">-- No section --</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Patient selector — hidden when a resident is pre-selected */}
          {!preselectedPatientId && patients.length > 0 && (
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: '#1a1a1a' }}
              >
                Link to resident (optional)
              </label>
              <select
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                className="w-full px-3 py-2.5 rounded border text-sm outline-none"
                style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
              >
                <option value="">-- No resident --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.fullName}</option>
                ))}
              </select>
            </div>
          )}

          {/* Make global toggle — super_admin only */}
          {isSuperAdmin && (
            <label
              className="flex items-center gap-2.5 cursor-pointer select-none p-3 rounded-lg border"
              style={{ borderColor: '#D4AF37', backgroundColor: 'rgba(212,175,55,0.06)' }}
            >
              <input
                type="checkbox"
                checked={isGlobal}
                onChange={e => setIsGlobal(e.target.checked)}
                className="w-4 h-4 accent-[#1E3A2F] cursor-pointer"
              />
              <Globe size={14} style={{ color: '#D4AF37' }} aria-hidden="true" />
              <span className="text-sm font-medium" style={{ color: '#1a1a1a' }}>
                Make global
              </span>
              <span className="text-xs" style={{ color: '#5a5a5a' }}>
                — visible to all facilities
              </span>
            </label>
          )}

          {/* Progress bar */}
          {uploading && (
            <div
              className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: '#ddd6c8' }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  backgroundColor: '#D4AF37',
                }}
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <p
              className="text-xs p-3 rounded border"
              style={{
                color: '#dc2626',
                backgroundColor: '#fef2f2',
                borderColor: '#fecaca',
              }}
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
