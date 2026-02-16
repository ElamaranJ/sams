import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, X, Check, AlertCircle, Loader, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { markAttendanceViaQR } from '../firebase/database';

const QRScanner = ({ onClose, onScanSuccess }) => {
  const { user } = useAuth();
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  const [phase, setPhase] = useState('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [isMirrored, setIsMirrored] = useState(false); // To handle laptop mirroring

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const jsQRRef = useRef(null);
  const didMark = useRef(false);

  // 1. Load jsQR
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
      // Laptop webcams work best with specific resolution constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
            facingMode: 'user', 
            width: { ideal: 1280 }, 
            height: { ideal: 720 } 
        }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(e => console.error(e));
          setPhase('scanning');
        };
      }
    } catch (err) {
      console.error(err);
      setCameraError('Camera not found or permission denied.');
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // 2. The Scanning Loop (Now with VISUAL DEBUGGING)
  useEffect(() => {
    if (phase !== 'scanning') return;

    const scan = () => {
      if (didMark.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || !jsQRRef.current) {
        rafRef.current = requestAnimationFrame(scan);
        return;
      }

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Try to find QR
        const code = jsQRRef.current(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          // --- VISUAL DEBUGGING: DRAW RED BOX AROUND DETECTED QR ---
          const color = "#FF3B58";
          ctx.beginPath();
          ctx.lineWidth = 5;
          ctx.strokeStyle = color;
          ctx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
          ctx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
          ctx.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
          ctx.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
          ctx.lineTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
          ctx.stroke();
          // -------------------------------------------------------

          // If we found a code, process it
          if (code.data) {
             handleQRData(code.data);
             return; // Stop scanning loop
          }
        }
      }
      rafRef.current = requestAnimationFrame(scan);
    };

    rafRef.current = requestAnimationFrame(scan);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [phase]);

  const handleQRData = async (raw) => {
    if (didMark.current) return;
    didMark.current = true;
    
    // Don't stop camera immediately so user sees the red box!
    // stopCamera(); 
    
    setPhase('processing');
    setStatusMsg('Processing QR...');

    try {
      let payload;
      try { payload = JSON.parse(raw); } catch {
        setStatusMsg('Invalid QR Format (Not JSON)');
        setPhase('error'); return;
      }

      if (!payload?.sessionId) {
        setStatusMsg('QR missing Session ID');
        setPhase('error'); return;
      }

      const result = await markAttendanceViaQR(payload.sessionId, userRef.current.uid);

      if (result.success) {
        setSuccessInfo({
          studentName: result.studentName || 'Student',
          className: payload.courseName || result.className,
          markedAt: new Date().toLocaleTimeString(),
        });
        setPhase('success');
        stopCamera(); // Now stop it
        setTimeout(() => {
            if (onScanSuccess) onScanSuccess(payload);
            else onClose();
        }, 2500);
      } else {
        setStatusMsg(result.error || 'Failed to mark.');
        setPhase('error');
      }
    } catch (err) {
      setStatusMsg('Error: ' + err.message);
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
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="relative bg-slate-900 text-white p-5 flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2"><QrCode /> Scan QR</h2>
            <button onClick={onClose}><X /></button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {phase === 'error' && (
              <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle size={32} /></div>
                <h3 className="font-bold text-lg mb-2">Scan Failed</h3>
                <p className="text-red-600 mb-4">{statusMsg || cameraError}</p>
                <button onClick={retry} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Try Again</button>
              </motion.div>
            )}

            {(phase === 'starting' || phase === 'scanning' || phase === 'processing') && (
              <motion.div key="cam" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="relative bg-black rounded-xl overflow-hidden aspect-video mb-4">
                  {/* The Video Element (Hidden but active) */}
                  <video 
                    ref={videoRef} 
                    className="absolute inset-0 w-full h-full object-cover" 
                    style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }} 
                    playsInline muted 
                  />
                  
                  {/* The Canvas (This is what we actually see with the Red Box) */}
                  <canvas 
                    ref={canvasRef} 
                    className="absolute inset-0 w-full h-full object-contain"
                    style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }} 
                  />

                  {phase === 'starting' && <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white"><Loader className="animate-spin" /></div>}
                  
                  {phase === 'processing' && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white">
                        <Loader className="animate-spin mb-2" size={40}/>
                        <span className="font-bold">Marking Attendance...</span>
                     </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-500">Hold QR code steady in front of camera</p>
                    <button 
                        onClick={() => setIsMirrored(!isMirrored)}
                        className="text-xs flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full hover:bg-slate-200"
                    >
                        <RefreshCw size={12}/> {isMirrored ? 'Un-mirror' : 'Mirror Cam'}
                    </button>
                </div>
              </motion.div>
            )}

            {phase === 'success' && (
              <motion.div key="suc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={40} /></div>
                <h3 className="font-black text-2xl text-slate-900">Marked!</h3>
                <p className="text-slate-600 mt-2">{successInfo?.className}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QRScanner;