/**
 * QR SCANNER COMPONENT — FIXED VERSION
 * Layer 3: QR Code / OTP Verification
 *
 * FIX 1 — OTP: Faculty stores a random OTP in Firestore (attendance_sessions.otp).
 *   Student must fetch & compare from Firestore — NOT use a hash algorithm.
 *
 * FIX 2 — QR: Decrypt using the same key faculty used ('demo-secret-key'),
 *   then look up the sessionId in Firestore and call markAttendanceViaQR.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, CheckCircle, XCircle, Loader, Camera, KeyRound, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';
import { validateQRPayload } from '../../utils/qrGenerator';
import { markAttendance, markAttendanceViaQR } from '../../firebase/database';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

// Must match the key used in AttendanceGenerate.jsx
const QR_SECRET_KEY = import.meta.env.VITE_QR_SECRET_KEY || 'demo-secret-key';

const QRScanner = ({ onSuccess, onFailure }) => {
    const { user } = useAuth();
    const [tab, setTab] = useState('otp'); // default to OTP since it's simpler
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);

    // OTP state
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef([]);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const requestRef = useRef(null);
    const streamRef = useRef(null);

    // ── Cleanup on unmount ────────────────────────────────────────────────────
    useEffect(() => {
        return () => stopCamera();
    }, []);

    // ── Camera helpers ────────────────────────────────────────────────────────
    const stopCamera = () => {
        if (requestRef.current) { cancelAnimationFrame(requestRef.current); requestRef.current = null; }
        if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
        if (videoRef.current) videoRef.current.srcObject = null;
    };

    const startCamera = async () => {
        try {
            setStatus('initializing');
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            streamRef.current = stream;

            setTimeout(() => {
                if (!videoRef.current) {
                    setError('Camera failed to initialize. Try again.');
                    setStatus('failed');
                    return;
                }
                videoRef.current.srcObject = stream;
                videoRef.current.setAttribute('playsinline', true);
                const p = videoRef.current.play();
                if (p !== undefined) p.catch(e => console.warn('Autoplay blocked:', e));
                videoRef.current.onloadedmetadata = () => {
                    setStatus('scanning');
                    requestRef.current = requestAnimationFrame(scanTick);
                };
            }, 100);
        } catch (err) {
            setError('Camera access denied — please use OTP instead.');
            setStatus('failed');
        }
    };

    // ── QR Frame Scan Loop ────────────────────────────────────────────────────
    const scanTick = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
            if (code) { handleQRDetected(code.data); return; }
        }
        requestRef.current = requestAnimationFrame(scanTick);
    };

    // ── QR Validation (Firestore) ─────────────────────────────────────────────
    const handleQRDetected = async (qrData) => {
        stopCamera();
        setStatus('validating');
        try {
            // Step 1: Decrypt payload
            const result = validateQRPayload(qrData, QR_SECRET_KEY);
            if (!result.valid) throw new Error(result.error || 'Invalid or expired QR code.');

            const { sessionId } = result.payload;
            if (!sessionId) throw new Error('QR code is missing session information.');

            // Step 2: Mark attendance in Firestore
            const res = await markAttendanceViaQR(sessionId, user.uid);
            if (!res.success) throw new Error(res.error || 'Could not mark attendance.');

            setStatus('success');
            onSuccess?.({ method: 'qr', sessionId, ...result.payload });
        } catch (err) {
            setStatus('failed');
            setError(err.message);
            onFailure?.(err.message);
        }
    };

    // ── Manual QR paste ───────────────────────────────────────────────────────
    const handleManualQR = (e) => {
        e.preventDefault();
        const val = e.target.qrInput?.value?.trim();
        if (val) handleQRDetected(val);
    };

    // ── OTP handlers ──────────────────────────────────────────────────────────
    const handleOtpChange = (index, value) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
        if (digit && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
        if (e.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus();
        if (e.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) { setOtp(pasted.split('')); otpRefs.current[5]?.focus(); }
    };

    // ── OTP Submit — validate against Firestore ───────────────────────────────
    const submitOTP = async () => {
        const entered = otp.join('');
        if (entered.length !== 6) { setError('Enter all 6 digits'); return; }

        setStatus('validating');
        setError(null);

        try {
            // Find an active session with this exact OTP
            const q = query(
                collection(db, 'attendance_sessions'),
                where('otp', '==', entered),
                where('isActive', '==', true)
            );
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                throw new Error('Incorrect OTP or session has expired. Ask faculty for the current code.');
            }

            // Pick the most recent session (in case multiple active sessions somehow)
            const sessions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            sessions.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            const session = sessions[0];

            // Check expiry
            if (session.expiresAt && new Date() > new Date(session.expiresAt)) {
                throw new Error('This session has expired. Ask faculty to generate a new QR/OTP.');
            }

            // Mark attendance in Firestore
            const res = await markAttendance(session.id, user.uid);
            if (!res.success) throw new Error(res.error || 'Could not mark attendance.');

            setStatus('success');
            onSuccess?.({ method: 'otp', sessionId: session.id, enteredOtp: entered });
        } catch (err) {
            setStatus('failed');
            setError(err.message);
            onFailure?.(err.message);
        }
    };

    const reset = () => {
        setStatus('idle');
        setError(null);
        setOtp(['', '', '', '', '', '']);
        stopCamera();
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
            <div className="neomorph rounded-3xl p-8">

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-block mb-4">
                        {status === 'idle' && <QrCode size={48} className="text-purple-500" />}
                        {status === 'initializing' && <Loader size={48} className="text-blue-500 animate-spin" />}
                        {status === 'scanning' && <Camera size={48} className="text-blue-500" />}
                        {status === 'validating' && <Loader size={48} className="text-amber-500 animate-spin" />}
                        {status === 'success' && <CheckCircle size={48} className="text-green-500" />}
                        {status === 'failed' && <XCircle size={48} className="text-red-500" />}
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1">Verify Attendance</h2>
                    <p className="text-slate-500 text-sm">Layer 3: QR Code / OTP</p>
                </div>

                {/* Tab switcher */}
                {(status === 'idle' || status === 'failed') && (
                    <div className="flex bg-slate-100 rounded-2xl p-1 mb-6">
                        <button onClick={() => { setTab('otp'); reset(); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'otp' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <KeyRound size={16} /> Enter OTP
                        </button>
                        <button onClick={() => { setTab('qr'); reset(); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'qr' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <QrCode size={16} /> Scan QR
                        </button>
                    </div>
                )}

                <AnimatePresence mode="wait">

                    {/* ── OTP Tab ── */}
                    {tab === 'otp' && status === 'idle' && (
                        <motion.div key="otp-idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="bg-slate-50 rounded-xl p-5 text-center mb-5">
                                <KeyRound size={40} className="text-purple-400 mx-auto mb-2" />
                                <p className="text-slate-500 text-sm">Ask your faculty for the 6-digit OTP shown on their screen</p>
                            </div>
                            <div className="flex justify-center gap-2 mb-5" onPaste={handleOtpPaste}>
                                {otp.map((digit, i) => (
                                    <input key={i} ref={el => otpRefs.current[i] = el}
                                        type="text" inputMode="numeric" maxLength={1} value={digit}
                                        onChange={e => handleOtpChange(i, e.target.value)}
                                        onKeyDown={e => handleOtpKeyDown(i, e)}
                                        className="w-12 h-14 text-center text-2xl font-black border-2 border-slate-200 rounded-xl bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                                    />
                                ))}
                            </div>
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center text-sm text-red-600 mb-4">{error}</div>
                            )}
                            <Button variant="gradient" fullWidth onClick={submitOTP} disabled={otp.join('').length !== 6}>
                                Verify OTP
                            </Button>
                        </motion.div>
                    )}

                    {/* ── QR Tab: Idle ── */}
                    {tab === 'qr' && status === 'idle' && (
                        <motion.div key="qr-idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="bg-slate-50 rounded-xl p-8 text-center mb-4">
                                <QrCode size={56} className="text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 text-sm">Point your camera at the QR code shown by your faculty</p>
                            </div>
                            <Button variant="gradient" fullWidth onClick={startCamera} icon={Camera}>
                                Start QR Scanner
                            </Button>
                            <form onSubmit={handleManualQR} className="mt-4">
                                <div className="text-xs text-slate-400 mb-2 text-center">— or paste encrypted QR data —</div>
                                <div className="flex gap-2">
                                    <input type="text" name="qrInput" placeholder="Paste QR data here"
                                        className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-300" />
                                    <Button type="submit" size="sm">Go</Button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* ── QR Tab: Scanning ── */}
                    {tab === 'qr' && (status === 'scanning' || status === 'initializing') && (
                        <motion.div key="qr-scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="relative bg-slate-900 rounded-xl overflow-hidden mb-4">
                                <video ref={videoRef} autoPlay playsInline className="w-full h-60 object-cover" />
                                <canvas ref={canvasRef} className="hidden" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-44 h-44 border-4 border-white/80 rounded-2xl overflow-hidden">
                                        <motion.div animate={{ y: [0, 160, 0] }} transition={{ duration: 2, repeat: Infinity }}
                                            className="h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
                                    </div>
                                </div>
                                {status === 'initializing' && (
                                    <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
                                        <div className="text-center text-white">
                                            <Loader className="animate-spin mx-auto mb-2" size={32} />
                                            <p className="text-sm">Starting camera...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <Button variant="outline" fullWidth onClick={() => { stopCamera(); setStatus('idle'); }}>Cancel</Button>
                            <div className="mt-3 bg-blue-50 rounded-xl p-3 flex gap-2">
                                <AlertCircle className="text-blue-400 shrink-0" size={16} />
                                <p className="text-xs text-blue-600">Hold steady · Good lighting · QR valid for session duration</p>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Validating ── */}
                    {status === 'validating' && (
                        <motion.div key="validating" className="flex items-center justify-center gap-2 text-amber-600 py-8">
                            <Loader className="animate-spin" size={20} />
                            <span className="font-semibold">Verifying with server...</span>
                        </motion.div>
                    )}

                    {/* ── Success ── */}
                    {status === 'success' && (
                        <motion.div key="success" initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            className="bg-green-50 border-2 border-green-500 rounded-xl p-6 text-center">
                            <CheckCircle className="text-green-500 mx-auto mb-3" size={40} />
                            <div className="font-bold text-green-700 text-lg">Verified! ✅</div>
                            <div className="text-sm text-green-600 mt-1">
                                {tab === 'otp' ? 'OTP accepted' : 'QR code accepted'}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Failed ── */}
                    {status === 'failed' && (
                        <motion.div key="failed" initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-3">
                            <div className="bg-red-50 border-2 border-red-500 rounded-xl p-5 text-center">
                                <XCircle className="text-red-500 mx-auto mb-2" size={36} />
                                <div className="font-bold text-red-700">Verification Failed</div>
                                <div className="text-sm text-red-600 mt-1">{error}</div>
                            </div>
                            <Button variant="gradient" fullWidth onClick={reset}>Try Again</Button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default QRScanner;
