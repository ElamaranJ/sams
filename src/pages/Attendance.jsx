/**
 * MLPV ATTENDANCE PAGE
 * 
 * Complete 4-layer verification attendance system
 * Replaces old QR/OTP system with foolproof multi-layer presence verification
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
  CheckCircle, Clock, Loader, Shield, AlertCircle, TrendingUp,
  BookOpen, X, Wifi, Laptop, QrCode, Eye, ArrowRight, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/shared/GlassCard';
import Button from '../components/ui/Button';
import { getStudentAttendance, getStudentClasses } from '../firebase/database';
import { doc, getDoc, setDoc, addDoc, collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';

// MLPV Components
import NetworkCheck from '../components/attendance/NetworkCheck';
import DeviceRegistration from '../components/attendance/DeviceRegistration';
import QRScanner from '../components/attendance/QRScanner';
import FaceLivenessVerification from '../components/attendance/FaceLivenessVerification';

// Calendar Styles
const calendarStyles = `
  .attendance-calendar {
    width: 100% !important;
    border: none !important;
    font-family: inherit !important;
    background: white !important;
  }
  .react-calendar__tile {
    height: 75px !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 12px !important;
    font-weight: 700 !important;
    font-size: 0.9rem !important;
    transition: all 0.2s ease;
    border: 2px solid transparent !important;
    color: #475569;
  }
  .react-calendar__tile--active {
    background: #2563eb !important;
    color: white !important;
  }
  .present-day {
    background: #f0fdf4 !important;
    color: #16a34a !important;
    border-bottom: 3px solid #22c55e !important;
  }
  .absent-day {
    background: #fff1f2 !important;
    color: #e11d48 !important;
  }
  .react-calendar__navigation {
    margin-bottom: 1rem !important;
    background: #f8fafc;
    border-radius: 10px;
    padding: 5px;
  }
  .react-calendar__navigation button {
    font-weight: 800 !important;
    color: #1e293b;
    min-width: 40px;
  }
  .react-calendar__month-view__weekdays__weekday abbr {
    text-decoration: none !important;
    font-weight: 700 !important;
    color: #94a3b8;
    font-size: 11px;
    text-transform: uppercase;
  }
`;

const MLPVAttendance = () => {
  const { user } = useAuth();

  // Data States
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [userClasses, setUserClasses] = useState([]);

  // View States
  const [activeTab, setActiveTab] = useState('mark');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // MLPV States
  const [showMLPV, setShowMLPV] = useState(false);
  const [currentLayer, setCurrentLayer] = useState(1); // 1: Network, 2: Device, 3: QR, 4: Face
  const [verificationData, setVerificationData] = useState({
    network: null,
    device: null,
    qr: null,
    liveness: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [error, setError] = useState(null);
  const [registeredDeviceHash, setRegisteredDeviceHash] = useState(null);

  // College Wi-Fi: 10.0.x.x (subnet mask 255.255.0.0 = entire 10.0.xxx.xxx range)
  const allowedSubnets = ['10.0.xxx.xxx'];
  const qrSecretKey = import.meta.env.VITE_QR_SECRET_KEY || 'demo-secret-key';

  // Load Data
  const fetchMyAttendance = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const [attRes, clsRes] = await Promise.all([
        getStudentAttendance(user.uid),
        getStudentClasses(user.uid)
      ]);
      if (attRes.success) setAttendance(attRes.attendance);
      if (clsRes.success) setUserClasses(clsRes.classes);

      // Fetch registered device
      const deviceDoc = await getDoc(doc(db, 'registeredDevices', user.uid));
      if (deviceDoc.exists()) {
        setRegisteredDeviceHash(deviceDoc.data().deviceHash);
      }
    } catch (err) {
      console.error("Failed to load records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyAttendance(); }, [user]);

  // Data Helpers
  const attendanceLookup = useMemo(() => {
    return attendance.reduce((acc, rec) => {
      const d = rec.date || (rec.markedAt ? rec.markedAt.split('T')[0] : null);
      if (d) {
        if (!acc[d]) acc[d] = [];
        acc[d].push(rec);
      }
      return acc;
    }, {});
  }, [attendance]);

  const dashboardStats = useMemo(() => {
    const present = attendance.filter(a => a.status === 'present').length;
    const rate = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 0;
    return { present, rate, total: attendance.length };
  }, [attendance]);

  const classesThisDay = useMemo(() => {
    const key = selectedDate.toISOString().split('T')[0];
    const records = attendanceLookup[key] || [];
    return records.map(r => {
      const info = userClasses.find(c => c.id === r.classId);
      return {
        ...r,
        name: info ? info.name : 'Unknown Class',
        code: info ? info.code : 'No Code'
      };
    });
  }, [selectedDate, attendanceLookup, userClasses]);

  // Calendar
  const getTileClass = ({ date, view }) => {
    if (view === 'month') {
      const str = date.toISOString().split('T')[0];
      if (attendanceLookup[str]?.some(r => r.status === 'present')) return 'present-day';
      if (date < new Date().setHours(0, 0, 0, 0) && !attendanceLookup[str]) return 'absent-day';
    }
    return null;
  };

  // MLPV Handlers
  const handleNetworkSuccess = (data) => {
    setVerificationData(prev => ({ ...prev, network: data }));
    setTimeout(() => setCurrentLayer(2), 1000);
  };

  const handleDeviceSuccess = async (data) => {
    setVerificationData(prev => ({ ...prev, device: data }));
    // Always update Firestore with current device hash
    try {
      await setDoc(doc(db, 'registeredDevices', user.uid), {
        studentId: user.uid,
        deviceHash: data.deviceHash,
        deviceInfo: data.deviceInfo,
        isActive: true,
        registeredAt: new Date(),
        lastUsed: new Date()
      });
      setRegisteredDeviceHash(data.deviceHash);
    } catch (err) {
      console.error('Failed to save device:', err);
    }
    setTimeout(() => setCurrentLayer(3), 1000);
  };

  const handleDeviceReRegister = async (data) => {
    // Force overwrite old device record with new UUID
    try {
      await setDoc(doc(db, 'registeredDevices', user.uid), {
        studentId: user.uid,
        deviceHash: data.deviceHash,
        deviceInfo: data.deviceInfo,
        isActive: true,
        registeredAt: new Date(),
        lastUsed: new Date()
      });
      setRegisteredDeviceHash(data.deviceHash);
      setVerificationData(prev => ({ ...prev, device: data }));
      setTimeout(() => setCurrentLayer(3), 1000);
    } catch (err) {
      console.error('Failed to re-register device:', err);
    }
  };


  const handleQRSuccess = (data) => {
    setVerificationData(prev => ({ ...prev, qr: data }));
    setTimeout(() => setCurrentLayer(4), 1000);
  };

  const handleLivenessSuccess = async (data) => {
    setVerificationData(prev => ({ ...prev, liveness: data }));
    await markAttendance(data);
  };

  const markAttendance = async (livenessData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { qr, device, network } = verificationData;
      let finalSessionId = qr?.sessionId;
      let finalSubjectId = qr?.subjectId;
      let finalFacultyId = qr?.facultyId;
      let markMethod = qr?.method || 'qr';

      // ── OTP VERIFICATION ──
      if (qr?.method === 'otp') {
        // Find active session with this OTP
        const q = query(
          collection(db, 'attendance_sessions'),
          where('otp', '==', qr.enteredOtp),
          where('isActive', '==', true)
        );
        const sessionSnap = await getDocs(q);

        if (sessionSnap.empty) {
          throw new Error('Wrong OTP or session expired. Ask faculty for current code.');
        }

        const sessionDoc = sessionSnap.docs[0];
        const sessionData = sessionDoc.data();

        // Check local expiry
        if (new Date() > new Date(sessionData.expiresAt)) {
          throw new Error('This session has expired.');
        }

        finalSessionId = sessionDoc.id;
        finalSubjectId = sessionData.classId;
        finalFacultyId = sessionData.facultyId;
        markMethod = 'otp';
      }

      if (!finalSessionId) {
        throw new Error('Session context missing. Scan QR or enter valid OTP.');
      }

      const attendanceRecord = {
        studentId: user.uid,
        studentName: user.displayName || user.name || user.email,
        studentEmail: user.email,
        sessionId: finalSessionId,
        classId: finalSubjectId, // database.js uses classId
        facultyId: finalFacultyId,
        method: markMethod,
        verificationLayers: {
          network: {
            passed: true,
            ip: network.ip,
            timestamp: new Date().toISOString()
          },
          device: {
            passed: true,
            deviceHash: device.deviceHash,
            timestamp: new Date().toISOString()
          },
          qr: {
            passed: true,
            scannedAt: new Date().toISOString()
          },
          liveness: {
            passed: true,
            challenges: livenessData.challenges,
            timestamp: new Date().toISOString()
          }
        },
        status: 'present',
        markedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      // USE 'attendance' collection (matching database.js and faculty view)
      await addDoc(collection(db, 'attendance'), attendanceRecord);

      setAttendanceMarked(true);
      fetchMyAttendance();
    } catch (err) {
      console.error('Failed to mark attendance:', err);
      setError(err.message || 'Failed to mark attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLayerFailure = (layer, error) => {
    setError(`${layer} verification failed: ${error}`);
  };

  const resetMLPV = () => {
    setShowMLPV(false);
    setCurrentLayer(1);
    setVerificationData({ network: null, device: null, qr: null, liveness: null });
    setAttendanceMarked(false);
    setError(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfdfe] p-6 pt-24 pb-12">
      <style>{calendarStyles}</style>
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">
              My Attendance 🔐
            </h1>
            <p className="text-slate-500 font-medium">Secure multi-layer verification system</p>
          </motion.div>

          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-sm">
            <TabButton active={activeTab === 'mark'} label="Mark Now" onClick={() => setActiveTab('mark')} />
            <TabButton active={activeTab === 'history'} label="My History" onClick={() => setActiveTab('history')} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <SimpleStat label="Days Present" value={dashboardStats.present} color="text-green-600" bg="bg-green-50" icon={CheckCircle} />
          <SimpleStat label="Attendance Rate" value={`${dashboardStats.rate}%`} color="text-blue-600" bg="bg-blue-50" icon={TrendingUp} />
          <SimpleStat label="Total Classes" value={dashboardStats.total} color="text-purple-600" bg="bg-purple-50" icon={BookOpen} />
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'mark' ? (
            <motion.div key="mark" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid lg:grid-cols-12 gap-8">

                {/* Mark Presence Section */}
                <div className="lg:col-span-8">
                  <Card className="p-10 border-none shadow-xl bg-white">
                    <h2 className="text-2xl font-black text-slate-900 mb-6">Mark Attendance</h2>

                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-8 text-white mb-8">
                      <div className="flex items-center gap-4 mb-4">
                        <Shield size={32} />
                        <div>
                          <h3 className="text-xl font-black">4-Layer Verification</h3>
                          <p className="text-sm opacity-90">Foolproof attendance system</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-6">
                        <div className="bg-white/10 rounded-xl p-3 backdrop-blur">
                          <Wifi size={20} className="mb-2" />
                          <div className="text-xs font-bold">Network Lock</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 backdrop-blur">
                          <Laptop size={20} className="mb-2" />
                          <div className="text-xs font-bold">Device Binding</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 backdrop-blur">
                          <QrCode size={20} className="mb-2" />
                          <div className="text-xs font-bold">QR Validation</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 backdrop-blur">
                          <Eye size={20} className="mb-2" />
                          <div className="text-xs font-bold">Face Liveness</div>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="gradient"
                      fullWidth
                      size="lg"
                      onClick={() => setShowMLPV(true)}
                      icon={Lock}
                    >
                      Start Secure Verification
                    </Button>
                  </Card>
                </div>

                {/* Help Sidebar */}
                <div className="lg:col-span-4">
                  <Card className="p-8 bg-white border-none shadow-lg h-full">
                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                      <Shield size={20} className="text-purple-600" />
                      How It Works
                    </h3>
                    <div className="space-y-6">
                      <HelpStep n="1" t="Network Check" d="Verify you're in the classroom Wi-Fi" />
                      <HelpStep n="2" t="Device Verify" d="Confirm you're using your registered laptop" />
                      <HelpStep n="3" t="Scan QR Code" d="Scan faculty's rotating QR (10s expiry)" />
                      <HelpStep n="4" t="Face Liveness" d="Complete random challenges (blink, turn, smile)" />
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid lg:grid-cols-12 gap-8">

              {/* Calendar Display */}
              <div className="lg:col-span-8">
                <Card className="p-8 border-none shadow-xl bg-white overflow-hidden">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-slate-900">My History</h2>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm" /><span className="text-[10px] font-black text-slate-400 uppercase">Present</span></div>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" /><span className="text-[10px] font-black text-slate-400 uppercase">Absent</span></div>
                    </div>
                  </div>
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    tileClassName={getTileClass}
                    className="attendance-calendar"
                  />
                </Card>
              </div>

              {/* Sidebar Details */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="p-8 border-none shadow-xl bg-white min-h-[400px]">
                  <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                    <Clock size={18} className="text-blue-600" />
                    Details for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </h3>
                  <div className="space-y-3">
                    {classesThisDay.length === 0 ? (
                      <div className="text-center py-12">
                        <AlertCircle className="mx-auto text-slate-200 mb-3" size={40} />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No classes found</p>
                      </div>
                    ) : (
                      classesThisDay.map((rec, i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                          <div>
                            <p className="font-black text-slate-900 text-[13px] uppercase tracking-tighter">{rec.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{rec.code}</p>
                          </div>
                          <CheckCircle className="text-green-500" size={20} />
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MLPV Modal */}
        <AnimatePresence>
          {showMLPV && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full max-w-2xl"
              >
                <button
                  onClick={resetMLPV}
                  className="absolute -top-12 right-0 text-white/70 hover:text-white transition-all"
                >
                  <X size={32} />
                </button>

                <div className="bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 rounded-3xl p-8">
                  {/* Progress Steps */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between">
                      {[
                        { num: 1, label: 'Network', icon: '🌐' },
                        { num: 2, label: 'Device', icon: '💻' },
                        { num: 3, label: 'QR Code', icon: '📱' },
                        { num: 4, label: 'Face', icon: '👤' }
                      ].map((step, i) => (
                        <React.Fragment key={step.num}>
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all ${currentLayer > step.num
                                ? 'bg-green-500 text-white'
                                : currentLayer === step.num
                                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                                  : 'bg-slate-200 text-slate-400'
                                }`}
                            >
                              {currentLayer > step.num ? <CheckCircle size={24} /> : step.icon}
                            </div>
                            <div className={`mt-1 text-xs font-semibold ${currentLayer >= step.num ? 'text-slate-900' : 'text-slate-400'
                              }`}>
                              {step.label}
                            </div>
                          </div>
                          {i < 3 && (
                            <div className={`flex-1 h-1 mx-2 rounded ${currentLayer > step.num ? 'bg-green-500' : 'bg-slate-200'
                              }`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Verification Layers */}
                  {!attendanceMarked && !isSubmitting && (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentLayer}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        {currentLayer === 1 && (
                          <NetworkCheck
                            allowedSubnets={allowedSubnets}
                            onSuccess={handleNetworkSuccess}
                            onFailure={(err) => handleLayerFailure('Network', err)}
                          />
                        )}

                        {currentLayer === 2 && (
                          <DeviceRegistration
                            studentId={user.uid}
                            registeredDeviceHash={registeredDeviceHash}
                            onRegister={handleDeviceSuccess}
                            onVerify={handleDeviceSuccess}
                            onFailure={(err) => handleLayerFailure('Device', err)}
                          />
                        )}

                        {currentLayer === 3 && (
                          <QRScanner
                            secretKey={qrSecretKey}
                            sessionId={verificationData.device?.deviceHash || 'default-session'}
                            onSuccess={handleQRSuccess}
                            onFailure={(err) => handleLayerFailure('QR', err)}
                          />
                        )}


                        {currentLayer === 4 && (
                          <FaceLivenessVerification
                            onSuccess={handleLivenessSuccess}
                            onFailure={(err) => handleLayerFailure('Liveness', err)}
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  )}

                  {isSubmitting && (
                    <div className="text-center py-12">
                      <Loader className="animate-spin text-purple-500 mx-auto mb-4" size={48} />
                      <div className="text-xl font-bold text-slate-900">Marking Attendance...</div>
                    </div>
                  )}

                  {attendanceMarked && (
                    <div className="text-center py-12">
                      <CheckCircle className="text-green-500 mx-auto mb-6" size={80} />
                      <h2 className="text-3xl font-black text-slate-900 mb-4">
                        Attendance Marked! 🎉
                      </h2>
                      <p className="text-slate-600 mb-8">All verification layers passed successfully</p>
                      <Button variant="gradient" onClick={resetMLPV} fullWidth>
                        Close
                      </Button>
                    </div>
                  )}

                  {error && (
                    <div className="mt-6 bg-red-50 border-2 border-red-500 rounded-xl p-4 text-center">
                      <div className="font-bold text-red-700 mb-2">Error</div>
                      <div className="text-sm text-red-600">{error}</div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Helper Components
const SimpleStat = ({ label, value, color, bg, icon: Icon }) => (
  <Card className="p-8 border-none shadow-lg bg-white flex items-center gap-6 group hover:scale-[1.02] transition-all">
    <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform shadow-inner`}><Icon size={28} /></div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-3xl font-black text-slate-900 leading-none">{value}</p>
    </div>
  </Card>
);

const TabButton = ({ active, label, onClick }) => (
  <button onClick={onClick} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-700'}`}>
    {label}
  </button>
);

const HelpStep = ({ n, t, d }) => (
  <div className="flex gap-4">
    <span className="text-2xl font-black text-purple-200">{n}</span>
    <div>
      <p className="font-black text-xs text-slate-900 uppercase tracking-widest mb-1">{t}</p>
      <p className="text-[10px] font-bold text-slate-400 leading-relaxed">{d}</p>
    </div>
  </div>
);

export default MLPVAttendance;