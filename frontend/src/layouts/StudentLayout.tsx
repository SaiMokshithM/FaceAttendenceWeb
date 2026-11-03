import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, ClipboardList, ScanFace, LogOut, Scan } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import clsx from 'clsx'

const nav = [
  { label: 'Dashboard',   path: '/student',            icon: LayoutDashboard },
  { label: 'Attendance',  path: '/student/attendance', icon: ClipboardList },
  { label: 'Verify Face', path: '/student/verify',     icon: ScanFace },
]

export default function StudentLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-gray-900 text-sm tracking-tight block leading-none">FaceAttend</span>
              <span className="text-[10px] text-gray-400 font-medium">Student Portal</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {nav.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/student'}
                className={({ isActive }) => clsx(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Sign Out Button */}
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-rose-600 px-2.5 py-1.5 rounded-xl hover:bg-rose-50 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl w-full mx-auto px-3 sm:px-6 py-4 pb-20 sm:pb-8 flex-1">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Mobile Floating Bottom Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-1.5 flex items-center justify-around z-30 shadow-lg">
        {nav.map(({ label, path, icon: Icon }) => {
          const isScanner = path === '/student/verify'
          const active = path === '/student'
            ? location.pathname === '/student'
            : location.pathname.startsWith(path)

          if (isScanner) {
            return (
              <NavLink
                key={path}
                to={path}
                className="flex flex-col items-center -mt-5"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/35 border-2 border-white scale-105 active:scale-95 transition">
                  <ScanFace className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-blue-600 mt-1">Scan Face</span>
              </NavLink>
            )
          }

          return (
            <NavLink
              key={path}
              to={path}
              end={path === '/student'}
              className={clsx(
                'flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold transition-all',
                active ? 'text-blue-600 font-black' : 'text-gray-500 hover:text-gray-800'
              )}
            >
              <div className={clsx(
                'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                active ? 'bg-blue-50 text-blue-600' : 'text-gray-500'
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <span>{label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
