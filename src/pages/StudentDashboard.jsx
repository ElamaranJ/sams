import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Calendar, FileText, Award, CheckCircle, 
  Clock, ArrowRight, Loader, Bell, TrendingUp,
  Target, Zap, Activity, Star, Search, Filter,
  Book, ChevronRight, User, Layout, MessageSquare,
  ShieldCheck, ArrowUpRight, Bookmark, Download, X,
  CheckSquare, Info, MoreHorizontal, Layers, Send,
  QrCode, Settings, BarChart3, GraduationCap, Briefcase
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';
import Chatbot from '../components/shared/Chatbot';
import { useAuth } from '../context/AuthContext';
import { 
  getStudentClasses, 
  getStudentAssignments,
  getStudentAttendance,
  getStudentGrades,
  getStudentSubmissions
} from '../firebase/database';

// ==========================================
// 1. SYNCED UI SUB-COMPONENTS
// ==========================================

const StudentStatCard = ({ label, value, subtext, icon: Icon, color, trend }) => (
  <motion.div whileHover={{ y: -5 }} className="h-full">
    <Card className="p-6 h-full border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color} text-white shadow-lg shadow-current/20`}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
        <p className="text-[11px] font-bold text-slate-500 mt-2 flex items-center gap-1">
          <Activity size={12} className="text-blue-500" /> {subtext}
        </p>
      </div>
    </Card>
  </motion.div>
);

