import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, CheckCircle2, XCircle, Users, ChevronDown, ChevronUp, ScanFace, ShieldCheck, RefreshCw, Sparkles } from 'lucide-react'
import api from '../../services/api'

interface StudentStatus {
  id: string
  rollNumber: string
  fullName: string
  status: 'PRESENT' | 'ABSENT' | 'LATE'
  checkInTime: string | null
  verificationMethod: string | null
  remarks: string | null
}

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
  presentStudents: StudentStatus[]
  absentStudents: StudentStatus[]
}

interface AttendanceResponse {
  date: string
  dayOfWeek: number
  totalStudents: number
  periods: PeriodSummary[]
}

const SUBJECT_BADGES: Record<string, string> = {
  TECH001: 'bg-gray-100 text-gray-800 border-gray-300',
  '230BT02': 'bg-blue-100 text-blue-800 border-blue-300',
  '2505T02': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  '250HT01': 'bg-purple-100 text-purple-800 border-purple-300',
  '2505T01': 'bg-amber-100 text-amber-800 border-amber-300',
}

export default function AttendancePage() {
  const [data, setData] = useState<AttendanceResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [expandedPeriod, setExpandedPeriod] = useState<number | null>(1)
  const [activeTab, setActiveTab] = useState<'SCANNED' | 'NOT_SCANNED'>('SCANNED')
  const [searchQuery, setSearchQuery] = useState('')
  const [clock, setClock] = useState(new Date())

  const fetchAttendance = async (dateStr: string) => {
    try {
      setLoading(true)
      const res = await api.get(`/admin/period-attendance?date=${dateStr}`)
      setData(res.data)
    } catch (err) {
      console.error('Error fetching period attendance:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance(selectedDate)
    const timer = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(timer)
  }, [selectedDate])

  const istTime = clock.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })
  const istDate = clock.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata', weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  })

  return (
    <div className="space-y-4 max-w-5xl mx-auto px-1 sm:px-4 py-2">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-5 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-semibold text-cyan-300 border border-white/15 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Biometric AI Verified Attendance
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <ScanFace className="w-6 h-6 text-cyan-400" /> Period Face Scan Reports
          </h1>
          <p className="text-xs text-blue-200 mt-1">
            Section F (32 Registered Students) • Tap any period to inspect who scanned face
          </p>
        </div>

        <div className="flex items-center gap-2 bg-black/25 p-2 rounded-2xl border border-white/10 self-start sm:self-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2.5 py-1.5 bg-white/10 border border-white/20 rounded-xl text-xs font-semibold text-white outline-none cursor-pointer"
          />
          <button
            onClick={() => fetchAttendance(selectedDate)}
            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition active:scale-95"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Overview Stat Badges */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-xs">
            <p className="text-[11px] text-gray-500 font-medium">Total Registered</p>
            <p className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">{data.totalStudents}</p>
            <p className="text-[10px] text-gray-400">CSM Section F</p>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-xs">
            <p className="text-[11px] text-gray-500 font-medium">College Periods</p>
            <p className="text-xl sm:text-2xl font-black text-blue-600 mt-0.5">{data.periods.length}</p>
            <p className="text-[10px] text-gray-400">Mon - Sat Schedule</p>
          </div>
          <div className="bg-emerald-50 p-3.5 sm:p-4 rounded-2xl border border-emerald-200 shadow-xs">
            <p className="text-[11px] text-emerald-800 font-semibold">Active Period Scanned</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5">
              {data.periods[0]?.presentCount ?? 0}
            </p>
            <p className="text-[10px] text-emerald-600 font-medium">Present via Face AI</p>
          </div>
          <div className="bg-rose-50 p-3.5 sm:p-4 rounded-2xl border border-rose-200 shadow-xs">
            <p className="text-[11px] text-rose-800 font-semibold">Active Period Not Scanned</p>
            <p className="text-xl sm:text-2xl font-black text-rose-700 mt-0.5">
              {data.periods[0]?.absentCount ?? 0}
            </p>
            <p className="text-[10px] text-rose-600 font-medium">Absent (No Scan)</p>
          </div>
        </div>
      )}

      {/* Period Accordions List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-gray-400 space-y-2">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading period attendance records...</p>
          </div>
        ) : !data || data.periods.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-gray-500 border border-gray-200">
            <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-semibold">No timetable periods scheduled for this day.</p>
          </div>
        ) : (
          data.periods.map((p) => {
            const isExpanded = expandedPeriod === p.periodNumber
            const scannedList = p.presentStudents.filter(s =>
              s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
            )
            const notScannedList = p.absentStudents.filter(s =>
              s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
            )

            return (
              <div
                key={p.periodNumber}
                className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs transition hover:shadow-md"
              >
                {/* Period Header Click Target */}
                <div
                  onClick={() => setExpandedPeriod(isExpanded ? null : p.periodNumber)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-gray-50/80 transition select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white font-black text-base sm:text-lg flex items-center justify-center shadow-md flex-shrink-0">
                      P{p.periodNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900">{p.subjectName}</h3>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${SUBJECT_BADGES[p.subjectCode] || 'bg-gray-100'}`}>
                          {p.subjectCode}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                        {p.timing} • <span className="text-gray-700 font-medium">{p.faculty}</span>
                      </p>
                    </div>
                  </div>

                  {/* Scanned Counts & Percentage */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {p.presentCount} Scanned Face
                      </span>
                      <span className="px-2.5 py-1 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        {p.absentCount} Absent
                      </span>
                    </div>

                    <div className="text-right pl-1">
                      <span className="text-sm sm:text-base font-black text-gray-900">{p.attendancePercentage}%</span>
                    </div>

                    <div className="p-1 text-gray-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Section: Scanned Face vs Not Scanned Face */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100 bg-gray-50/60 p-4 sm:p-5 space-y-4"
                    >
                      {/* Sub-Tabs: Scanned vs Not Scanned */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-gray-200 shadow-xs">
                          <button
                            onClick={() => setActiveTab('SCANNED')}
                            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                              activeTab === 'SCANNED'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Scanned Face & Present ({p.presentCount})
                          </button>
                          <button
                            onClick={() => setActiveTab('NOT_SCANNED')}
                            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                              activeTab === 'NOT_SCANNED'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Not Scanned & Absent ({p.absentCount})
                          </button>
                        </div>

                        <input
                          type="text"
                          placeholder="Search roll number or name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64"
                        />
                      </div>

                      {/* Student Cards (Fully Responsive for Mobile) */}
                      {activeTab === 'SCANNED' ? (
                        scannedList.length === 0 ? (
                          <div className="py-8 text-center text-gray-400 bg-white rounded-2xl border border-gray-200">
                            <ScanFace className="w-8 h-8 mx-auto text-gray-300 mb-1" />
                            <p className="text-xs font-semibold">No students have scanned their face for Period {p.periodNumber} yet.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {scannedList.map((st) => (
                              <div
                                key={st.id}
                                className="p-3.5 bg-white rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between gap-2"
                              >
                                <div className="space-y-0.5 min-w-0">
                                  <p className="font-bold text-xs text-gray-900 truncate">{st.fullName}</p>
                                  <p className="font-mono text-[11px] font-bold text-blue-700">{st.rollNumber}</p>
                                  <div className="flex items-center gap-1 text-[10px] text-gray-500 pt-1">
                                    <Clock className="w-3 h-3 text-emerald-600" />
                                    <span>{st.checkInTime || 'Checked in'}</span>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PRESENT
                                  </span>
                                  <p className="text-[9px] text-cyan-700 font-mono font-semibold mt-1">FACE AI ✓</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      ) : (
                        notScannedList.length === 0 ? (
                          <div className="py-8 text-center text-emerald-700 bg-emerald-50 rounded-2xl border border-emerald-200">
                            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-1" />
                            <p className="text-xs font-bold">Awesome! All 32 students have verified their face for this period!</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {notScannedList.map((st) => (
                              <div
                                key={st.id}
                                className="p-3.5 bg-white rounded-2xl border border-rose-200 shadow-xs flex items-center justify-between gap-2"
                              >
                                <div className="space-y-0.5 min-w-0">
                                  <p className="font-bold text-xs text-gray-900 truncate">{st.fullName}</p>
                                  <p className="font-mono text-[11px] font-bold text-gray-500">{st.rollNumber}</p>
                                  <p className="text-[10px] text-rose-500 italic pt-1">Face not scanned</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                    <XCircle className="w-3 h-3 text-rose-600" /> ABSENT
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
