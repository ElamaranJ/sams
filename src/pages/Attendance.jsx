import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, MapPin, Clock, CheckCircle, XCircle, AlertCircle, 
  Camera, Smartphone, Shield, Wifi, Battery, Signal, Eye,
  Users, Calendar, TrendingUp, Award, Hash, Lock, Unlock,
  Zap, Target, Activity, Timer, Scan, UserCheck, Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' or 'history'
  const [qrScanStep, setQrScanStep] = useState('ready'); // 'ready', 'scanning', 'otp', 'location', 'face', 'success', 'failed'
  const [scannedData, setScannedData] = useState(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [faceVerifying, setFaceVerifying] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [proxyAttempts, setProxyAttempts] = useState(0);
  const [securityScore, setSecurityScore] = useState(100);
  const videoRef = useRef(null);
  const otpInputRefs = useRef([]);

  // Simulated QR data from faculty
  const simulatedQRData = {
    sessionId: 'CS101-2026-01-27-1030',
    courseCode: 'CS101',
    courseName: 'Data Structures',
    facultyId: 'FAC001',
    facultyName: 'Dr. Sarah Miller',
    validUntil: Date.now() + 300000, // 5 minutes
    requiredOtp: '123456',
    allowedLocation: {
      latitude: 28.7041,
      longitude: 77.1025,
      radius: 50 // meters
    },
    timestamp: Date.now(),
    securityLevel: 'HIGH'
  };

  // Initialize device info and location tracking
  useEffect(() => {
    captureDeviceInfo();
    startLocationTracking();
    
    // Simulate some attendance records
    setAttendanceRecords([
      {
        id: 1,
        date: '2026-01-26',
        time: '10:30 AM',
        course: 'Data Structures',
        status: 'present',
        method: 'QR+OTP+Location',
        securityScore: 100
      },
      {
        id: 2,
        date: '2026-01-25',
        time: '02:00 PM',
        course: 'Machine Learning',
        status: 'present',
        method: 'QR+OTP+Face',
        securityScore: 98
      },
      {
        id: 3,
        date: '2026-01-24',
        time: '11:00 AM',
        course: 'Algorithms',
        status: 'present',
        method: 'QR+OTP+Location',
        securityScore: 100
      },
      {
        id: 4,
        date: '2026-01-23',
        time: '09:00 AM',
        course: 'Database Systems',
        status: 'late',
        method: 'Manual',
        securityScore: 75
      },
    ]);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (qrScanStep === 'scanning' || qrScanStep === 'otp' || qrScanStep === 'location') {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setQrScanStep('failed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [qrScanStep]);

  const captureDeviceInfo = () => {
    setDeviceInfo({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      connectionType: navigator.connection?.effectiveType || 'unknown',
      batteryLevel: 85, // Would need battery API in real app
      timestamp: new Date().toISOString()
    });
  };

  const startLocationTracking = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          setLocationError('Location access denied. Attendance marking may be restricted.');
        }
      );
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const simulateQRScan = () => {
    setQrScanStep('scanning');
    setTimeRemaining(300);
    
    // Simulate QR scan after 2 seconds
    setTimeout(() => {
      setScannedData(simulatedQRData);
      setQrScanStep('otp');
    }, 2000);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits entered
    if (index === 5 && value) {
      verifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = (otpValue) => {
    if (otpValue === scannedData.requiredOtp) {
      setQrScanStep('location');
      verifyLocation();
    } else {
      setOtpError('Invalid OTP. Please try again.');
      setProxyAttempts(prev => prev + 1);
      setSecurityScore(prev => Math.max(0, prev - 10));
      
      if (proxyAttempts >= 2) {
        setQrScanStep('failed');
      }
    }
  };

  const verifyLocation = () => {
    if (!location) {
      setLocationError('Unable to verify location. Please enable location services.');
      setTimeout(() => {
        setQrScanStep('face');
      }, 2000);
      return;
    }

    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      scannedData.allowedLocation.latitude,
      scannedData.allowedLocation.longitude
    );

    if (distance <= scannedData.allowedLocation.radius) {
      setQrScanStep('face');
      setTimeout(() => {
        startFaceVerification();
      }, 1000);
    } else {
      setLocationError(`You are ${Math.round(distance)}m away from the classroom. Required: within ${scannedData.allowedLocation.radius}m`);
      setSecurityScore(prev => Math.max(0, prev - 20));
      setTimeout(() => {
        setQrScanStep('failed');
      }, 2000);
    }
  };

  const startFaceVerification = async () => {
    setFaceVerifying(true);
    
    // Simulate camera access and face detection
    try {
      // In real app, you'd use getUserMedia API
      // const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // videoRef.current.srcObject = stream;
      
      // Simulate face verification
      setTimeout(() => {
        setFaceVerifying(false);
        // 90% success rate for demo
        if (Math.random() > 0.1) {
          markAttendanceSuccess();
        } else {
          setQrScanStep('failed');
          setSecurityScore(prev => Math.max(0, prev - 15));
        }
      }, 3000);
    } catch (error) {
      setFaceVerifying(false);
      // Fall back to success without face verification
      markAttendanceSuccess();
    }
  };

  const markAttendanceSuccess = () => {
    setQrScanStep('success');
    
    // Add new attendance record
    const newRecord = {
      id: attendanceRecords.length + 1,
      date: new Date().toLocaleDateString('en-US'),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      course: scannedData.courseName,
      status: 'present',
      method: 'QR+OTP+Location+Face',
      securityScore: securityScore
    };
    
    setAttendanceRecords(prev => [newRecord, ...prev]);
    
    // Reset after 3 seconds
    setTimeout(() => {
      resetScan();
    }, 3000);
  };

  const resetScan = () => {
    setQrScanStep('ready');
    setScannedData(null);
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setLocationError('');
    setTimeRemaining(300);
    setProxyAttempts(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-50';
      case 'late': return 'text-orange-600 bg-orange-50';
      case 'absent': return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getSecurityColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Smart Attendance</h1>
          <p className="text-slate-600">Hybrid QR + OTP + Location + Face Verification System</p>
        </div>

        {/* Security Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border-2 border-slate-100 p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Shield size={24} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-500">Security Score</div>
                <div className={`text-2xl font-black ${getSecurityColor(securityScore)}`}>{securityScore}%</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border-2 border-slate-100 p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle size={24} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-500">This Month</div>
                <div className="text-2xl font-black text-slate-900">24/26</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border-2 border-slate-100 p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-500">Attendance %</div>
                <div className="text-2xl font-black text-slate-900">92.3%</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border-2 border-slate-100 p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Target size={24} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-500">Streak</div>
                <div className="text-2xl font-black text-slate-900">7 Days</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('scan')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'scan'
                ? 'bg-slate-900 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Scan className="inline mr-2" size={20} />
            Scan Attendance
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-slate-900 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Clock className="inline mr-2" size={20} />
            History
          </button>
        </div>

        {/* Main Content */}
        {activeTab === 'scan' ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Scanning Interface */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {qrScanStep === 'ready' && (
                  <motion.div
                    key="ready"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-3xl border-2 border-slate-100 p-12 shadow-xl text-center"
                  >
                    <div className="w-32 h-32 bg-gradient-to-br from-slate-800 to-slate-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                      <QrCode size={64} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-3">Ready to Mark Attendance</h2>
                    <p className="text-slate-600 mb-8 text-lg">
                      Scan the QR code displayed by your faculty to begin the secure attendance process
                    </p>
                    <button
                      onClick={simulateQRScan}
                      className="px-12 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl transition-all text-lg"
                    >
                      <Camera className="inline mr-2" size={24} />
                      Start Scanning
                    </button>
                    
                    {/* Device Status */}
                    <div className="mt-8 pt-8 border-t-2 border-slate-100">
                      <div className="flex items-center justify-center gap-8 text-sm">
                        <div className="flex items-center gap-2 text-green-600">
                          <Wifi size={16} />
                          <span className="font-semibold">Online</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-600">
                          <MapPin size={16} />
                          <span className="font-semibold">Location: {location ? 'Active' : 'Inactive'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-600">
                          <Camera size={16} />
                          <span className="font-semibold">Camera: Ready</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {qrScanStep === 'scanning' && (
                  <motion.div
                    key="scanning"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-3xl border-2 border-slate-100 p-12 shadow-xl text-center"
                  >
                    <div className="relative w-64 h-64 mx-auto mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl animate-pulse"></div>
                      <div className="absolute inset-4 bg-white rounded-2xl flex items-center justify-center">
                        <Scan size={80} className="text-slate-800 animate-pulse" />
                      </div>
                      {/* Scanning animation corners */}
                      <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-blue-500 rounded-tl-3xl"></div>
                      <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-blue-500 rounded-tr-3xl"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-blue-500 rounded-bl-3xl"></div>
                      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-blue-500 rounded-br-3xl"></div>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-3">Scanning QR Code...</h2>
                    <p className="text-slate-600 text-lg">Please hold steady</p>
                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl">
                      <Timer size={16} className="text-blue-600" />
                      <span className="font-bold text-blue-600">{formatTime(timeRemaining)}</span>
                    </div>
                  </motion.div>
                )}

                {qrScanStep === 'otp' && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-3xl border-2 border-slate-100 p-12 shadow-xl"
                  >
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={40} className="text-white" />
                      </div>
                      <h2 className="text-3xl font-black text-slate-900 mb-2">QR Code Verified!</h2>
                      <p className="text-slate-600 text-lg mb-2">
                        {scannedData?.courseName} - {scannedData?.facultyName}
                      </p>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl">
                        <Timer size={16} className="text-amber-600" />
                        <span className="font-bold text-amber-600">{formatTime(timeRemaining)}</span>
                      </div>
                    </div>

                    <div className="mb-8">
                      <label className="block text-center font-bold text-slate-700 mb-4 text-xl">
                        Enter 6-Digit OTP
                      </label>
                      <div className="flex gap-3 justify-center mb-4">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            ref={el => otpInputRefs.current[index] = el}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            className="w-14 h-16 text-center text-2xl font-black border-3 border-slate-300 rounded-xl focus:border-slate-900 focus:outline-none transition-all"
                          />
                        ))}
                      </div>
                      {otpError && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-600 text-center font-semibold"
                        >
                          {otpError}
                        </motion.p>
                      )}
                      <p className="text-sm text-slate-500 text-center mt-4">
                        OTP displayed on faculty screen. Ask your faculty if not visible.
                      </p>
                    </div>

                    {proxyAttempts > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-50 border-2 border-red-200 rounded-xl mb-4"
                      >
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertCircle size={20} />
                          <span className="font-bold">Warning: {proxyAttempts} failed attempt(s)</span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {qrScanStep === 'location' && (
                  <motion.div
                    key="location"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-3xl border-2 border-slate-100 p-12 shadow-xl text-center"
                  >
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl relative">
                      <MapPin size={64} className="text-white" />
                      <motion.div
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 border-4 border-blue-400 rounded-3xl"
                      />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-3">Verifying Location...</h2>
                    <p className="text-slate-600 text-lg">
                      Checking if you're in the classroom vicinity
                    </p>
                    {locationError && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
                      >
                        <p className="text-red-600 font-semibold">{locationError}</p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {qrScanStep === 'face' && (
                  <motion.div
                    key="face"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-3xl border-2 border-slate-100 p-12 shadow-xl text-center"
                  >
                    <div className="relative w-64 h-64 mx-auto mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full overflow-hidden">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {faceVerifying && (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="absolute inset-0 border-4 border-t-white border-transparent rounded-full"
                          />
                          <div className="absolute inset-8 border-2 border-white/30 rounded-full"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <Eye size={48} className="text-white" />
                          </div>
                        </>
                      )}
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-3">Face Verification</h2>
                    <p className="text-slate-600 text-lg">
                      {faceVerifying ? 'Analyzing facial features...' : 'Position your face in the circle'}
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-xl">
                      <Camera size={16} className="text-purple-600" />
                      <span className="font-bold text-purple-600">AI Face Recognition Active</span>
                    </div>
                  </motion.div>
                )}

                {qrScanStep === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl border-2 border-green-400 p-12 shadow-2xl text-center text-white"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                      className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                    >
                      <CheckCircle size={80} className="text-green-600" />
                    </motion.div>
                    <h2 className="text-4xl font-black mb-3">Attendance Marked!</h2>
                    <p className="text-xl mb-6 text-green-50">
                      Successfully verified via QR + OTP + Location + Face
                    </p>
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                        <div className="text-sm font-semibold text-green-100">Course</div>
                        <div className="text-lg font-black">{scannedData?.courseName}</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                        <div className="text-sm font-semibold text-green-100">Time</div>
                        <div className="text-lg font-black">{new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}</div>
                      </div>
                    </div>
                    <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-lg rounded-xl">
                      <Shield size={20} />
                      <span className="font-bold">Security Score: {securityScore}%</span>
                    </div>
                  </motion.div>
                )}

                {qrScanStep === 'failed' && (
                  <motion.div
                    key="failed"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl border-2 border-red-400 p-12 shadow-2xl text-center text-white"
                  >
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                      className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                    >
                      <XCircle size={80} className="text-red-600" />
                    </motion.div>
                    <h2 className="text-4xl font-black mb-3">Verification Failed</h2>
                    <p className="text-xl mb-6 text-red-50">
                      {locationError || otpError || 'Unable to verify your identity. Please try again.'}
                    </p>
                    <button
                      onClick={resetScan}
                      className="px-8 py-4 bg-white text-red-600 font-bold rounded-2xl shadow-xl hover:bg-red-50 transition-all"
                    >
                      Try Again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Info Panel */}
            <div className="space-y-6">
              {/* Session Info */}
              {scannedData && qrScanStep !== 'ready' && qrScanStep !== 'success' && qrScanStep !== 'failed' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl border-2 border-slate-100 p-6 shadow-lg"
                >
                  <h3 className="font-black text-lg text-slate-900 mb-4">Session Details</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-bold text-slate-500 mb-1">COURSE</div>
                      <div className="font-bold text-slate-900">{scannedData.courseName}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 mb-1">FACULTY</div>
                      <div className="font-bold text-slate-900">{scannedData.facultyName}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 mb-1">SESSION ID</div>
                      <div className="font-mono text-sm text-slate-700">{scannedData.sessionId}</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Verification Steps */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border-2 border-slate-100 p-6 shadow-lg"
              >
                <h3 className="font-black text-lg text-slate-900 mb-4">Verification Steps</h3>
                <div className="space-y-4">
                  <div className={`flex items-center gap-3 ${['scanning', 'otp', 'location', 'face', 'success'].includes(qrScanStep) ? 'text-green-600' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${['scanning', 'otp', 'location', 'face', 'success'].includes(qrScanStep) ? 'bg-green-100' : 'bg-slate-100'}`}>
                      {qrScanStep === 'scanning' ? (
                        <Radio className="animate-pulse" size={18} />
                      ) : ['scanning', 'otp', 'location', 'face', 'success'].includes(qrScanStep) ? (
                        <CheckCircle size={18} />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                      )}
                    </div>
                    <span className="font-semibold">Scan QR Code</span>
                  </div>
                  
                  <div className={`flex items-center gap-3 ${['otp', 'location', 'face', 'success'].includes(qrScanStep) ? 'text-green-600' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${['otp', 'location', 'face', 'success'].includes(qrScanStep) ? 'bg-green-100' : 'bg-slate-100'}`}>
                      {qrScanStep === 'otp' ? (
                        <Hash className="animate-pulse" size={18} />
                      ) : ['otp', 'location', 'face', 'success'].includes(qrScanStep) ? (
                        <CheckCircle size={18} />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                      )}
                    </div>
                    <span className="font-semibold">Enter OTP</span>
                  </div>
                  
                  <div className={`flex items-center gap-3 ${['location', 'face', 'success'].includes(qrScanStep) ? 'text-green-600' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${['location', 'face', 'success'].includes(qrScanStep) ? 'bg-green-100' : 'bg-slate-100'}`}>
                      {qrScanStep === 'location' ? (
                        <MapPin className="animate-pulse" size={18} />
                      ) : ['location', 'face', 'success'].includes(qrScanStep) ? (
                        <CheckCircle size={18} />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                      )}
                    </div>
                    <span className="font-semibold">Verify Location</span>
                  </div>
                  
                  <div className={`flex items-center gap-3 ${['face', 'success'].includes(qrScanStep) ? 'text-green-600' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${['face', 'success'].includes(qrScanStep) ? 'bg-green-100' : 'bg-slate-100'}`}>
                      {qrScanStep === 'face' ? (
                        <Camera className="animate-pulse" size={18} />
                      ) : qrScanStep === 'success' ? (
                        <CheckCircle size={18} />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                      )}
                    </div>
                    <span className="font-semibold">Face Recognition</span>
                  </div>
                </div>
              </motion.div>

              {/* Security Features */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-200 p-6 shadow-lg"
              >
                <h3 className="font-black text-lg text-slate-900 mb-4">Security Features</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Shield size={16} className="text-purple-600" />
                    <span className="font-semibold">Multi-layer verification</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Zap size={16} className="text-purple-600" />
                    <span className="font-semibold">Real-time validation</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Lock size={16} className="text-purple-600" />
                    <span className="font-semibold">Anti-proxy detection</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Activity size={16} className="text-purple-600" />
                    <span className="font-semibold">Device fingerprinting</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          /* History Tab */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border-2 border-slate-100 shadow-xl overflow-hidden"
          >
            <div className="p-6 border-b-2 border-slate-100">
              <h2 className="text-2xl font-black text-slate-900">Attendance History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                      Security Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceRecords.map((record) => (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                        {record.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {record.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                        {record.course}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-lg ${getStatusColor(record.status)}`}>
                          {record.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {record.method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-black ${getSecurityColor(record.securityScore)}`}>
                          {record.securityScore}%
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Attendance;