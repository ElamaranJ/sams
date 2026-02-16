import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Clock, Users, Calendar, CheckCircle, AlertCircle, BookOpen, Loader, RefreshCw, Copy, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';
import { getFacultyClasses, createAttendanceSession, getClassAttendanceSessions } from '../firebase/database';

const AttendanceGenerate = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [qrDuration, setQrDuration] = useState(10);
  const [generatedQR, setGeneratedQR] = useState(null);
  const [otp, setOtp] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user?.uid) return;
      setLoading(true);
      const result = await getFacultyClasses(user.uid);
      if (result.success) {
        setCourses(result.classes);
        if (result.classes.length > 0) setSelectedCourse(result.classes[0]);
      }
      setLoading(false);
    };
    fetchClasses();
  }, [user]);

  // Fetch session history when course changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedCourse) return;
      const result = await getClassAttendanceSessions(selectedCourse.id);
      if (result.success) setSessionHistory(result.sessions.slice(0, 10));
    };
    fetchHistory();
  }, [selectedCourse]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setGeneratedQR(null);
            setOtp('');
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleGenerateQR = async () => {
    if (!selectedCourse) { alert('Please select a course first'); return; }
    setIsGenerating(true);

    const newOTP = generateOTP();
    const sessionId = `${selectedCourse.code}-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    // Save to Firebase
    const result = await createAttendanceSession({
      classId: selectedCourse.id,
      classCode: selectedCourse.code,
      className: selectedCourse.name,
      facultyId: user.uid,
      facultyName: user.name,
      otp: newOTP,
      duration: qrDuration,
      date: today,
      sessionId
    });

    if (result.success) {
      const qrData = {
        sessionId: result.sessionId,
        courseCode: selectedCourse.code,
        courseName: selectedCourse.name,
        otp: newOTP,
        validFor: `${qrDuration} minutes`
      };
      setOtp(newOTP);
      setGeneratedQR(qrData);
      setTimeRemaining(qrDuration * 60);

      // Refresh history
      const histResult = await getClassAttendanceSessions(selectedCourse.id);
      if (histResult.success) setSessionHistory(histResult.sessions.slice(0, 10));
    } else {
      alert('Error creating session: ' + result.error);
    }
    setIsGenerating(false);
  };

  const copyOTP = () => {
    navigator.clipboard.writeText(otp).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds) => {
    if (seconds === null) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-700">Loading your classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Generate Attendance QR 📱</h1>
          <p className="text-lg text-slate-600">Create QR codes and OTPs for student attendance</p>
        </motion.div>

        {courses.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen size={56} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">No Classes Found</h3>
            <p className="text-slate-600">Create a class first from the "My Classes" section before generating attendance QRs.</p>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Generator */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-black text-slate-900 mb-5">Setup Attendance Session</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Select Course</label>
                    <select
                      value={selectedCourse?.id || ''}
                      onChange={e => setSelectedCourse(courses.find(c => c.id === e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500"
                    >
                      {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">QR Valid Duration</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[5, 10, 15, 20].map(d => (
                        <button key={d}
                          onClick={() => setQrDuration(d)}
                          className={`p-3 rounded-xl font-bold transition-all ${qrDuration === d ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-700 hover:bg-blue-50'}`}>
                          {d} min
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button variant="primary" fullWidth icon={QrCode} onClick={handleGenerateQR} disabled={isGenerating}>
                    {isGenerating ? 'Generating...' : 'Generate QR + OTP'}
                  </Button>
                </div>
              </Card>

              {/* Generated QR Display */}
              <AnimatePresence>
                {generatedQR && timeRemaining !== null && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                    <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                      <div className="text-center mb-4">
                        <div className={`text-3xl font-black mb-2 ${timeRemaining < 60 ? 'text-red-600' : 'text-blue-600'}`}>
                          ⏱ {formatTime(timeRemaining)}
                        </div>
                        <p className="text-sm text-slate-600">Session expires in</p>
                      </div>

                      {/* QR Code Placeholder */}
                      <div className="bg-white rounded-2xl p-6 mb-4 text-center border-2 border-blue-100">
                        <QrCode size={80} className="text-blue-600 mx-auto mb-3" />
                        <p className="text-xs text-slate-500 font-semibold">Session ID: {generatedQR.sessionId?.slice(-10)}</p>
                      </div>

                      {/* OTP Display */}
                      <div className="bg-white rounded-xl p-4 border-2 border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-slate-700">OTP Code</span>
                          <button onClick={copyOTP} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                            <Copy size={12} /> {copied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <div className="flex gap-2 justify-center">
                          {otp.split('').map((digit, i) => (
                            <div key={i} className="w-10 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl font-black text-blue-800">
                              {digit}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 text-center text-sm text-slate-600">
                        <Shield size={14} className="inline mr-1" />
                        Share this OTP with students verbally in class
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {!generatedQR && (
                <Card className="p-6 bg-yellow-50 border-yellow-200 text-center">
                  <AlertCircle size={32} className="text-yellow-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-700">No active QR session. Click "Generate QR + OTP" to start attendance.</p>
                </Card>
              )}
            </div>

            {/* Right: Session History */}
            <div>
              <Card className="p-6">
                <h2 className="text-xl font-black text-slate-900 mb-5">Session History</h2>
                {sessionHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock size={36} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No sessions yet for this class.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessionHistory.map((session, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900">{session.className || session.classCode}</span>
                          <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            {session.isActive ? 'Active' : 'Completed'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Calendar size={12} />{session.date || session.createdAt?.split('T')[0]}</span>
                          <span className="flex items-center gap-1"><Clock size={12} />{session.duration} min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-6 mt-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <h3 className="text-lg font-black text-slate-900 mb-3">How it works 📋</h3>
                <div className="space-y-2 text-sm text-slate-700">
                  <div className="flex gap-2 items-start"><CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" /><span>Generate QR + OTP for your class</span></div>
                  <div className="flex gap-2 items-start"><CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" /><span>Share the OTP verbally with students</span></div>
                  <div className="flex gap-2 items-start"><CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" /><span>Students scan QR & enter OTP on their Attendance page</span></div>
                  <div className="flex gap-2 items-start"><CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" /><span>QR expires automatically after the set duration</span></div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceGenerate;