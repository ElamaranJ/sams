import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, BookOpen, Calendar, TrendingUp, Award, Clock,
  CheckCircle, FileText, QrCode, Bell, Plus, Activity,
  Loader, BarChart3, Trash2, Edit, Megaphone, Settings,
  Search, Filter, ChevronRight, MoreVertical, Layout, 
  MessageSquare, Video, ShieldCheck, Star, ArrowUpRight,
  UserCheck, AlertCircle, Bookmark, Download, Share2
} from 'lucide-react';
import Card from '../components/shared/GlassCard';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { 
  getFacultyClasses, 
  getFacultyAssignments,
  getClassAssignments
} from '../firebase/database';
import { doc, deleteDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import Chatbot from '../components/shared/Chatbot'; //
// ==========================================
// 1. SUB-COMPONENTS (For a cleaner dashboard)
// ==========================================

const StatCard = ({ label, value, subtext, icon: Icon, color, trend }) => (
  <motion.div whileHover={{ y: -5 }} className="h-full">
    <Card className="p-6 h-full border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color} text-white shadow-lg shadow-current/20`}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-black text-slate-900">{value}</h3>
        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
          <Activity size={12} className="text-blue-500" /> {subtext}
        </p>
      </div>
    </Card>
  </motion.div>
);

const SectionHeader = ({ title, subtitle, action, actionIcon: Icon, onAction }) => (
  <div className="flex justify-between items-center mb-6">
    <div>
      <h2 className="text-2xl font-black text-slate-900">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 font-medium">{subtitle}</p>}
    </div>
    {action && (
      <button 
        onClick={onAction}
        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
      >
        <Icon size={16} /> {action}
      </button>
    )}
  </div>
);

// ==========================================
// 2. MAIN FACULTY DASHBOARD COMPONENT
// ==========================================

const FacultyDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  
  // State Management
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', classId: 'all' });

  // Dashboard Statistics
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingGrading: 0,
    avgAttendance: 94.2,
    activeExams: 2
  });

  // ─── Data Fetching ─────────────────────────────────────────────────────────
  const fetchDashboardData = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const [classesRes, assignmentsRes] = await Promise.all([
        getFacultyClasses(user.uid),
        getFacultyAssignments(user.uid)
      ]);

      if (classesRes.success) setClasses(classesRes.classes);
      if (assignmentsRes.success) {
        setAssignments(assignmentsRes.assignments);
        
        // Complex math for stats
        const pending = assignmentsRes.assignments.length; // Simplified for demo
        const students = classesRes.classes.reduce((acc, curr) => acc + (curr.enrolled || 0), 0);
        
        setStats(prev => ({
          ...prev,
          totalStudents: students,
          pendingGrading: pending
        }));
      }

      // Fetch Recent Announcements
      const q = query(collection(db, "announcements"), where("facultyId", "==", user.uid));
      const annSnap = await getDocs(q);
      const annList = annSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAnnouncements(annList.sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds));

    } catch (err) {
      console.error("Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, [user]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleDeleteAssignment = async (id) => {
    if (!window.confirm("Permanently delete this assignment and all submissions?")) return;
    try {
      await deleteDoc(doc(db, 'assignments', id));
      setAssignments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handlePostAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) return;
    try {
      await addDoc(collection(db, "announcements"), {
        ...newAnnouncement,
        facultyId: user.uid,
        facultyName: user.name,
        createdAt: serverTimestamp()
      });
      setShowAnnouncementModal(false);
      setNewAnnouncement({ title: '', content: '', classId: 'all' });
      fetchDashboardData();
    } catch (err) {
      alert("Failed to post: " + err.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
        <p className="text-lg font-black text-slate-800 animate-pulse">Synchronizing Command Center...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 pt-24 pb-12">
      <div className="max-w-[1400px] mx-auto">
        
        {/* TOP BAR / GREETING */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">Faculty Pro</span>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">{new Date().toDateString()}</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 leading-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg mt-2">You have <span className="text-blue-600 font-bold">{stats.pendingGrading} assignments</span> waiting for review today.</p>
          </motion.div>

          <div className="flex gap-3">
            <button 
              onClick={() => setShowAnnouncementModal(true)}
              className="group flex items-center gap-2 px-6 py-4 bg-white border-2 border-slate-200 rounded-2xl font-black text-slate-700 hover:border-purple-500 hover:text-purple-600 transition-all shadow-sm"
            >
              <Megaphone size={20} className="group-hover:rotate-12 transition-transform" /> Post Notice
            </button>
            <button 
              onClick={() => onNavigate('create-assignment')}
              className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
            >
              <Plus size={20} /> Create Assignment
            </button>
          </div>
        </div>
<Chatbot />
        {/* ANALYTICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard label="Student Base" value={stats.totalStudents} subtext="Total enrolled students" icon={Users} color="bg-blue-600" trend={12} />
          <StatCard label="Lecture Load" value={classes.length} subtext="Active courses this term" icon={BookOpen} color="bg-purple-600" />
          <StatCard label="Evaluation" value={stats.pendingGrading} subtext="Submissions to grade" icon={Clock} color="bg-orange-500" trend={-5} />
          <StatCard label="Engagement" value={`${stats.avgAttendance}%`} subtext="Avg. class attendance" icon={UserCheck} color="bg-green-600" trend={2} />
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN (8 Units) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* SEARCH & FILTERS */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search assignments, students, or classes..." 
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 font-medium transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="p-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-500 hover:text-blue-600 transition-all">
                <Filter size={20} />
              </button>
            </div>

            {/* ASSIGNMENT MANAGER */}
            <Card className="p-8">
              <SectionHeader 
                title="Academic Deliverables" 
                subtitle="Manage and track progress of your current assignments" 
                action="View All" 
                actionIcon={ChevronRight}
                onAction={() => onNavigate('evaluate')}
              />

              <div className="space-y-4">
                {assignments.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <FileText size={64} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold">No assignments found matching your criteria.</p>
                  </div>
                ) : (
                  assignments.map((a, i) => (
                    <motion.div 
                      key={a.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-5 bg-white border-2 border-slate-50 rounded-2xl hover:border-blue-100 hover:shadow-md transition-all group relative overflow-hidden"
                    >
                      <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                            <FileText size={28} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md uppercase tracking-widest">{a.classCode}</span>
                              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <Calendar size={12} /> Due: {new Date(a.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{a.title}</h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <p className="text-xs font-black text-slate-400 uppercase">Submissions</p>
                            <p className="text-lg font-black text-slate-900">24/30</p>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => onNavigate('evaluate')} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={20} /></button>
                            <button onClick={() => handleDeleteAssignment(a.id)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20} /></button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Submission Progress Bar */}
                      <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: '80%' }} 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                        />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>

            {/* RECENT ANNOUNCEMENTS */}
            <Card className="p-8">
              <SectionHeader title="Latest Announcements" subtitle="Communication shared with your students" />
              <div className="grid md:grid-cols-2 gap-4">
                {announcements.length === 0 ? (
                  <div className="col-span-2 text-center py-10 text-slate-400 font-bold">No announcements posted recently.</div>
                ) : (
                  announcements.slice(0, 4).map(ann => (
                    <div key={ann.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex justify-between mb-2">
                        <span className="text-[10px] font-black text-purple-600 uppercase tracking-tighter">Broadcast</span>
                        <span className="text-[10px] text-slate-400 font-bold">{new Date(ann.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-black text-slate-900 mb-2 truncate">{ann.title}</h4>
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{ann.content}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>

          </div>

          {/* RIGHT COLUMN (4 Units) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* QUICK ACTIONS PANEL */}
            <Card className="p-8 bg-white shadow-xl shadow-slate-200/50">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Layout size={20} className="text-blue-600" /> Command Center
              </h3>
              <div className="grid gap-3">
                <QuickLinkBtn 
                  icon={QrCode} 
                  title="Generate Attendance" 
                  desc="Create OTP or QR Session" 
                  color="text-blue-600" 
                  bg="bg-blue-50" 
                  onClick={() => onNavigate('generate-qr')} 
                />
                <QuickLinkBtn 
                  icon={Calendar} 
                  title="Schedule Matrix" 
                  desc="Manage timetable & rooms" 
                  color="text-purple-600" 
                  bg="bg-purple-50" 
                  onClick={() => onNavigate('schedule')} 
                />
                <QuickLinkBtn 
                  icon={BarChart3} 
                  title="Export Reports" 
                  desc="Download CSV/PDF analytics" 
                  color="text-emerald-600" 
                  bg="bg-emerald-50" 
                  onClick={() => onNavigate('reports')} 
                />
                <QuickLinkBtn 
                  icon={Users} 
                  title="Student Roster" 
                  desc="View student performance" 
                  color="text-orange-600" 
                  bg="bg-orange-50" 
                  onClick={() => onNavigate('students')} 
                />
              </div>
            </Card>

            {/* CLASS PROGRESS SUMMARY */}
            <Card className="p-8 bg-slate-900 text-white border-none relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp size={120} />
              </div>
              <h3 className="text-xl font-black mb-6 flex items-center gap-2 relative z-10">
                <Star size={20} className="text-amber-400" /> Class Performance
              </h3>
              <div className="space-y-6 relative z-10">
                {classes.slice(0,3).map((c, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-slate-300">{c.code} Attendance</span>
                      <span className="text-sm font-black text-blue-400">92%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: '92%' }} 
                        className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => onNavigate('reports')} className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                Detailed Analytics <ArrowUpRight size={16} />
              </button>
            </Card>

            {/* QUICK REMINDERS */}
            <Card className="p-6 border-slate-100">
               <h3 className="font-black text-slate-900 mb-4">Internal Tasks</h3>
               <div className="space-y-4">
                 <ReminderItem icon={Clock} text="Grade Math Lab Submissions" time="Due in 2h" color="text-orange-600" />
                 <ReminderItem icon={MessageSquare} text="Reply to HOD email" time="Today" color="text-blue-600" />
                 <ReminderItem icon={Video} text="Upload Lecture Recording" time="Yesterday" color="text-slate-400" />
               </div>
            </Card>

          </div>
        </div>
      </div>

      {/* ANNOUNCEMENT MODAL */}
      <AnimatePresence>
        {showAnnouncementModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAnnouncementModal(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-900">New Announcement</h3>
                <button onClick={() => setShowAnnouncementModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Target Class</label>
                  <select 
                    value={newAnnouncement.classId} 
                    onChange={e => setNewAnnouncement({...newAnnouncement, classId: e.target.value})}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-500 outline-none"
                  >
                    <option value="all">All Classes</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Subject</label>
                  <input 
                    type="text" 
                    placeholder="E.g., Class Rescheduled"
                    value={newAnnouncement.title}
                    onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Message Details</label>
                  <textarea 
                    rows={4}
                    placeholder="Write your announcement here..."
                    value={newAnnouncement.content}
                    onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-medium focus:border-blue-500 outline-none resize-none"
                  />
                </div>
                <Button variant="primary" fullWidth size="lg" icon={Send} onClick={handlePostAnnouncement}>
                  Post to Students
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 3. HELPER SUB-COMPONENTS
// ==========================================

const QuickLinkBtn = ({ icon: Icon, title, desc, color, bg, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 p-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all text-left group ${bg}`}
  >
    <div className={`p-3 rounded-xl bg-white shadow-sm ${color} group-hover:scale-110 transition-transform`}>
      <Icon size={22} />
    </div>
    <div>
      <h4 className={`font-black text-sm ${color}`}>{title}</h4>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{desc}</p>
    </div>
    <ChevronRight size={16} className="ml-auto text-slate-300 group-hover:text-blue-500 transition-colors" />
  </button>
);

const ReminderItem = ({ icon: Icon, text, time, color }) => (
  <div className="flex items-center gap-3">
    <div className={`w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center ${color}`}>
      <Icon size={16} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-slate-800 truncate">{text}</p>
      <p className="text-[10px] font-medium text-slate-400 uppercase">{time}</p>
    </div>
    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,1)]" />
  </div>
);

export default FacultyDashboard;