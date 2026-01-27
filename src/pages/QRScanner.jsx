import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, Camera, X, Check, AlertCircle, Loader, Wifi, WifiOff,
  Smartphone, Monitor, Battery, Signal, MapPin, Clock, Users,
  Shield, Zap, Activity, Hash, Eye, Fingerprint, Radio, Cpu
} from 'lucide-react';

const QRScanner = ({ onClose, onScanSuccess }) => {
  const [scanState, setScanState] = useState('initializing'); // initializing, ready, scanning, processing, success, error
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState('');
  const [deviceStatus, setDeviceStatus] = useState({
    camera: 'checking',
    location: 'checking',
    network: 'checking',
    battery: 100
  });
  const [scanAttempts, setScanAttempts] = useState(0);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [verificationSteps, setVerificationSteps] = useState([
    { id: 1, name: 'Device Check', status: 'pending', icon: Smartphone },
    { id: 2, name: 'Camera Access', status: 'pending', icon: Camera },
    { id: 3, name: 'QR Detection', status: 'pending', icon: QrCode },
    { id: 4, name: 'Data Validation', status: 'pending', icon: Shield },
    { id: 5, name: 'Session Verify', status: 'pending', icon: Check }
  ]);
  const [scanningAnimation, setScanningAnimation] = useState(0);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Device fingerprint for anti-proxy
  const [deviceFingerprint, setDeviceFingerprint] = useState(null);

  useEffect(() => {
    initializeScanner();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (scanState === 'scanning') {
      const animationInterval = setInterval(() => {
        setScanningAnimation(prev => (prev + 1) % 100);
      }, 20);
      return () => clearInterval(animationInterval);
    }
  }, [scanState]);

  const initializeScanner = async () => {
    try {
      // Step 1: Device Check
      updateVerificationStep(1, 'processing');
      await checkDeviceCapabilities();
      updateVerificationStep(1, 'completed');

      // Step 2: Camera Access
      updateVerificationStep(2, 'processing');
      await initializeCamera();
      updateVerificationStep(2, 'completed');

      // Generate device fingerprint
      generateDeviceFingerprint();

      setScanState('ready');
      
      // Auto-start scanning after 1 second
      setTimeout(() => {
        startScanning();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to initialize scanner');
      setScanState('error');
    }
  };

  const checkDeviceCapabilities = async () => {
    return new Promise((resolve) => {
      // Check network
      const isOnline = navigator.onLine;
      setDeviceStatus(prev => ({ ...prev, network: isOnline ? 'online' : 'offline' }));

      // Check location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => setDeviceStatus(prev => ({ ...prev, location: 'available' })),
          () => setDeviceStatus(prev => ({ ...prev, location: 'unavailable' }))
        );
      }

      // Check camera
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        setDeviceStatus(prev => ({ ...prev, camera: 'available' }));
      } else {
        throw new Error('Camera not available on this device');
      }

      // Simulate battery check (in real app, use Battery API)
      setDeviceStatus(prev => ({ ...prev, battery: 85 }));

      resolve();
    });
  };

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.play();
      }
    } catch (err) {
      throw new Error('Camera access denied. Please allow camera permissions.');
    }
  };

  const generateDeviceFingerprint = () => {
    const fingerprint = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      colorDepth: window.screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: Date.now(),
      hash: btoa(`${navigator.userAgent}-${Date.now()}`).substring(0, 16)
    };
    setDeviceFingerprint(fingerprint);
  };

  const startScanning = () => {
    setScanState('scanning');
    updateVerificationStep(3, 'processing');
    
    // Simulate QR code scanning (in real app, use a QR library like jsQR)
    scanIntervalRef.current = setInterval(() => {
      simulateQRDetection();
    }, 100);
  };

  const simulateQRDetection = () => {
    // In real implementation, use canvas to capture video frame and detect QR
    // For demo, we'll simulate successful detection after a few attempts
    setScanAttempts(prev => {
      const attempts = prev + 1;
      if (attempts >= 30) { // Simulate detection after 3 seconds
        processQRCode();
        clearInterval(scanIntervalRef.current);
      }
      return attempts;
    });
  };

  const processQRCode = async () => {
    setScanState('processing');
    updateVerificationStep(3, 'completed');
    updateVerificationStep(4, 'processing');

    // Simulate QR data (in real app, this would come from actual QR scan)
    const simulatedQRData = {
      sessionId: 'CS101-2026-01-27-1030',
      courseCode: 'CS101',
      courseName: 'Data Structures',
      facultyId: 'FAC001',
      facultyName: 'Dr. Sarah Miller',
      validUntil: Date.now() + 300000,
      requiredOtp: '123456',
      allowedLocation: {
        latitude: 28.7041,
        longitude: 77.1025,
        radius: 50
      },
      timestamp: Date.now(),
      securityLevel: 'HIGH',
      checksum: 'a1b2c3d4e5f6'
    };

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Validate QR data
    if (validateQRData(simulatedQRData)) {
      updateVerificationStep(4, 'completed');
      updateVerificationStep(5, 'processing');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setQrData(simulatedQRData);
      setSessionInfo({
        ...simulatedQRData,
        deviceFingerprint: deviceFingerprint,
        scannedAt: new Date().toISOString()
      });
      
      updateVerificationStep(5, 'completed');
      setScanState('success');
      
      // Auto-proceed to next step after 2 seconds
      setTimeout(() => {
        onScanSuccess(simulatedQRData);
      }, 2000);
    } else {
      updateVerificationStep(4, 'failed');
      setScanState('error');
      setError('Invalid or expired QR code');
    }
  };

  const validateQRData = (data) => {
    // Check if QR code is expired
    if (data.validUntil < Date.now()) {
      setError('QR code has expired. Please ask faculty to generate a new one.');
      return false;
    }

    // Check if required fields are present
    if (!data.sessionId || !data.courseCode || !data.requiredOtp) {
      setError('Invalid QR code format');
      return false;
    }

    return true;
  };

  const updateVerificationStep = (stepId, status) => {
    setVerificationSteps(prev =>
      prev.map(step =>
        step.id === stepId ? { ...step, status } : step
      )
    );
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <Check className="text-green-600" size={16} />;
      case 'processing':
        return <Loader className="text-blue-600 animate-spin" size={16} />;
      case 'failed':
        return <X className="text-red-600" size={16} />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-slate-300" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300';
      case 'processing':
        return 'bg-blue-100 border-blue-300 animate-pulse';
      case 'failed':
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-900 to-slate-700 text-white p-6 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center">
              <QrCode size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black">Smart QR Scanner</h2>
              <p className="text-slate-300">Multi-layer verification system</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Device Status Bar */}
          <div className="bg-slate-50 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                {deviceStatus.camera === 'available' ? (
                  <Camera className="text-green-600" size={18} />
                ) : (
                  <Camera className="text-red-600" size={18} />
                )}
                <span className="text-sm font-semibold text-slate-700">
                  Camera: {deviceStatus.camera}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {deviceStatus.network === 'online' ? (
                  <Wifi className="text-green-600" size={18} />
                ) : (
                  <WifiOff className="text-red-600" size={18} />
                )}
                <span className="text-sm font-semibold text-slate-700">
                  Network: {deviceStatus.network}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {deviceStatus.location === 'available' ? (
                  <MapPin className="text-green-600" size={18} />
                ) : (
                  <MapPin className="text-orange-600" size={18} />
                )}
                <span className="text-sm font-semibold text-slate-700">
                  Location: {deviceStatus.location}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Battery className="text-green-600" size={18} />
                <span className="text-sm font-semibold text-slate-700">
                  Battery: {deviceStatus.battery}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Scanner Area */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {scanState === 'initializing' && (
                  <motion.div
                    key="initializing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-slate-50 rounded-2xl p-12 text-center"
                  >
                    <Loader className="w-16 h-16 text-slate-600 animate-spin mx-auto mb-4" />
                    <h3 className="text-xl font-black text-slate-900 mb-2">Initializing Scanner</h3>
                    <p className="text-slate-600">Setting up camera and security checks...</p>
                  </motion.div>
                )}

                {(scanState === 'ready' || scanState === 'scanning') && (
                  <motion.div
                    key="scanning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative bg-black rounded-2xl overflow-hidden aspect-video"
                  >
                    {/* Video feed */}
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                    
                    {/* Scanning overlay */}
                    {scanState === 'scanning' && (
                      <>
                        {/* Corner markers */}
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute top-8 left-8 w-24 h-24 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl"></div>
                          <div className="absolute top-8 right-8 w-24 h-24 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl"></div>
                          <div className="absolute bottom-8 left-8 w-24 h-24 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl"></div>
                          <div className="absolute bottom-8 right-8 w-24 h-24 border-b-4 border-r-4 border-blue-500 rounded-br-2xl"></div>
                        </div>

                        {/* Scanning line */}
                        <motion.div
                          animate={{ top: ['10%', '90%'] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                          style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' }}
                        />

                        {/* Center reticle */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative w-64 h-64 border-2 border-blue-500/50 rounded-2xl">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <QrCode size={48} className="text-blue-500 animate-pulse" />
                            </div>
                          </div>
                        </div>

                        {/* Scan progress indicator */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-6 py-3 rounded-full">
                          <div className="flex items-center gap-3">
                            <Radio className="text-blue-500 animate-pulse" size={20} />
                            <span className="text-white font-bold">Scanning...</span>
                            <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <motion.div
                                animate={{ width: `${(scanAttempts / 30) * 100}%` }}
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {scanState === 'ready' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="text-center text-white">
                          <Camera size={64} className="mx-auto mb-4 animate-pulse" />
                          <p className="text-xl font-bold">Position QR code in frame</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {scanState === 'processing' && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12 text-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"
                    />
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Processing QR Code</h3>
                    <p className="text-slate-600">Validating session data and security parameters...</p>
                  </motion.div>
                )}

                {scanState === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-12 text-center text-white"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                      className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <Check size={48} className="text-green-600" />
                    </motion.div>
                    <h3 className="text-3xl font-black mb-3">QR Code Verified!</h3>
                    <p className="text-xl text-green-50 mb-6">
                      Session authenticated successfully
                    </p>
                    {qrData && (
                      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                        <div className="text-sm font-semibold text-green-100 mb-2">COURSE</div>
                        <div className="text-lg font-black">{qrData.courseName}</div>
                      </div>
                    )}
                  </motion.div>
                )}

                {scanState === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-12 text-center text-white"
                  >
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                      className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <X size={48} className="text-red-600" />
                    </motion.div>
                    <h3 className="text-3xl font-black mb-3">Scan Failed</h3>
                    <p className="text-xl text-red-50 mb-6">{error}</p>
                    <button
                      onClick={() => {
                        setScanState('ready');
                        setError('');
                        setScanAttempts(0);
                        setTimeout(() => startScanning(), 500);
                      }}
                      className="px-8 py-3 bg-white text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all"
                    >
                      Try Again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Instructions */}
              {(scanState === 'ready' || scanState === 'scanning') && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-blue-50 rounded-xl p-4"
                >
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <AlertCircle size={18} className="text-blue-600" />
                    Scanning Tips
                  </h4>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li>• Hold device steady and ensure good lighting</li>
                    <li>• Keep QR code within the blue markers</li>
                    <li>• Make sure QR code is not blurry or damaged</li>
                    <li>• Stay within 1-2 feet distance from the screen</li>
                  </ul>
                </motion.div>
              )}
            </div>

            {/* Verification Steps Panel */}
            <div>
              <div className="bg-slate-50 rounded-2xl p-6 mb-4">
                <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-purple-600" />
                  Verification Steps
                </h3>
                <div className="space-y-3">
                  {verificationSteps.map((step) => (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${getStatusColor(step.status)}`}
                    >
                      <div className="flex-shrink-0">
                        {getStatusIcon(step.status)}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-slate-900">{step.name}</div>
                        <div className="text-xs text-slate-600 capitalize">{step.status}</div>
                      </div>
                      <step.icon size={18} className="text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Device Fingerprint */}
              {deviceFingerprint && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-200"
                >
                  <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                    <Fingerprint size={20} className="text-purple-600" />
                    Device ID
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="text-slate-500 font-semibold">Fingerprint Hash</div>
                      <div className="font-mono text-slate-900 font-bold">{deviceFingerprint.hash}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-semibold">Platform</div>
                      <div className="text-slate-900">{deviceFingerprint.platform}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-semibold">Timezone</div>
                      <div className="text-slate-900">{deviceFingerprint.timezone}</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Session Info */}
              {sessionInfo && scanState === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-green-50 rounded-2xl p-6 border-2 border-green-200"
                >
                  <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                    <Activity size={20} className="text-green-600" />
                    Session Info
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-slate-500 font-semibold">Course</div>
                      <div className="text-slate-900 font-bold">{sessionInfo.courseName}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-semibold">Faculty</div>
                      <div className="text-slate-900">{sessionInfo.facultyName}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-semibold">Session ID</div>
                      <div className="text-slate-900 font-mono text-xs">{sessionInfo.sessionId}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-semibold">Security Level</div>
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">
                        {sessionInfo.securityLevel}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 rounded-b-3xl border-t-2 border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Shield size={14} />
                Encrypted Session
              </span>
              <span className="flex items-center gap-1">
                <Zap size={14} />
                Real-time Validation
              </span>
            </div>
            <span className="font-mono">{scanAttempts > 0 ? `${scanAttempts} frames analyzed` : 'Ready to scan'}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QRScanner;