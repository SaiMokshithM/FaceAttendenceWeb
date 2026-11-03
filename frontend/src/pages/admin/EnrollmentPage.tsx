import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileArchive, FileSpreadsheet, CheckCircle2,
  XCircle, Clock, AlertCircle, ScanFace, RefreshCw,
  Users, UserCheck, TrendingUp, ChevronRight, Loader2,
} from 'lucide-react'
import { enrollmentService } from '../../services/endpoints'
import type { BulkJobStatus } from '../../types'

// ── KPI card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }:
  { icon: any; label: string; value: number | string; color: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="label mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${color.includes('success') ? 'bg-status-success/10' : color.includes('warning') ? 'bg-status-warning/10' : color.includes('danger') ? 'bg-status-danger/10' : 'bg-brand-blue/10'}`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
    </div>
  )
}

// ── Drop zone ─────────────────────────────────────────────────────────────────
function DropZone({ label, accept, icon: Icon, file, onFile }:
  { label: string; accept: string; icon: any; file: File | null; onFile: (f: File) => void }) {
  const [drag, setDrag] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  const handle = (f: File) => { if (f) onFile(f) }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handle(f) }}
      onClick={() => ref.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-200 flex flex-col items-center gap-3
        ${drag ? 'border-brand-blue bg-brand-blue/5' : file ? 'border-status-success bg-status-success/5' : 'border-brand-border hover:border-brand-electric hover:bg-brand-surface'}`}
    >
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={e => e.target.files?.[0] && handle(e.target.files[0])} />
      {file ? (
        <>
          <CheckCircle2 className="w-8 h-8 text-status-success" />
          <div className="text-center">
            <p className="text-sm font-semibold text-brand-navy">{file.name}</p>
            <p className="text-xs text-brand-slate">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </>
      ) : (
        <>
          <Icon className="w-8 h-8 text-brand-slate" />
          <div className="text-center">
            <p className="text-sm font-semibold text-brand-navy">{label}</p>
            <p className="text-xs text-brand-slate">Drag & drop or click to browse</p>
          </div>
        </>
      )}
    </div>
  )
}

// ── Progress panel ────────────────────────────────────────────────────────────
function JobProgress({ jobId }: { jobId: string }) {
  const [progress, setProgress] = useState<BulkJobStatus | null>(null)

  const { data } = useQuery({
    queryKey: ['job-status', jobId],
    queryFn: () => enrollmentService.jobStatus(jobId),
    refetchInterval: (q) => {
      const s = q.state.data?.status
      return s === 'PROCESSING' || s === 'PENDING' ? 2000 : false
    },
    enabled: !!jobId,
  })

  useEffect(() => { if (data) setProgress(data) }, [data])

  if (!progress) return <div className="h-8 skeleton rounded-lg" />

  const pct = progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0
  const done = progress.status === 'COMPLETED' || progress.status === 'FAILED'

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-brand-navy">Processing enrollment…</span>
        <span className={`badge ${progress.status === 'COMPLETED' ? 'badge-success' : progress.status === 'FAILED' ? 'badge-danger' : 'badge-info'}`}>
          {progress.status}
        </span>
      </div>

      <div className="h-2.5 bg-brand-border rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full rounded-full ${progress.status === 'FAILED' ? 'bg-status-danger' : 'bg-brand-blue'}`}
        />
      </div>

      <div className="grid grid-cols-4 gap-3 text-center">
        {[
          { label: 'Total',      value: progress.total,      color: 'text-brand-navy' },
          { label: 'Processed',  value: progress.processed,  color: 'text-brand-electric' },
          { label: 'Successful', value: progress.successful, color: 'text-status-success' },
          { label: 'Failed',     value: progress.failed,     color: 'text-status-danger' },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-brand-slate">{label}</p>
          </div>
        ))}
      </div>

      {done && progress.status === 'COMPLETED' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-status-success/10 text-status-success text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          Enrollment completed — {progress.successful} students enrolled successfully.
        </motion.div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function EnrollmentPage() {
  const [zipFile, setZipFile]       = useState<File | null>(null)
  const [rosterFile, setRosterFile] = useState<File | null>(null)
  const [jobId, setJobId]           = useState<string | null>(null)
  const [toast, setToast]           = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const qc = useQueryClient()

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['enrollment-overview'],
    queryFn: enrollmentService.overview,
    refetchInterval: 10_000,
  })

  const bulkMutation = useMutation({
    mutationFn: () => enrollmentService.bulkUpload(zipFile!, rosterFile!),
    onSuccess: (data) => {
      setJobId(data.jobId)
      setToast({ msg: `Job started — processing ${data.totalStudents} students.`, type: 'success' })
      qc.invalidateQueries({ queryKey: ['enrollment-overview'] })
    },
    onError: (err: any) => {
      setToast({ msg: err?.response?.data?.message || 'Upload failed. Please try again.', type: 'error' })
    },
  })

  const canUpload = zipFile && rosterFile && !bulkMutation.isPending

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Face Enrollment</h1>
          <p className="text-sm text-brand-slate mt-0.5">Bulk and individual biometric enrollment management</p>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className={`flex items-center gap-2 p-4 rounded-xl text-sm font-medium
              ${toast.type === 'success' ? 'bg-status-success/10 text-status-success border border-status-success/20'
                : 'bg-status-danger/10 text-status-danger border border-status-danger/20'}`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {overviewLoading ? Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card h-24 skeleton" />
        )) : (
          <>
            <StatCard icon={Users}     label="Total"     value={overview?.total ?? 0}    color="text-brand-navy" />
            <StatCard icon={UserCheck} label="Enrolled"  value={overview?.enrolled ?? 0} color="text-status-success" />
            <StatCard icon={Clock}     label="Pending"   value={overview?.pending ?? 0}  color="text-status-warning" />
            <StatCard icon={XCircle}   label="Failed"    value={overview?.failed ?? 0}   color="text-status-danger" />
          </>
        )}
      </div>

      {/* Bulk Upload Section */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-brand-border">
          <div className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center">
            <ScanFace className="w-4 h-4 text-brand-blue" />
          </div>
          <div>
            <h2 className="font-semibold text-brand-navy">Bulk Enrollment</h2>
            <p className="text-xs text-brand-slate">Upload ZIP of photos + CSV/Excel roster</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="label mb-2">Student Photos (ZIP)</p>
            <DropZone
              label="Upload ZIP archive" accept=".zip"
              icon={FileArchive} file={zipFile} onFile={setZipFile}
            />
            <p className="text-xs text-brand-slate mt-2">
              Filenames must match roll numbers (e.g. <code className="font-mono bg-brand-surface px-1 rounded">24A001.jpg</code>)
            </p>
          </div>
          <div>
            <p className="label mb-2">Student Roster (CSV/Excel)</p>
            <DropZone
              label="Upload CSV or XLSX" accept=".csv,.xlsx"
              icon={FileSpreadsheet} file={rosterFile} onFile={setRosterFile}
            />
            <p className="text-xs text-brand-slate mt-2">
              Columns: <code className="font-mono bg-brand-surface px-1 rounded">roll_number, full_name, filename</code>
            </p>
          </div>
        </div>

        <button
          onClick={() => bulkMutation.mutate()}
          disabled={!canUpload}
          className="btn-primary w-full justify-center py-3"
        >
          {bulkMutation.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Starting enrollment…</>
          ) : (
            <><Upload className="w-4 h-4" /> Start Bulk Enrollment</>
          )}
        </button>
      </div>

      {/* Job progress */}
      {jobId && <JobProgress jobId={jobId} />}

      {/* Instructions */}
      <div className="card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-brand-navy">Enrollment Requirements</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            'Each photo must contain exactly one face',
            'Minimum face size: 112×112 pixels',
            'Image must be JPEG, PNG or WEBP',
            'Image must not be blurry or overexposed',
            'Filenames must match roll numbers exactly',
            'No duplicate roll numbers in roster',
            'Photos are encrypted before storage (AES-256)',
            'Admin approval required before activation',
          ].map((req, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-brand-slate">
              <CheckCircle2 className="w-3.5 h-3.5 text-status-success mt-0.5 flex-shrink-0" />
              {req}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
