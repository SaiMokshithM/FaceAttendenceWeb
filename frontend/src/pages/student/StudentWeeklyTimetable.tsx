import { useState, useEffect, useMemo, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  Coffee,
  Utensils,
  ChevronRight,
  ScanFace,
  Terminal,
  BookOpen,
  Users,
  Code2,
  Binary,
  Layers,
  Printer,
  Info,
  X,
  MapPin,
  Flame,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'

export interface AttendanceHistoryItem {
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

export interface SubjectStat {
  code: string
  name: string
  faculty: string
  conducted: number
  attended: number
  percentage: number
}

interface StudentWeeklyTimetableProps {
  attendanceHistory?: AttendanceHistoryItem[]
  subjectStats?: SubjectStat[]
}

export interface SlotMeta {
  periodNumber: number
  periodName: string
  startTime: string
  endTime: string
  startMinutes: number
  endMinutes: number
  subjectCode: string
  subjectName: string
  abbr: string
  faculty: string
  room: string
  color: string
  accent: string
}

// ─── STATIC DATA DEFINITIONS ───
export const SUBJECT_METADATA: Record<
  string,
  {
    name: string
    abbr: string
    faculty: string
    room: string
    color: 'indigo' | 'blue' | 'emerald' | 'purple' | 'amber'
    accent: string
    gradient: string
    lightBg: string
    border: string
    badgeBg: string
    badgeText: string
    icon: typeof Code2
    description: string
    credits: number
    weeklyHours: number
  }
> = {
  TECH001: {
    name: 'Technical Training',
    abbr: 'TT',
    faculty: 'Technical Trainer / TBD',
    room: 'Lab 304 • AI Innovation Wing',
    color: 'indigo',
    accent: '#4f46e5',
    gradient: 'from-slate-800 via-indigo-900 to-slate-900',
    lightBg: 'bg-indigo-50/70',
    border: 'border-indigo-200/80',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
    icon: Terminal,
    description: 'Hands-on practical development, algorithms, system engineering, and competitive problem solving.',
    credits: 4,
    weeklyHours: 12,
  },
  '230BT02': {
    name: 'Mathematical Foundation for Computer Science',
    abbr: 'MFCS',
    faculty: 'Dr. K. Vijay Kumar',
    room: 'Lecture Hall 201 • Academic Block',
    color: 'blue',
    accent: '#0284c7',
    gradient: 'from-blue-700 via-sky-800 to-indigo-900',
    lightBg: 'bg-blue-50/70',
    border: 'border-blue-200/80',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    icon: Binary,
    description: 'Discrete mathematics, logic, combinatorics, graph theory, and mathematical formalisms for AI/ML.',
    credits: 4,
    weeklyHours: 6,
  },
  '2505T02': {
    name: 'Python for Scientific Computing',
    abbr: 'PSC',
    faculty: 'P. Liyaz',
    room: 'Lab 202 • Computing Centre',
    color: 'emerald',
    accent: '#059669',
    gradient: 'from-emerald-700 via-teal-800 to-cyan-900',
    lightBg: 'bg-emerald-50/70',
    border: 'border-emerald-200/80',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    icon: Code2,
    description: 'NumPy, Pandas, SciPy, scientific computing paradigms, vectorization, and data processing architectures.',
    credits: 3,
    weeklyHours: 6,
  },
  '250HT01': {
    name: 'Language and Professional Skills',
    abbr: 'LPS',
    faculty: 'Dr. Sk Iliyas Ali',
    room: 'Seminar Studio 105 • Humanities Wing',
    color: 'purple',
    accent: '#7c3aed',
    gradient: 'from-purple-700 via-fuchsia-800 to-indigo-900',
    lightBg: 'bg-purple-50/70',
    border: 'border-purple-200/80',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    icon: Users,
    description: 'Professional communication, technical documentation, interpersonal aptitude, and presentation skills.',
    credits: 2,
    weeklyHours: 6,
  },
  '2505T01': {
    name: 'Foundations of Web Development',
    abbr: 'FWD',
    faculty: 'Dr. R. Devendra Reddy',
    room: 'Lab 208 • Web Tech Centre',
    color: 'amber',
    accent: '#d97706',
    gradient: 'from-amber-600 via-orange-700 to-rose-800',
    lightBg: 'bg-amber-50/70',
    border: 'border-amber-200/80',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    icon: Layers,
    description: 'Modern frontend architectures, responsive DOM layouts, TypeScript, REST API integration, and web design.',
    credits: 3,
    weeklyHours: 6,
  },
}

export const DAYS = [
  { num: 1, name: 'Monday', short: 'Mon' },
  { num: 2, name: 'Tuesday', short: 'Tue' },
  { num: 3, name: 'Wednesday', short: 'Wed' },
  { num: 4, name: 'Thursday', short: 'Thu' },
  { num: 5, name: 'Friday', short: 'Fri' },
  { num: 6, name: 'Saturday', short: 'Sat' },
]

export const PERIOD_SLOTS = [
  { num: 1, name: 'Period 1', start: '09:20', end: '10:10', startMins: 9 * 60 + 20, endMins: 10 * 60 + 10 },
  { num: 2, name: 'Period 2', start: '10:10', end: '11:00', startMins: 10 * 60 + 10, endMins: 11 * 60 },
  { num: 3, name: 'Period 3', start: '11:30', end: '12:20', startMins: 11 * 60 + 30, endMins: 12 * 60 + 20 },
  { num: 4, name: 'Period 4', start: '12:20', end: '13:10', startMins: 12 * 60 + 20, endMins: 13 * 60 + 10 },
  { num: 5, name: 'Period 5', start: '14:00', end: '14:50', startMins: 14 * 60, endMins: 14 * 60 + 50 },
  { num: 6, name: 'Period 6', start: '14:50', end: '15:40', startMins: 14 * 60 + 50, endMins: 15 * 60 + 40 },
]

// Official CSM-F Master Timetable Mapping (Day 1..6 -> Period 1..6 -> Subject Code)
export const MASTER_TIMETABLE: Record<number, Record<number, string>> = {
  1: { 1: 'TECH001', 2: 'TECH001', 3: '250HT01', 4: '2505T02', 5: '230BT02', 6: '2505T01' }, // Mon
  2: { 1: 'TECH001', 2: 'TECH001', 3: '250HT01', 4: '2505T01', 5: '2505T02', 6: '230BT02' }, // Tue
  3: { 1: 'TECH001', 2: 'TECH001', 3: '230BT02', 4: '2505T01', 5: '250HT01', 6: '2505T02' }, // Wed
  4: { 1: 'TECH001', 2: 'TECH001', 3: '250HT01', 4: '230BT02', 5: '2505T01', 6: '2505T02' }, // Thu
  5: { 1: 'TECH001', 2: 'TECH001', 3: '2505T01', 4: '2505T02', 5: '230BT02', 6: '250HT01' }, // Fri
  6: { 1: 'TECH001', 2: 'TECH001', 3: '2505T02', 4: '2505T01', 5: '250HT01', 6: '230BT02' }, // Sat
}

// ─── TIME HELPER: Convert current moment to IST ───
function getIstTime() {
  const now = new Date()
  const istOffset = 5 * 60 + 30
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes()
  const istMinutes = (utcMinutes + istOffset) % (24 * 60)

  const istMs = now.getTime() + istOffset * 60 * 1000
  const istDate = new Date(istMs)
  const dow = istDate.getUTCDay() // 0=Sun, 1=Mon... 6=Sat
  const dayOfWeek = dow === 0 ? 7 : dow

  return { dayOfWeek, minutes: istMinutes, dateStr: istDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' }) }
}

function formatMinsToAmPm(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hh = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hh.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`
}

export default function StudentWeeklyTimetable({
  attendanceHistory = [],
  subjectStats = [],
}: StudentWeeklyTimetableProps) {
  // Live IST Clock
  const [ist, setIst] = useState(getIstTime)
  const [viewMode, setViewMode] = useState<'flow' | 'matrix'>('flow')
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const current = getIstTime().dayOfWeek
    return current >= 1 && current <= 6 ? current : 1
  })
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string | null>(null)
  const [selectedSlotForModal, setSelectedSlotForModal] = useState<SlotMeta | null>(null)

  // Keep IST clock live every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIst(getIstTime())
    }, 10_000)
    return () => clearInterval(timer)
  }, [])

  const isTodayActiveDay = ist.dayOfWeek === selectedDay

  // Current Live Period determination
  const livePeriodInfo = useMemo(() => {
    if (ist.dayOfWeek === 7) {
      return { type: 'holiday', label: 'Sunday • Campus Closed', desc: 'No classes scheduled today. Have a restful weekend!' }
    }

    const { minutes } = ist
    const COLLEGE_START = 9 * 60 + 20
    const COLLEGE_END = 15 * 60 + 40

    if (minutes < COLLEGE_START) {
      const diff = COLLEGE_START - minutes
      return {
        type: 'upcoming_day',
        label: `College Starts at 09:20 AM IST`,
        desc: `First class starts in ${diff} minutes (Period 1 • Technical Training)`,
      }
    }

    if (minutes >= COLLEGE_END) {
      return {
        type: 'over',
        label: `College Day Concluded`,
        desc: `All 6 periods completed for today. See you tomorrow at 09:20 AM!`,
      }
    }

    // Check Morning Break
    if (minutes >= 11 * 60 && minutes < 11 * 60 + 30) {
      const left = 11 * 60 + 30 - minutes
      return {
        type: 'break',
        name: 'Morning Refreshment Break',
        timing: '11:00 AM – 11:30 AM',
        remainingMins: left,
        icon: Coffee,
        color: 'amber',
        desc: '30-minute campus interval before Period 3',
      }
    }

    // Check Lunch Break
    if (minutes >= 13 * 60 + 10 && minutes < 14 * 60) {
      const left = 14 * 60 - minutes
      return {
        type: 'break',
        name: 'Lunch & Rest Break',
        timing: '01:10 PM – 02:00 PM',
        remainingMins: left,
        icon: Utensils,
        color: 'emerald',
        desc: '50-minute dining interval before Period 5',
      }
    }

    // Find current period
    const activeSlot = PERIOD_SLOTS.find(p => minutes >= p.startMins && minutes < p.endMins)
    if (activeSlot) {
      const code = MASTER_TIMETABLE[ist.dayOfWeek]?.[activeSlot.num]
      const meta = code ? SUBJECT_METADATA[code] : null
      const remainingMins = activeSlot.endMins - minutes
      const elapsedMins = minutes - activeSlot.startMins
      const totalPeriodMins = activeSlot.endMins - activeSlot.startMins
      const progress = Math.min(100, Math.round((elapsedMins / totalPeriodMins) * 100))

      // Check scan window: first 10 minutes (start to start+10)
      const scanWindowOpen = elapsedMins <= 10

      // Check if student is already marked present today for this period
      const attendanceItem = attendanceHistory.find(h => h.periodNumber === activeSlot.num)
      const isMarked = !!attendanceItem

      return {
        type: 'period',
        periodNumber: activeSlot.num,
        periodName: activeSlot.name,
        time: `${formatMinsToAmPm(activeSlot.startMins)} – ${formatMinsToAmPm(activeSlot.endMins)}`,
        subjectCode: code,
        meta,
        remainingMins,
        progress,
        scanWindowOpen,
        isMarked,
        attendanceItem,
      }
    }

    return { type: 'between', label: 'Passing Period', desc: '5-minute transition between periods' }
  }, [ist, attendanceHistory])

  // Get full schedule for the currently selected day
  const selectedDaySlots: SlotMeta[] = useMemo(() => {
    return PERIOD_SLOTS.map(slot => {
      const code = MASTER_TIMETABLE[selectedDay]?.[slot.num] || 'TECH001'
      const meta = SUBJECT_METADATA[code]
      return {
        periodNumber: slot.num,
        periodName: slot.name,
        startTime: formatMinsToAmPm(slot.startMins),
        endTime: formatMinsToAmPm(slot.endMins),
        startMinutes: slot.startMins,
        endMinutes: slot.endMins,
        subjectCode: code,
        subjectName: meta?.name || 'Class Period',
        abbr: meta?.abbr || code,
        faculty: meta?.faculty || 'Faculty Member',
        room: meta?.room || 'CSM-F Room',
        color: meta?.color || 'blue',
        accent: meta?.accent || '#0090e7',
      }
    })
  }, [selectedDay])

  // Print schedule helper
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-4 font-sans select-none print:p-0">
      {/* ─── CARD CONTAINER ─── */}
      <div className="bg-white rounded-[28px] border border-slate-200/90 shadow-[0_8px_32px_rgba(0,144,231,0.06)] p-5 sm:p-7 space-y-6">
        
        {/* ── 1. HEADER & CONTROLS ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0070ba] to-[#0090e7] text-white flex items-center justify-center shadow-md shadow-sky-500/25">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    Academic Weekly Timetable
                  </h2>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0090e7]/10 text-[#0090e7] border border-[#0090e7]/20 font-mono">
                    CSM Section F • Sem I
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Official 6-Day Schedule • SFace Zero-Knowledge Biometric Attendance Windows
                </p>
              </div>
            </div>
          </div>

          {/* Right Toolbar: View Mode Switcher & Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {/* View Mode Toggle: Day Flow vs Full Matrix */}
            <div className="bg-slate-100/90 p-1 rounded-xl flex items-center border border-slate-200/80 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('flow')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'flow'
                    ? 'bg-white text-[#0090e7] shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Day Flow</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'matrix'
                    ? 'bg-white text-[#0090e7] shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Full Week Grid</span>
              </button>
            </div>

            {/* Jump to Today Button */}
            {ist.dayOfWeek >= 1 && ist.dayOfWeek <= 6 && (
              <button
                type="button"
                onClick={() => setSelectedDay(ist.dayOfWeek)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  selectedDay === ist.dayOfWeek
                    ? 'bg-sky-50 border-sky-300 text-[#0090e7]'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title="Jump to Today's Schedule"
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Today</span>
              </button>
            )}

            {/* Print Timetable */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition border border-transparent hover:border-slate-200"
              title="Print Schedule"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── 2. REAL-TIME CLASS RADAR STRIP (Current Happening / Up Next) ── */}
        {livePeriodInfo.type === 'period' && livePeriodInfo.meta && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg shadow-indigo-950/20 relative overflow-hidden"
          >
            {/* Background geometric flare */}
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-[#0090e7]/20 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                {/* Live Animated Beacon */}
                <div className="relative mt-0.5 sm:mt-0 flex-shrink-0">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping absolute" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-emerald-400/30">
                      Live In Session • Period {livePeriodInfo.periodNumber}
                    </span>
                    <span className="text-white/60 text-xs font-mono">
                      {livePeriodInfo.time}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-white mt-0.5 flex items-center gap-2">
                    <span>{livePeriodInfo.meta.name}</span>
                    <span className="text-xs font-bold text-sky-400 font-mono">
                      ({livePeriodInfo.subjectCode})
                    </span>
                  </h3>

                  <p className="text-xs text-white/70 flex items-center gap-2 mt-0.5">
                    <span>Faculty: <strong className="text-white font-semibold">{livePeriodInfo.meta.faculty}</strong></span>
                    <span>•</span>
                    <span>{livePeriodInfo.meta.room}</span>
                  </p>
                </div>
              </div>

              {/* Status Action / Biometric Scan Button */}
              <div className="flex items-center gap-3 self-start md:self-auto pt-2 md:pt-0">
                {livePeriodInfo.isMarked ? (
                  <div className="px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="leading-none">Attendance Verified</p>
                      <p className="text-[10px] text-emerald-300/80 font-mono mt-0.5">
                        Logged at {livePeriodInfo.attendanceItem?.checkInTime || 'IST'}
                      </p>
                    </div>
                  </div>
                ) : livePeriodInfo.scanWindowOpen ? (
                  <Link
                    to="/student/verify"
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 active:scale-95 transition"
                  >
                    <ScanFace className="w-4 h-4" />
                    <span>Scan Face Attendance</span>
                  </Link>
                ) : (
                  <div className="px-3.5 py-2 rounded-xl bg-white/10 text-white/80 text-xs font-medium border border-white/15">
                    <span>Window Closed (+10m passed)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Time progress bar */}
            <div className="relative z-10 mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
              <span>{livePeriodInfo.progress}% elapsed</span>
              <span className="font-semibold text-white/90">
                {livePeriodInfo.remainingMins} mins remaining
              </span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full transition-all duration-1000"
                style={{ width: `${livePeriodInfo.progress}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* Break Alert Bar */}
        {livePeriodInfo.type === 'break' && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300/40 text-amber-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                {livePeriodInfo.icon && <livePeriodInfo.icon className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-amber-800">
                  {livePeriodInfo.name} ({livePeriodInfo.timing})
                </p>
                <p className="text-xs text-amber-700 mt-0.5">{livePeriodInfo.desc}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg text-xs">
                {livePeriodInfo.remainingMins} mins left
              </span>
            </div>
          </div>
        )}

        {/* Off-Hours / Next Day Radar Banner */}
        {(livePeriodInfo.type === 'upcoming_day' || livePeriodInfo.type === 'over' || livePeriodInfo.type === 'holiday') && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-sky-400 flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs sm:text-sm font-black text-white">
                    {livePeriodInfo.label}
                  </p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-300 font-mono">
                    IST Clock Active
                  </span>
                </div>
                <p className="text-xs text-white/70 mt-0.5">
                  {livePeriodInfo.desc}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[11px] text-white/80 font-mono bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                Period 1: Technical Training • 09:20 AM
              </span>
            </div>
          </div>
        )}

        {/* ── 3. DAY SELECTOR RIBBON (MON - SAT) ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Select Day of Week
            </span>
            <span className="text-xs font-medium text-slate-500">
              Viewing: <strong className="text-slate-800 font-bold">{DAYS.find(d => d.num === selectedDay)?.name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {DAYS.map(day => {
              const isToday = ist.dayOfWeek === day.num
              const isSelected = selectedDay === day.num

              return (
                <button
                  key={day.num}
                  type="button"
                  onClick={() => setSelectedDay(day.num)}
                  className={`relative p-3 rounded-2xl border text-center transition-all duration-200 active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#0090e7] to-[#0070ba] text-white border-[#0090e7] shadow-md shadow-sky-500/25 ring-2 ring-sky-300/50'
                      : 'bg-slate-50/80 hover:bg-slate-100/80 text-slate-700 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  {isToday && (
                    <span
                      className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                        isSelected ? 'bg-amber-300' : 'bg-[#0090e7]'
                      } animate-pulse`}
                      title="Today"
                    />
                  )}

                  <p className={`text-[11px] font-black uppercase tracking-wider ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                    {day.short}
                  </p>
                  <p className="text-sm font-extrabold mt-0.5 leading-none">
                    {day.name}
                  </p>
                  <p className={`text-[10px] mt-1 font-semibold ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                    6 Periods
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── 4. VIEW 1: DAY TIMELINE FLOW (CAROUSEL / SEQUENTIAL VIEW) ── */}
        {viewMode === 'flow' && (
          <div className="space-y-3.5 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Schedule Breakdown for <strong>{DAYS.find(d => d.num === selectedDay)?.name}</strong></span>
              <span className="text-[11px] text-[#0090e7] font-semibold">Tap any period card for syllabus & room details</span>
            </div>

            <div className="space-y-3">
              {selectedDaySlots.map(slot => {
                const meta = SUBJECT_METADATA[slot.subjectCode]
                const IconComponent = meta?.icon || BookOpen
                
                // Attendance cross-check if this day is today
                const attendanceRecord = isTodayActiveDay
                  ? attendanceHistory.find(h => h.periodNumber === slot.periodNumber)
                  : null
                const isAttended = !!attendanceRecord

                // Period status in IST if viewing today
                const isPast = isTodayActiveDay && ist.minutes >= slot.endMinutes
                const isCurrent = isTodayActiveDay && ist.minutes >= slot.startMinutes && ist.minutes < slot.endMinutes
                const isUpcoming = isTodayActiveDay && ist.minutes < slot.startMinutes

                const isFilteredOut = activeSubjectFilter && activeSubjectFilter !== slot.subjectCode

                return (
                  <div key={slot.periodNumber} className="space-y-3">
                    {/* Period Card */}
                    <motion.div
                      layout
                      onClick={() => setSelectedSlotForModal(slot)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                        isFilteredOut ? 'opacity-40 grayscale' : 'opacity-100'
                      } ${
                        isCurrent
                          ? 'bg-sky-50/50 border-[#0090e7] shadow-lg shadow-sky-500/10 ring-2 ring-[#0090e7]/30'
                          : 'bg-white hover:bg-slate-50/70 border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md'
                      }`}
                    >
                      {/* Left vertical color pill accent */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2"
                        style={{ backgroundColor: meta?.accent || '#0090e7' }}
                      />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 ml-2">
                        {/* Period & Subject Info */}
                        <div className="flex items-start sm:items-center gap-3.5">
                          {/* Period Badge */}
                          <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-slate-200/80 flex flex-col items-center justify-center flex-shrink-0 transition">
                            <span className="text-[10px] font-black text-slate-400 uppercase leading-none">
                              P{slot.periodNumber}
                            </span>
                            <IconComponent className="w-4 h-4 text-slate-700 mt-1" />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Subject Code Badge */}
                              <span
                                className={`px-2 py-0.5 rounded-md font-mono font-black text-[11px] ${
                                  meta?.badgeBg || 'bg-blue-100'
                                } ${meta?.badgeText || 'text-blue-800'}`}
                              >
                                {slot.subjectCode}
                              </span>

                              {/* Subject Abbr */}
                              <span className="text-xs font-bold text-slate-400">
                                • {meta?.abbr}
                              </span>

                              {/* Timing */}
                              <span className="text-xs text-slate-500 font-mono font-semibold flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {slot.startTime} – {slot.endTime}
                              </span>
                            </div>

                            {/* Full Subject Name */}
                            <h4 className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5 group-hover:text-[#0090e7] transition">
                              {slot.subjectName}
                            </h4>

                            {/* Faculty & Venue */}
                            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                              <span>Instructor: <strong className="text-slate-700 font-semibold">{slot.faculty}</strong></span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {slot.room}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Right: Attendance Verification Badge & Scan Window */}
                        <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          {isTodayActiveDay ? (
                            isAttended ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Attended</span>
                              </span>
                            ) : isCurrent ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-sky-100 text-sky-800 border border-sky-300 animate-pulse">
                                <Sparkles className="w-3.5 h-3.5 text-[#0090e7]" />
                                <span>Scanning Now</span>
                              </span>
                            ) : isPast ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                <span>Unverified</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200">
                                <span>Upcoming</span>
                              </span>
                            )
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-400">
                              Window: {slot.startTime} (+10m)
                            </span>
                          )}

                          <span className="text-[10px] text-slate-400 font-mono hidden sm:block">
                            Face Scan: 10m window
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Morning Break insertion between P2 and P3 */}
                    {slot.periodNumber === 2 && (
                      <div className="my-2 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-center justify-between text-amber-900 shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-200/70 text-amber-800 flex items-center justify-center">
                            <Coffee className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-amber-900">
                              ☕ Morning Refreshment Break (11:00 AM – 11:30 AM)
                            </p>
                            <p className="text-[11px] text-amber-700/90 font-medium">
                              30 Minutes • Campus Cafeteria, Courtyard & Reading Lawn
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-200/60 px-2.5 py-1 rounded-lg">
                          Interval
                        </span>
                      </div>
                    )}

                    {/* Lunch Break insertion between P4 and P5 */}
                    {slot.periodNumber === 4 && (
                      <div className="my-2 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex items-center justify-between text-emerald-900 shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-200/70 text-emerald-800 flex items-center justify-center">
                            <Utensils className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-emerald-900">
                              🍱 Lunch & Recreation Break (01:10 PM – 02:00 PM)
                            </p>
                            <p className="text-[11px] text-emerald-700/90 font-medium">
                              50 Minutes • University Dining Hall & Student Lounge
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-200/60 px-2.5 py-1 rounded-lg">
                          Lunch Hour
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── 5. VIEW 2: FULL 6-DAY MATRIX GRID TABLE (DESKTOP POWER VIEW) ── */}
        {viewMode === 'matrix' && (
          <div className="space-y-3 pt-1 overflow-x-auto">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Complete Master Timetable: <strong>Monday through Saturday</strong></span>
              <span className="text-sky-600 font-semibold">Click any slot to inspect subject data</span>
            </div>

            <div className="rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
                    <th className="p-3 font-bold uppercase tracking-wider text-[11px] w-28 text-center border-r border-white/10">
                      Period & Time
                    </th>
                    {DAYS.map(d => {
                      const isToday = ist.dayOfWeek === d.num
                      return (
                        <th
                          key={d.num}
                          className={`p-3 font-bold uppercase tracking-wider text-[11px] text-center border-r border-white/10 min-w-[150px] ${
                            isToday ? 'bg-[#0090e7] text-white shadow-inner font-black' : ''
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <span>{d.name}</span>
                            {isToday && (
                              <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" title="Today" />
                            )}
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {PERIOD_SLOTS.map(p => {
                    const isMorningBreakAfter = p.num === 2
                    const isLunchBreakAfter = p.num === 4

                    return (
                      <Fragment key={p.num}>
                        <tr className="hover:bg-slate-50/70 transition">
                          {/* Left Column: Period info */}
                          <td className="p-3 bg-slate-50 text-center border-r border-slate-200 font-bold">
                            <p className="text-slate-900 font-black">{p.name}</p>
                            <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                              {p.start} - {p.end}
                            </p>
                          </td>

                          {/* 6 Day Columns */}
                          {DAYS.map(d => {
                            const code = MASTER_TIMETABLE[d.num]?.[p.num] || 'TECH001'
                            const meta = SUBJECT_METADATA[code]
                            const isTodayCol = ist.dayOfWeek === d.num
                            const isSelected = activeSubjectFilter ? activeSubjectFilter === code : true

                            const slotMetaObj: SlotMeta = {
                              periodNumber: p.num,
                              periodName: p.name,
                              startTime: p.start,
                              endTime: p.end,
                              startMinutes: p.startMins,
                              endMinutes: p.endMins,
                              subjectCode: code,
                              subjectName: meta?.name || code,
                              abbr: meta?.abbr || code,
                              faculty: meta?.faculty || 'Faculty',
                              room: meta?.room || 'CSM-F',
                              color: meta?.color || 'blue',
                              accent: meta?.accent || '#0090e7',
                            }

                            return (
                              <td
                                key={d.num}
                                onClick={() => setSelectedSlotForModal(slotMetaObj)}
                                className={`p-2 border-r border-slate-100 align-top cursor-pointer group ${
                                  isTodayCol ? 'bg-sky-50/20' : ''
                                }`}
                              >
                                <div
                                  className={`p-2.5 rounded-xl border transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-md ${
                                    meta?.lightBg || 'bg-slate-50'
                                  } ${meta?.border || 'border-slate-200'} ${
                                    !isSelected ? 'opacity-30' : 'opacity-100'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span
                                      className={`font-mono font-bold text-[10px] px-1.5 py-0.5 rounded shadow-2xs ${
                                        meta?.badgeBg || 'bg-white'
                                      } ${meta?.badgeText || 'text-slate-800'}`}
                                    >
                                      {code}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400">
                                      {meta?.abbr}
                                    </span>
                                  </div>

                                  <p className="font-bold text-xs mt-1.5 text-slate-800 line-clamp-1 group-hover:text-[#0090e7] transition">
                                    {meta?.name}
                                  </p>

                                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                                    {meta?.faculty}
                                  </p>

                                  <div className="mt-2 pt-1 border-t border-black/5 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                                    <span>P{p.num}</span>
                                    <span>{p.start}</span>
                                  </div>
                                </div>
                              </td>
                            )
                          })}
                        </tr>

                        {/* Morning Break Row */}
                        {isMorningBreakAfter && (
                          <tr className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-y border-amber-200 text-amber-900 text-center font-bold text-xs">
                            <td colSpan={7} className="py-2 tracking-wider font-extrabold flex-row items-center justify-center gap-2">
                              ☕ Morning Refreshment Break • 11:00 AM – 11:30 AM (30 Minutes)
                            </td>
                          </tr>
                        )}

                        {/* Lunch Break Row */}
                        {isLunchBreakAfter && (
                          <tr className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-y border-emerald-200 text-emerald-900 text-center font-bold text-xs">
                            <td colSpan={7} className="py-2 tracking-wider font-extrabold flex-row items-center justify-center gap-2">
                              🍱 Lunch & Recreation Interval • 01:10 PM – 02:00 PM (50 Minutes)
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── 6. INTERACTIVE SUBJECT FILTER / DIRECTORY STRIP ── */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#0090e7]" />
              Course Directory & Quick Subject Filter:
            </span>
            {activeSubjectFilter && (
              <button
                type="button"
                onClick={() => setActiveSubjectFilter(null)}
                className="text-[11px] font-bold text-sky-600 hover:text-sky-800"
              >
                Clear Filter (Show All)
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveSubjectFilter(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeSubjectFilter === null
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              All (5 Subjects)
            </button>

            {Object.entries(SUBJECT_METADATA).map(([code, meta]) => {
              const isSelected = activeSubjectFilter === code
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setActiveSubjectFilter(isSelected ? null : code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#0090e7] text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: meta.accent }}
                  />
                  <span>{meta.abbr}</span>
                  <span className="text-[10px] opacity-75 font-mono">({code})</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── 7. DETAILED SUBJECT INSPECTOR MODAL ── */}
      <AnimatePresence>
        {selectedSlotForModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-[28px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: selectedSlotForModal.accent }}
                  >
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-[#0090e7] bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                        {selectedSlotForModal.subjectCode}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {selectedSlotForModal.abbr}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mt-1 leading-tight">
                      {selectedSlotForModal.subjectName}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSlotForModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Slot Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Faculty In-Charge
                  </span>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">
                    {selectedSlotForModal.faculty}
                  </p>
                  <span className="text-[10px] text-slate-500">Department of CSE (AI & ML)</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Lecture Hall / Lab
                  </span>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">
                    {selectedSlotForModal.room}
                  </p>
                  <span className="text-[10px] text-slate-500">Malla Reddy University</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Class Timing
                  </span>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5 font-mono">
                    {selectedSlotForModal.startTime} – {selectedSlotForModal.endTime}
                  </p>
                  <span className="text-[10px] text-slate-500">Duration: 50 Minutes</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Biometric Check-in Window
                  </span>
                  <p className="font-extrabold text-[#0090e7] text-sm mt-0.5 font-mono">
                    {selectedSlotForModal.startTime} – {selectedSlotForModal.startTime.replace(/(\d+):(\d+)/, (_, h, m) => {
                      const endM = parseInt(m, 10) + 10
                      return `${h}:${endM.toString().padStart(2, '0')}`
                    })}
                  </p>
                  <span className="text-[10px] text-slate-500">First 10 minutes strictly</span>
                </div>
              </div>

              {/* Description & Syllabus note */}
              {SUBJECT_METADATA[selectedSlotForModal.subjectCode]?.description && (
                <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-2xl text-xs text-blue-900 leading-relaxed">
                  <p className="font-bold text-[11px] text-blue-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-[#0090e7]" /> Course Objectives:
                  </p>
                  {SUBJECT_METADATA[selectedSlotForModal.subjectCode].description}
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSlotForModal(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Close
                </button>
                <Link
                  to="/student/verify"
                  className="flex-1 py-2.5 bg-[#0090e7] hover:bg-[#007ec9] text-white font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/25"
                >
                  <ScanFace className="w-4 h-4" />
                  <span>Mark Attendance</span>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
