/**
 * QR SCANNER COMPONENT
 * Layer 3: QR Code / OTP Verification
 *
 * Two modes:
 *  1. QR Scan — camera scans faculty's rotating QR code
 *  2. Enter OTP — student types the 6-digit OTP shown by faculty
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, CheckCircle, XCircle, Loader, Camera, KeyRound, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';
import { validateQRPayload, validateSessionOTP } from '../../utils/qrGenerator';
import Button from '../ui/Button';

const QRScanner = ({ secretKey, onSuccess, onFailure, sessionId = 'default-session' }) => {
    const [tab, setTab] = useState('qr');   // 'qr' | 'otp'
    const [status, setStatus] = useState('idle');  // idle | scanning | validating | success | failed
    const [error, setError] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);

    // OTP state
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef([]);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const requestRef = useRef(null);

    // ── Camera ──────────────────────────────────────────────────────────────
    // ── Camera ──────────────────────────────────────────────────────────────
    const startCamera = async () => {
        try {
            setStatus('initializing'); // Show loader/video placeholder
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });

            // Wait a tick for render if needed, but since we set status, we need the video to be there.
            // We'll update render logic to show video when initializing.

            // Use a small timeout to ensure ref is populated if we just switched status
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.setAttribute("playsinline", true);

                    const playPromise = videoRef.current.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.error("Auto-play prevented:", error);
                        });
                    }

                    videoRef.current.onloadedmetadata = () => {
                        setCameraActive(true);
                        setStatus('scanning');
                        requestRef.current = requestAnimationFrame(scanTick);
                    };
                } else {
                    // Retry once if ref was missing
                    console.warn("Video ref missing, retrying...");
                }
            }, 100);

        } catch (err) {
            console.error("Camera error:", err);
            setError('Camera access denied. Use OTP option instead.');
            setStatus('failed');
        }
    };

    // ... stopCamera ...

    // ... scanTick ...

    // ── QR Validation ────────────────────────────────────────────────────────
    const handleQRDetected = async (qrData) => {
        stopCamera();
        setStatus('validating');

        try {
            // Decrypt and validate locally first
            const result = validateQRPayload(qrData, secretKey);

            if (result.valid) {
                // Await parent validation (Firestore check)
                if (onSuccess) {
                    await onSuccess({
                        method: 'qr',
                        sessionId: result.payload.sessionId, // This might be null if using older format?
                        ...result.payload
                    });
                    setStatus('success');
                }
            } else {
                throw new Error(result.error || 'Invalid QR Code');
            }
        } catch (err) {
            setStatus('failed');
            setError(err.message || 'Invalid QR Code');
            onFailure?.(err.message);
        }
    };

    // ... 

    const submitOTP = async () => {
        const entered = otp.join('');
        if (entered.length !== 6) { setError('Enter all 6 digits'); return; }

        setStatus('validating');
        setError(null);

        try {
            if (onSuccess) {
                // Await parent validation (Firestore check)
                await onSuccess({ method: 'otp', enteredOtp: entered });
                setStatus('success');
            }
        } catch (err) {
            setStatus('failed');
            setError(err.message || 'OTP verification failed'); // Show actual error from parent
            onFailure?.(err.message);
        }
    };

    const reset = () => {
        setStatus('idle');
        setError(null);
        setOtp(['', '', '', '', '', '']);
        stopCamera();
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
            <div className="neomorph rounded-3xl p-8">

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-block mb-4">
                        {status === 'idle' && <QrCode size={48} className="text-purple-500" />}
                        {status === 'scanning' && <Camera size={48} className="text-blue-500" />}
                        {status === 'validating' && <Loader size={48} className="text-amber-500 animate-spin" />}
                        {status === 'success' && <CheckCircle size={48} className="text-green-500" />}
                        {status === 'failed' && <XCircle size={48} className="text-red-500" />}
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1">Verify Attendance</h2>
                    <p className="text-slate-500 text-sm">Layer 3: QR Code / OTP</p>
                </div>

                {/* Tab switcher — only show when idle or failed */}
                {(status === 'idle' || status === 'failed') && (
                    <div className="flex bg-slate-100 rounded-2xl p-1 mb-6">
                        <button
                            onClick={() => { setTab('qr'); reset(); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'qr'
                                ? 'bg-white text-purple-700 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <QrCode size={16} /> Scan QR
                        </button>
                        <button
                            onClick={() => { setTab('otp'); reset(); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'otp'
                                ? 'bg-white text-purple-700 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <KeyRound size={16} /> Enter OTP
                        </button>
                    </div>
                )}

                <AnimatePresence mode="wait">

                    {/* ── QR Tab ── */}
                    {tab === 'qr' && status === 'idle' && (
                        <motion.div key="qr-idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="bg-slate-50 rounded-xl p-8 text-center mb-4">
                                <QrCode size={56} className="text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 text-sm">Point your camera at the QR code shown by your faculty</p>
                            </div>
                            <Button variant="gradient" fullWidth onClick={startCamera} icon={Camera}>
                                Start QR Scanner
                            </Button>

                            {/* Manual input for testing */}
                            <form onSubmit={handleManualQR} className="mt-4">
                                <div className="text-xs text-slate-400 mb-2 text-center">— or paste encrypted QR data —</div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="qrInput"
                                        placeholder="Paste QR data here"
                                        className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
                                    />
                                    <Button type="submit" size="sm">Go</Button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {tab === 'qr' && (status === 'scanning' || status === 'initializing') && (
                        <motion.div key="qr-scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="relative bg-slate-900 rounded-xl overflow-hidden mb-4">
                                <video ref={videoRef} autoPlay playsInline className="w-full h-60 object-cover" />
                                <canvas ref={canvasRef} className="hidden" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-44 h-44 border-4 border-white/80 rounded-2xl">
                                        <motion.div
                                            animate={{ y: [0, 160, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" fullWidth onClick={() => { stopCamera(); setStatus('idle'); }}>
                                Cancel
                            </Button>
                            <div className="mt-3 bg-blue-50 rounded-xl p-3 flex gap-2">
                                <AlertCircle className="text-blue-400 shrink-0" size={16} />
                                <p className="text-xs text-blue-600">Hold steady · Good lighting · QR expires every 10s</p>
                            </div>
                        </motion.div>
                    )}

                    {/* ── OTP Tab ── */}
                    {tab === 'otp' && status === 'idle' && (
                        <motion.div key="otp-idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="bg-slate-50 rounded-xl p-5 text-center mb-5">
                                <KeyRound size={40} className="text-purple-400 mx-auto mb-2" />
                                <p className="text-slate-500 text-sm">Ask your faculty for the 6-digit OTP shown on their screen</p>
                            </div>

                            {/* 6-digit OTP boxes */}
                            <div className="flex justify-center gap-2 mb-5" onPaste={handleOtpPaste}>
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={el => otpRefs.current[i] = el}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={e => handleOtpChange(i, e.target.value)}
                                        onKeyDown={e => handleOtpKeyDown(i, e)}
                                        className="w-12 h-14 text-center text-2xl font-black border-2 border-slate-200 rounded-xl bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                                    />
                                ))}
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center text-sm text-red-600 mb-4">
                                    {error}
                                </div>
                            )}

                            <Button
                                variant="gradient"
                                fullWidth
                                onClick={submitOTP}
                                disabled={otp.join('').length !== 6}
                            >
                                Verify OTP
                            </Button>
                        </motion.div>
                    )}

                    {/* ── Validating ── */}
                    {status === 'validating' && (
                        <motion.div key="validating" className="flex items-center justify-center gap-2 text-amber-600 py-8">
                            <Loader className="animate-spin" size={20} />
                            <span className="font-semibold">Verifying...</span>
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
