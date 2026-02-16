import { auth, db } from './firebase';
import { useEffect, useState } from 'react';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home, BookOpen, Calendar, FileText, Award, QrCode,
  Users, BarChart3, Settings, Edit, Plus, GraduationCap
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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

// ==========================================
// MAIN DASHBOARD LAYOUT ARCHITECTURE
// ==========================================
const DashboardLayout = () => {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('home');

  // Unified Menu Configuration
  const menuItems = {
    student: [
      { icon: Home, label: 'Dashboard', page: 'home' },
      { icon: BookOpen, label: 'My Classes', page: 'classes' },
      { icon: Calendar, label: 'Calendar', page: 'calendar' },
      { icon: FileText, label: 'Assignments', page: 'assignments' },
      { icon: Award, label: 'Grades', page: 'grades' },
      { icon: QrCode, label: 'Attendance', page: 'attendance' },
    ],
    faculty: [
      { icon: Home, label: 'Dashboard', page: 'home' },
      { icon: BookOpen, label: 'My Classes', page: 'classes' },
      { icon: Users, label: 'Students', page: 'students' },
      { icon: Plus, label: 'Create Assignment', page: 'create-assignment' },
      { icon: Edit, label: 'Evaluate', page: 'evaluate' },
      { icon: QrCode, label: 'Generate QR', page: 'generate-qr' },
      { icon: BarChart3, label: 'Reports', page: 'reports' },
    ],
    admin: [
      { icon: Home, label: 'Dashboard', page: 'home' },
      { icon: Users, label: 'Users', page: 'users' },
      { icon: BookOpen, label: 'Courses', page: 'courses' },
      { icon: Calendar, label: 'Schedule', page: 'schedule' },
      { icon: BarChart3, label: 'Reports', page: 'reports' },
      { icon: Settings, label: 'Settings', page: 'settings' },
    ],
  };

  const items = menuItems[user?.role] || menuItems.student;

  // Render Logic for Home Dashboards
  const renderHomePage = () => {
    switch (user?.role) {
      case 'faculty': 
        return <FacultyDashboard onNavigate={setActivePage} />;
      case 'student': 
        // FIX: Enabled onNavigate for Student Dashboard to make buttons work
        return <StudentDashboard onNavigate={setActivePage} />; 
      case 'admin': 
        return <AdminDashboard onNavigate={setActivePage} />;
      default: 
        return <StudentDashboard onNavigate={setActivePage} />;
    }
  };

  // Visual Identity Logic
  const roleColor = user?.role === 'admin' ? 'from-red-500 to-red-600'
    : user?.role === 'faculty' ? 'from-blue-500 to-purple-600'
    : 'from-blue-600 to-indigo-600'; // Synced Student color to professional blue

  const roleLabel = user?.role === 'admin' ? '🎛️ Admin'
    : user?.role === 'faculty' ? '👨‍🏫 Faculty'
    : '👨‍🎓 Student';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onNavigate={setActivePage} />
      
      {/* GLOBAL SIDEBAR */}
      <div className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r-2 border-slate-100 overflow-y-auto z-40">
        <div className="p-4 border-b border-slate-100">
          <div className={`bg-gradient-to-br ${roleColor} rounded-xl p-4 text-white shadow-lg`}>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-2 font-black text-lg">
              {user?.name?.charAt(0) || '?'}
            </div>
            <div className="font-bold text-sm truncate">{user?.name}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/80">{roleLabel}</div>
          </div>
        </div>

        <div className="p-4 space-y-1">
          {items.map((item, index) => {
            const isActive = activePage === item.page;
            return (
              <motion.button
                key={index}
                onClick={() => setActivePage(item.page)}
                whileHover={{ x: 4 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-sm transition-all ${
                  isActive ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-blue-400' : ''} />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100 space-y-1">
          <motion.button
            onClick={() => setActivePage('profile')}
            whileHover={{ x: 4 }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-sm transition-all ${
              activePage === 'profile' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <GraduationCap size={20} />
            <span>Academic Profile</span>
          </motion.button>
        </div>
      </div>

      {/* DYNAMIC VIEWPORT */}
      <div className="ml-64 pt-16">
        {activePage === 'home' && renderHomePage()}
        
        {/* SHARED NAVIGABLE VIEWS */}
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
        
        {/* FACULTY EXCLUSIVE VIEWS */}
        {user?.role === 'faculty' && (
          <>
            {activePage === 'create-assignment' && <AssignmentCreate onNavigate={setActivePage} />}
            {activePage === 'evaluate' && <AssignmentEvaluation onNavigate={setActivePage} />}
            {activePage === 'generate-qr' && <AttendanceGenerate onNavigate={setActivePage} />}
            {activePage === 'students' && <Students onNavigate={setActivePage} />}
          </>
        )}

        {/* ADMIN EXCLUSIVE VIEWS */}
        {user?.role === 'admin' && (
          <>
            {activePage === 'users' && <UserManagement onNavigate={setActivePage} />}
            {activePage === 'courses' && <CourseManagement onNavigate={setActivePage} />}
            {activePage === 'schedule' && <ScheduleManagement onNavigate={setActivePage} />}
          </>
        )}

        {/* UTILITY VIEWS */}
        {activePage === 'calendar' && <CalendarPage onNavigate={setActivePage} />}
        {activePage === 'grades' && <Grades onNavigate={setActivePage} />}
        {activePage === 'reports' && <Reports onNavigate={setActivePage} />}
        {activePage === 'settings' && <SettingsPage onNavigate={setActivePage} />}
        {activePage === 'profile' && <Profile onNavigate={setActivePage} />}
      </div>
    </div>
  );
};

function App() {
  useEffect(() => {
    console.log('SAMS System Core Initialized:', !!auth, !!db);
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