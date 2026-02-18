import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Calendar, FileText, Award, CheckCircle,
  Clock, Loader, Bell, TrendingUp, Activity, Star,
  Search, ShieldCheck, ArrowUpRight, QrCode, Settings,
  Layout, ChevronRight
} from 'lucide-react';
import Chatbot from '../components/shared/Chatbot';
import { useAuth } from '../context/AuthContext';
import {
  getStudentClasses, getStudentAssignments,
  getStudentAttendance, getStudentGrades, getStudentSubmissions
} from '../firebase/database';

// ── Design tokens ──────────────────────────────────────────────────────────
const card = {
  background: 'rgba(255,255,255,0.75)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.9)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
};

const ACCENT = '#4f46e5';

// ── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, subtext, icon: Icon, iconBg, trend }) => (
  <motion.div whileHover={{ y: -3 }} className="h-full">
    <div className="p-5 h-full rounded-2xl transition-all duration-300" style={card}>
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
          <Icon size={18} className="text-white" />
        </div>
        {trend !== undefined && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
        <Activity size={10} className="text-indigo-400" /> {subtext}
      </p>
    </div>
  </motion.div>
);

// ── Progress Row ───────────────────────────────────────────────────────────
const ProgressRow = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between items-center mb-1.5">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value}%</span>
    </div>
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  </div>
);

