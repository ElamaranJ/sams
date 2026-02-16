import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Camera, X, Check, AlertCircle, Loader, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { markAttendanceViaQR } from '../firebase/database';

/**
 * QRScanner — uses jsQR (loaded from CDN) to decode real QR codes from the camera.
 * On success it calls markAttendanceViaQR in Firebase.
 */
const QRScanner = ({ onClose, onScanSuccess }) => {
  const { user } = useAuth();
  const [phase, setPhase]         = useState('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);
  const [cameraError, setCameraError] = useState('');

  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);
  const rafRef     = useRef(null);
  const jsQRRef    = useRef(null);
  const didMark    = useRef(false);

  // Load jsQR from CDN once
  useEffect(() => {
    if (window.jsQR) { jsQRRef.current = window.jsQR; return; }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
    script.onload = () => { jsQRRef.current = window.jsQR; };
    document.head.appendChild(script);
  }, []);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setPhase('starting');
    setCameraError('');
    didMark.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPhase('scanning');
    } catch {
      setCameraError('Camera access denied. Please allow camera permissions and try again.');
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // QR scan loop
  useEffect(() => {
    if (phase !== 'scanning') return;
    const scan = () => {
      if (didMark.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || !jsQRRef.current || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(scan);
        return;
      }
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result  = jsQRRef.current(imgData.data, imgData.width, imgData.height);
      if (result?.data) {
        handleQRData(result.data);
      } else {
        rafRef.current = requestAnimationFrame(scan);
      }
    };
    rafRef.current = requestAnimationFrame(scan);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleQRData = async (raw) => {
    if (didMark.current) return;
    didMark.current = true;
    stopCamera();
    setPhase('processing');
    setStatusMsg('QR detected — verifying session…');

    try {
      let payload;
      try { payload = JSON.parse(raw); } catch {
        setStatusMsg('Invalid QR — not a SAMS attendance QR code.');
        setPhase('error'); return;
      }
      if (!payload?.sessionId) {
        setStatusMsg('QR does not contain a valid session ID.');
        setPhase('error'); return;
      }
      if (!user?.uid) {
        setStatusMsg('You must be logged in to mark attendance.');
        setPhase('error'); return;
      }
      const result = await markAttendanceViaQR(payload.sessionId, user.uid);
      if (result.success) {
        setSuccessInfo({
          studentName: result.studentName,
          className: payload.courseName || result.className || payload.courseCode,
          markedAt: new Date().toLocaleTimeString(),
        });
        setPhase('success');
        setTimeout(() => onScanSuccess?.(payload), 2500);
      } else {
        setStatusMsg(result.error || 'Failed to mark attendance.');
        setPhase('error');
      }
    } catch (err) {
      setStatusMsg('Unexpected error: ' + err.message);
      setPhase('error');
    }
  };

  const retry = () => {
    setSuccessInfo(null);
    setStatusMsg('');
    setCameraError('');
    startCamera();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-900 to-slate-700 text-white p-5">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X size={22} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><QrCode size={26} /></div>
            <div>
              <h2 className="text-xl font-black">Scan Attendance QR</h2>
              <p className="text-slate-300 text-sm">Point your camera at the faculty's QR code</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">

            {(phase === 'starting' || phase === 'scanning') && (
              <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="relative bg-black rounded-2xl overflow-hidden aspect-video mb-4">
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-6 left-6 w-16 h-16 border-t-4 border-l-4 border-blue-400 rounded-tl-xl" />
                    <div className="absolute top-6 right-6 w-16 h-16 border-t-4 border-r-4 border-blue-400 rounded-tr-xl" />
                    <div className="absolute bottom-6 left-6 w-16 h-16 border-b-4 border-l-4 border-blue-400 rounded-bl-xl" />
                    <div className="absolute bottom-6 right-6 w-16 h-16 border-b-4 border-r-4 border-blue-400 rounded-br-xl" />
                  </div>
                  {phase === 'scanning' && (
                    <motion.div
                      animate={{ top: ['8%', '88%'] }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                      className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                      style={{ boxShadow: '0 0 12px rgba(96,165,250,0.9)' }}
                    />
                  )}
                  {phase === 'starting' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <div className="text-center text-white">
                        <Loader className="animate-spin w-10 h-10 mx-auto mb-3" />
                        <p className="font-semibold">Starting camera…</p>
                      </div>
                    </div>
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <div className="bg-blue-50 rounded-xl p-4 text-sm text-slate-700">
                  <p className="font-bold text-blue-800 mb-1 flex items-center gap-1.5"><Shield size={14} /> Tips</p>
                  <ul className="space-y-0.5 text-slate-600">
                    <li>• Hold device steady with good lighting</li>
                    <li>• Keep the full QR code inside the blue corners</li>
                    <li>• Stay 20–40 cm from the screen</li>
                  </ul>
                </div>
              </motion.div>
            )}

            {phase === 'processing' && (
              <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-16 text-center">
                <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
                <p className="text-lg font-black text-slate-900 mb-1">Marking Attendance…</p>
                <p className="text-slate-500 text-sm">{statusMsg}</p>
              </motion.div>
            )}

            {phase === 'success' && (
              <motion.div key="ok" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="py-10 text-center">
                <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.5 }}
                  className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
                  <Check size={44} className="text-white" />
                </motion.div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">Attendance Marked! 🎉</h3>
                {successInfo && (
                  <div className="mt-5 bg-green-50 border-2 border-green-200 rounded-2xl p-5 text-left space-y-2">
                    {[['Student', successInfo.studentName], ['Class', successInfo.className], ['Time', successInfo.markedAt]].map(([label, val]) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-slate-500 font-semibold">{label}</span>
                        <span className="font-black text-slate-900">{val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {phase === 'error' && (
              <motion.div key="err" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="py-10 text-center">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <AlertCircle size={44} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Scan Failed</h3>
                <p className="text-red-600 font-semibold mb-6 px-4">{cameraError || statusMsg}</p>
                <button onClick={retry} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                  Try Again
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QRScanner;