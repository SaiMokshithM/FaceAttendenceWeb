import api from './api'
import type { Student, EnrollmentOverview, BulkJobStatus, ImportResult } from '../types'

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then(r => r.data.data),

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  },
}

export const studentService = {
  list: () => api.get<{ data: Student[] }>('/students').then(r => r.data.data!),
  getById: (id: string) => api.get<{ data: Student }>(`/students/${id}`).then(r => r.data.data!),
  getMe: () => api.get<{ data: Student }>('/students/me').then(r => r.data.data!),
  importFile: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<{ data: ImportResult }>('/students/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data.data!)
  },
}

export const enrollmentService = {
  overview: () =>
    api.get<{ data: EnrollmentOverview }>('/admin/face-enrollment/overview').then(r => r.data.data!),

  bulkUpload: (zipFile: File, rosterFile: File) => {
    const form = new FormData()
    form.append('zip', zipFile)
    form.append('roster', rosterFile)
    return api.post('/face-enrollment/bulk/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data.data as { jobId: string; totalStudents: number })
  },

  jobStatus: (jobId: string) =>
    api.get<{ data: BulkJobStatus }>(`/face-enrollment/bulk/status/${jobId}`).then(r => r.data.data!),

  individualEnroll: (studentId: string, photo: File) => {
    const form = new FormData()
    form.append('studentId', studentId)
    form.append('photo', photo)
    return api.post('/face-enrollment/individual', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data.data)
  },

  reEnroll: (studentId: string, photo: File) => {
    const form = new FormData()
    form.append('photo', photo)
    return api.put(`/face-enrollment/${studentId}/reenroll`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data.data)
  },

  studentStatus: (studentId: string) =>
    api.get(`/face-enrollment/student/${studentId}`).then(r => r.data.data),
}

export const attendanceService = {
  adminDashboard: () => api.get('/admin/dashboard').then(r => r.data.data),
  liveAttendance: () => api.get('/admin/live-attendance').then(r => r.data.data),
  myAttendance: () => api.get('/attendance/student/me').then(r => r.data.data),
  summary: () => api.get('/attendance/summary').then(r => r.data.data),
  markAttendance: (qrToken: string, photo: File) => {
    const form = new FormData()
    form.append('qrToken', qrToken)
    form.append('photo', photo)
    return api.post('/attendance/mark', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data.data)
  },
}
