import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  GraduationCap,
  Shield,
  ScanFace,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

/* ─── Corner Geometric Hex-Quatrefoil Motif ─── */
function CornerGeometric({ position }: { position: 'top-left' | 'bottom-right' }) {
  const isTopLeft = position === 'top-left'
  return (
    <div
      className={`absolute pointer-events-none z-0 ${
        isTopLeft ? '-top-14 -left-14' : '-bottom-14 -right-14'
      }`}
      aria-hidden="true"
    >
      <svg
        width="280"
        height="280"
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-90"
      >
        {[
          { cx: 60, cy: 60 },
          { cx: 180, cy: 60 },
          { cx: 60, cy: 180 },
          { cx: 180, cy: 180 },
          { cx: 120, cy: 120 },
          { cx: 0, cy: 120 },
          { cx: 120, cy: 0 },
        ].map((c, i) => (
          <g key={i} transform={`translate(${c.cx}, ${c.cy})`}>
            {/* North petal */}
            <path
              d="M 0 0 C -22 -18, -18 -42, 0 -52 C 18 -42, 22 -18, 0 0 Z"
              fill="#ffffff"
            />
            {/* South petal */}
            <path
              d="M 0 0 C -22 18, -18 42, 0 52 C 18 42, 22 18, 0 0 Z"
              fill="#ffffff"
            />
            {/* East petal */}
            <path
              d="M 0 0 C 18 -22, 42 -18, 52 0 C 42 18, 18 22, 0 0 Z"
              fill="#ffffff"
            />
            {/* West petal */}
            <path
              d="M 0 0 C -18 -22, -42 -18, -52 0 C -42 18, -18 22, 0 0 Z"
              fill="#ffffff"
            />
            <circle cx="0" cy="0" r="3" fill="#0284c7" />
          </g>
        ))}
      </svg>
    </div>
  )
}

