import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home, BookOpen, Calendar, FileText, Award, QrCode,
  Users, BarChart3, Settings, Edit, Plus
} from 'lucide-react';

// Import AuthContext from the separate file
import { AuthProvider, useAuth } from './context/AuthContext';

// Import your pages
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

// Import shared components
import Navbar from './components/layout/Navbar';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Dashboard Layout Component
const DashboardLayout = () => {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('home');

  // Define menu items based on role
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
      { icon: BarChart3, label: 'Analytics', page: 'reports' },
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

  // Render appropriate dashboard based on role
  const renderHomePage = () => {
    switch (user?.role) {
      case 'faculty':
        return <FacultyDashboard />;
      case 'student':
        return <StudentDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r-2 border-slate-100 overflow-y-auto z-40">
        <div className="p-4 space-y-1">
          {items.map((item, index) => {
            const isActive = activePage === item.page;
            
            return (
              <motion.button
                key={index}
                onClick={() => setActivePage(item.page)}
                whileHover={{ x: 4 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Quick Stats in Sidebar */}
        <div className="p-4 mt-4 border-t-2 border-slate-100">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-100">
            <div className="text-xs font-bold text-slate-500 mb-2">Quick Stats</div>
            <div className="space-y-2">
              {user?.role === 'faculty' ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Students</span>
                    <span className="text-sm font-bold text-slate-900">156</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Pending Grading</span>
                    <span className="text-sm font-bold text-orange-600">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Avg Attendance</span>
                    <span className="text-sm font-bold text-green-600">89%</span>
                  </div>
                </>
              ) : user?.role === 'admin' ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Users</span>
                    <span className="text-sm font-bold text-slate-900">1,245</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Active Courses</span>
                    <span className="text-sm font-bold text-blue-600">48</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">System Health</span>
                    <span className="text-sm font-bold text-green-600">98%</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Classes Today</span>
                    <span className="text-sm font-bold text-slate-900">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Pending</span>
                    <span className="text-sm font-bold text-orange-600">2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Attendance</span>
                    <span className="text-sm font-bold text-green-600">94%</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
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
        {activePage === 'classes' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900">
              {user?.role === 'faculty' ? 'My Classes' : 'Enrolled Classes'}
            </h2>
            <p className="text-slate-600 mt-2">Classes page coming soon...</p>
          </div>
        )}
        {activePage === 'calendar' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900">Calendar</h2>
            <p className="text-slate-600 mt-2">Calendar page coming soon...</p>
          </div>
        )}
        {activePage === 'grades' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900">Grades</h2>
            <p className="text-slate-600 mt-2">Grades page coming soon...</p>
          </div>
        )}
        {activePage === 'students' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900">Students</h2>
            <p className="text-slate-600 mt-2">Student management page coming soon...</p>
          </div>
        )}
        {activePage === 'reports' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900">Analytics & Reports</h2>
            <p className="text-slate-600 mt-2">Analytics page coming soon...</p>
          </div>
        )}
        {activePage === 'users' && user?.role === 'admin' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
            <p className="text-slate-600 mt-2">User management page coming soon...</p>
          </div>
        )}
        {activePage === 'courses' && user?.role === 'admin' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900">Course Management</h2>
            <p className="text-slate-600 mt-2">Course management page coming soon...</p>
          </div>
        )}
        {activePage === 'schedule' && user?.role === 'admin' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900">Schedule Management</h2>
            <p className="text-slate-600 mt-2">Schedule management page coming soon...</p>
          </div>
        )}
        {activePage === 'settings' && user?.role === 'admin' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900">System Settings</h2>
            <p className="text-slate-600 mt-2">System settings page coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes - redirect to dashboard if logged in */}
          <Route path="/" element={
            <PublicRoute>
              <Navbar />
              <Landing />
            </PublicRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          {/* Protected Route - dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />
          
          {/* Redirect all other routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;