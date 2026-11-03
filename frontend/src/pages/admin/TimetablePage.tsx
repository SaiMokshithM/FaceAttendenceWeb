import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Edit2, Save, X, BookOpen, Check, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react'
import api from '../../services/api'

interface TimetableSlot {
  id: string
  dayOfWeek: number
  periodNumber: number
  periodName: string
  startTime: string
  endTime: string
  subjectId: string
  subjectCode: string
  subjectName: string
  faculty: string
  attendanceOpen: string
  attendanceClose: string
  lateThreshold: number
}

interface Subject {
  id: string
  subjectCode: string
  subjectName: string
  faculty: string
}

const DAYS = [
  { num: 1, name: 'Monday', short: 'Mon' },
  { num: 2, name: 'Tuesday', short: 'Tue' },
  { num: 3, name: 'Wednesday', short: 'Wed' },
  { num: 4, name: 'Thursday', short: 'Thu' },
  { num: 5, name: 'Friday', short: 'Fri' },
  { num: 6, name: 'Saturday', short: 'Sat' },
]

const PERIODS = [
  { num: 1, name: 'Period 1', time: '09:20 - 10:10' },
  { num: 2, name: 'Period 2', time: '10:10 - 11:00' },
  { num: 3, name: 'Period 3', time: '11:30 - 12:20' },
  { num: 4, name: 'Period 4', time: '12:20 - 13:10' },
  { num: 5, name: 'Period 5', time: '14:00 - 14:50' },
  { num: 6, name: 'Period 6', time: '14:50 - 15:40' },
]

