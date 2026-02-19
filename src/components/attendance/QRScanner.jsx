/**
 * QR SCANNER + OTP VERIFIER — SIMPLIFIED
 *
 * QR now contains plain JSON: { sessionId, type: 'attendance' }
 * OTP validated directly against Firestore attendance_sessions.otp
 */
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, CheckCircle, XCircle, Loader, Camera, KeyRound, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';
import { markAttendance, markAttendanceViaQR } from '../../firebase/database';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const QRScanner = ({ onSuccess, onFailure }) => {
    const { user } = useAuth();
    const [tab, setTab] = useState('otp');
    const [status, setStatus] = useState('idle'); // idle | scanning | initializing | validating | success | failed
    const [error, setError] = useState(null);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef([]);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const rafRef = useRef(null);
    const streamRef = useRef(null);
    const processingRef = useRef(false); // prevent double-processing a QR

    useEffect(() => { return () => stopCamera(); }, []);

    // ── Camera ────────────────────────────────────────────────────────────────
    const stopCamera = () => {
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
        if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
        if (videoRef.current) videoRef.current.srcObject = null;
        processingRef.current = false;
    };

    const startCamera = async () => {
        setStatus('initializing');
        setError(null);
        processingRef.current = false;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            streamRef.current = stream;
            // Small delay so the video element is in the DOM
            await new Promise(r => setTimeout(r, 150));
            if (!videoRef.current) throw new Error('Camera element not ready');
            videoRef.current.srcObject = stream;
            videoRef.current.setAttribute('playsinline', true);
            await videoRef.current.play().catch(() => { });
            setStatus('scanning');
            rafRef.current = requestAnimationFrame(scanTick);
        } catch (err) {
            setError('Camera denied — use OTP instead.');
            setStatus('failed');
        }
    };

    // QR scan loop — NO React state reads inside (uses refs to avoid stale closures)
    const scanTick = () => {
        if (processingRef.current) return; // already handling a code
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < 2) {
            rafRef.current = requestAnimationFrame(scanTick);
            return;
        }
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
        if (code && code.data) {
            processingRef.current = true;
            stopCamera();
            handleQRData(code.data);
            return;
        }
        rafRef.current = requestAnimationFrame(scanTick);
    };

    // ── QR Handler ────────────────────────────────────────────────────────────
    const handleQRData = async (raw) => {
        setStatus('validating');
        try {
            // Try parsing as JSON first (new format: {sessionId, type})
            let sessionId = null;
            try {
                const parsed = JSON.parse(raw);
                if (parsed.sessionId) sessionId = parsed.sessionId;
            } catch {
                // Might be a plain sessionId string
                sessionId = raw.trim();
            }
            if (!sessionId) throw new Error('QR code does not contain a valid session ID.');

            const res = await markAttendanceViaQR(sessionId, user.uid);
            if (!res.success) throw new Error(res.error || 'Could not mark attendance.');
            setStatus('success');
            onSuccess?.({ method: 'qr', sessionId });
        } catch (err) {
            setStatus('failed');
            setError(err.message);
            onFailure?.(err.message);
        }
    };

    const handleManualQR = (e) => {
        e.preventDefault();
        const val = e.target.qrInput?.value?.trim();
        if (val) { processingRef.current = true; stopCamera(); handleQRData(val); }
    };

    // ── OTP ───────────────────────────────────────────────────────────────────
    const handleOtpChange = (i, val) => {
        const digit = val.replace(/\D/g, '').slice(-1);
        const next = [...otp]; next[i] = digit; setOtp(next);
        if (digit && i < 5) otpRefs.current[i + 1]?.focus();
    };

    const handleOtpKeyDown = (i, e) => {
        if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
        if (e.key === 'ArrowLeft' && i > 0) otpRefs.current[i - 1]?.focus();
        if (e.key === 'ArrowRight' && i < 5) otpRefs.current[i + 1]?.focus();
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) { setOtp(pasted.split('')); otpRefs.current[5]?.focus(); }
    };

    const submitOTP = async () => {
        const entered = otp.join('');
        if (entered.length !== 6) { setError('Enter all 6 digits'); return; }
        setStatus('validating'); setError(null);
        try {
            const q = query(
                collection(db, 'attendance_sessions'),
                where('otp', '==', entered),
                where('isActive', '==', true)
            );
            const snap = await getDocs(q);
            if (snap.empty) throw new Error('Wrong OTP — make sure the faculty session is still active.');

            const sessions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            sessions.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            const session = sessions[0];

            if (session.expiresAt && new Date() > new Date(session.expiresAt))
                throw new Error('Session has expired. Ask faculty to generate a new QR/OTP.');

            const res = await markAttendance(session.id, user.uid);
            if (!res.success) throw new Error(res.error || 'Could not mark attendance.');
            setStatus('success');
            onSuccess?.({ method: 'otp', sessionId: session.id });
        } catch (err) {
            setStatus('failed');
            setError(err.message);
            onFailure?.(err.message);
        }
    };

    const reset = () => {
        setStatus('idle'); setError(null); setOtp(['', '', '', '', '', '']);
        stopCamera();
    };

    // ── Render ────────────────────────────────────────────────────────────────
    const isIdle = status === 'idle' || status === 'failed';

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
            <div className="neomorph rounded-3xl p-8">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-block mb-3">
                        {status === 'idle' && <QrCode size={48} className="text-purple-500" />}
                        {(status === 'initializing') && <Loader size={48} className="text-blue-500 animate-spin" />}
                        {status === 'scanning' && <Camera size={48} className="text-blue-500" />}
                        {status === 'validating' && <Loader size={48} className="text-amber-500 animate-spin" />}
                        {status === 'success' && <CheckCircle size={48} className="text-green-500" />}
                        {status === 'failed' && <XCircle size={48} className="text-red-500" />}
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1">Verify Attendance</h2>
                    <p className="text-slate-500 text-sm">Layer 3: QR Code / OTP</p>
                </div>

                {/* Tab */}
                {isIdle && (
                    <div className="flex bg-slate-100 rounded-2xl p-1 mb-6">
                        {[['otp', KeyRound, 'Enter OTP'], ['qr', QrCode, 'Scan QR']].map(([id, Icon, label]) => (
                            <button key={id} onClick={() => { setTab(id); reset(); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === id ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                <Icon size={16} />{label}
                            </button>
                        ))}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {/* OTP idle */}
                    {tab === 'otp' && status === 'idle' && (
                        <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="bg-slate-50 rounded-xl p-5 text-center mb-5">
                                <KeyRound size={40} className="text-purple-400 mx-auto mb-2" />
                                <p className="text-slate-500 text-sm">Ask faculty for the 6-digit OTP on their screen</p>
                            </div>
                            <div className="flex justify-center gap-2 mb-5" onPaste={handleOtpPaste}>
                                {otp.map((d, i) => (
                                    <input key={i} ref={el => otpRefs.current[i] = el} type="text" inputMode="numeric"
                                        maxLength={1} value={d}
                                        onChange={e => handleOtpChange(i, e.target.value)}
                                        onKeyDown={e => handleOtpKeyDown(i, e)}
                                        className="w-12 h-14 text-center text-2xl font-black border-2 border-slate-200 rounded-xl bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all" />
                                ))}
                            </div>
                            <Button variant="gradient" fullWidth onClick={submitOTP} disabled={otp.join('').length !== 6}>Verify OTP</Button>
                        </motion.div>
                    )}

                    {/* QR idle */}
                    {tab === 'qr' && status === 'idle' && (
                        <motion.div key="qr-idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="bg-slate-50 rounded-xl p-8 text-center mb-4">
                                <QrCode size={56} className="text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 text-sm">Point your camera at the QR code on faculty's screen</p>
                            </div>
                            <Button variant="gradient" fullWidth onClick={startCamera} icon={Camera}>Start QR Scanner</Button>
                            <form onSubmit={handleManualQR} className="mt-4">
                                <div className="text-xs text-slate-400 mb-2 text-center">— or paste session ID —</div>
                                <div className="flex gap-2">
                                    <input name="qrInput" placeholder="Paste session ID here" className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-300" />
                                    <Button type="submit" size="sm">Go</Button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* QR scanning */}
                    {tab === 'qr' && (status === 'scanning' || status === 'initializing') && (
                        <motion.div key="qr-scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="relative bg-slate-900 rounded-xl overflow-hidden mb-4">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-60 object-cover" />
                                <canvas ref={canvasRef} className="hidden" />
                                {/* Viewfinder */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-44 h-44 border-4 border-white/80 rounded-2xl">
                                        <motion.div animate={{ y: [0, 155, 0] }} transition={{ duration: 2, repeat: Infinity }}
                                            className="h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
                                    </div>
                                </div>
                                {status === 'initializing' && (
                                    <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
                                        <div className="text-center text-white">
                                            <Loader className="animate-spin mx-auto mb-2" size={32} />
                                            <p className="text-sm">Starting camera…</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="mb-3 bg-blue-50 rounded-xl p-3 flex gap-2">
                                <AlertCircle className="text-blue-400 shrink-0" size={16} />
                                <p className="text-xs text-blue-600">Hold steady · Good lighting · Point at QR on faculty screen</p>
                            </div>
                            <Button variant="outline" fullWidth onClick={() => { stopCamera(); setStatus('idle'); }}>Cancel</Button>
                        </motion.div>
                    )}

                    {/* Validating */}
                    {status === 'validating' && (
                        <motion.div key="validating" className="flex items-center justify-center gap-2 text-amber-600 py-8">
                            <Loader className="animate-spin" size={20} /><span className="font-semibold">Checking with server…</span>
                        </motion.div>
                    )}

                    {/* Success */}
                    {status === 'success' && (
                        <motion.div key="success" initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            className="bg-green-50 border-2 border-green-500 rounded-xl p-6 text-center">
                            <CheckCircle className="text-green-500 mx-auto mb-3" size={40} />
                            <div className="font-bold text-green-700 text-lg">Attendance Marked! ✅</div>
                            <div className="text-sm text-green-600 mt-1">{tab === 'otp' ? 'OTP accepted' : 'QR scan accepted'}</div>
                        </motion.div>
                    )}

                    {/* Failed */}
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