/* ─── Top-Right Biometric Radar & Wave Trail (Reference-style) ─── */
function BiometricRadarTrail() {
  return (
    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 pointer-events-none z-10">
      <svg
        width="110"
        height="60"
        viewBox="0 0 110 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Curved dashed signal path */}
        <path
          d="M 12 50 C 45 46, 75 36, 92 16"
          stroke="#0090e7"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          strokeLinecap="round"
        />
        {/* Biometric Scan Face Node */}
        <g transform="translate(86, 6)">
          <circle cx="8" cy="8" r="8" fill="#0090e7" fillOpacity="0.15" />
          <circle cx="8" cy="8" r="5" fill="#0090e7" />
          <circle cx="8" cy="8" r="2" fill="#ffffff" />
          {/* Target corners */}
          <path d="M 3 5 L 3 3 L 5 3" stroke="#0090e7" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M 13 5 L 13 3 L 11 3" stroke="#0090e7" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M 3 11 L 3 13 L 5 13" stroke="#0090e7" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M 13 11 L 13 13 L 11 13" stroke="#0090e7" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  )
}

/* ─── Academic Campus Architecture & Tech Skyline Silhouette ─── */
function CampusSkyline() {
  return (
    <div className="absolute bottom-0 inset-x-0 h-16 sm:h-20 pointer-events-none overflow-hidden z-0 flex items-end justify-between px-2 sm:px-6">
      {/* Left: Classical University Pillars & Academic Dome */}
      <svg
        viewBox="0 0 160 85"
        className="w-32 sm:w-40 h-16 sm:h-20 text-[#0090e7] fill-current opacity-85 transition-transform duration-300 hover:scale-105"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="10" y="76" width="140" height="9" />
        <rect x="20" y="70" width="120" height="6" />

        {/* Portico Colonnade (Campus pillars) */}
        <rect x="28" y="38" width="6" height="32" />
        <rect x="42" y="38" width="6" height="32" />
        <rect x="56" y="38" width="6" height="32" />
        <rect x="70" y="38" width="6" height="32" />
        <rect x="84" y="38" width="6" height="32" />
        <rect x="98" y="38" width="6" height="32" />
        <rect x="112" y="38" width="6" height="32" />
        <rect x="126" y="38" width="6" height="32" />

        {/* Architrave and Pediment */}
        <rect x="24" y="32" width="112" height="6" />
        <polygon points="24,32 80,14 136,32" />

        {/* Library Central Academic Dome */}
        <path d="M 62 14 C 62 0, 98 0, 98 14 Z" />
        <line x1="80" y1="2" x2="80" y2="0" stroke="currentColor" strokeWidth="2" />
        <circle cx="80" cy="0" r="1.5" />
      </svg>

      {/* Right: Modern CSE Tech Campus Towers & Clock Tower */}
      <svg
        viewBox="0 0 180 85"
        className="w-36 sm:w-48 h-16 sm:h-20 text-[#0090e7] fill-current opacity-85 transition-transform duration-300 hover:scale-105"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="0" y="78" width="180" height="7" />

        {/* University Clock Tower */}
        <rect x="20" y="16" width="18" height="62" />
        <polygon points="18,16 29,4 40,16" />
        {/* Clock Face */}
        <circle cx="29" cy="26" r="4.5" fill="#ffffff" />
        <circle cx="29" cy="26" r="1.5" fill="currentColor" />
        {/* Tower lancet windows */}
        <rect x="26" y="38" width="6" height="12" rx="2" fill="#ffffff" />
        <rect x="26" y="56" width="6" height="12" rx="2" fill="#ffffff" />

        {/* Central CSE Engineering Building */}
        <rect x="46" y="30" width="52" height="48" />
        <line x1="46" y1="30" x2="98" y2="30" stroke="currentColor" strokeWidth="2" />
        {/* Labs windows grid */}
        <rect x="52" y="36" width="7" height="8" rx="1" fill="#ffffff" />
        <rect x="63" y="36" width="7" height="8" rx="1" fill="#ffffff" />
        <rect x="74" y="36" width="7" height="8" rx="1" fill="#ffffff" />
        <rect x="85" y="36" width="7" height="8" rx="1" fill="#ffffff" />

        <rect x="52" y="48" width="7" height="8" rx="1" fill="#ffffff" />
        <rect x="63" y="48" width="7" height="8" rx="1" fill="#ffffff" />
        <rect x="74" y="48" width="7" height="8" rx="1" fill="#ffffff" />
        <rect x="85" y="48" width="7" height="8" rx="1" fill="#ffffff" />

        <rect x="52" y="60" width="7" height="8" rx="1" fill="#ffffff" />
        <rect x="63" y="60" width="7" height="8" rx="1" fill="#ffffff" />
        <rect x="74" y="60" width="7" height="8" rx="1" fill="#ffffff" />
        <rect x="85" y="60" width="7" height="8" rx="1" fill="#ffffff" />

        {/* AI Innovation Wing */}
        <rect x="104" y="42" width="36" height="36" />
        <rect x="110" y="48" width="6" height="6" fill="#ffffff" />
        <rect x="120" y="48" width="6" height="6" fill="#ffffff" />
        <rect x="130" y="48" width="6" height="6" fill="#ffffff" />
        <rect x="110" y="58" width="6" height="6" fill="#ffffff" />
        <rect x="120" y="58" width="6" height="6" fill="#ffffff" />
        <rect x="130" y="58" width="6" height="6" fill="#ffffff" />
      </svg>
    </div>
  )
}

export default function LoginPage() {
  const [roleMode, setRoleMode] = useState<'STUDENT' | 'ADMIN'>('STUDENT')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login, user, isLoading } = useAuth()
  const navigate                = useNavigate()

  // Redirect if already authenticated once auth state is verified
  useEffect(() => {
    if (!isLoading && user) {
      navigate(user.role === 'ADMIN' ? '/admin' : '/student', { replace: true })
    }
  }, [user, isLoading, navigate])

  const handleRoleChange = (role: 'STUDENT' | 'ADMIN') => {
    setRoleMode(role)
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
      setError(
        err?.response?.data?.message ||
        'Authentication failed. Please verify your institutional ID and password.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0090e7] flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-white">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold tracking-wide">Connecting to FaceAttend Portal...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0090e7] flex items-center justify-center p-3 sm:p-6 md:p-8 relative overflow-hidden font-sans selection:bg-white selection:text-[#0090e7]">
      {/* Decorative Overlapping Circle Corner Motifs */}
      <CornerGeometric position="top-left" />
      <CornerGeometric position="bottom-right" />

      {/* Top Floating Institutional Badge */}
      <header className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/30 shadow-sm">
          <ScanFace className="w-4 h-4 text-white" />
          <span className="hidden sm:inline">Malla Reddy (MR) University • FaceAttend Portal</span>
          <span className="sm:hidden">FaceAttend AI</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] text-white/90 border border-white/20">
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          <span>Biometric System Online</span>
        </div>
      </header>

      {/* Main Dual-Panel Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[960px] bg-white rounded-[28px] sm:rounded-[32px] shadow-[0_24px_70px_rgba(0,35,80,0.32)] overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[560px]"
      >
        {/* ─── LEFT PANEL: FaceAttend & University AI Brand Hero ─── */}
        <div className="relative min-h-[280px] md:min-h-full flex flex-col justify-between p-6 sm:p-8 text-center overflow-hidden bg-slate-900 select-none">
          {/* High-Tech Campus & Biometric Photography Background */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop')`,
            }}
          >
            {/* Deep Rich Azure / Tech Blue Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0090e7]/85 via-[#0266b3]/85 to-[#0b1b36]/90 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070e1e] via-transparent to-black/30" />
          </div>

          {/* Biometric Mesh Overlay Graphics */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Top Brand & Cursive Identity */}
          <div className="relative z-10 pt-4 sm:pt-6 max-w-sm mx-auto">
            {/* University Crest Monogram */}
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-lg">
              <ScanFace className="w-6 h-6 text-white" />
            </div>

            {/* Script Elegance Header */}
            <h2
              className="text-white text-3xl sm:text-4xl md:text-[44px] font-normal tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] font-script"
              style={{ fontFamily: "'Dancing Script', cursive" }}
            >
              FaceAttend Portal
            </h2>

            {/* Inspiring Academic Tagline */}
            <p className="text-white/95 text-[11px] sm:text-xs font-medium mt-2 leading-relaxed max-w-[300px] mx-auto drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
              "Smart biometric intelligence for modern academic excellence — fast, seamless, and automated precision."
            </p>
          </div>

          {/* Bottom Institutional Features Pill Badge */}
          <div className="relative z-10 mt-auto pt-4 flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[11px] text-white font-medium shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SFace v2.1 • Zero-Knowledge Recognition</span>
            </div>
            <p className="text-[10px] text-white/70 font-mono">
              Malla Reddy University • Off Campus Tirupati
            </p>
          </div>
        </div>

        {/* ─── RIGHT PANEL: Authentication Form ─── */}
        <div className="relative bg-white flex flex-col justify-between p-6 sm:p-8 md:p-10 lg:p-12">
          {/* Top-Right Decorative Radar Vector */}
          <BiometricRadarTrail />

          {/* Form Content */}
          <div className="relative z-10 w-full max-w-[340px] mx-auto my-auto">
            {/* Header: Exact reference styling */}
            <div className="text-center mb-5">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0090e7] tracking-tight">
                Welcome
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
                Login with Institutional ID
              </p>
            </div>

            {/* Role Switcher Pill (Student vs Admin) */}
            <div className="bg-slate-100/90 p-1 rounded-xl flex items-center mb-5 border border-slate-200/70">
              <button
                type="button"
                onClick={() => handleRoleChange('STUDENT')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  roleMode === 'STUDENT'
                    ? 'bg-[#0090e7] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('ADMIN')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  roleMode === 'ADMIN'
                    ? 'bg-[#0090e7] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Faculty / Admin</span>
              </button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inputs Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / Roll Input with Notched Outline Label */}
              <div className="relative pt-1.5">
                <span className="absolute -top-1 left-4 px-1.5 bg-white text-[11px] font-semibold text-[#0090e7] z-10 select-none">
                  {roleMode === 'STUDENT' ? 'Email Id / Roll Number' : 'Admin Account Email'}
                </span>
                <div className="relative flex items-center border border-[#0090e7] rounded-xl px-3.5 py-2.5 bg-white focus-within:ring-2 focus-within:ring-[#0090e7]/20 transition-all">
                  <Mail className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
                  <input
                    type="text"
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={roleMode === 'STUDENT' ? 'e.g. 26teu06530@faceattend.local' : 'e.g. admin@faceattend.com'}
                    required
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Password Input with Notched Outline Label */}
              <div className="relative pt-1.5">
                <span className="absolute -top-1 left-4 px-1.5 bg-white text-[11px] font-semibold text-[#0090e7] z-10 select-none">
                  Password
                </span>
                <div className="relative flex items-center border border-[#0090e7] rounded-xl px-3.5 py-2.5 bg-white focus-within:ring-2 focus-within:ring-[#0090e7]/20 transition-all">
                  <Lock className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(s => !s)}
                    className="text-slate-400 hover:text-slate-600 transition-colors ml-1.5 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right pt-0.5">
                <a
                  href="#forgot"
                  onClick={e => {
                    e.preventDefault()
                    setError('Password reset requests are processed by the University IT / Department Office.')
                  }}
                  className="text-[11px] text-slate-400 hover:text-[#0090e7] transition-colors"
                >
                  Forgot your password?
                </a>
              </div>

              {/* Center Action Button: LOGIN */}
              <div className="pt-2 flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto min-w-[160px] px-10 py-3 rounded-xl bg-[#0090e7] hover:bg-[#007ec9] active:scale-95 text-white text-xs sm:text-sm font-bold tracking-wider uppercase shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>LOGIN</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Academic Campus Skyline Silhouette */}
          <CampusSkyline />
        </div>
      </motion.div>
    </div>
  )
}
