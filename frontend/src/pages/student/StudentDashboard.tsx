import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  XCircle,
  Clock,
  ScanFace,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Award,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { studentService, enrollmentService } from '../../services/endpoints'
import api from '../../services/api'
import StudentWeeklyTimetable from './StudentWeeklyTimetable'

interface AttendanceHistoryItem {
  id: string
  date: string
  status: string
  checkInTime: string
  periodNumber: number
  periodName: string
  subjectCode: string
  subjectName: string
  faculty: string
  timing: string
}

interface SummaryData {
  overallPercentage: number
  totalConducted: number
  presentCount: number
  absentCount: number
  lateCount: number
  subjects: Array<{
    code: string
    name: string
    faculty: string
    conducted: number
    attended: number
    percentage: number
  }>
}

const OFFICIAL_SUBJECTS = [
  { code: 'TECH001', name: 'Technical Training', faculty: 'Technical Trainer', periodsPerWeek: 12 },
  { code: '230BT02', name: 'Mathematical Foundations of Computer Science (MFCS)', faculty: 'Faculty MFCS', periodsPerWeek: 6 },
  { code: '2505T02', name: 'Problem Solving with C (PSC)', faculty: 'Faculty PSC', periodsPerWeek: 6 },
  { code: '250HT01', name: 'Logical Reasoning & Problem Solving (LPS)', faculty: 'Faculty LPS', periodsPerWeek: 6 },
  { code: '2505T01', name: 'Frontend Web Development (FWD)', faculty: 'Faculty FWD', periodsPerWeek: 6 },
]

