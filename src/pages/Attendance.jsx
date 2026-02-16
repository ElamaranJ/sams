import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, Clock, Calendar, Loader, Shield, 
  AlertCircle, TrendingUp, Camera 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/shared/GlassCard';
import Button from '../components/ui/Button';
import { getStudentAttendance, markAttendance } from '../firebase/database';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import QRScanner from './QRScanner';

const Attendance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [activeTab, setActiveTab] = useState('mark'); // 'mark' or 'history'
  const [showScanner, setShowScanner] = useState(false);
  
  // Mark attendance form
  const [otpInput, setOtpInput] = useState('');
  const [marking, setMarking] = useState(false);
  const [markSuccess, setMarkSuccess] = useState(false);
  const [markError, setMarkError] = useState('');
  const [successDetails, setSuccessDetails] = useState(null);

  const fetchAttendance = async () => {
    if (!user?.uid) return;
    setLoading(true);
    const result = await getStudentAttendance(user.uid);
    if (result.success) setAttendance(result.attendance);
    setLoading(false);
  };

  useEffect(() => { fetchAttendance(); }, [user]);

  const handleMarkAttendance = async () => {
    // 1. Validate Input
    if (!otpInput.trim() || otpInput.length !== 6) { 
      setMarkError('Please enter the 6-digit OTP.'); 
      return; 
    }
    
    setMarking(true);
    setMarkError('');
    setSuccessDetails(null);

    try {
      // 2. Find the session using ONLY the OTP
      // We search the 'attendance_sessions' collection for a document with this OTP
      const q = query(
        collection(db, 'attendance_sessions'),
        where('otp', '==', otpInput.trim())
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setMarkError('Invalid OTP. Please check the code and try again.');
        setMarking(false);
        return;
      }

      // 3. Check if the session is expired
      const now = new Date();
      // We take the first matching session (OTPs should ideally be unique active)
      const sessionDoc = querySnapshot.docs[0];
      const sessionData = sessionDoc.data();
      const expiresAt = new Date(sessionData.expiresAt);

      if (now > expiresAt) {
        setMarkError('This OTP has expired. Ask faculty for a new one.');
        setMarking(false);
        return;
      }

      // 4. Mark the attendance using the Session ID found
      const result = await markAttendance(sessionDoc.id, user.uid);
      
      if (result.success) {
        setMarkSuccess(true);
        setSuccessDetails(`Class: ${sessionData.className || sessionData.classCode}`);
        setOtpInput('');
        fetchAttendance(); // Refresh the list
        setTimeout(() => setMarkSuccess(false), 5000);
      } else {
        setMarkError(result.error || 'Failed to mark attendance.');
      }

    } catch (err) {
      console.error(err);
      setMarkError('System Error: ' + err.message);
    } finally {
      setMarking(false);
    }
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
          <p className="text-lg text-slate-600">Mark your attendance easily</p>
        </motion.div>

        {/* Stats Cards */}
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
            <div className="text-sm font-bold text-slate-500 mb-1">Rate</div>
            <div className="text-3xl font-black text-slate-900">{attendance.length > 0 ? `${attendanceRate}%` : '—'}</div>
          </Card>
          <Card className="p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
              <Calendar size={22} className="text-white" />
            </div>
            <div className="text-sm font-bold text-slate-500 mb-1">Total</div>
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
                    <p className="text-green-700 font-bold">Marked Successfully! 🎉</p>
                    {successDetails && <p className="text-green-600 text-sm">{successDetails}</p>}
                  </div>
                </motion.div>
              )}

              {markError && (
                <div className="p-4 mb-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
                  <AlertCircle className="text-red-600 shrink-0" size={20} />
                  <p className="text-red-700 font-semibold">{markError}</p>
                </div>
              )}

              {/* ── Option 1: Scan QR ── */}
              <button
                onClick={() => setShowScanner(true)}
                className="w-full mb-5 p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-lg transition-all shadow-lg hover:shadow-xl"
              >
                <Camera size={24} />
                Scan QR Code
              </button>

              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-dashed border-slate-200" /></div>
                <div className="relative flex justify-center"><span className="px-3 bg-white text-slate-400 text-sm font-bold">OR enter OTP manually</span></div>
              </div>

              {/* ── Option 2: OTP ONLY ── */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">6-Digit OTP</label>
                  <input 
                    type="text" 
                    value={otpInput} 
                    onChange={e => { setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6)); setMarkError(''); }}
                    placeholder="Enter OTP (e.g., 123456)" 
                    maxLength={6}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500 tracking-widest text-center text-2xl font-black" 
                  />
                  <p className="text-xs text-slate-500 mt-1">Enter the code shown on the faculty screen.</p>
                </div>

                <Button variant="primary" fullWidth icon={CheckCircle} onClick={handleMarkAttendance} disabled={marking}>
                  {marking ? 'Verifying...' : 'Submit OTP'}
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <Shield size={20} className="text-blue-600" />
                Troubleshooting
              </h3>
              <div className="space-y-3 text-sm text-slate-700">
                <p><strong>Camera not working?</strong><br/>Make sure you are using a secure connection (HTTPS) or localhost. Browsers block cameras on insecure IP addresses.</p>
                <p><strong>OTP Invalid?</strong><br/>Ask your faculty to refresh their screen. OTPs expire after 10-15 minutes.</p>
              </div>
            </Card>
          </div>
        )}

        {/* QR Scanner Modal */}
        <AnimatePresence>
          {showScanner && (
            <QRScanner
              onClose={() => setShowScanner(false)}
              onScanSuccess={() => {
                setShowScanner(false);
                setMarkSuccess(true);
                fetchAttendance();
                setTimeout(() => setMarkSuccess(false), 5000);
              }}
            />
          )}
        </AnimatePresence>

        {activeTab === 'history' && (
          <div>
            {attendance.length === 0 ? (
              <Card className="p-12 text-center">
                <Clock size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Records</h3>
                <p className="text-slate-600">You haven't marked any attendance yet.</p>
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