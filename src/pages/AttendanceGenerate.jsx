import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, Clock, Users, Calendar, CheckCircle, AlertCircle,
  BookOpen, Loader, Copy, Shield, UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';
import {
  getFacultyClasses,
  createAttendanceSession,
  getClassAttendanceSessions,
  getSessionAttendees
} from '../firebase/database';

const AttendanceGenerate = () => {
  const { user } = useAuth();
  const [courses, setCourses]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [qrDuration, setQrDuration]     = useState(10);
  const [generatedQR, setGeneratedQR]   = useState(null);
  const [otp, setOtp]                   = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [copied, setCopied]             = useState(false);
  const [attendees, setAttendees]       = useState([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [selectedHistorySession, setSelectedHistorySession] = useState(null);

  const pollRef = useRef(null);

  // ── Fetch faculty classes ───────────────────────────────────────────────────
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

  // ── Session history when course changes ────────────────────────────────────
  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedCourse) return;
      const result = await getClassAttendanceSessions(selectedCourse.id);
      if (result.success) setSessionHistory(result.sessions.slice(0, 15));
    };
    fetchHistory();
    setGeneratedQR(null);
    setOtp('');
    setTimeRemaining(null);
    setAttendees([]);
    setSelectedHistorySession(null);
    clearInterval(pollRef.current);
  }, [selectedCourse]);

  // ── Countdown timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setGeneratedQR(null);
          setOtp('');
          clearInterval(pollRef.current);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

  // ── Poll attendees every 5 s while session is live ─────────────────────────
  const startPollingAttendees = (sessionDocId) => {
    clearInterval(pollRef.current);
    const fetch = async () => {
      setLoadingAttendees(true);
      const res = await getSessionAttendees(sessionDocId);
      if (res.success) setAttendees(res.attendees);
      setLoadingAttendees(false);
    };
    fetch();
    pollRef.current = setInterval(fetch, 5000);
  };

  // ── Generate QR + OTP ───────────────────────────────────────────────────────
  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleGenerateQR = async () => {
    if (!selectedCourse) { alert('Please select a course first'); return; }
    setIsGenerating(true);
    setAttendees([]);

    const newOTP = generateOTP();
    const sessionId = `${selectedCourse.code}-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    // Create session in Database
    const result = await createAttendanceSession({
      classId:     selectedCourse.id,
      classCode:   selectedCourse.code,
      className:   selectedCourse.name,
      facultyId:   user.uid,
      facultyName: user.name,
      otp:         newOTP,
      duration:    qrDuration,
      date:        today,
      sessionId,
    });

    if (result.success) {
      // Small data payload for the QR code
      const qrData = {
        sessionId:  result.sessionId, // This is the ID Scanner needs
        otp:        newOTP,
      };
      
      setOtp(newOTP);
      setGeneratedQR(qrData);
      setTimeRemaining(qrDuration * 60);
      startPollingAttendees(result.sessionId);

      // Refresh history
      const histResult = await getClassAttendanceSessions(selectedCourse.id);
      if (histResult.success) setSessionHistory(histResult.sessions.slice(0, 15));
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

  const formatTime = (s) => {
    if (s === null) return '0:00';
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const viewHistoryAttendees = async (session) => {
    if (selectedHistorySession?.id === session.id) {
      setSelectedHistorySession(null);
      setAttendees([]);
      return;
    }
    setSelectedHistorySession(session);
    setLoadingAttendees(true);
    const res = await getSessionAttendees(session.id);
    if (res.success) setAttendees(res.attendees);
    setLoadingAttendees(false);
  };

  // ── Helper to generate QR Image URL ──
  const getQRUrl = (data) => {
    if (!data) return '';
    // We use a reliable public API to generate the QR image
    const jsonString = JSON.stringify(data);
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(jsonString)}`;
  };

  // ── Attendees table ────────────────────────────────────────────────────────
  const AttendeesTable = ({ list, isLive }) => (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-slate-900 flex items-center gap-2">
          <UserCheck size={18} className="text-green-600" />
          {isLive ? 'Live Attendance' : 'Who Attended'}
          <span className="ml-1 text-sm font-bold text-slate-500">({list.length})</span>
        </h3>
        {isLive && (
          <span className="flex items-center gap-1 text-xs text-green-600 font-semibold animate-pulse">
            <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
            Live
          </span>
        )}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Users size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">No students have marked attendance yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold">
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Method</th>
                <th className="px-3 py-2 text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a, i) => (
                <tr key={a.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-3 py-2 text-slate-400 font-mono">{i + 1}</td>
                  <td className="px-3 py-2 font-semibold text-slate-900">{a.studentName || '—'}</td>
                  <td className="px-3 py-2 text-slate-600">{a.studentEmail || '—'}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      a.method === 'qr'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {a.method === 'qr' ? 'QR Scan' : 'OTP'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-500 text-xs">
                    {a.markedAt ? new Date(a.markedAt).toLocaleTimeString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

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
      <div className="max-w-6xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Generate Attendance QR 📱</h1>
          <p className="text-lg text-slate-600">Create QR codes and OTPs — see who scanned in real time</p>
        </motion.div>

        {courses.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen size={56} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">No Classes Found</h3>
            <p className="text-slate-600">Create a class first from "My Classes" before generating attendance QRs.</p>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">

            {/* ── Left: Generator ── */}
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
                        <button key={d} onClick={() => setQrDuration(d)}
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

              {/* ── Generated QR Display ── */}
              <AnimatePresence>
                {generatedQR && timeRemaining !== null && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                    <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                      <div className="text-center mb-4">
                        <div className={`text-3xl font-black mb-1 ${timeRemaining < 60 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
                          ⏱ {formatTime(timeRemaining)}
                        </div>
                        <p className="text-sm text-slate-600">Session expires in</p>
                      </div>

                      {/* Real QR Code - Using API Image */}
                      <div className="bg-white rounded-2xl p-4 mb-4 flex flex-col items-center border-2 border-blue-100 shadow-sm">
                        <img 
                          src={getQRUrl(generatedQR)}
                          alt="Attendance QR"
                          className="w-full max-w-[220px] h-auto rounded-lg"
                        />
                        <p className="text-xs text-slate-400 font-semibold mt-2">
                          Scan with Student App
                        </p>
                      </div>

                      {/* OTP */}
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
                        Share OTP verbally · Students can also scan the QR
                      </div>

                      {/* Live attendees */}
                      {loadingAttendees && attendees.length === 0 ? (
                        <div className="mt-4 text-center py-4">
                          <Loader className="animate-spin w-6 h-6 text-blue-500 mx-auto" />
                        </div>
                      ) : (
                        <AttendeesTable list={attendees} isLive={true} />
                      )}
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

            {/* ── Right: Session History ── */}
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
                    {sessionHistory.map((session) => (
                      <div key={session.id}>
                        <button
                          onClick={() => viewHistoryAttendees(session)}
                          className="w-full p-4 bg-slate-50 rounded-xl hover:bg-blue-50 transition-colors text-left"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900">{session.className || session.classCode}</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${session.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                              {session.isActive ? 'Active' : 'Ended'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Calendar size={12} />{session.date || session.createdAt?.split('T')[0]}</span>
                            <span className="flex items-center gap-1"><Clock size={12} />{session.duration} min</span>
                          </div>
                        </button>

                        <AnimatePresence>
                          {selectedHistorySession?.id === session.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-1 pb-2">
                                {loadingAttendees ? (
                                  <div className="text-center py-4"><Loader className="animate-spin w-6 h-6 text-blue-500 mx-auto" /></div>
                                ) : (
                                  <AttendeesTable list={attendees} isLive={false} />
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceGenerate;