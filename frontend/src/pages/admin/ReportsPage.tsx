import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Search, Filter, Calendar, CheckCircle2, Clock, Users, RefreshCw } from 'lucide-react'
import api from '../../services/api'

interface AttendanceRecord {
  id: string
  date: string
  status: string
  checkInTime: string
  rollNumber: string
  studentName: string
  periodNumber: number
  periodName: string
  timing: string
  subjectCode: string
  subjectName: string
  faculty: string
  verificationMethod: string
  remarks: string
}

export default function ReportsPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedDate, setSelectedDate] = useState('')

  const fetchRecords = async () => {
    try {
      setLoading(true)
      let url = '/admin/all-records?'
      if (selectedDate) url += `date=${selectedDate}&`
      if (selectedSubject !== 'ALL') url += `subject=${selectedSubject}&`
      if (selectedStatus !== 'ALL') url += `status=${selectedStatus}&`
      if (search) url += `search=${encodeURIComponent(search)}&`

      const res = await api.get(url)
      setRecords(res.data?.data || [])
    } catch (err) {
      console.error('Error fetching records:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [selectedSubject, selectedStatus, selectedDate])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchRecords()
  }

  // Export full records table to CSV for Excel
  const exportToCSV = () => {
    if (records.length === 0) {
      alert('No records to export')
      return
    }

    const headers = ['Date', 'Check-in Time', 'Roll Number', 'Student Name', 'Period', 'Subject Code', 'Subject Name', 'Faculty', 'Verification Method', 'Status', 'Remarks']
    const rows = records.map(r => [
      `"${r.date}"`,
      `"${r.checkInTime}"`,
      `"${r.rollNumber}"`,
      `"${r.studentName}"`,
      `"Period ${r.periodNumber}"`,
      `"${r.subjectCode}"`,
      `"${r.subjectName}"`,
      `"${r.faculty}"`,
      `"${r.verificationMethod || 'FACE AI'}"`,
      `"${r.status}"`,
      `"${r.remarks || ''}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `FaceAttend_Records_${selectedDate || 'All'}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" /> Complete Attendance Records Explorer
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Access, search, filter and export all biometric face attendance logs across CSM Section F
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <Download className="w-4 h-4" /> Export Excel (CSV)
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name or roll number (e.g. 26TEU06R508)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="ALL">All Subjects</option>
            <option value="TECH001">TECH001 - Technical Training</option>
            <option value="230BT02">230BT02 - MFCS</option>
            <option value="2505T02">2505T02 - PSC</option>
            <option value="250HT01">250HT01 - LPS</option>
            <option value="2505T01">2505T01 - FWD</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">PRESENT</option>
            <option value="ABSENT">ABSENT</option>
            <option value="LATE">LATE</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            type="submit"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition shadow-sm"
          >
            Search
          </button>

          {(selectedDate || search || selectedSubject !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSelectedDate('')
                setSearch('')
                setSelectedSubject('ALL')
                setSelectedStatus('ALL')
              }}
              className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-xs font-medium transition"
            >
              Reset
            </button>
          )}
        </form>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
          <span>Found <b>{records.length}</b> total matching records</span>
          <span className="text-[11px] text-gray-400">Export includes all matching entries</span>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-400 space-y-2">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading attendance records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center text-gray-400 space-y-2">
            <Users className="w-10 h-10 mx-auto text-gray-300" />
            <p className="text-sm font-semibold">No attendance records match the selected filters.</p>
            <p className="text-xs text-gray-400">Records are automatically created when students scan face via webcam.</p>
          </div>
        ) : (
          <>
            {/* Mobile Card List View (< md screens) */}
            <div className="md:hidden divide-y divide-gray-100 p-2">
              {records.map((r) => {
                const isPres = r.status === 'PRESENT' || r.status === 'LATE'
                return (
                  <div key={r.id} className="p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-xs text-gray-900">{r.studentName}</p>
                        <p className="font-mono text-[11px] font-bold text-blue-700">{r.rollNumber}</p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isPres
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {isPres ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {r.status}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-2 rounded-xl text-[11px] text-gray-600 flex items-center justify-between">
                      <span className="font-semibold text-gray-800">P{r.periodNumber} • {r.subjectName}</span>
                      <span className="font-mono text-gray-400">{r.subjectCode}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                      <span>{r.date} at {r.checkInTime}</span>
                      <span className="text-cyan-700 font-semibold">{r.verificationMethod || 'FACE AI'} ✓</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop Table (md: and above) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-100/75 border-b border-gray-200 text-gray-600 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Date & Time</th>
                    <th className="px-4 py-3.5">Roll Number</th>
                    <th className="px-4 py-3.5">Student Name</th>
                    <th className="px-4 py-3.5">Period & Subject</th>
                    <th className="px-4 py-3.5">Faculty</th>
                    <th className="px-4 py-3.5">Verification</th>
                    <th className="px-4 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {records.map((r) => {
                    const isPres = r.status === 'PRESENT' || r.status === 'LATE'
                    return (
                      <tr key={r.id} className="hover:bg-gray-50/75 transition">
                        <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">{r.date}</div>
                          <div className="text-[11px] text-gray-500 font-mono">{r.checkInTime}</div>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                          {r.rollNumber}
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                          {r.studentName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-bold text-gray-800">P{r.periodNumber} • {r.subjectName}</span>
                          <div className="text-[10px] text-gray-500 font-mono">Code: {r.subjectCode}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {r.faculty}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-mono">
                            {r.verificationMethod || 'FACE AI'}
                          </span>
                          {r.remarks && (
                            <div className="text-[10px] text-emerald-600 mt-0.5">{r.remarks}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isPres
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {isPres ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
