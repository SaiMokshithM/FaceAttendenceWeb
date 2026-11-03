import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

/* ─── Corner Quatrefoil / Floral Ornament SVG ─── */
function QuatrefoilCorner({ position }: { position: 'top-left' | 'bottom-right' }) {
  // A cluster of 4-petal flower rosettes matching the screenshot
  const flowerCenters = [
    { cx: 60, cy: 60 },
    { cx: 180, cy: 60 },
    { cx: 60, cy: 180 },
    { cx: 180, cy: 180 },
    { cx: 120, cy: 120 },
    { cx: 0, cy: 120 },
    { cx: 120, cy: 0 },
  ]

  const isTopLeft = position === 'top-left'

  return (
    <div
      className={`absolute pointer-events-none z-0 ${
        isTopLeft ? '-top-12 -left-12' : '-bottom-12 -right-12'
      }`}
      aria-hidden="true"
    >
      <svg
        width="260"
        height="260"
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-95"
      >
        {flowerCenters.map((c, i) => (
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
            {/* Center diamond star */}
            <circle cx="0" cy="0" r="2.5" fill="#0090e7" />
          </g>
        ))}
      </svg>
    </div>
  )
}

/* ─── Airplane & Curved Flight Path SVG ─── */
function FlightTrail() {
  return (
    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 pointer-events-none z-10">
      <svg
        width="110"
        height="60"
        viewBox="0 0 110 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Curved dashed trajectory */}
        <path
          d="M 12 52 C 45 48, 75 38, 92 16"
          stroke="#0090e7"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          strokeLinecap="round"
        />
        {/* Airplane silhouette icon */}
        <g transform="translate(86, 8) rotate(32)">
          <path
            d="M 10 0 L 14 8 L 24 11 L 14 13 L 13 18 L 10 16 L 8 18 L 8 13 L 0 11 L 8 8 Z"
            fill="#0090e7"
          />
        </g>
      </svg>
    </div>
  )
}

