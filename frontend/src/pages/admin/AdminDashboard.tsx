import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Clock,
  ScanFace,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

interface PeriodSummary {
  timetableId: string
  periodNumber: number
  periodName: string
  timing: string
  subjectCode: string
  subjectName: string
  faculty: string
  totalStudents: number
  presentCount: number
  absentCount: number
  attendancePercentage: number
}

export default function AdminDashboard() {
  const [periods, setPeriods] = useState<PeriodSummary[]>([])
  const [totalStudents, setTotalStudents] = useState(32)
  const [loading, setLoading] = useState(true)
  const [clock, setClock] = useState(new Date())

  const fetchOverview = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/period-attendance')
      setPeriods(res.data?.periods || [])
      setTotalStudents(res.data?.totalStudents || 32)
    } catch (err) {
      console.error('Error fetching admin overview:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverview()
    const timer = setInterval(() => {
      setClock(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const istTime = clock.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })
  const istDate = clock.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Aggregate today's stats
  const activePeriod = periods[0]
  const todayPresent = activePeriod?.presentCount || 0
  const todayAbsent = activePeriod?.absentCount || 0
  const todayPct = activePeriod?.attendancePercentage || 0

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-4 font-sans">
      {/* ── Top Institutional Hero Banner (Premium Blue Matching Login) ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#0070ba] via-[#0090e7] to-[#0284c7] text-white p-6 sm:p-8 shadow-[0_16px_48px_rgba(0,144,231,0.22)]"
      >
        {/* Background Subtle Biometric Dot Matrix Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center flex-shrink-0 shadow-lg">
              <ScanFace className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[11px] font-semibold text-white/95 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>CSM Section F • Automated Biometric Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Admin Master Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl">
                Malla Reddy University (Off Campus Tirupati) • Real-time SFace Biometrics & Attendance Command Center
              </p>
            </div>
          </div>

          {/* Real-time Clock & Sync Pill */}
          <div className="flex md:flex-col items-center md:items-end justify-between gap-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-3.5 sm:px-5">
            <div className="text-right">
              <div className="text-lg sm:text-xl font-black text-white font-mono tracking-tight">{istTime}</div>
              <div className="text-[11px] text-white/80">{istDate}</div>
            </div>
            <button
              onClick={fetchOverview}
              title="Refresh Data"
              className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 transition text-white active:scale-95 flex items-center gap-1.5 text-xs font-semibold px-2.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── KPI Metrics Cards (Sleek Clean Cards with Micro-Glow) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Enrolled Students */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 rounded-[24px] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,144,231,0.1)] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enrolled Roster</span>
            <div className="w-10 h-10 rounded-xl bg-[#0090e7]/10 text-[#0090e7] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800 mt-2.5 tracking-tight">{totalStudents}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold mt-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% SFace Embeddings Active</span>
          </div>
        </motion.div>

        {/* Active Period Present */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white p-5 rounded-[24px] border border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/30 shadow-[0_4px_24px_rgba(16,185,129,0.06)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.12)] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Period Present</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600 mt-2.5 tracking-tight">{todayPresent}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{todayPct}% Biometric Turnout</span>
          </div>
        </motion.div>

        {/* Active Period Absent */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 rounded-[24px] border border-rose-200/80 bg-gradient-to-br from-white to-rose-50/30 shadow-[0_4px_24px_rgba(244,63,94,0.06)] hover:shadow-[0_8px_32px_rgba(244,63,94,0.12)] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Period Absent</span>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-600 mt-2.5 tracking-tight">{todayAbsent}</p>
          <p className="text-[11px] text-rose-600 font-semibold mt-2">Pending Biometric Verification</p>
        </motion.div>

        {/* Scheduled Periods */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white p-5 rounded-[24px] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,144,231,0.1)] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled Periods</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-indigo-700 mt-2.5 tracking-tight">{periods.length || 6}</p>
          <p className="text-[11px] text-slate-500 font-semibold mt-2">09:20 AM – 03:40 PM IST</p>
        </motion.div>
      </div>

      {/* ── Today's Period-wise Attendance Report Snapshot ── */}
      <div className="bg-white rounded-[28px] border border-slate-200/80 p-6 sm:p-7 shadow-[0_6px_30px_rgba(0,0,0,0.04)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#0090e7]/10 text-[#0090e7] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
                Today's Live Period Breakdown
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-10">
              Individual present and absent headcount across all 6 lecture periods
            </p>
          </div>
          <Link
            to="/admin/attendance"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0090e7]/10 hover:bg-[#0090e7]/20 text-[#0090e7] text-xs font-bold transition-colors active:scale-95"
          >
            <span>Detailed Period View</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-14 text-center text-slate-400">
            <div className="w-7 h-7 border-3 border-[#0090e7] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-medium">Loading live period streams…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {periods.map(p => (
              <div
                key={p.periodNumber}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-[#0090e7]/40 hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[11px] px-2.5 py-0.5 bg-[#0090e7] text-white rounded-lg shadow-sm">
                    Period {p.periodNumber}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500 font-semibold">{p.timing}</span>
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800 truncate">{p.subjectName}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{p.faculty} • <span className="font-mono">{p.subjectCode}</span></p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                    <span>Attendance Rate</span>
                    <span className="font-bold text-[#0090e7]">{p.attendancePercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#0090e7] to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, p.attendancePercentage))}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold">
                  <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {p.presentCount} Present
                  </span>
                  <span className="text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> {p.absentCount} Absent
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Quick Action Command Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/attendance"
          className="p-6 rounded-[24px] bg-white border border-slate-200/80 hover:border-[#0090e7] hover:shadow-[0_12px_36px_rgba(0,144,231,0.14)] transition-all space-y-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#0090e7]/10 text-[#0090e7] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-800 group-hover:text-[#0090e7] transition-colors">
            Period-wise Attendance
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Expand any lecture period to view individual student photos, verified roll numbers, and manual override controls.
          </p>
        </Link>

        <Link
          to="/admin/timetable"
          className="p-6 rounded-[24px] bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-[0_12px_36px_rgba(99,102,241,0.14)] transition-all space-y-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-800 group-hover:text-indigo-600 transition-colors">
            Weekly Master Timetable
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Interactive 6-day × 6-period academic grid. Configure faculty assignments, subject codes, and scan windows.
          </p>
        </Link>

        <Link
          to="/admin/reports"
          className="p-6 rounded-[24px] bg-white border border-slate-200/80 hover:border-emerald-400 hover:shadow-[0_12px_36px_rgba(16,185,129,0.14)] transition-all space-y-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-800 group-hover:text-emerald-600 transition-colors">
            Biometric Logs & Export
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Audit-ready facial verification logs. Filter by student, subject or date, and export full Excel reports.
          </p>
        </Link>
      </div>
    </div>
  )
}