export default function StudentDashboard() {
  const { data: student, isLoading: studentLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: studentService.getMe,
  })

  const { data: enrollStatus } = useQuery({
    queryKey: ['my-enroll-status'],
    queryFn: () => (student ? enrollmentService.studentStatus(student.id) : null),
    enabled: !!student,
  })

  // Fetch real attendance records
  const { data: attendanceHistory } = useQuery<AttendanceHistoryItem[]>({
    queryKey: ['my-attendance-history'],
    queryFn: async () => {
      const res = await api.get('/attendance/my-history')
      return res.data?.data || []
    },
    refetchInterval: 3000,
  })

  // Fetch accurate aggregated summary from backend
  const { data: summaryData } = useQuery<SummaryData>({
    queryKey: ['my-attendance-summary'],
    queryFn: async () => {
      const res = await api.get('/attendance/my-summary')
      return res.data?.data
    },
    refetchInterval: 3000,
  })

  if (studentLoading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto p-4">
        <div className="h-36 bg-slate-100 animate-pulse rounded-[28px]" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-slate-100 animate-pulse rounded-[24px]" />
          ))}
        </div>
      </div>
    )
  }

  const history = attendanceHistory || []

  // Prefer backend calculated breakdown if available
  const subjectBreakdown = summaryData?.subjects?.length
    ? summaryData.subjects
    : OFFICIAL_SUBJECTS.map(sub => {
        const subHistory = history.filter(h => h.subjectCode === sub.code)
        const attended = subHistory.filter(h => h.status === 'PRESENT').length
        const conducted = subHistory.length
        const pct = conducted > 0 ? Math.round((attended / conducted) * 100) : 100

        return {
          ...sub,
          attended,
          conducted,
          percentage: pct,
        }
      })

  // Calculate real totals across subjects
  const presentCount = summaryData?.presentCount ?? subjectBreakdown.reduce((acc, s) => acc + s.attended, 0)
  const totalConducted = summaryData?.totalConducted ?? subjectBreakdown.reduce((acc, s) => acc + s.conducted, 0)
  const absentCount = summaryData?.absentCount ?? Math.max(0, totalConducted - presentCount)
  const lateCount = summaryData?.lateCount ?? history.filter(h => h.status === 'LATE').length
  const overallPercentage =
    summaryData?.overallPercentage ??
    (totalConducted > 0 ? parseFloat(((presentCount / totalConducted) * 100).toFixed(1)) : 100.0)

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-2 sm:p-4 font-sans">
      {/* ── Profile Hero Banner (Signature Electric Azure Blue matching Login) ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#0070ba] via-[#0090e7] to-[#0284c7] text-white p-6 sm:p-8 shadow-[0_16px_48px_rgba(0,144,231,0.22)]"
      >
        <div className="absolute inset-0 pointer-events-none opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-[22px] bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-900/20">
              {student?.fullName?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {student?.fullName || 'Student Portal'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Biometrics Verified
                </span>
              </div>
              <p className="text-xs text-white/90 font-mono">
                Roll No: <span className="font-bold text-white">{student?.rollNumber}</span> • Section CSM - F
              </p>
              <p className="text-[11px] text-white/75 mt-0.5">
                Malla Reddy (MR) University • Off Campus Tirupati
              </p>
            </div>
          </div>

          {/* Quick Launch Camera Button */}
          <Link
            to="/student/verify"
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-[#0090e7] hover:bg-white/95 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-950/20 transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
          >
            <ScanFace className="w-4 h-4 text-[#0090e7]" />
            <span>Mark Live Attendance</span>
          </Link>
        </div>
      </motion.div>

      {/* ── Key Metrics Cards (Clean Modern Cards with Glow) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Overall Attendance',
            value: totalConducted === 0 ? '100%' : `${overallPercentage}%`,
            subtitle:
              totalConducted === 0
                ? 'Clean attendance record'
                : overallPercentage >= 75
                ? 'Above 75% required'
                : 'Low attendance alert',
            icon: ScanFace,
            color: overallPercentage >= 75 ? 'text-emerald-600' : 'text-rose-600',
            bg: overallPercentage >= 75 ? 'bg-emerald-50/50' : 'bg-rose-50/50',
            border: overallPercentage >= 75 ? 'border-emerald-200/80' : 'border-rose-200/80',
          },
          {
            label: 'Classes Attended',
            value: `${presentCount}`,
            subtitle: `${presentCount} verified periods`,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50/50',
            border: 'border-emerald-200/80',
          },
          {
            label: 'Classes Missed',
            value: `${absentCount}`,
            subtitle: absentCount === 0 ? '0 missed periods' : `${absentCount} unverified periods`,
            icon: XCircle,
            color: absentCount > 0 ? 'text-rose-600' : 'text-slate-500',
            bg: absentCount > 0 ? 'bg-rose-50/50' : 'bg-slate-50/60',
            border: absentCount > 0 ? 'border-rose-200/80' : 'border-slate-200/80',
          },
          {
            label: 'Late Check-ins',
            value: `${lateCount}`,
            subtitle: 'Post-window check-ins',
            icon: Clock,
            color: lateCount > 0 ? 'text-amber-600' : 'text-slate-500',
            bg: lateCount > 0 ? 'bg-amber-50/50' : 'bg-slate-50/60',
            border: lateCount > 0 ? 'border-amber-200/80' : 'border-slate-200/80',
          },
        ].map(({ label, value, subtitle, icon: Icon, color, bg, border }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-[24px] border ${border} ${bg} bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all space-y-2`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className={`text-3xl font-black ${color} tracking-tight`}>{value}</p>
            <p className="text-[11px] text-slate-500 font-semibold">{subtitle}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Full Weekly Timetable (Premium Interactive Experience) ── */}
      <StudentWeeklyTimetable
        attendanceHistory={history}
        subjectStats={subjectBreakdown}
      />

      {/* ── Subject-wise Attendance Breakdown ── */}
      <div className="bg-white p-6 sm:p-7 rounded-[28px] border border-slate-200/80 shadow-[0_6px_30px_rgba(0,0,0,0.04)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#0090e7]/10 text-[#0090e7] flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
                Subject-wise Biometric Attendance
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-10">
              CSM Section F • Minimum 75% attendance required per subject for semester examination eligibility
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0090e7]/10 text-[#0090e7] rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>5 Core Subjects</span>
          </span>
        </div>

        <div className="space-y-3.5">
          {subjectBreakdown.map(sub => {
            const hasStarted = sub.conducted > 0
            const isGood = hasStarted ? sub.percentage >= 75 : true
            return (
              <div
                key={sub.code}
                className="p-5 rounded-2xl border border-slate-200/70 hover:border-[#0090e7]/40 bg-slate-50/40 hover:bg-white transition-all space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-mono font-bold text-[#0090e7] bg-[#0090e7]/10 px-2 py-0.5 rounded-md text-[11px] mr-2">
                      {sub.code}
                    </span>
                    <span className="font-bold text-slate-800 text-sm">{sub.name}</span>
                    <span className="text-slate-400 ml-2">({sub.faculty})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-600">
                      {sub.conducted === 0
                        ? '0 Attended / 0 Total'
                        : `${sub.attended} Attended / ${sub.conducted} Total`}
                    </span>
                    <span
                      className={`font-black text-xs px-2.5 py-1 rounded-lg ${
                        !hasStarted
                          ? 'bg-slate-100 text-slate-700'
                          : isGood
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {!hasStarted ? '—' : `${sub.percentage}%`}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      !hasStarted
                        ? 'bg-slate-200'
                        : isGood
                        ? 'bg-gradient-to-r from-[#0090e7] to-emerald-500'
                        : 'bg-gradient-to-r from-rose-500 to-red-500'
                    }`}
                    style={{ width: `${!hasStarted ? 0 : Math.min(100, sub.percentage)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Recent Attendance Verification Log ── */}
      <div className="bg-white p-6 sm:p-7 rounded-[28px] border border-slate-200/80 shadow-[0_6px_30px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
              Recent Attendance Verification Log
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Real-time SFace Logs</span>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <ScanFace className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium">No biometric records logged yet for today.</p>
            <Link
              to="/student/verify"
              className="mt-3.5 inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#0090e7] hover:bg-[#007ec9] text-white rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
            >
              <ScanFace className="w-4 h-4" />
              <span>Scan Face Now</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.slice(0, 5).map(item => (
              <div key={item.id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800">
                    Period {item.periodNumber} • {item.subjectName}
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    {item.date} at {item.checkInTime} • {item.timing}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {item.status}
                  </span>
                  <span className="px-2 py-0.5 bg-[#0090e7]/10 text-[#0090e7] rounded-md font-mono text-[10px] font-bold">
                    SFace AI
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