/* ─── Skyline Monuments: Taj Mahal & Leaning Tower / Cathedral ─── */
function SkylineMonuments() {
  return (
    <div className="absolute bottom-0 inset-x-0 h-16 sm:h-20 pointer-events-none overflow-hidden z-0 flex items-end justify-between px-2 sm:px-4">
      {/* Left monument: Taj Mahal silhouette */}
      <svg
        viewBox="0 0 140 85"
        className="w-28 sm:w-36 h-16 sm:h-20 text-[#0090e7] fill-current opacity-90 transition-transform duration-300 hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Base foundation plinth */}
        <rect x="18" y="76" width="104" height="9" />
        <rect x="24" y="70" width="92" height="6" />

        {/* Left Minaret */}
        <rect x="20" y="24" width="4" height="46" />
        <rect x="19" y="36" width="6" height="2" />
        <rect x="19" y="52" width="6" height="2" />
        <path d="M 19 24 L 22 18 L 25 24 Z" />
        <line x1="22" y1="18" x2="22" y2="15" stroke="currentColor" strokeWidth="1" />

        {/* Right Minaret */}
        <rect x="116" y="24" width="4" height="46" />
        <rect x="115" y="36" width="6" height="2" />
        <rect x="115" y="52" width="6" height="2" />
        <path d="M 115 24 L 118 18 L 121 24 Z" />
        <line x1="118" y1="18" x2="118" y2="15" stroke="currentColor" strokeWidth="1" />

        {/* Main Central Tomb Block */}
        <rect x="36" y="44" width="68" height="26" />

        {/* Main Iwan / Central Arch */}
        <path
          d="M 56 70 L 56 54 C 56 47, 84 47, 84 54 L 84 70 Z"
          fill="#ffffff"
        />

        {/* Flanking Side Niches */}
        <rect x="42" y="50" width="7" height="8" rx="2" fill="#ffffff" />
        <rect x="42" y="61" width="7" height="8" rx="2" fill="#ffffff" />
        <rect x="91" y="50" width="7" height="8" rx="2" fill="#ffffff" />
        <rect x="91" y="61" width="7" height="8" rx="2" fill="#ffffff" />

        {/* Left Small Chhatri Dome */}
        <rect x="46" y="34" width="8" height="10" />
        <path d="M 45 34 C 45 28, 55 28, 55 34 Z" />

        {/* Right Small Chhatri Dome */}
        <rect x="86" y="34" width="8" height="10" />
        <path d="M 85 34 C 85 28, 95 28, 95 34 Z" />

        {/* Grand Central Onion Dome */}
        <path
          d="M 58 44 C 55 32, 60 16, 70 8 C 80 16, 85 32, 82 44 Z"
        />
        {/* Dome Crescent & Finial */}
        <line x1="70" y1="8" x2="70" y2="1" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="70" cy="1" r="1" />
      </svg>

      {/* Right monument: Leaning Tower of Pisa + European Cathedral */}
      <svg
        viewBox="0 0 170 85"
        className="w-36 sm:w-44 h-16 sm:h-20 text-[#0090e7] fill-current opacity-90 transition-transform duration-300 hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Base Line */}
        <rect x="0" y="78" width="170" height="7" />

        {/* Leaning Tower of Pisa (tilted ~4 deg left) */}
        <g transform="translate(24, 78) rotate(-5) translate(-24, -78)">
          <rect x="18" y="22" width="18" height="56" rx="1" />
          {/* Gallery tiers & open arches */}
          <line x1="17" y1="30" x2="37" y2="30" stroke="#ffffff" strokeWidth="1.2" />
          <line x1="17" y1="38" x2="37" y2="38" stroke="#ffffff" strokeWidth="1.2" />
          <line x1="17" y1="46" x2="37" y2="46" stroke="#ffffff" strokeWidth="1.2" />
          <line x1="17" y1="54" x2="37" y2="54" stroke="#ffffff" strokeWidth="1.2" />
          <line x1="17" y1="62" x2="37" y2="62" stroke="#ffffff" strokeWidth="1.2" />
          <line x1="17" y1="70" x2="37" y2="70" stroke="#ffffff" strokeWidth="1.2" />
          {/* Top belfry */}
          <rect x="20" y="14" width="14" height="8" />
          <line x1="19" y1="14" x2="35" y2="14" stroke="currentColor" strokeWidth="1.5" />
        </g>

        {/* Cathedral / Notre-Dame facade */}
        <g transform="translate(62, 0)">
          {/* Left Tower */}
          <rect x="16" y="20" width="22" height="58" />
          <rect x="18" y="16" width="18" height="4" />
          {/* Right Tower */}
          <rect x="52" y="20" width="22" height="58" />
          <rect x="54" y="16" width="18" height="4" />

          {/* Central Nave Section */}
          <rect x="38" y="32" width="14" height="46" />
          <polygon points="38,32 45,22 52,32" />

          {/* Rose Window */}
          <circle cx="45" cy="42" r="5" fill="#ffffff" />
          <circle cx="45" cy="42" r="2" fill="currentColor" />

          {/* Belfry Tower Windows */}
          <rect x="22" y="28" width="4" height="14" rx="2" fill="#ffffff" />
          <rect x="28" y="28" width="4" height="14" rx="2" fill="#ffffff" />
          <rect x="58" y="28" width="4" height="14" rx="2" fill="#ffffff" />
          <rect x="64" y="28" width="4" height="14" rx="2" fill="#ffffff" />

          {/* Triple Entry Portals at ground level */}
          <path d="M 22 78 L 22 66 C 22 62, 30 62, 30 66 L 30 78 Z" fill="#ffffff" />
          <path d="M 40 78 L 40 64 C 40 59, 50 59, 50 64 L 50 78 Z" fill="#ffffff" />
          <path d="M 60 78 L 60 66 C 60 62, 68 62, 68 66 L 68 78 Z" fill="#ffffff" />

          {/* Adjacent classical cityscape buildings */}
          <rect x="74" y="46" width="30" height="32" />
          <line x1="74" y1="46" x2="104" y2="46" stroke="currentColor" strokeWidth="2" />
          <rect x="78" y="52" width="5" height="7" fill="#ffffff" />
          <rect x="86" y="52" width="5" height="7" fill="#ffffff" />
          <rect x="94" y="52" width="5" height="7" fill="#ffffff" />
          <rect x="78" y="64" width="5" height="7" fill="#ffffff" />
          <rect x="86" y="64" width="5" height="7" fill="#ffffff" />
          <rect x="94" y="64" width="5" height="7" fill="#ffffff" />
        </g>
      </svg>
    </div>
  )
}

