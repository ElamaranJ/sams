import { auth, db } from './firebase';
import { useEffect, useState } from 'react';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, BookOpen, Calendar, FileText, Award, QrCode,
  Users, BarChart3, Settings, Edit, Plus,
  ChevronRight, Bell, Search, LogOut, X, User,
  GraduationCap
} from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AssignmentUpload from './pages/AssignmentUpload';
import AssignmentEvaluation from './pages/AssignmentEvaluation';
import AssignmentCreate from './pages/AssignmentCreate';
import Attendance from './pages/Attendance';
import AttendanceGenerate from './pages/AttendanceGenerate';
import SettingsPage from './pages/Settings';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import CalendarPage from './pages/Calendar';
import Classes from './pages/Classes';
import Grades from './pages/Grades';
import FacultyClasses from './pages/FacultyClasses';
import Students from './pages/Students';
import UserManagement from './pages/UserManagement';
import CourseManagement from './pages/CourseManagement';
import ScheduleManagement from './pages/ScheduleManagement';

import Navbar from './components/layout/Navbar';

// ── Protected Route ──────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ── Public Route ─────────────────────────────────────────────────────────────
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

// ══════════════════════════════════════════════════════════════════════════════
//  DASHBOARD LAYOUT — professional light glassmorphism
// ══════════════════════════════════════════════════════════════════════════════
const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState('home');
  const [collapsed, setCollapsed] = React.useState(false);
  const [expandedGroup, setExpandedGroup] = React.useState('home');
  const [showNotifs, setShowNotifs] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      // ProtectedRoute redirects automatically when isAuthenticated → false
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // ── Menu config ────────────────────────────────────────────────────────────
  const menuItems = {
    student: [
      {
        icon: Home, label: 'Dashboard', page: 'home',
        sub: [
          { label: 'Overview', page: 'home' },
          { label: 'Calendar', page: 'calendar' },
          { label: 'Grades', page: 'grades' },
        ],
      },
      { icon: BookOpen, label: 'My Classes', page: 'classes' },
      { icon: FileText, label: 'Assignments', page: 'assignments' },
      { icon: QrCode, label: 'Attendance', page: 'attendance' },
      { icon: Award, label: 'Grades', page: 'grades' },
    ],
    faculty: [
      {
        icon: Home, label: 'Dashboard', page: 'home',
        sub: [
          { label: 'Overview', page: 'home' },
          { label: 'Reports', page: 'reports' },
        ],
      },
      { icon: BookOpen, label: 'My Classes', page: 'classes' },
      { icon: Users, label: 'Students', page: 'students' },
      { icon: Plus, label: 'Create Assignment', page: 'create-assignment' },
      { icon: Edit, label: 'Evaluate', page: 'evaluate' },
      { icon: QrCode, label: 'Generate QR', page: 'generate-qr' },
      { icon: BarChart3, label: 'Reports', page: 'reports' },
    ],
    admin: [
      {
        icon: Home, label: 'Dashboard', page: 'home',
        sub: [
          { label: 'Overview', page: 'home' },
          { label: 'Reports', page: 'reports' },
        ],
      },
      { icon: Users, label: 'Users', page: 'users' },
      { icon: BookOpen, label: 'Courses', page: 'courses' },
      { icon: Calendar, label: 'Schedule', page: 'schedule' },
      { icon: BarChart3, label: 'Reports', page: 'reports' },
      { icon: Settings, label: 'Settings', page: 'settings' },
    ],
  };

  const items = menuItems[user?.role] || menuItems.student;

  const renderHomePage = () => {
    switch (user?.role) {
      case 'faculty': return <FacultyDashboard onNavigate={setActivePage} />;
      case 'admin': return <AdminDashboard onNavigate={setActivePage} />;
      default: return <StudentDashboard onNavigate={setActivePage} />;
    }
  };

  const roleInitial = user?.name?.charAt(0)?.toUpperCase() || '?';
  const W = collapsed ? '68px' : '256px';

  const notifications = [
    { id: 1, text: 'Attendance window is now open', time: '2 min ago', color: '#10b981' },
    { id: 2, text: 'Assignment deadline tomorrow', time: '1 hr ago', color: '#f59e0b' },
    { id: 3, text: 'New grade posted for CS101', time: '3 hrs ago', color: '#6366f1' },
  ];

  const pageTitle = items.find(i => i.page === activePage)?.label ||
    items.flatMap(i => i.sub || []).find(s => s.page === activePage)?.label ||
    'Dashboard';

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Inter', sans-serif", background: '#f8fafc' }}
    >
      {/* ══ SIDEBAR ══ */}
      <motion.aside
        animate={{ width: W }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="fixed left-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid #e2e8f0',
          boxShadow: '4px 0 24px rgba(0,0,0,0.04)',
        }}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-100 ${collapsed ? 'justify-center' : ''}`}>
          <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            <GraduationCap size={16} className="text-white" />
          </div>
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="font-bold text-slate-800 text-base tracking-tight">
              SAMS
            </motion.span>
          )}
          {!collapsed && (
            <button onClick={() => setCollapsed(true)}
              className="ml-auto w-6 h-6 rounded-md hover:bg-slate-100 flex items-center justify-center transition-colors">
              <ChevronRight size={14} className="text-slate-400 rotate-180" />
            </button>
          )}
        </div>

        {collapsed && (
          <button onClick={() => setCollapsed(false)}
            className="mx-auto mt-3 w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
            <ChevronRight size={14} className="text-slate-400" />
          </button>
        )}

        {/* User info */}
        {!collapsed && (
          <div className="px-4 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                {roleInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5" style={{ scrollbarWidth: 'none' }}>
          {!collapsed && (
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2 mb-2">Navigation</p>
          )}
          {items.map((item, i) => {
            const isActive = activePage === item.page || item.sub?.some(s => s.page === activePage);
            const isExpanded = expandedGroup === item.page && item.sub;
            return (
              <div key={i}>
                <button
                  onClick={() => {
                    if (item.sub) {
                      setExpandedGroup(isExpanded ? null : item.page);
                      setActivePage(item.page);
                    } else {
                      setActivePage(item.page);
                      setExpandedGroup(null);
                    }
                  }}
                  title={collapsed ? item.label : ''}
                  className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${collapsed ? 'justify-center' : ''}`}
                  style={isActive
                    ? { background: 'rgba(79,70,229,0.08)', color: '#4f46e5' }
                    : { color: '#64748b' }
                  }
                >
                  <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={isActive
                      ? { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 2px 8px rgba(79,70,229,0.3)' }
                      : { background: '#f1f5f9' }
                    }>
                    <item.icon size={15} style={{ color: isActive ? '#fff' : '#94a3b8' }} />
                  </div>
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.sub && (
                        <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronRight size={13} className="text-slate-300" />
                        </motion.div>
                      )}
                    </>
                  )}
                </button>

                {!collapsed && item.sub && (
                  <motion.div
                    initial={false}
                    animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-10 mt-0.5 space-y-0.5 pb-1">
                      {item.sub.map((sub, j) => (
                        <button key={j} onClick={() => setActivePage(sub.page)}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all"
                          style={activePage === sub.page
                            ? { color: '#4f46e5', background: 'rgba(79,70,229,0.06)' }
                            : { color: '#94a3b8' }
                          }>
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 pb-4 space-y-1 border-t border-slate-100 pt-3">
          <button
            onClick={() => { setActivePage('settings'); }}
            title={collapsed ? 'Settings' : ''}
            className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <div className="shrink-0 w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <Settings size={15} className="text-slate-400" />
            </div>
            {!collapsed && <span>Settings</span>}
          </button>

          <button
            onClick={handleLogout}
            title={collapsed ? 'Sign out' : ''}
            className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <div className="shrink-0 w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <LogOut size={15} className="text-slate-400" />
            </div>
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </motion.aside>

      {/* ══ MAIN CONTENT ══ */}
      <motion.div
        animate={{ marginLeft: W }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 min-h-screen flex flex-col"
      >
        {/* Top Bar */}
        <div
          className="sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div>
            <h1 className="text-base font-semibold text-slate-800">{pageTitle}</h1>
            <p className="text-xs text-slate-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Search */}
            <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <Search size={17} className="text-slate-500" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }}
                className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <Bell size={17} className="text-slate-500" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
              </button>

              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden z-50"
                    style={{
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                    }}
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                      <span className="text-sm font-semibold text-slate-800">Notifications</span>
                      <button onClick={() => setShowNotifs(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={15} />
                      </button>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {notifications.map(n => (
                        <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
                          <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ background: n.color }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 leading-snug">{n.text}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2.5 border-t border-slate-100">
                      <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                        Mark all as read
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User menu */}
            <div className="relative ml-1">
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm transition-all hover:opacity-90 ring-2 ring-white"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
              >
                {roleInitial}
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-11 w-52 rounded-2xl overflow-hidden z-50"
                    style={{
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                    }}
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                    </div>
                    <button onClick={() => { setActivePage('profile'); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all font-medium">
                      <User size={15} /> Profile
                    </button>
                    <button onClick={() => { setActivePage('settings'); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all font-medium">
                      <Settings size={15} /> Settings
                    </button>
                    <div className="border-t border-slate-100">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium">
                        <LogOut size={15} /> Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6 pb-10">
          {activePage === 'home' && renderHomePage()}

          {activePage === 'classes' && (
            user?.role === 'faculty'
              ? <FacultyClasses onNavigate={setActivePage} />
              : <Classes onNavigate={setActivePage} />
          )}
          {activePage === 'assignments' && (
            user?.role === 'student'
              ? <AssignmentUpload onNavigate={setActivePage} />
              : <AssignmentEvaluation onNavigate={setActivePage} />
          )}
          {activePage === 'attendance' && <Attendance onNavigate={setActivePage} />}

          {user?.role === 'faculty' && (
            <>
              {activePage === 'create-assignment' && <AssignmentCreate onNavigate={setActivePage} />}
              {activePage === 'evaluate' && <AssignmentEvaluation onNavigate={setActivePage} />}
              {activePage === 'generate-qr' && <AttendanceGenerate onNavigate={setActivePage} />}
              {activePage === 'students' && <Students onNavigate={setActivePage} />}
            </>
          )}
          {user?.role === 'admin' && (
            <>
              {activePage === 'users' && <UserManagement onNavigate={setActivePage} />}
              {activePage === 'courses' && <CourseManagement onNavigate={setActivePage} />}
              {activePage === 'schedule' && <ScheduleManagement onNavigate={setActivePage} />}
            </>
          )}

          {activePage === 'calendar' && <CalendarPage onNavigate={setActivePage} />}
          {activePage === 'grades' && <Grades onNavigate={setActivePage} />}
          {activePage === 'reports' && <Reports onNavigate={setActivePage} />}
          {activePage === 'settings' && <SettingsPage onNavigate={setActivePage} />}
          {activePage === 'profile' && <Profile onNavigate={setActivePage} />}
        </div>
      </motion.div>

      {/* Click-outside overlay */}
      {(showNotifs || showUserMenu) && (
        <div className="fixed inset-0 z-30"
          onClick={() => { setShowNotifs(false); setShowUserMenu(false); }} />
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  APP ROOT
// ══════════════════════════════════════════════════════════════════════════════
function App() {
  useEffect(() => {
    console.log('SAMS initialized:', !!auth, !!db);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PublicRoute><Navbar /><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;