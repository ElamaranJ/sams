import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, CheckCircle, Clock, Calendar, BookOpen, Loader, Hash, Shield, AlertCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/shared/GlassCard';
import Button from '../components/ui/Button';
import { getStudentAttendance, markAttendance } from '../firebase/database';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const Attendance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [activeTab, setActiveTab] = useState('mark'); // 'mark' or 'history'
  
  // Mark attendance form
  const [sessionId, setSessionId] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [marking, setMarking] = useState(false);
  const [markSuccess, setMarkSuccess] = useState(false);
  const [markError, setMarkError] = useState('');

  const fetchAttendance = async () => {
    if (!user?.uid) return;
    setLoading(true);
    const result = await getStudentAttendance(user.uid);
    if (result.success) setAttendance(result.attendance);
    setLoading(false);
  };

  useEffect(() => { fetchAttendance(); }, [user]);

  const handleMarkAttendance = async () => {
    if (!sessionId.trim()) { setMarkError('Please enter the Session ID from your faculty.'); return; }
    if (!otpInput.trim() || otpInput.length !== 6) { setMarkError('Please enter the 6-digit OTP.'); return; }
    
    setMarking(true);
    setMarkError('');

    try {
      // First verify the OTP matches the session
      const sessionSnap = await getDocs(query(
        collection(db, 'attendance_sessions'),
        where('sessionId', '==', sessionId.trim())
      ));

      if (sessionSnap.empty) {
        // Try by document ID
        const { getDoc, doc } = await import('firebase/firestore');
        const sessionDoc = await getDoc(doc(db, 'attendance_sessions', sessionId.trim()));
        if (!sessionDoc.exists()) {
          setMarkError('Session not found. Please check the Session ID.');
          setMarking(false);
          return;
        }
        const session = sessionDoc.data();
        // Check OTP
        if (session.otp !== otpInput.trim()) {
          setMarkError('Incorrect OTP. Please try again.');
          setMarking(false);
          return;
        }
        // Check expiry
        const expiresAt = new Date(session.expiresAt);
        if (new Date() > expiresAt) {
          setMarkError('This session has expired.');
          setMarking(false);
          return;
        }
        // Mark attendance
        const result = await markAttendance(sessionDoc.id, user.uid);
        if (result.success) {
          setMarkSuccess(true);
          setSessionId('');
          setOtpInput('');
          fetchAttendance();
          setTimeout(() => setMarkSuccess(false), 5000);
        } else {
          setMarkError(result.error || 'Failed to mark attendance.');
        }
      } else {
        const sessionDoc = sessionSnap.docs[0];
        const session = sessionDoc.data();
        if (session.otp !== otpInput.trim()) {
          setMarkError('Incorrect OTP. Please try again.');
          setMarking(false);
          return;
        }
        const expiresAt = new Date(session.expiresAt);
        if (new Date() > expiresAt) {
          setMarkError('This session has expired.');
          setMarking(false);
          return;
        }
        const result = await markAttendance(sessionDoc.id, user.uid);
        if (result.success) {
          setMarkSuccess(true);
          setSessionId('');
          setOtpInput('');
          fetchAttendance();
          setTimeout(() => setMarkSuccess(false), 5000);
        } else {
          setMarkError(result.error || 'Failed to mark attendance.');
        }
      }
    } catch (err) {
      setMarkError('Error: ' + err.message);
    }
    setMarking(false);
  };

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-700">Loading attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Attendance 📱</h1>
          <p className="text-lg text-slate-600">Mark your attendance using QR code and OTP</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
              <CheckCircle size={22} className="text-white" />
            </div>
            <div className="text-sm font-bold text-slate-500 mb-1">Present</div>
            <div className="text-3xl font-black text-slate-900">{presentCount}</div>
          </Card>
          <Card className="p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
              <TrendingUp size={22} className="text-white" />
            </div>
            <div className="text-sm font-bold text-slate-500 mb-1">Attendance Rate</div>
            <div className="text-3xl font-black text-slate-900">{attendance.length > 0 ? `${attendanceRate}%` : '—'}</div>
          </Card>
          <Card className="p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
              <Calendar size={22} className="text-white" />
            </div>
            <div className="text-sm font-bold text-slate-500 mb-1">Total Sessions</div>
            <div className="text-3xl font-black text-slate-900">{attendance.length}</div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          {[
            { id: 'mark', label: '📱 Mark Attendance' },
            { id: 'history', label: '📋 History' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'mark' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-black text-slate-900 mb-5">Mark Your Attendance</h2>

              {markSuccess && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="p-4 mb-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={24} />
                  <div>
                    <p className="text-green-700 font-bold">Attendance marked successfully! ✅</p>
                    <p className="text-green-600 text-sm">Your attendance has been recorded.</p>
                  </div>
                </motion.div>
              )}

              {markError && (
                <div className="p-4 mb-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
                  <AlertCircle className="text-red-600" size={20} />
                  <p className="text-red-700 font-semibold">{markError}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Session ID</label>
                  <input type="text" value={sessionId} onChange={e => { setSessionId(e.target.value); setMarkError(''); }}
                    placeholder="Enter session ID from faculty"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500" />
                  <p className="text-xs text-slate-500 mt-1">Your faculty will display the Session ID on the board.</p>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">6-Digit OTP</label>
                  <input type="text" value={otpInput} onChange={e => { setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6)); setMarkError(''); }}
                    placeholder="Enter OTP (e.g., 123456)" maxLength={6}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500 tracking-widest text-center text-2xl font-black" />
                  <p className="text-xs text-slate-500 mt-1">Your faculty will tell you this 6-digit OTP verbally.</p>
                </div>

                <Button variant="primary" fullWidth icon={CheckCircle} onClick={handleMarkAttendance} disabled={marking}>
                  {marking ? 'Marking...' : 'Mark Attendance'}
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <Shield size={20} className="text-blue-600" />
                How to Mark Attendance
              </h3>
              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex gap-3 p-3 bg-white rounded-xl">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">1</span>
                  <p>Your faculty generates a QR code in the "Generate QR" section</p>
                </div>
                <div className="flex gap-3 p-3 bg-white rounded-xl">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">2</span>
                  <p>Faculty gives you the <strong>Session ID</strong> (shown on their screen)</p>
                </div>
                <div className="flex gap-3 p-3 bg-white rounded-xl">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">3</span>
                  <p>Faculty verbally tells you the <strong>6-digit OTP</strong></p>
                </div>
                <div className="flex gap-3 p-3 bg-white rounded-xl">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">4</span>
                  <p>Enter both here and click <strong>"Mark Attendance"</strong></p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {attendance.length === 0 ? (
              <Card className="p-12 text-center">
                <Clock size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Attendance Records</h3>
                <p className="text-slate-600">Your attendance history will appear here after you mark attendance.</p>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b-2 border-slate-100">
                        <th className="text-left px-6 py-4 text-sm font-black text-slate-700">Date</th>
                        <th className="text-left px-6 py-4 text-sm font-black text-slate-700">Class</th>
                        <th className="text-left px-6 py-4 text-sm font-black text-slate-700">Status</th>
                        <th className="text-left px-6 py-4 text-sm font-black text-slate-700">Marked At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((record, i) => (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                            {record.date || record.markedAt?.split('T')[0] || '—'}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{record.classId}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${record.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {record.status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {record.markedAt ? new Date(record.markedAt).toLocaleTimeString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;