/* ─── Social Login Icons (Google, Facebook, Apple) ─── */
function SocialLoginButtons() {
  return (
    <div className="flex items-center justify-center gap-4 my-2">
      {/* Google */}
      <button
        type="button"
        title="Sign in with Google"
        className="w-14 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center hover:bg-slate-100/90 hover:border-slate-300 transition-all shadow-sm active:scale-95"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.27-2.09 3.675-5.17 3.675-9.15z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.15C3.26 21.36 7.34 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.24c-.25-.72-.39-1.49-.39-2.24s.14-1.52.39-2.24V6.61H1.28C.47 8.24 0 10.06 0 12s.47 3.76 1.28 5.39l3.99-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.28 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
          />
        </svg>
      </button>

      {/* Facebook */}
      <button
        type="button"
        title="Sign in with Facebook"
        className="w-14 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center hover:bg-slate-100/90 hover:border-slate-300 transition-all shadow-sm active:scale-95"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </button>

      {/* Apple */}
      <button
        type="button"
        title="Sign in with Apple"
        className="w-14 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center hover:bg-slate-100/90 hover:border-slate-300 transition-all shadow-sm active:scale-95"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#000000">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.98.6-2.61 1.34-.56.64-1.05 1.71-.92 2.73 1 .08 2.01-.51 2.6-1.22z" />
        </svg>
      </button>
    </div>
  )
}