// ── Quick Action Button ────────────────────────────────────────────────────
const ActionBtn = ({ icon: Icon, title, desc, color, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-slate-50 active:scale-[0.99] transition-all text-left group w-full"
    style={{ border: '1px solid #f1f5f9' }}
  >
    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
      style={{ background: `${color}15` }}>
      <Icon size={17} style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-[13px] text-slate-700">{title}</h4>
      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{desc}</p>
    </div>
    <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
  </button>
);

// ── Feed Item ──────────────────────────────────────────────────────────────
const FeedItem = ({ icon: Icon, text, time, color }) => (
  <div className="flex items-center gap-3 group cursor-pointer">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform bg-slate-50">
      <Icon size={15} style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-slate-700 leading-tight">{text}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">{time}</p>
    </div>
    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN STUDENT DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
const StudentDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    classes: [], assignments: [], attendance: [], grades: [], submissions: []
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    Promise.all([
      getStudentClasses(user.uid),
      getStudentAssignments(user.uid),
      getStudentAttendance(user.uid),
      getStudentGrades(user.uid),
      getStudentSubmissions(user.uid)
    ]).then(([cls, asg, att, grd, sub]) => {
      setData({
        classes: cls.success ? cls.classes : [],
        assignments: asg.success ? asg.assignments : [],
        attendance: att.success ? att.attendance : [],
        grades: grd.success ? grd.grades : [],
        submissions: sub.success ? sub.submissions : []
      });
    }).catch(err => console.error('Dashboard error:', err))
      .finally(() => setLoading(false));
  }, [user]);

  const stats = useMemo(() => {
    const subIds = new Set(data.submissions.map(s => s.assignmentId));
    const pending = data.assignments.filter(a => !subIds.has(a.id));
    const present = data.attendance.filter(a => a.status === 'present').length;
    const rate = data.attendance.length > 0 ? Math.round((present / data.attendance.length) * 100) : 0;
    const valid = data.grades.filter(g => g.grade !== null);
    const gpa = valid.length > 0
      ? (valid.reduce((s, g) => s + parseFloat(g.grade), 0) / valid.length).toFixed(2)
      : '0.00';
    return { pending, rate, gpa, present };
  }, [data]);

  const filtered = data.classes.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <Loader className="animate-spin mx-auto mb-3 text-indigo-500" size={28} />
        <p className="text-sm font-medium text-slate-500">Loading your dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-12" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-[1400px] mx-auto">

        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-7 gap-4">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                {new Date().toDateString()}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900" style={{ letterSpacing: '-0.02em' }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
              <span style={{ color: ACCENT }}>{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              You have <span className="font-semibold text-slate-700">{stats.pending.length} assignments</span> pending.
            </p>
          </motion.div>

          <div className="flex gap-2.5">
            <button
              onClick={() => onNavigate('calendar')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-white hover:shadow-sm transition-all border border-slate-200 bg-white/60"
            >
              <Calendar size={15} /> Calendar
            </button>
            <button
              onClick={() => onNavigate('attendance')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}
            >
              <QrCode size={15} /> Mark Attendance
            </button>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <StatCard label="Enrolled Courses" value={data.classes.length} subtext="Active subjects" icon={BookOpen} iconBg="linear-gradient(135deg,#4f46e5,#6366f1)" />
          <StatCard label="Pending Work" value={stats.pending.length} subtext="Assignments due" icon={Clock} iconBg="linear-gradient(135deg,#f59e0b,#fbbf24)" trend={-12} />
          <StatCard label="Attendance Rate" value={`${stats.rate}%`} subtext={`${stats.present} sessions attended`} icon={CheckCircle} iconBg="linear-gradient(135deg,#10b981,#34d399)" trend={5} />
          <StatCard label="Academic GPA" value={stats.gpa} subtext="Cumulative average" icon={Award} iconBg="linear-gradient(135deg,#ec4899,#f472b6)" />
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid lg:grid-cols-12 gap-5">

          {/* Left column */}
          <div className="lg:col-span-8 space-y-5">

            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search classes…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium text-slate-700 placeholder-slate-400 outline-none transition-all"
                style={{ ...card, border: '1.5px solid #e2e8f0' }}
                onFocus={e => e.target.style.borderColor = '#4f46e5'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* My Classes */}
            <div className="rounded-2xl p-6" style={card}>
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">My Classes</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Current semester</p>
                </div>
                <button
                  onClick={() => onNavigate('classes')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: 'rgba(79,70,229,0.07)' }}
                >
                  View all <ArrowUpRight size={13} />
                </button>
              </div>

              <div className="space-y-2.5">
                {filtered.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">No classes found.</p>
                ) : filtered.map((course, i) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group"
                    style={{ border: '1px solid #f1f5f9' }}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white"
                      style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                      <BookOpen size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide text-indigo-600"
                          style={{ background: 'rgba(79,70,229,0.08)' }}>
                          {course.code}
                        </span>
                        <span className="text-[11px] text-slate-400">{course.instructor}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800 truncate">{course.name}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-medium text-slate-400 mb-0.5">Attendance</p>
                      <span className="text-sm font-bold text-slate-800">92%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-4 space-y-5">

            {/* Quick Actions */}
            <div className="rounded-2xl p-5" style={card}>
              <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Layout size={15} className="text-indigo-500" /> Quick Actions
              </h3>
              <div className="space-y-1.5">
                <ActionBtn icon={QrCode} title="Mark Attendance" desc="OTP or QR check-in" color="#4f46e5" onClick={() => onNavigate('attendance')} />
                <ActionBtn icon={FileText} title="Assignments" desc="Submission hub" color="#ec4899" onClick={() => onNavigate('assignments')} />
                <ActionBtn icon={Award} title="Grades" desc="Performance metrics" color="#10b981" onClick={() => onNavigate('grades')} />
                <ActionBtn icon={Settings} title="Settings" desc="Profile configuration" color="#64748b" onClick={() => onNavigate('profile')} />
              </div>
            </div>

            {/* Growth Radar */}
            <div className="rounded-2xl p-5" style={card}>
              <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp size={15} className="text-indigo-500" /> Performance
              </h3>
              <div className="space-y-4">
                <ProgressRow label="Attendance" value={stats.rate} color="linear-gradient(90deg,#4f46e5,#6366f1)" />
                <ProgressRow label="Assignments" value={85} color="linear-gradient(90deg,#ec4899,#f472b6)" />
                <ProgressRow label="Engagement" value={92} color="linear-gradient(90deg,#10b981,#34d399)" />
              </div>
              <button
                onClick={() => onNavigate('profile')}
                className="w-full mt-5 py-2.5 rounded-xl text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-1.5 border border-indigo-100"
              >
                Full Analytics <ArrowUpRight size={13} />
              </button>
            </div>

            {/* Live Feed */}
            <div className="rounded-2xl p-5" style={card}>
              <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Bell size={15} className="text-indigo-500" /> Recent Activity
              </h3>
              <div className="space-y-3.5">
                {data.grades.slice(0, 1).map((g, i) => (
                  <FeedItem key={i} text={`Grade posted: ${g.assignmentTitle || 'recent work'}`} time="Just now" icon={Award} color="#ec4899" />
                ))}
                <FeedItem text="New course material available" time="2h ago" icon={BookOpen} color="#4f46e5" />
                <FeedItem text="Attendance window is active" time="5h ago" icon={ShieldCheck} color="#10b981" />
              </div>
            </div>

          </div>
        </div>
      </div>
      <Chatbot />
    </div>
  );
};

export default StudentDashboard;