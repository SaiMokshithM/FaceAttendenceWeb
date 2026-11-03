import { useEffect, useState } from 'react'
import { ClipboardList, CheckCircle2, Clock } from 'lucide-react'
import api from '../../services/api'

interface AttendanceItem {
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

export default function StudentAttendance() {
  const [history, setHistory] = useState<AttendanceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/attendance/my-history')
      .then(res => setHistory(res.data.data || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Attendance Records</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your personal timetable attendance verified via face scan</p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full border border-green-200">
          Total Recorded: {history.length}
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />)}
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center gap-3 text-gray-400">
          <ClipboardList className="w-12 h-12 opacity-30 text-blue-600" />
          <p className="font-semibold text-gray-700 text-base">No attendance marked yet today</p>
          <p className="text-sm text-center text-gray-500 max-w-sm">
            Go to the "Verify" page to turn on the camera and scan your face to mark attendance!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">Date</th>
                <th className="py-3 px-4 text-left font-semibold">Period</th>
                <th className="py-3 px-4 text-left font-semibold">Subject</th>
                <th className="py-3 px-4 text-left font-semibold">Faculty</th>
                <th className="py-3 px-4 text-center font-semibold">Status</th>
                <th className="py-3 px-4 text-right font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map(row => (
                <tr key={row.id} className="hover:bg-blue-50/40 transition">
                  <td className="py-3.5 px-4 font-mono text-gray-700">{row.date}</td>
                  <td className="py-3.5 px-4 font-semibold text-blue-700">P{row.periodNumber} ({row.timing})</td>
                  <td className="py-3.5 px-4 font-medium text-gray-900">{row.subjectName}</td>
                  <td className="py-3.5 px-4 text-gray-600">{row.faculty}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {row.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-gray-600">{row.checkInTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