const RadarRow = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-bold text-slate-300">{label}</span>
      <span className={`text-sm font-black ${color.replace('bg-', 'text-')}`}>{value}%</span>
    </div>
    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }} 
        animate={{ width: `${value}%` }} 
        transition={{ duration: 1.5, ease: "easeOut" }}
        className={`h-full ${color} rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
      />
    </div>
  </div>
);

// ==========================================
// 2. MAIN STUDENT DASHBOARD COMPONENT
// ==========================================

const StudentDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    classes: [],
    assignments: [],
    attendance: [],
    grades: [],
    submissions: []
  });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMetrics = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const [cls, asg, att, grd, sub] = await Promise.all([
        getStudentClasses(user.uid),
        getStudentAssignments(user.uid),
        getStudentAttendance(user.uid),
        getStudentGrades(user.uid),
        getStudentSubmissions(user.uid)
      ]);

      setDashboardData({
        classes: cls.success ? cls.classes : [],
        assignments: asg.success ? asg.assignments : [],
        attendance: att.success ? att.attendance : [],
        grades: grd.success ? grd.grades : [],
        submissions: sub.success ? sub.submissions : []
      });
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMetrics(); }, [user]);

  const analytics = useMemo(() => {
    const subIds = new Set(dashboardData.submissions.map(s => s.assignmentId));
    const pending = dashboardData.assignments.filter(a => !subIds.has(a.id));
    const present = dashboardData.attendance.filter(a => a.status === 'present').length;
    const rate = dashboardData.attendance.length > 0 ? Math.round((present / dashboardData.attendance.length) * 100) : 0;
    const validGrades = dashboardData.grades.filter(g => g.grade !== null);
    const gpa = validGrades.length > 0 
      ? (validGrades.reduce((acc, curr) => acc + parseFloat(curr.grade), 0) / validGrades.length).toFixed(2)
      : "0.00";

    return { pending, rate, gpa, presentCount: present };
  }, [dashboardData]);

  const filteredClasses = dashboardData.classes.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
        <p className="text-lg font-black text-slate-800 animate-pulse uppercase tracking-tighter">Synchronizing Learning Node...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 pt-24 pb-12">
      <div className="max-w-[1400px] mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-[0.2em] shadow-lg">Student Intelligence</span>
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{new Date().toDateString()}</span>
            </div>
            <h1 className="text-6xl font-black text-slate-900 leading-[0.85] tracking-tighter">
              Level up, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">{user?.name?.split(' ')[0]}</span> 🚀
            </h1>
            <p className="text-slate-500 font-bold text-lg mt-5 max-w-xl">
              Performance status: <span className="text-blue-600 font-black italic">Stable</span>. You have <span className="text-blue-600 font-black">{analytics.pending.length} deliverables</span> waiting.
            </p>
          </motion.div>

          <div className="flex gap-4">
            <button 
              onClick={() => onNavigate('calendar')} 
              className="flex items-center gap-3 px-8 py-5 bg-white border-2 border-slate-100 rounded-[24px] font-black text-slate-800 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
            >
              <Calendar size={20} /> Timeline
            </button>
            <button 
              onClick={() => onNavigate('attendance')} 
              className="flex items-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-[24px] font-black hover:bg-blue-600 transition-all shadow-2xl shadow-blue-200 group"
            >
              <Zap size={20} className="text-blue-400 group-hover:animate-bounce" /> Scan Attendance
            </button>
          </div>
        </div>

        {/* ANALYTICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <StudentStatCard label="Course Load" value={dashboardData.classes.length} subtext="Enrolled Subjects" icon={BookOpen} color="bg-blue-600" />
          <StudentStatCard label="Pending Work" value={analytics.pending.length} subtext="Assignments Due" icon={Clock} color="bg-orange-500" trend={-12} />
          <StudentStatCard label="Presence Rate" value={`${analytics.rate}%`} subtext={`${analytics.presentCount} sessions verified`} icon={CheckCircle} color="bg-emerald-600" trend={5} />
          <StudentStatCard label="Academic GPA" value={analytics.gpa} subtext="Cumulative Score" icon={Award} color="bg-purple-600" />
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8 space-y-10">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={22} />
              <input 
                type="text" 
                placeholder="Query academic records..." 
                className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[28px] focus:outline-none focus:border-blue-500 font-bold transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Card className="p-10 border-none shadow-xl bg-white">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Active Curriculum</h2>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-1">Live Term Overview</p>
                </div>
                <button onClick={() => onNavigate('classes')} className="text-xs font-black text-blue-600 hover:text-blue-700 flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl transition-all">
                  Catalog View <ArrowUpRight size={16} />
                </button>
              </div>

              <div className="space-y-6">
                {filteredClasses.map((course, i) => (
                  <motion.div 
                    key={course.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-6 bg-slate-50/50 border border-slate-100 rounded-[32px] hover:border-blue-200 hover:bg-white hover:shadow-xl transition-all duration-500 group"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                      <div className="flex items-center gap-6 w-full">
                        <div className="w-20 h-20 rounded-[24px] bg-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                          <BookOpen size={32} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg uppercase tracking-widest">{course.code}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase">{course.instructor}</span>
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{course.name}</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-8 w-full sm:w-auto justify-between border-t sm:border-0 pt-4 sm:pt-0">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attendance</p>
                          <span className="text-xl font-black text-slate-900 tracking-tighter">92.0%</span>
                        </div>
                        <button onClick={() => onNavigate('attendance')} className="p-4 bg-white text-slate-900 rounded-2xl border border-slate-200 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <ChevronRight size={24} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <Card className="p-8 bg-white shadow-xl shadow-slate-200/50 border-none">
              <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <Layout size={22} className="text-blue-600" /> Command Matrix
              </h3>
              <div className="grid gap-3">
                <SideActionBtn icon={QrCode} title="Verify Presence" desc="OTP or QR Check-in" color="text-blue-600" bg="bg-blue-50" onClick={() => onNavigate('attendance')} />
                <SideActionBtn icon={FileText} title="Assignments" desc="Submission Hub" color="text-purple-600" bg="bg-purple-50" onClick={() => onNavigate('assignments')} />
                <SideActionBtn icon={Award} title="Grades" desc="Performance metrics" color="text-emerald-600" bg="bg-emerald-50" onClick={() => onNavigate('assignments')} />
                <SideActionBtn icon={Settings} title="Settings" desc="Profile configuration" color="text-orange-600" bg="bg-orange-50" onClick={() => onNavigate('profile')} />
              </div>
            </Card>

            <Card className="p-10 bg-slate-900 text-white border-none relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12">
                <TrendingUp size={140} />
              </div>
              <h3 className="text-2xl font-black mb-10 flex items-center gap-3 relative z-10 tracking-tight">
                <Star size={24} className="text-amber-400 animate-pulse" /> Growth Radar
              </h3>
              <div className="space-y-8 relative z-10">
                <RadarRow label="Attendance" value={analytics.rate} color="bg-blue-500" />
                <RadarRow label="Assignments" value={85} color="bg-purple-500" />
                <RadarRow label="Engagement" value={92} color="bg-emerald-500" />
              </div>
              <div className="mt-12 relative z-10">
                <button onClick={() => onNavigate('profile')} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-3 group">
                  Full Analytics <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </Card>

            <Card className="p-8 border-slate-100 bg-white">
               <h3 className="font-black text-slate-900 mb-6 flex items-center gap-3 tracking-tight">
                 <Bell size={20} className="text-blue-600" /> Live Feed
               </h3>
               <div className="space-y-6">
                 {dashboardData.grades.slice(0, 1).map((g, i) => (
                   <FeedItem key={i} text={`Score returned: ${g.assignmentTitle || 'recent work'}`} time="Just now" icon={Award} color="text-purple-600" />
                 ))}
                 <FeedItem text="New Material available" time="2h ago" icon={BookOpen} color="text-blue-600" />
                 <FeedItem text="Attendance window active" time="5h ago" icon={ShieldCheck} color="text-green-600" />
               </div>
            </Card>
          </div>
        </div>
      </div>
      <Chatbot />
    </div>
  );
};

const SideActionBtn = ({ icon: Icon, title, desc, color, bg, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-5 p-5 rounded-[24px] hover:scale-[1.02] active:scale-[0.98] transition-all text-left group ${bg} border border-white/50 shadow-sm`}>
    <div className={`p-3.5 rounded-2xl bg-white shadow-sm ${color} group-hover:scale-110 transition-transform`}><Icon size={22} /></div>
    <div className="flex-1 min-w-0">
      <h4 className={`font-black text-[14px] ${color}`}>{title}</h4>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-0.5 truncate">{desc}</p>
    </div>
    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
  </button>
);

const FeedItem = ({ icon: Icon, text, time, color }) => (
  <div className="flex items-center gap-4 group cursor-pointer">
    <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}><Icon size={18} className={color} /></div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-black text-slate-800 leading-tight mb-1 group-hover:text-blue-600 transition-colors">{text}</p>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{time}</p>
    </div>
    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
  </div>
);

export default StudentDashboard;