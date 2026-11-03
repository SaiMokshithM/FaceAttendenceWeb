import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, CheckCircle2, XCircle, AlertTriangle, Sparkles, Sliders, ShieldCheck, RefreshCw } from 'lucide-react'
import api from '../../services/api'

interface TopMatch {
  rollNumber: string
  fullName: string
  similarity: number
}

interface ScanResponse {
  match: boolean
  status: 'MATCH' | 'UNKNOWN_PERSON' | 'IDENTITY_MISMATCH' | 'NO_FACE_DETECTED'
  identity: string
  message: string
  similarity: number
  threshold: number
  attendanceRecorded?: boolean
  topMatches?: TopMatch[]
  student?: {
    id: string
    rollNumber: string
    fullName: string
  }
  attendance?: {
    id: string
    status: string
    checkInTime: string
    similarityScore: string
  }
  period?: {
    periodNumber: number
    periodName: string
    subjectCode: string
    subjectName: string
    faculty: string
    timing: string
  }
}

interface ActivePeriod {
  active: boolean
  periodNumber?: number
  periodName?: string
  subjectCode?: string
  subjectName?: string
  faculty?: string
  startTime?: string
  endTime?: string
  message?: string
}

export default function VerifyPage() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeSlot, setActiveSlot] = useState<ActivePeriod | null>(null)
  const [threshold, setThreshold] = useState<number>(0.50)
  const [kioskMode, setKioskMode] = useState<boolean>(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Fetch current period from backend
  useEffect(() => {
    api.get('/attendance/current-period')
      .then(res => setActiveSlot(res.data))
      .catch(() => {})
  }, [])

  // Start webcam
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      })
      setStream(mediaStream)
      setCameraActive(true)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play().catch(e => console.warn('Video play error:', e))
      }
    } catch (err: any) {
      console.warn('Camera error:', err)
      setCameraError('Camera access unavailable. Please grant camera permission.')
      setCameraActive(false)
    }
  }, [])

  // Stop webcam
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setCameraActive(false)
  }, [stream])

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  // Ensure video element always binds active stream
  useEffect(() => {
    if (videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream
      }
      videoRef.current.play().catch(() => {})
    }
  }, [stream, result])

  // Capture frame & verify live camera image
  const captureAndVerify = async () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)

    await processFaceImage(dataUrl)
  }

  const processFaceImage = async (base64Image: string) => {
    setScanning(true)
    setError(null)
    setResult(null)

    try {
      const endpoint = kioskMode ? '/attendance/verify-kiosk' : '/attendance/scan-face'
      const res = await api.post(endpoint, {
        image: base64Image,
        threshold: threshold
      })
      setResult(res.data)
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.response?.data?.message || 'Face verification service error. Check connection.')
    } finally {
      setScanning(false)
    }
  }

  // Fast test with an unknown noise image to verify rejection
  const testUnknownPerson = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 320
    canvas.height = 320
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const imgData = ctx.createImageData(320, 320)
      for (let i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] = Math.floor(Math.random() * 255)
        imgData.data[i + 1] = Math.floor(Math.random() * 255)
        imgData.data[i + 2] = Math.floor(Math.random() * 255)
        imgData.data[i + 3] = 255
      }
      ctx.putImageData(imgData, 0, 0)
      processFaceImage(canvas.toDataURL('image/jpeg'))
    }
  }

  // Instant Reset: dismisses overlay and guarantees continuous video playback
  const resetScan = () => {
    setResult(null)
    setError(null)
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(() => {})
    } else {
      startCamera()
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-4 py-2">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" /> 32 Enrolled Biometric Profiles Loaded
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600" /> Biometric Face Verification
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Deep learning SFace embeddings comparison with cosine similarity thresholding
        </p>
      </div>

      {/* Active Period & Class Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center justify-between text-xs text-blue-200 uppercase tracking-wider mb-1">
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-ping" />
            Classroom CSM - Section F
          </span>
          <span>{activeSlot?.startTime || '09:20'} - {activeSlot?.endTime || '15:40'}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="text-lg font-bold text-white">
              {activeSlot?.subjectName || 'Current Lecture'}
            </p>
            <p className="text-xs text-blue-200 mt-0.5">
              Period {activeSlot?.periodNumber || 1} • Faculty: {activeSlot?.faculty || 'Faculty in Charge'}
            </p>
          </div>
          <span className="px-3 py-1 bg-blue-700/60 border border-blue-400/30 rounded-xl text-xs font-mono font-semibold">
            {activeSlot?.subjectCode || 'TECH001'}
          </span>
        </div>
      </div>

      {/* Threshold & Mode Controls Bar */}
      <div className="bg-white rounded-2xl p-3 border border-gray-200 shadow-sm flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-gray-500" />
          <span className="font-semibold text-gray-700">Threshold:</span>
          <span className="px-2 py-0.5 bg-gray-100 rounded-md font-mono font-bold text-blue-600">
            {(threshold * 100).toFixed(0)}%
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.30"
            max="0.80"
            step="0.05"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-24 accent-blue-600 cursor-pointer"
          />
          <button
            onClick={() => setKioskMode(!kioskMode)}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              kioskMode ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {kioskMode ? 'Kiosk Mode' : 'Student Mode'}
          </button>
        </div>
      </div>

      {/* Camera Viewport (Video is ALWAYS kept mounted in DOM to prevent freeze/reload) */}
      <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800 aspect-[4/3] flex items-center justify-center">
        {/* Persistent Video Stream */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover mirror ${cameraActive ? 'block' : 'hidden'}`}
        />

        {/* Fallback when camera is off */}
        {!cameraActive && (
          <div className="text-center p-6 text-gray-400 space-y-3 z-0">
            <Camera className="w-12 h-12 mx-auto text-gray-600" />
            <p className="text-sm">{cameraError || 'Camera stopped'}</p>
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
            >
              Start Camera
            </button>
          </div>
        )}

        {/* Face Boundary Guide (Visible when camera is active and no result is overlaying) */}
        {cameraActive && !result && (
          <>
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
              <div className="w-56 h-72 border-2 border-dashed border-cyan-400/80 rounded-[50%] shadow-[0_0_30px_rgba(6,182,212,0.3)] relative">
                {scanning && (
                  <motion.div
                    initial={{ top: '5%' }}
                    animate={{ top: '90%' }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee]"
                  />
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none z-10">
              <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-cyan-300 text-xs font-semibold rounded-full border border-cyan-500/30">
                LIVE CAMERA FEED
              </span>
              <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-gray-300 text-xs font-mono rounded-full border border-gray-700">
                SFace 128-D
              </span>
            </div>
          </>
        )}

        {/* Result Overlay Layer (Animated Over Video - Never Destroys Stream) */}
        <AnimatePresence>
          {result?.match && (
            /* ======================================================== */
            /* MATCH: REGISTERED PERSON FOUND                          */
            /* ======================================================== */
            <motion.div
              key="match-overlay"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-gradient-to-br from-emerald-950/95 via-teal-900/95 to-emerald-900/95 backdrop-blur-md p-6 flex flex-col justify-between text-white text-center z-20"
            >
              <div className="flex justify-center mt-2">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.5)]">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 font-bold text-xs uppercase tracking-widest rounded-full mb-1">
                  MATCH: REGISTERED PERSON
                </span>
                <h2 className="text-xl font-black text-white">{result.student?.fullName || result.identity}</h2>
                <p className="font-mono text-emerald-200 text-sm mt-0.5">{result.student?.rollNumber}</p>
              </div>

              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 border border-emerald-500/20 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-emerald-300">Biometric Match</span>
                  <span className="font-bold text-cyan-300">{result.similarity}% (Threshold: {result.threshold}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-300">Attendance Status</span>
                  <span className="font-bold text-emerald-400">RECORDED (PRESENT)</span>
                </div>
                {result.attendance?.checkInTime && (
                  <div className="flex justify-between">
                    <span className="text-emerald-300">Check-in Time</span>
                    <span className="font-semibold text-white">{result.attendance.checkInTime}</span>
                  </div>
                )}
                {result.period && (
                  <div className="flex justify-between">
                    <span className="text-emerald-300">Subject</span>
                    <span className="font-semibold text-white">{result.period.subjectName} (P{result.period.periodNumber})</span>
                  </div>
                )}
              </div>

              <button
                onClick={resetScan}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Verify Next Person / Scan Again
              </button>
            </motion.div>
          )}

          {result && !result.match && (
            /* ======================================================== */
            /* NO MATCH: UNKNOWN PERSON OR MISMATCH                     */
            /* ======================================================== */
            <motion.div
              key="no-match-overlay"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-gradient-to-br from-red-950/95 via-rose-900/95 to-red-900/95 backdrop-blur-md p-6 flex flex-col justify-between text-white text-center z-20"
            >
              <div className="flex justify-center mt-2">
                <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center shadow-[0_0_30px_rgba(248,113,113,0.5)]">
                  <XCircle className="w-10 h-10 text-red-400" />
                </div>
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-red-500/30 border border-red-400/40 text-red-300 font-bold text-xs uppercase tracking-widest rounded-full mb-1">
                  NO MATCH: {result.status === 'IDENTITY_MISMATCH' ? 'IDENTITY MISMATCH' : 'UNKNOWN PERSON'}
                </span>
                <h2 className="text-xl font-black text-white">{result.identity}</h2>
                <p className="text-red-200 text-xs mt-1 max-w-sm mx-auto">{result.message}</p>
              </div>

              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 border border-red-500/20 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-red-300">Similarity Score</span>
                  <span className="font-bold text-red-200">{result.similarity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-300">Required Threshold</span>
                  <span className="font-bold text-white">{result.threshold}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-300">Attendance Status</span>
                  <span className="font-bold text-red-400">REJECTED (NOT MARKED)</span>
                </div>
              </div>

              <button
                onClick={resetScan}
                className="py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Try Again (Return to Camera)
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scanning Spinner Overlay */}
        {scanning && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center text-white z-30">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-semibold tracking-wide text-cyan-200">Comparing face against 32 registered profiles...</p>
          </div>
        )}
      </div>

      {/* Hidden canvas for snapshot capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Error alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-3"
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-500" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Scan Action Controls (Live Camera Only - Upload Option Removed) */}
      <div className="space-y-2">
        <button
          onClick={captureAndVerify}
          disabled={scanning || !cameraActive}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2.5 transition active:scale-[0.98] text-sm"
        >
          <Camera className="w-5 h-5" />
          {scanning ? 'Analyzing Face...' : result ? 'Scan Face Again' : 'Scan Live Face & Verify'}
        </button>

        {/* Quick Demo Simulator Buttons */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Quick Verification Demo:</span>
          <button
            onClick={testUnknownPerson}
            className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium transition"
          >
            Test Unknown Person Rejection
          </button>
        </div>
      </div>
    </div>
  )
}