export default function LoginPage() {
  const [email, setEmail]       = useState('thisuix@mail.com')
  const [password, setPassword] = useState('password123')
  const [showPwd, setShowPwd]   = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showDemoTip, setShowDemoTip] = useState(false)
  const { login, user }         = useAuth()
  const navigate                = useNavigate()

  // Redirect if already authenticated
  if (user) {
    navigate(user.role === 'ADMIN' ? '/admin' : '/student', { replace: true })
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
        'Authentication failed. Please verify your email and password.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Quick fill demo credentials
  const fillCredentials = (role: 'admin' | 'student') => {
    if (role === 'admin') {
      setEmail('admin@faceattend.com')
      setPassword('AdminPassword@2026')
    } else {
      setEmail('26teu06530@faceattend.local')
      setPassword('26TEU06530')
    }
    setError('')
  }

  return (
    <div className="min-h-screen bg-[#0090e7] flex items-center justify-center p-3 sm:p-6 md:p-8 relative overflow-hidden font-sans selection:bg-white selection:text-[#0090e7]">
      {/* Decorative Overlapping Circle Quatrefoil Corners */}
      <QuatrefoilCorner position="top-left" />
      <QuatrefoilCorner position="bottom-right" />

      {/* Top Floating App Banner with Quick Test Switcher */}
      <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium border border-white/30 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">FaceAttend AI Portal</span>
          <span className="sm:hidden">FaceAttend</span>
        </div>

        {/* Quick Demo Fill Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDemoTip(prev => !prev)}
            className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold border border-white/30 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <span>Demo Logins</span>
            <span className="text-[10px] bg-white text-[#0090e7] px-1.5 py-0.2 rounded-full font-bold">2</span>
          </button>

          <AnimatePresence>
            {showDemoTip && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 z-50 text-slate-700"
              >
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  1-Click Auto Fill
                </div>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => { fillCredentials('admin'); setShowDemoTip(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-100 transition-colors"
                  >
                    <div className="text-xs font-bold text-[#0090e7]">Faculty Admin</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">admin@faceattend.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { fillCredentials('student'); setShowDemoTip(false); }}
                    className="w-full text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-colors"
                  >
                    <div className="text-xs font-bold text-slate-800">Student Account</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">26teu06530@faceattend.local</div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Dual-Panel Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[940px] bg-white rounded-[28px] sm:rounded-[32px] shadow-[0_24px_70px_rgba(0,40,90,0.32)] overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[540px]"
      >
        {/* ─── LEFT PANEL: Hero Scenic Wanderlust Image ─── */}
        <div className="relative min-h-[260px] md:min-h-full flex flex-col justify-start items-center p-6 sm:p-8 text-center overflow-hidden bg-slate-900 select-none">
          {/* Scenic Travel Photography Background */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200&auto=format&fit=crop')`,
            }}
          >
            {/* Subtle Gradient & Tint to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-sky-950/40 via-transparent to-black/30" />
          </div>

          {/* Fallback CSS mountain landscape if image is loading or blocked */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1]" />

          {/* Overlay Typography */}
          <div className="relative z-10 pt-4 sm:pt-6 max-w-sm mx-auto">
            <h2
              className="text-white text-3xl sm:text-4xl md:text-[42px] font-normal tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] font-script"
              style={{ fontFamily: "'Dancing Script', cursive" }}
            >
              Travelista Tours
            </h2>
            <p className="text-white/95 text-[11px] sm:text-xs font-medium mt-2 leading-relaxed max-w-[280px] mx-auto drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
              Travel is the only purchase that enriches you in ways beyond material wealth
            </p>
          </div>
        </div>

        {/* ─── RIGHT PANEL: Authentication Form ─── */}
        <div className="relative bg-white flex flex-col justify-between p-6 sm:p-8 md:p-10 lg:p-12">
          {/* Top-Right Airplane Decorative Vector */}
          <FlightTrail />

          {/* Form Content */}
          <div className="relative z-10 w-full max-w-[340px] mx-auto my-auto">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0090e7] tracking-tight">
                Welcome
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
                Login with Email
              </p>
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
              {/* Email / Username Input with Notched Outline Label */}
              <div className="relative pt-1.5">
                {/* Floating Label Badge */}
                <span className="absolute -top-1 left-4 px-1.5 bg-white text-[11px] font-semibold text-[#0090e7] z-10 select-none">
                  Email Id
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
                    placeholder="thisuix@mail.com"
                    required
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Password Input with Notched Outline Label */}
              <div className="relative pt-1.5">
                {/* Floating Label Badge */}
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
                    placeholder="••••••••••••"
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
                    setError('Contact system administrator to reset credentials.')
                  }}
                  className="text-[11px] text-slate-400 hover:text-[#0090e7] transition-colors"
                >
                  Forgot your password?
                </a>
              </div>

              {/* Center Action Button: LOGIN */}
              <div className="pt-1 flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="min-w-[120px] px-8 py-2.5 rounded-lg bg-[#0090e7] hover:bg-[#007ec9] active:scale-95 text-white text-xs sm:text-sm font-bold tracking-wider uppercase shadow-md shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>...</span>
                    </>
                  ) : (
                    <span>LOGIN</span>
                  )}
                </button>
              </div>
            </form>

            {/* OR Divider */}
            <div className="flex items-center justify-center my-4">
              <div className="h-[1px] bg-slate-200 flex-1 max-w-[60px]" />
              <span className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                OR
              </span>
              <div className="h-[1px] bg-slate-200 flex-1 max-w-[60px]" />
            </div>

            {/* Social Logins */}
            <SocialLoginButtons />

            {/* Don't have account? Register Now */}
            <div className="text-center mt-3 text-xs text-slate-400">
              <span>Don't have account? </span>
              <button
                type="button"
                onClick={() => {
                  setError('Registration is managed by Department Office or Administrator.')
                }}
                className="text-slate-800 font-bold hover:underline hover:text-[#0090e7] transition-colors"
              >
                Register Now
              </button>
            </div>
          </div>

          {/* Bottom Skyline Silhouette Illustration */}
          <SkylineMonuments />
        </div>
      </motion.div>
    </div>
  )
}
