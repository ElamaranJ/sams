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

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

// Dashboard Layout
const DashboardLayout = () => {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('home');

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

  const renderHomePage = () => {
    switch (user?.role) {
      case 'faculty': return <FacultyDashboard />;
      case 'student': return <StudentDashboard />;
      case 'admin': return <AdminDashboard />;
      default: return <StudentDashboard />;
    }
  };

  const roleColor = user?.role === 'admin' ? 'from-red-500 to-red-600'
    : user?.role === 'faculty' ? 'from-blue-500 to-purple-600'
    : 'from-green-500 to-emerald-600';

  const roleLabel = user?.role === 'admin' ? '🎛️ Admin'
    : user?.role === 'faculty' ? '👨‍🏫 Faculty'
    : '👨‍🎓 Student';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onNavigate={setActivePage} />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r-2 border-slate-100 overflow-y-auto z-40">
        {/* User Info in Sidebar */}
        <div className="p-4 border-b border-slate-100">
          <div className={`bg-gradient-to-br ${roleColor} rounded-xl p-4 text-white`}>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-2 font-black text-lg">
              {user?.name?.charAt(0) || '?'}
            </div>
            <div className="font-bold text-sm truncate">{user?.name}</div>
            <div className="text-xs text-white/80">{roleLabel}</div>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                  isActive ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Profile & Settings at bottom */}
        <div className="p-4 border-t border-slate-100 space-y-1">
          <motion.button
            onClick={() => setActivePage('profile')}
            whileHover={{ x: 4 }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
              activePage === 'profile' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <GraduationCap size={20} />
            <span>Profile</span>
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 pt-16">
        {activePage === 'home' && renderHomePage()}
        
        {/* Student Pages */}
        {user?.role === 'student' && activePage === 'assignments' && <AssignmentUpload />}
        {user?.role === 'student' && activePage === 'attendance' && <Attendance />}
        
        {/* Faculty Pages */}
        {user?.role === 'faculty' && activePage === 'create-assignment' && <AssignmentCreate />}
        {user?.role === 'faculty' && activePage === 'evaluate' && <AssignmentEvaluation />}
        {user?.role === 'faculty' && activePage === 'generate-qr' && <AttendanceGenerate />}
        
        {/* Common Pages */}
        {activePage === 'classes' && user?.role === 'faculty' && <FacultyClasses />}
        {activePage === 'classes' && user?.role !== 'faculty' && <Classes />}
        {activePage === 'calendar' && <CalendarPage />}
        {activePage === 'grades' && <Grades />}
        {activePage === 'students' && <Students />}
        {activePage === 'reports' && <Reports />}
        {activePage === 'users' && user?.role === 'admin' && <UserManagement />}
        {activePage === 'courses' && user?.role === 'admin' && <CourseManagement />}
        {activePage === 'schedule' && user?.role === 'admin' && <ScheduleManagement />}
        {activePage === 'settings' && <SettingsPage />}
        {activePage === 'profile' && <Profile />}
      </div>
    </div>
  );
};

// Main App
function App() {
  useEffect(() => {
    console.log('Firebase connected:', !!auth, !!db);
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