import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, Filter, Download, UserCheck, Clock, XCircle, Users } from 'lucide-react'
import { studentService } from '../../services/endpoints'
import type { Student } from '../../types'

const STATUS_BADGE: Record<string, string> = {
  ENROLLED:      'badge-success',
  PENDING:       'badge-warning',
  FAILED:        'badge-danger',
  RE_ENROLLMENT: 'badge-info',
}

export default function StudentsPage() {
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('ALL')

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.list,
  })

  const filtered = students.filter(s => {
    const matchSearch = search === '' ||
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'ALL' || s.enrollmentStatus === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Students</h1>
          <p className="text-sm text-brand-slate mt-0.5">{students.length} students registered</p>
        </div>
        <button className="btn-secondary">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-slate" />
          <input
            className="input pl-9"
            placeholder="Search by name or roll number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'ENROLLED', 'PENDING', 'FAILED', 'RE_ENROLLMENT'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                ${filter === s ? 'bg-brand-blue text-white' : 'border border-brand-border bg-white text-brand-slate hover:text-brand-navy'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border bg-brand-surface">
                <th className="text-left px-4 py-3 label">Roll No.</th>
                <th className="text-left px-4 py-3 label">Name</th>
                <th className="text-left px-4 py-3 label">Status</th>
                <th className="text-left px-4 py-3 label">Enrolled</th>
                <th className="text-right px-4 py-3 label">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 skeleton rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-brand-slate text-sm">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No students found
                  </td>
                </tr>
              ) : (
                filtered.map(student => (
                  <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-brand-surface transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-brand-navy">
                      {student.rollNumber}
                    </td>
                    <td className="px-4 py-3 font-medium text-brand-navy">{student.fullName}</td>
                    <td className="px-4 py-3">
                      <span className={STATUS_BADGE[student.enrollmentStatus] || 'badge-neutral'}>
                        {student.enrollmentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-brand-slate">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-brand-blue text-xs font-medium hover:underline">
                        View
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
