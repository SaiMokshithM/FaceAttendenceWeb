import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Suspense, lazy } from 'react'

// Lazy pages
const LoginPage        = lazy(() => import('./pages/auth/LoginPage'))
const AdminLayout      = lazy(() => import('./layouts/AdminLayout'))
const StudentLayout    = lazy(() => import('./layouts/StudentLayout'))
const AdminDashboard   = lazy(() => import('./pages/admin/AdminDashboard'))
const EnrollmentPage   = lazy(() => import('./pages/admin/EnrollmentPage'))
const StudentsPage     = lazy(() => import('./pages/admin/StudentsPage'))
const TimetablePage    = lazy(() => import('./pages/admin/TimetablePage'))
const AttendancePage   = lazy(() => import('./pages/admin/AttendancePage'))
const ReportsPage      = lazy(() => import('./pages/admin/ReportsPage'))
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'))
const StudentTimetablePage = lazy(() => import('./pages/student/StudentTimetablePage'))
const StudentAttendance = lazy(() => import('./pages/student/StudentAttendance'))
const VerifyPage       = lazy(() => import('./pages/student/VerifyPage'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-surface">
      <div className="flex items-center gap-3 text-brand-slate">
        <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading…</span>
      </div>
    </div>
  )
}

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'ADMIN' | 'STUDENT' }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student'} replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="enrollment" element={<EnrollmentPage />} />
            <Route path="timetable" element={<TimetablePage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>

          {/* Student routes */}
          <Route path="/student" element={<ProtectedRoute role="STUDENT"><StudentLayout /></ProtectedRoute>}>
            <Route index element={<StudentDashboard />} />
            <Route path="timetable" element={<StudentTimetablePage />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="verify" element={<VerifyPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}
