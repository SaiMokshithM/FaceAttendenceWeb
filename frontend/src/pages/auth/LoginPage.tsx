import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  GraduationCap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Fingerprint,
  Cpu,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const [roleMode, setRoleMode] = useState<'STUDENT' | 'ADMIN'>('STUDENT')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login, user }         = useAuth()
  const navigate                = useNavigate()

  // Redirect if already authenticated
  if (user) {
    navigate(user.role === 'ADMIN' ? '/admin' : '/student', { replace: true })
  }

  const handleQuickPreset = (targetRole: 'STUDENT' | 'ADMIN', userEmail: string, userPass: string) => {
    setRoleMode(targetRole)
    setEmail(userEmail)
    setPassword(userPass)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()

    try {
      await login(cleanEmail, cleanPassword)
      const stored = JSON.parse(localStorage.getItem('user') || '{}')
      navigate(stored.role === 'ADMIN' ? '/admin' : '/student', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Authentication failed. Please verify your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white relative overflow-hidden font-sans">
      {/* Dynamic Background Mesh & Grid */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Architectural Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:36px_36px]" />
        
        {/* Ambient Radial Mesh Gradients */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-b from-blue-600/15 via-indigo-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-0 w-[380px] h-[380px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      {/* Top Institutional Header */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-[#070B14]/80 backdrop-blur-xl px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* University Crest Monogram */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-0.5 shadow-lg shadow-blue-900/30 flex items-center justify-center">
              <div className="w-full h-full bg-[#0B1120] rounded-[10px] flex items-center justify-center font-black text-xs text-blue-400 tracking-wider">
                MR
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-xs sm:text-sm tracking-tight">
                  Malla Reddy (MR) University
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  Off Campus – Tirupati
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono tracking-tight">
                CSM Section F • Automated Biometric System
              </p>
            </div>
          </div>

          {/* Real-time System Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-slate-400">SFace Core Online</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 font-semibold font-mono">33 Enrolled</span>
          </div>
        </div>
      </header>

      {/* Main Command Center Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[440px]"
        >
          {/* Outer Glassmorphic Card */}
          <div className="relative rounded-3xl bg-[#0B1120]/90 border border-slate-800 shadow-[0_24px_64px_rgba(0,0,0,0.65)] backdrop-blur-2xl p-6 sm:p-8 overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-blue-500/50 before:to-transparent">
            
            {/* Header Identity */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold mb-3">
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Zero-Knowledge Facial Recognition</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Institutional Sign In
              </h1>
              <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto">
                Authorized identity portal for Department of Computer Science & Engineering
              </p>
            </div>

            {/* Role Switcher Pill */}
            <div className="bg-slate-950/80 p-1 rounded-2xl border border-slate-800/80 flex items-center mb-6">
              <button
                type="button"
                onClick={() => setRoleMode('STUDENT')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  roleMode === 'STUDENT'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student Portal</span>
              </button>

              <button
                type="button"
                onClick={() => setRoleMode('ADMIN')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  roleMode === 'ADMIN'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Faculty / Admin</span>
              </button>
            </div>

            {/* Sign-in Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / Roll Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {roleMode === 'STUDENT' ? 'Institutional Email or Roll' : 'Administrative Account'}
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Encrypted</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={roleMode === 'STUDENT' ? '26teu06530@faceattend.local' : 'admin@faceattend.com'}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder:text-slate-600 text-xs sm:text-sm font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Security Passcode
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {roleMode === 'STUDENT' ? 'Default: Roll No' : 'Admin Pass'}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={roleMode === 'STUDENT' ? 'e.g. 26TEU06530' : '••••••••••••'}
                    required
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder:text-slate-600 text-xs sm:text-sm font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(s => !s)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-blue-900/30 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating Credentials…</span>
                  </>
                ) : (
                  <>
                    <span>Authorize & Continue</span>
                    <ChevronRight className="w-4 h-4 text-blue-200" />
                  </>
                )}
              </button>
            </form>

            {/* Executive Quick-Auth Drawer (Refined & Professional) */}
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  <span>Institutional Presets</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">1-Tap Fill</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickPreset('ADMIN', 'admin@faceattend.com', 'AdminPassword@2026')}
                  className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-all active:scale-95 group"
                >
                  <div className="flex items-center justify-between text-slate-300 group-hover:text-white">
                    <span className="font-bold text-[11px]">Faculty Admin</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                    admin@faceattend.com
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPreset('STUDENT', '26teu06530@faceattend.local', '26TEU06530')}
                  className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-all active:scale-95 group"
                >
                  <div className="flex items-center justify-between text-slate-300 group-hover:text-white">
                    <span className="font-bold text-[11px]">Enrolled Student</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                    26TEU06530 (CSM-F)
                  </p>
                </button>
              </div>
            </div>

            {/* Cryptography Footer Badge */}
            <div className="mt-5 flex items-center justify-center gap-3 text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-600" /> AES-256 Hashes
              </span>
              <span>·</span>
              <span>YuNet + SFace v2.1</span>
              <span>·</span>
              <span>Zero Cookies</span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Institutional Legal Footer */}
      <footer className="relative z-10 w-full border-t border-slate-800/60 bg-[#070B14]/90 py-3 px-4 text-center">
        <p className="text-[11px] text-slate-500 font-mono">
          Malla Reddy (MR) Deemed to be University, Off Campus – Tirupati • Department of Computer Science & Engineering
        </p>
      </footer>
    </div>
  )
}
