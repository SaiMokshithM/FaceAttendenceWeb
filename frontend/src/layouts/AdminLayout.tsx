import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, ScanFace, CalendarDays,
  ClipboardList, BarChart3, Menu, X, Bell, ChevronDown,
  LogOut, Scan, ShieldCheck
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import clsx from 'clsx'

const nav = [
  { label: 'Dashboard',   path: '/admin',            icon: LayoutDashboard },
  { label: 'Attendance',  path: '/admin/attendance', icon: ClipboardList },
  { label: 'Timetable',   path: '/admin/timetable',  icon: CalendarDays },
  { label: 'Records',     path: '/admin/reports',    icon: BarChart3 },
  { label: 'Students',    path: '/admin/students',   icon: Users },
  { label: 'Enrollment',  path: '/admin/enrollment', icon: ScanFace },
]

const mobileBottomNav = [
  { label: 'Home',        path: '/admin',            icon: LayoutDashboard },
  { label: 'Attendance',  path: '/admin/attendance', icon: ClipboardList },
  { label: 'Timetable',   path: '/admin/timetable',  icon: CalendarDays },
  { label: 'Records',     path: '/admin/reports',    icon: BarChart3 },
]

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* ── Desktop Sidebar (Hidden on Mobile) ──────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden md:flex flex-shrink-0 bg-slate-900 flex-col z-20 overflow-hidden border-r border-slate-800"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
            <Scan className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="leading-none"
              >
                <span className="font-black text-white text-base tracking-tight block">FaceAttend</span>
                <span className="text-[10px] text-blue-400 font-medium">MR University Admin</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 px-2.5 overflow-y-auto">
          {nav.map(({ label, path, icon: Icon }) => {
            const active = path === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(path)
            return (
              <NavLink
                key={path}
                to={path}
                end={path === '/admin'}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150',
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            )
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-white/10">
          <button
            onClick={() => setCollapsed(c => !c)}
            className="w-full flex items-center justify-center p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        </div>
      </motion.aside>

      {/* ── Main Content Container ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-gray-200 flex-shrink-0 z-10 shadow-xs">
          <div className="flex items-center gap-2.5">
            {/* Mobile Brand Icon */}
            <div className="md:hidden w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black text-gray-900 tracking-tight">
                {nav.find(n => (n.path !== '/admin' && location.pathname.startsWith(n.path)) || location.pathname === n.path)?.label || 'Dashboard'}
              </p>
              <p className="text-[10px] text-gray-400 hidden sm:block">CSM Section F • Official College Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(o => !o)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 transition"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-black shadow-xs">
                  A
                </div>
                <span className="text-xs font-bold text-gray-800 hidden sm:inline">Admin</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 top-10 w-52 bg-white rounded-2xl border border-gray-200 shadow-xl py-1.5 z-50 text-xs"
                  >
                    <div className="px-3.5 py-2 border-b border-gray-100">
                      <p className="font-bold text-gray-900 truncate">{user?.email}</p>
                      <p className="text-[10px] text-gray-500 font-medium">Administrator</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-semibold transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content (Scrollable with mobile bottom bar padding) */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="p-3 sm:p-6"
          >
            <Outlet />
          </motion.div>
        </main>

        {/* ── Mobile Bottom Navigation Bar (Ultra-Premium Native App Feel) ─── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-3 py-1.5 flex items-center justify-around z-30 shadow-lg">
          {mobileBottomNav.map(({ label, path, icon: Icon }) => {
            const active = path === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(path)
            return (
              <NavLink
                key={path}
                to={path}
                end={path === '/admin'}
                className={clsx(
                  'flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-[10px] font-bold transition-all',
                  active
                    ? 'text-blue-600 font-black scale-105'
                    : 'text-gray-500 hover:text-gray-800'
                )}
              >
                <div className={clsx(
                  'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                  active ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'text-gray-500'
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <span>{label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
