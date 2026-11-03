import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CalendarDays, Clock, MapPin, Sparkles, BookOpen, ShieldCheck } from 'lucide-react'
import StudentWeeklyTimetable from './StudentWeeklyTimetable'
import api from '../../services/api'
import { studentService } from '../../services/endpoints'

export default function StudentTimetablePage() {
  const { data: student } = useQuery({
    queryKey: ['my-profile'],
    queryFn: studentService.getMe,
  })

  const { data: attendanceHistory } = useQuery({
    queryKey: ['my-attendance-history'],
    queryFn: async () => {
      const res = await api.get('/attendance/my-history')
      return res.data?.data || []
    },
    refetchInterval: 3000,
  })

  const { data: summaryData } = useQuery({
    queryKey: ['my-attendance-summary'],
    queryFn: async () => {
      const res = await api.get('/attendance/my-summary')
      return res.data?.data
    },
    refetchInterval: 3000,
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-2 sm:p-4 font-sans">
      {/* ── Page Header Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[28px] bg-gradient-to-r from-[#0070ba] via-[#0090e7] to-[#0284c7] text-white p-6 sm:p-7 shadow-[0_16px_48px_rgba(0,144,231,0.22)] relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg">
              <CalendarDays className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Class Timetable & Schedule
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
                  Sem I
                </span>
              </div>
              <p className="text-xs text-white/90 mt-0.5">
                Department of Computer Science & Engineering • CSM Section F
              </p>
              <p className="text-[11px] text-white/75 mt-0.5 flex items-center gap-2">
                <span>Roll: <strong className="text-white">{student?.rollNumber || 'CSM-F'}</strong></span>
                <span>•</span>
                <span>Malla Reddy University</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Biometric Sync Active</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── The Full Premium Timetable Component ── */}
      <StudentWeeklyTimetable
        attendanceHistory={attendanceHistory || []}
        subjectStats={summaryData?.subjects || []}
      />
    </div>
  )
}
