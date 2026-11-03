// Shared TypeScript types across the application

export interface User {
  userId: string
  email: string
  role: 'ADMIN' | 'STUDENT'
  accessToken: string
  refreshToken: string
}

export interface Student {
  id: string
  rollNumber: string
  fullName: string
  profileImagePath?: string
  enrollmentStatus: 'PENDING' | 'ENROLLED' | 'FAILED' | 'RE_ENROLLMENT'
  createdAt: string
  updatedAt: string
}

export interface EnrollmentOverview {
  total: number
  enrolled: number
  pending: number
  failed: number
  other: number
  completionPct: number
}

export interface BulkJobStatus {
  id: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  total: number
  processed: number
  successful: number
  failed: number
}

export interface AttendanceRecord {
  id: string
  studentId: string
  rollNumber: string
  fullName: string
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED'
  checkInTime?: string
  subject?: string
  period?: number
  verificationMethod: 'FACE' | 'MANUAL' | 'CORRECTION'
}

export interface TimetableEntry {
  id: string
  dayOfWeek: number
  periodNumber: number
  subjectCode: string
  subjectName: string
  facultyName?: string
  startTime: string
  endTime: string
  attendanceOpen: string
  attendanceClose: string
  lateThresholdMinutes: number
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  errors?: Record<string, string>
}

export interface KpiData {
  total: number
  present: number
  absent: number
  late: number
  attendancePct: number
  currentPeriod?: number
  currentSubject?: string
}

export interface ImportResult {
  created: number
  skipped: number
  failed: number
  errors: string[]
}
