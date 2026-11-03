import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Clock, ScanFace, BookOpen, ChevronRight, Award, ShieldCheck, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { studentService, enrollmentService } from '../../services/endpoints'
import api from '../../services/api'

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
    queryFn: () => student ? enrollmentService.studentStatus(student.id) : null,
    enabled: !!student,
  })

  // Fetch real attendance records
  const { data: attendanceHistory, isLoading: historyLoading } = useQuery<AttendanceHistoryItem[]>({
    queryKey: ['my-attendance-history'],
    queryFn: async () => {
      const res = await api.get('/attendance/my-history')
      return res.data?.data || []
    },
    refetchInterval: 3000, // Auto-refresh when new face attendance is recorded
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
      <div className="space-y-4">
        <div className="h-32 skeleton rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-24 skeleton rounded-xl" />)}
        </div>
      </div>
    )
  }

  // Calculate live statistics from actual attendance records
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
  const overallPercentage = summaryData?.overallPercentage ?? (totalConducted > 0 ? parseFloat(((presentCount / totalConducted) * 100).toFixed(1)) : 100.0)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Profile Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl shadow-xl"
      >
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl font-bold shadow-inner">
            {student?.fullName?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">{student?.fullName}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Face Enrolled
              </span>
            </div>
            <p className="text-xs text-blue-200 font-mono mt-0.5">
              Roll No: {student?.rollNumber} • Section: CSM - F
            </p>
            <p className="text-xs text-blue-300 mt-1">
              Malla Reddy Deemed to be University, Off Campus – Tirupati
            </p>
          </div>
        </div>

        {/* Quick Launch Camera Button */}
        <Link
          to="/student/verify"
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs rounded-2xl shadow-lg transition flex items-center gap-2 whitespace-nowrap active:scale-95"
        >
          <ScanFace className="w-4 h-4" />
          Mark Live Attendance
        </Link>
      </motion.div>

      {/* Real-time Dynamic Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Overall Attendance',
            value: totalConducted === 0 ? '100%' : `${overallPercentage}%`,
            subtitle: totalConducted === 0 ? 'Clean attendance record' : (overallPercentage >= 75 ? 'Above 75% required' : 'Low attendance alert'),
            icon: ScanFace,
            color: overallPercentage >= 75 ? 'text-emerald-600' : 'text-rose-600',
            bg: overallPercentage >= 75 ? 'bg-emerald-50' : 'bg-rose-50',
            borderColor: overallPercentage >= 75 ? 'border-emerald-200' : 'border-rose-200'
          },
          {
            label: 'Classes Present',
            value: `${presentCount}`,
            subtitle: `${presentCount} verified periods`,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            borderColor: 'border-emerald-200'
          },
          {
            label: 'Classes Absent',
            value: `${absentCount}`,
            subtitle: absentCount === 0 ? '0 missed periods' : `${absentCount} unverified periods`,
            icon: XCircle,
            color: absentCount > 0 ? 'text-rose-600' : 'text-slate-600',
            bg: absentCount > 0 ? 'bg-rose-50' : 'bg-slate-50',
            borderColor: absentCount > 0 ? 'border-rose-200' : 'border-slate-200'
          },
          {
            label: 'Late Check-ins',
            value: `${lateCount}`,
            subtitle: 'Post-window check-ins',
            icon: Clock,
            color: lateCount > 0 ? 'text-amber-600' : 'text-slate-600',
            bg: lateCount > 0 ? 'bg-amber-50' : 'bg-slate-50',
            borderColor: lateCount > 0 ? 'border-amber-200' : 'border-slate-200'
          },
        ].map(({ label, value, subtitle, icon: Icon, color, bg, borderColor }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card p-5 border ${borderColor} ${bg} rounded-2xl transition hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-600">{label}</p>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className={`text-3xl font-extrabold ${color} mt-2 tracking-tight`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{subtitle}</p>
          </motion.div>
        ))}
      </div>

      {/* Subject-wise Attendance Breakdown */}
      <div className="card p-6 bg-white border border-gray-200 rounded-3xl shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" /> Subject-wise Biometric Attendance
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              CSM Section F • Minimum 75% attendance required per subject for exam eligibility
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
            5 Registered Subjects
          </span>
        </div>

        <div className="space-y-4">
          {subjectBreakdown.map((sub) => {
            const hasStarted = sub.conducted > 0
            const isGood = hasStarted ? sub.percentage >= 75 : true
            return (
              <div
                key={sub.code}
                className="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 transition space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div>
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px] mr-2">
                      {sub.code}
                    </span>
                    <span className="font-bold text-gray-900">{sub.name}</span>
                    <span className="text-gray-400 ml-2">({sub.faculty})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-600">
                      {sub.conducted === 0 ? '0 Attended / 0 Total' : `${sub.attended} Attended / ${sub.conducted} Total`}
                    </span>
                    <span
                      className={`font-black text-sm px-2.5 py-0.5 rounded-lg ${
                        !hasStarted
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : isGood
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {!hasStarted ? '—' : `${sub.percentage}%`}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      !hasStarted
                        ? 'bg-slate-200'
                        : isGood
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
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

      {/* Recent Attendance Verification Log */}
      <div className="card p-6 bg-white border border-gray-200 rounded-3xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" /> Recent Attendance Log
          </h2>
          <span className="text-xs text-gray-500">Live IST Records</span>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <ScanFace className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm">No attendance records yet for today.</p>
            <Link
              to="/student/verify"
              className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
            >
              Scan Face Now
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {history.slice(0, 5).map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-gray-900">
                    Period {item.periodNumber} • {item.subjectName}
                  </p>
                  <p className="text-gray-500 mt-0.5">
                    {item.date} at {item.checkInTime} • {item.timing}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {item.status}
                  </span>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-mono text-[10px]">
                    FACE AI
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
