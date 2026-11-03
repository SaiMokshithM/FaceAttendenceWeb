import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, UserCheck, Clock, ScanFace, Calendar, FileText, CheckCircle2, XCircle, ChevronRight, RefreshCw } from 'lucide-react'
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
    timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  // Aggregate today's stats
  const activePeriod = periods[0]
  const todayPresent = activePeriod?.presentCount || 0
  const todayAbsent = activePeriod?.absentCount || 0
  const todayPct = activePeriod?.attendancePercentage || 0

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Admin Master Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time biometric attendance oversight • CSM Section F (MR University, Tirupati)
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-800">{istTime}</p>
          <p className="text-[11px] text-gray-500">{istDate}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500">Enrolled Students</p>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-gray-900 mt-2">{totalStudents}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">✓ 100% SFace Embeddings Active</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white p-5 rounded-3xl border border-emerald-200 bg-emerald-50/40 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-800">Active Period Present</p>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-700 mt-2">{todayPresent}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">{todayPct}% Biometric Turnout</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white p-5 rounded-3xl border border-rose-200 bg-rose-50/40 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-rose-800">Active Period Absent</p>
            <XCircle className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-3xl font-black text-rose-700 mt-2">{todayAbsent}</p>
          <p className="text-[11px] text-rose-600 font-semibold mt-1">Pending Check-in</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500">Scheduled Periods</p>
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-indigo-700 mt-2">{periods.length || 6}</p>
          <p className="text-[11px] text-gray-500 font-semibold mt-1">09:20 AM - 03:40 PM</p>
        </motion.div>
      </div>

      {/* Today's Period-wise Attendance Report Snapshot */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" /> Today's Live Period Breakdown
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Individual Present vs Absent headcount for every period of the day
            </p>
          </div>
          <Link
            to="/admin/attendance"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
          >
            Detailed View <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400">
            <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading periods...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {periods.map(p => (
              <div
                key={p.periodNumber}
                className="p-4 rounded-2xl border border-gray-200 bg-gray-50/60 hover:bg-gray-50 transition space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-lg">
                    Period {p.periodNumber}
                  </span>
                  <span className="font-mono text-[10px] text-gray-500">{p.timing}</span>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900 truncate">{p.subjectName}</p>
                  <p className="text-[11px] text-gray-500">{p.faculty} ({p.subjectCode})</p>
                </div>
                <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs font-semibold">
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {p.presentCount} Present
                  </span>
                  <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> {p.absentCount} Absent
                  </span>
                  <span className="font-black text-gray-800">{p.attendancePercentage}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/attendance"
          className="p-5 rounded-3xl bg-white border border-gray-200 hover:border-blue-400 hover:shadow-lg transition space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-gray-900">Period-wise Report</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Expand any period to view individual present and absent student roll numbers and override statuses.
          </p>
        </Link>

        <Link
          to="/admin/timetable"
          className="p-5 rounded-3xl bg-white border border-gray-200 hover:border-indigo-400 hover:shadow-lg transition space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-gray-900">Configure Full Timetable</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Interactive 6-day × 6-period weekly grid. Click any slot to change subjects, faculty, and scan timing windows.
          </p>
        </Link>

        <Link
          to="/admin/reports"
          className="p-5 rounded-3xl bg-white border border-gray-200 hover:border-emerald-400 hover:shadow-lg transition space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-gray-900">Get All Records & Export</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Search, filter by subject/status/date, and download complete biometric face attendance logs in Excel (CSV).
          </p>
        </Link>
      </div>
    </div>
  )
}