const SUBJECT_THEMES: Record<string, { bg: string, text: string, border: string }> = {
  TECH001: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
  '230BT02': { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-300' },
  '2505T02': { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' },
  '250HT01': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-300' },
  '2505T01': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
}

export default function TimetablePage() {
  const [slots, setSlots] = useState<TimetableSlot[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null)
  const [editSubjectCode, setEditSubjectCode] = useState('')
  const [editOpenTime, setEditOpenTime] = useState('')
  const [editCloseTime, setEditCloseTime] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [mobileActiveDay, setMobileActiveDay] = useState(1)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [ttRes, subRes] = await Promise.all([
        api.get('/admin/timetable'),
        api.get('/admin/subjects')
      ])
      setSlots(ttRes.data?.data || [])
      setSubjects(subRes.data?.data || [])
    } catch (err) {
      console.error('Error fetching timetable data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openEditModal = (slot: TimetableSlot) => {
    setSelectedSlot(slot)
    setEditSubjectCode(slot.subjectCode)
    setEditOpenTime(slot.attendanceOpen)
    setEditCloseTime(slot.attendanceClose)
    setSaveSuccess(false)
  }

  const handleSaveSlot = async () => {
    if (!selectedSlot) return
    try {
      setSaving(true)
      await api.post('/admin/timetable/update', {
        slotId: selectedSlot.id,
        subjectCode: editSubjectCode,
        attendanceOpen: editOpenTime,
        attendanceClose: editCloseTime
      })
      setSaveSuccess(true)
      await fetchData()
      setTimeout(() => {
        setSelectedSlot(null)
        setSaveSuccess(false)
      }, 1000)
    } catch (err) {
      alert('Failed to update timetable slot')
    } finally {
      setSaving(false)
    }
  }

  // Filter slots for mobile day view
  const mobileDaySlots = slots.filter(s => s.dayOfWeek === mobileActiveDay)

  return (
    <div className="space-y-5 max-w-7xl mx-auto px-1 sm:px-4 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" /> Full Timetable Configuration
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Weekly 6-day × 6-period schedule • Tap any slot to change subjects or face-scan windows
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchData}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Schedule
          </button>
        </div>
      </div>

      {/* Mobile Day Selector Bar (Visible only on mobile screens) */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-1">
        {DAYS.map(d => (
          <button
            key={d.num}
            onClick={() => setMobileActiveDay(d.num)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap shadow-xs ${
              mobileActiveDay === d.num
                ? 'bg-indigo-600 text-white shadow-indigo-500/25'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {d.short}
          </button>
        ))}
      </div>

      {/* Mobile Card List View (Phones) */}
      <div className="md:hidden space-y-2.5">
        <div className="px-1 text-xs font-bold text-gray-700 flex items-center justify-between">
          <span>{DAYS.find(d => d.num === mobileActiveDay)?.name} Schedule</span>
          <span className="text-[11px] text-indigo-600 font-semibold">Tap to Edit</span>
        </div>

        {mobileDaySlots.length === 0 ? (
          <div className="p-8 text-center text-gray-400 bg-white rounded-3xl border border-gray-200 text-xs">
            No slots configured for this day.
          </div>
        ) : (
          mobileDaySlots.map(slot => {
            const theme = SUBJECT_THEMES[slot.subjectCode] || { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-200' }
            return (
              <div
                key={slot.id}
                onClick={() => openEditModal(slot)}
                className={`p-4 rounded-3xl border shadow-xs active:scale-[0.98] transition cursor-pointer ${theme.bg} ${theme.border} space-y-1.5`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs px-2 py-0.5 bg-black/10 rounded-lg">
                      Period {slot.periodNumber}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-blue-700 bg-white/80 px-2 py-0.5 rounded border">
                      {slot.subjectCode}
                    </span>
                  </div>
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </div>
                <p className={`font-bold text-sm ${theme.text}`}>{slot.subjectName}</p>
                <p className="text-xs text-gray-500">{slot.faculty}</p>
                <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[11px] text-gray-600 font-mono">
                  <span>Class: {slot.startTime.slice(0,5)} - {slot.endTime.slice(0,5)}</span>
                  <span className="text-indigo-600 font-bold">Scan Window: {slot.attendanceOpen.slice(0,5)} - {slot.attendanceClose.slice(0,5)}</span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Desktop Weekly Matrix Grid (md: and above) */}
      <div className="hidden md:block bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-400 space-y-2">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading complete weekly timetable...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-gradient-to-r from-gray-900 to-indigo-950 text-white">
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] w-28 text-center border-r border-gray-800">
                    Period
                  </th>
                  {DAYS.map(d => (
                    <th key={d.num} className="p-3.5 font-bold uppercase tracking-wider text-[11px] text-center border-r border-gray-800 min-w-[170px]">
                      {d.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {PERIODS.map(p => {
                  const isBreakAfterP2 = p.num === 2
                  const isBreakAfterP4 = p.num === 4

                  return (
                    <>
                      <tr key={p.num} className="hover:bg-gray-50/50 transition">
                        <td className="p-3 bg-gray-50 text-center border-r border-gray-200 font-bold">
                          <p className="text-gray-900">{p.name}</p>
                          <p className="text-[10px] font-normal text-gray-500 mt-0.5">{p.time}</p>
                        </td>

                        {DAYS.map(d => {
                          const slot = slots.find(s => s.dayOfWeek === d.num && s.periodNumber === p.num)
                          const theme = slot ? (SUBJECT_THEMES[slot.subjectCode] || { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-200' }) : null

                          return (
                            <td
                              key={d.num}
                              onClick={() => slot && openEditModal(slot)}
                              className="p-2.5 border-r border-gray-100 align-top cursor-pointer group"
                            >
                              {slot ? (
                                <div
                                  className={`p-3 rounded-2xl border transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-md ${theme?.bg} ${theme?.border} relative`}
                                >
                                  <div className="flex items-start justify-between">
                                    <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 bg-white/80 rounded border shadow-xs">
                                      {slot.subjectCode}
                                    </span>
                                    <Edit2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-600 transition" />
                                  </div>
                                  <p className={`font-bold text-xs mt-1.5 line-clamp-1 ${theme?.text}`}>
                                    {slot.subjectName}
                                  </p>
                                  <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                                    {slot.faculty}
                                  </p>
                                  <div className="mt-2 pt-1 border-t border-black/5 flex items-center justify-between text-[9px] text-gray-500 font-mono">
                                    <span>Scan: {slot.attendanceOpen.slice(0,5)} - {slot.attendanceClose.slice(0,5)}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-3 rounded-2xl border border-dashed border-gray-200 text-center text-gray-300 italic text-xs">
                                  Empty Slot
                                </div>
                              )}
                            </td>
                          )
                        })}
                      </tr>

                      {isBreakAfterP2 && (
                        <tr className="bg-amber-50/70 border-y border-amber-200 text-amber-900 text-center font-bold text-[11px]">
                          <td colSpan={7} className="py-1.5 tracking-wider uppercase">
                            ☕ Morning Break (11:00 AM – 11:30 AM) • 30 Minutes
                          </td>
                        </tr>
                      )}

                      {isBreakAfterP4 && (
                        <tr className="bg-emerald-50/70 border-y border-emerald-200 text-emerald-900 text-center font-bold text-[11px]">
                          <td colSpan={7} className="py-1.5 tracking-wider uppercase">
                            🍱 Lunch Break (1:10 PM – 2:00 PM) • 50 Minutes
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Slot Modal */}
      <AnimatePresence>
        {selectedSlot && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Configure Slot</h3>
                  <p className="text-xs text-gray-500">
                    {DAYS.find(d => d.num === selectedSlot.dayOfWeek)?.name} • Period {selectedSlot.periodNumber} ({selectedSlot.startTime} - {selectedSlot.endTime})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {saveSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-center space-y-2">
                  <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-bold text-sm">Timetable Slot Updated!</p>
                  <p className="text-xs text-emerald-600">Saved to database</p>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      Assigned Subject:
                    </label>
                    <select
                      value={editSubjectCode}
                      onChange={(e) => setEditSubjectCode(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {subjects.map(s => (
                        <option key={s.subjectCode} value={s.subjectCode}>
                          {s.subjectCode} - {s.subjectName} ({s.faculty})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">
                        Attendance Open:
                      </label>
                      <input
                        type="time"
                        step="1"
                        value={editOpenTime}
                        onChange={(e) => setEditOpenTime(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">
                        Attendance Close:
                      </label>
                      <input
                        type="time"
                        step="1"
                        value={editCloseTime}
                        onChange={(e) => setEditCloseTime(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-[11px] leading-relaxed">
                    💡 Changing this slot updates the live period for automatic student face check-in. Students scanning during this window will be marked PRESENT for this subject.
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSlot(null)}
                      className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveSlot}
                      disabled={saving}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
