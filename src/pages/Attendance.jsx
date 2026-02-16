import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { 
  CheckCircle, Clock, Calendar as CalendarIcon, Loader, Shield, 
  AlertCircle, TrendingUp, Camera, ChevronRight, Layout,
  UserCheck, Info, Zap, Search, ArrowUpRight, Target, Star,
  BookOpen, Hash, CheckSquare, X, Database, ShieldCheck,
  Activity, Fingerprint, Cpu, Globe, Lock, BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/shared/GlassCard';
import Button from '../components/ui/Button';
import { getStudentAttendance, markAttendance, getStudentClasses } from '../firebase/database';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import QRScanner from './QRScanner';

// ==========================================
// 1. STABLE CALENDAR STYLING
// ==========================================
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

// ==========================================
// 2. MAIN ATTENDANCE COMPONENT
// ==========================================

const Attendance = () => {
  const { user } = useAuth();
  
  // Data States
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [userClasses, setUserClasses] = useState([]);
  
  // Simple View Navigation
  const [activeTab, setActiveTab] = useState('mark'); 
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Verification States
  const [showScanner, setShowScanner] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [marking, setMarking] = useState(false);
  const [markSuccess, setMarkSuccess] = useState(false);
  const [markError, setMarkError] = useState('');
  const [successDetails, setSuccessDetails] = useState(null);

  // ─── Load Real Data ────────────────────────────────────────────────────────
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
    } catch (err) {
      console.error("Failed to load records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyAttendance(); }, [user]);

  // ─── Data Helpers ──────────────────────────────────────────────────────────
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

  // Filters classes for the sidebar when a date is clicked
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

  // ─── Calendar Logic ────────────────────────────────────────────────────────
  const getTileClass = ({ date, view }) => {
    if (view === 'month') {
      const str = date.toISOString().split('T')[0];
      if (attendanceLookup[str]?.some(r => r.status === 'present')) return 'present-day';
      if (date < new Date().setHours(0,0,0,0) && !attendanceLookup[str]) return 'absent-day';
    }
    return null;
  };

  // ─── Button Actions ────────────────────────────────────────────────────────
  const handleMarkWithOTP = async () => {
    if (otpInput.length !== 6) { setMarkError('Please enter all 6 numbers.'); return; }
    setMarking(true);
    setMarkError('');

    try {
      const q = query(collection(db, 'attendance_sessions'), where('otp', '==', otpInput.trim()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setMarkError('Invalid code. Please check with your teacher.');
        setMarking(false);
        return;
      }

      const session = snap.docs[0];
      const data = session.data();
      
      if (new Date() > new Date(data.expiresAt)) {
        setMarkError('This code has expired.');
        setMarking(false);
        return;
      }

      const result = await markAttendance(session.id, user.uid);
      if (result.success) {
        setMarkSuccess(true);
        setSuccessDetails(`Success for ${data.className || 'Class'}`);
        setOtpInput('');
        fetchMyAttendance();
        setTimeout(() => setMarkSuccess(false), 5000);
      } else {
        setMarkError(result.error);
      }
    } catch (err) {
      setMarkError('Could not connect to database.');
    } finally {
      setMarking(false);
    }
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
        
        {/* Simple Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">
              My Attendance 📱
            </h1>
            <p className="text-slate-500 font-medium">Mark your presence and check your history</p>
          </motion.div>

          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-sm">
            <TabButton active={activeTab === 'mark'} label="Mark Now" onClick={() => setActiveTab('mark')} />
            <TabButton active={activeTab === 'history'} label="My History" onClick={() => setActiveTab('history')} />
          </div>
        </div>

        {/* Simple Stats Hub */}
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
                      <h2 className="text-2xl font-black text-slate-900 mb-8">Enter Class Code</h2>
                      
                      {markSuccess && (
                        <div className="p-5 mb-8 bg-green-50 border-2 border-green-100 rounded-2xl flex items-center gap-4 text-green-700 font-bold">
                          <CheckSquare size={24} /> {successDetails}
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-10">
                         <button onClick={() => setShowScanner(true)} className="p-10 bg-slate-900 rounded-[32px] text-white flex flex-col items-center justify-center gap-4 shadow-xl hover:scale-[1.02] transition-all group">
                            <div className="p-6 bg-blue-600 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/30">
                               <Camera size={40} />
                            </div>
                            <span className="text-sm font-black uppercase tracking-widest">Open Scanner</span>
                         </button>

                         <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-200 flex flex-col justify-center">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 text-center">Or enter the 6-digit OTP</label>
                            <input 
                              type="text" value={otpInput} 
                              onChange={e => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="000000"
                              className="w-full bg-white border-2 border-slate-200 p-6 rounded-2xl text-center text-4xl font-black tracking-[0.2em] outline-none focus:border-blue-500 transition-all mb-6 shadow-inner"
                            />
                            <Button variant="primary" fullWidth size="lg" onClick={handleMarkWithOTP} disabled={marking}>
                               {marking ? 'Checking...' : 'Mark Present'}
                            </Button>
                         </div>
                      </div>

                      {markError && (
                        <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 font-bold text-sm">
                           <AlertCircle size={18} /> {markError}
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* Help Sidebar */}
                  <div className="lg:col-span-4">
                    <Card className="p-8 bg-white border-none shadow-lg h-full">
                       <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <Info size={20} className="text-blue-600" />
                        Help Guide
                       </h3>
                       <div className="space-y-8">
                          <HelpStep n="1" t="Ask for Code" d="Your teacher will show a QR code or a 6-digit number on the screen." />
                          <HelpStep n="2" t="Camera or OTP" d="Use the 'Open Scanner' button or type the 6 numbers manually." />
                          <HelpStep n="3" t="Confirmation" d="Wait for the success message to ensure your seat is logged." />
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
                          <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group hover:bg-slate-900 transition-all">
                             <div>
                                <p className="font-black text-slate-900 text-[13px] uppercase tracking-tighter group-hover:text-white">{rec.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{rec.code} • {new Date(rec.markedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                             </div>
                             <div className="p-2 bg-green-500 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform">
                                <ShieldCheck size={16} />
                             </div>
                          </div>
                        ))
                      )}
                    </div>
                 </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scanner Modal */}
        <AnimatePresence>
          {showScanner && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl">
               <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-xl p-4">
                  <button onClick={() => setShowScanner(false)} className="absolute -top-12 right-0 text-white/70 hover:text-white transition-all"><X size={32} /></button>
                  <div className="bg-white rounded-[40px] p-2 overflow-hidden shadow-2xl border-4 border-white/20">
                     <QRScanner
                       onClose={() => setShowScanner(false)}
                       onScanSuccess={() => {
                         setShowScanner(false);
                         setMarkSuccess(true);
                         fetchMyAttendance();
                         setTimeout(() => setMarkSuccess(false), 5000);
                       }}
                     />
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// HELPER COMPONENTS
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
  <div className="flex gap-5">
    <span className="text-2xl font-black text-blue-100">{n}</span>
    <div>
      <p className="font-black text-xs text-slate-900 uppercase tracking-widest mb-1">{t}</p>
      <p className="text-[10px] font-bold text-slate-400 leading-relaxed max-w-[200px]">{d}</p>
    </div>
  </div>
);

export default Attendance;