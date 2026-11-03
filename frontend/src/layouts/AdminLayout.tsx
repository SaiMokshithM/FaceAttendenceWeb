import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, ScanFace, CalendarDays,
  ClipboardList, BarChart3, Menu, X, ChevronDown,
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
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* ── Larger Desktop Sidebar (Hidden on Mobile) ────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 84 : 290 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="hidden md:flex flex-shrink-0 bg-slate-950 flex-col z-20 overflow-hidden border-r border-slate-800/80 shadow-2xl"
      >
        {/* Large Logo & Institution Brand */}
        <div className="flex items-center gap-3.5 px-6 py-6 border-b border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0070ba] to-[#0090e7] flex items-center justify-center flex-shrink-0 shadow-lg shadow-sky-500/30">
            <Scan className="w-6 h-6 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="leading-tight overflow-hidden"
              >
                <span className="font-black text-white text-xl tracking-tight block">FaceAttend</span>
                <span className="text-xs text-[#0090e7] font-bold tracking-wide block mt-0.5">
                  MR University Admin
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Larger Navigation List */}
        <nav className="flex-1 py-6 space-y-2 px-4 overflow-y-auto">
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
                  'flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200',
                  active
                    ? 'bg-[#0090e7] text-white shadow-lg shadow-sky-500/30 font-extrabold translate-x-1'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80 font-semibold hover:translate-x-0.5'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="tracking-wide"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom User Profile & Collapse Toggle */}
        <div className="p-4 border-t border-white/10 bg-slate-950/60">
          {!collapsed && (
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-[#0090e7] flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                  A
                </div>
                <div className="truncate leading-tight">
                  <p className="text-xs font-bold text-white truncate">Administrator</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{user?.email || 'admin@faceattend.com'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={() => setCollapsed(c => !c)}
            className="w-full flex items-center justify-center p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>
      </motion.aside>

      {/* ── Main Content Container ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-8 bg-white border-b border-gray-200/80 flex-shrink-0 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            {/* Mobile Brand Icon */}
            <div className="md:hidden w-10 h-10 rounded-xl bg-[#0090e7] flex items-center justify-center text-white shadow-md shadow-sky-500/25">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-black text-gray-900 tracking-tight">
                {nav.find(n => (n.path !== '/admin' && location.pathname.startsWith(n.path)) || location.pathname === n.path)?.label || 'Dashboard'}
              </p>
              <p className="text-[11px] text-gray-400 hidden sm:block">CSM Section F • Official College Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(o => !o)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-gray-100 transition"
              >
                <div className="w-8 h-8 rounded-full bg-[#0090e7] flex items-center justify-center text-white text-xs font-black shadow-xs">
                  A
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-bold text-gray-800 block leading-none">Admin</span>
                  <span className="text-[10px] text-gray-400 font-medium leading-none">Faculty</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 top-12 w-56 bg-white rounded-2xl border border-gray-200 shadow-xl py-2 z-50 text-xs"
                  >
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="font-bold text-gray-900 truncate">{user?.email}</p>
                      <p className="text-[11px] text-gray-500 font-medium">System Administrator</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-rose-600 hover:bg-rose-50 font-semibold transition"
                    >
                      <LogOut className="w-4 h-4" />
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

        {/* ── Mobile Bottom Navigation Bar ─── */}
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
                    ? 'text-[#0090e7] font-black scale-105'
                    : 'text-gray-500 hover:text-gray-800'
                )}
              >
                <div className={clsx(
                  'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                  active ? 'bg-[#0090e7] text-white shadow-md shadow-sky-500/25' : 'text-gray-500'
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
