import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, BookOpen, Calendar, TrendingUp, Award, Clock,
  CheckCircle, XCircle, AlertCircle, BarChart3, FileText,
  QrCode, Bell, Plus, Search, Filter, Download, Eye,
  Edit, Trash2, Send, ChevronRight, Activity, Target,
  Zap, Shield, MessageSquare, Video, Settings, Star,
  BookMarked, ClipboardList, PieChart, Upload, ChevronDown
} from 'lucide-react';
import Card from '../components/shared/GlassCard';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState(null);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [activeQuickAction, setActiveQuickAction] = useState(null);

  // Sample faculty data
  const stats = {
    totalStudents: 156,
    activeCourses: 3,
    pendingGrading: 24,
    avgAttendance: 89,
    classesThisWeek: 12,
    assignmentsCreated: 18
  };

  const courses = [
    {
      id: 1,
      code: 'CS101',
      name: 'Data Structures',
      students: 45,
      nextClass: 'Today, 10:00 AM',
      attendance: 94,
      pendingAssignments: 8,
      color: 'from-blue-500 to-blue-600',
      icon: '💻'
    },
    {
      id: 2,
      code: 'CS201',
      name: 'Machine Learning',
      students: 38,
      nextClass: 'Tomorrow, 2:00 PM',
      attendance: 87,
      pendingAssignments: 12,
      color: 'from-purple-500 to-purple-600',
      icon: '🤖'
    },
    {
      id: 3,
      code: 'CS301',
      name: 'Web Development',
      students: 52,
      nextClass: 'Wed, 11:00 AM',
      attendance: 91,
      pendingAssignments: 4,
      color: 'from-orange-500 to-orange-600',
      icon: '🌐'
    }
  ];

  const upcomingClasses = [
    {
      id: 1,
      course: 'Data Structures',
      code: 'CS101',
      time: 'Today, 10:00 AM',
      room: 'Lab 204',
      students: 45,
      type: 'Lecture',
      duration: '90 min'
    },
    {
      id: 2,
      course: 'Data Structures',
      code: 'CS101',
      time: 'Today, 2:00 PM',
      room: 'Room 305',
      students: 45,
      type: 'Tutorial',
      duration: '60 min'
    },
    {
      id: 3,
      course: 'Machine Learning',
      code: 'CS201',
      time: 'Tomorrow, 2:00 PM',
      room: 'Lab 101',
      students: 38,
      type: 'Lab',
      duration: '120 min'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'submission',
      student: 'Sarah Johnson',
      action: 'submitted assignment',
      course: 'CS101',
      time: '5 min ago',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      id: 2,
      type: 'question',
      student: 'Mike Chen',
      action: 'asked a question',
      course: 'CS201',
      time: '12 min ago',
      icon: MessageSquare,
      color: 'text-purple-600'
    },
    {
      id: 3,
      type: 'attendance',
      student: 'Emma Davis',
      action: 'marked attendance',
      course: 'CS301',
      time: '1 hour ago',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 4,
      type: 'grade',
      student: 'James Wilson',
      action: 'grade updated',
      course: 'CS101',
      time: '2 hours ago',
      icon: Award,
      color: 'text-amber-600'
    }
  ];

  const pendingTasks = [
    { id: 1, task: 'Grade CS101 Assignment 3', count: 8, priority: 'high', dueDate: 'Today' },
    { id: 2, task: 'Prepare ML Quiz Questions', count: 1, priority: 'medium', dueDate: 'Tomorrow' },
    { id: 3, task: 'Review Project Proposals', count: 12, priority: 'medium', dueDate: 'Jan 30' },
    { id: 4, task: 'Update Course Materials', count: 3, priority: 'low', dueDate: 'Feb 1' }
  ];

  const quickActions = [
    { id: 'qr', label: 'Generate QR', icon: QrCode, color: 'from-blue-500 to-blue-600' },
    { id: 'assignment', label: 'Create Assignment', icon: Plus, color: 'from-purple-500 to-purple-600' },
    { id: 'announcement', label: 'Send Announcement', icon: Bell, color: 'from-orange-500 to-orange-600' },
    { id: 'schedule', label: 'Schedule Class', icon: Calendar, color: 'from-green-500 to-green-600' }
  ];

  const handleQuickAction = (actionId) => {
    setActiveQuickAction(actionId);
    if (actionId === 'qr') {
      setShowQRGenerator(true);
    }
    // Handle other quick actions
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Good Morning, Prof. {user?.name?.split(' ').pop()}! 👋
              </h1>
              <p className="text-lg text-slate-600">Here's what's happening with your classes today</p>
            </div>
            <Button variant="primary" icon={Video}>
              Start Live Class
            </Button>
          </div>

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-4 gap-4">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleQuickAction(action.id)}
                className={`bg-gradient-to-br ${action.color} text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all group`}
              >
                <action.icon size={28} className="mb-3 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-lg">{action.label}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mb-12">
          {[
            { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'from-blue-500 to-blue-600', change: '+12' },
            { label: 'Active Courses', value: stats.activeCourses, icon: BookOpen, color: 'from-purple-500 to-purple-600' },
            { label: 'Pending Grading', value: stats.pendingGrading, icon: FileText, color: 'from-orange-500 to-red-500', urgent: true },
            { label: 'Avg Attendance', value: stats.avgAttendance + '%', icon: CheckCircle, color: 'from-green-500 to-emerald-600' },
            { label: 'Classes/Week', value: stats.classesThisWeek, icon: Calendar, color: 'from-pink-500 to-rose-600' },
            { label: 'Assignments', value: stats.assignmentsCreated, icon: ClipboardList, color: 'from-amber-500 to-yellow-600' }
          ].map((stat, i) => (
            <Card key={i} delay={i * 0.05} className="p-6 hover:shadow-xl transition-shadow relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-16 -mt-16`}></div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg relative z-10`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <div className="text-sm font-bold text-slate-500 mb-1">{stat.label}</div>
              <div className="flex items-center justify-between">
                <div className={`text-3xl font-black ${stat.urgent ? 'text-red-600' : 'text-slate-900'}`}>
                  {stat.value}
                </div>
                {stat.change && (
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                    {stat.change}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Courses Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-slate-900">Your Courses</h2>
                <Button variant="ghost" size="sm" icon={Plus}>
                  Add Course
                </Button>
              </div>
              <div className="grid gap-6">
                {courses.map((course, i) => (
                  <Card key={i} hover className="p-6">
                    <div className="flex gap-6">
                      {/* Course Icon */}
                      <div className={`w-20 h-20 bg-gradient-to-br ${course.color} rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 shadow-lg`}>
                        {course.icon}
                      </div>

                      {/* Course Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-xs font-bold text-slate-500 mb-1">{course.code}</div>
                            <h3 className="text-xl font-black text-slate-900 mb-1">{course.name}</h3>
                            <p className="text-sm text-slate-600">Next class: {course.nextClass}</p>
                          </div>
                          <Button variant="ghost" size="sm" icon={ChevronRight}>
                            Manage
                          </Button>
                        </div>

                        {/* Course Stats */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-slate-50 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Users size={16} className="text-blue-600" />
                              <span className="text-xs font-bold text-slate-500">Students</span>
                            </div>
                            <div className="text-xl font-black text-slate-900">{course.students}</div>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle size={16} className="text-green-600" />
                              <span className="text-xs font-bold text-slate-500">Attendance</span>
                            </div>
                            <div className="text-xl font-black text-green-600">{course.attendance}%</div>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText size={16} className="text-orange-600" />
                              <span className="text-xs font-bold text-slate-500">Pending</span>
                            </div>
                            <div className="text-xl font-black text-orange-600">{course.pendingAssignments}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Upcoming Classes */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-slate-900">Upcoming Classes</h3>
                <Button variant="ghost" size="sm" icon={Calendar}>
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {upcomingClasses.map((cls) => (
                  <div key={cls.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock size={28} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-slate-900">{cls.course}</span>
                        <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded">
                          {cls.code}
                        </span>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {cls.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>⏰ {cls.time}</span>
                        <span>📍 {cls.room}</span>
                        <span>👥 {cls.students} students</span>
                        <span>⏱️ {cls.duration}</span>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" icon={QrCode}>
                      Start
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Pending Tasks */}
            <Card className="p-6">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <ClipboardList size={24} className="text-orange-600" />
                Pending Tasks
              </h3>
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {task.task}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            task.priority === 'high' ? 'bg-red-100 text-red-600' :
                            task.priority === 'medium' ? 'bg-orange-100 text-orange-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {task.priority.toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-500">Due: {task.dueDate}</span>
                        </div>
                      </div>
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-black text-sm">
                        {task.count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" fullWidth size="sm" className="mt-4">
                View All Tasks
              </Button>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Activity size={24} className="text-purple-600" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <activity.icon size={18} className={activity.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900">
                        <span className="font-bold">{activity.student}</span>
                        {' '}{activity.action}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="font-semibold">{activity.course}</span>
                        <span>•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" fullWidth size="sm" className="mt-4">
                View All Activity
              </Button>
            </Card>

            {/* Performance Overview */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp size={24} className="text-blue-600" />
                Performance Overview
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-700">Student Engagement</span>
                    <span className="font-black text-blue-600">92%</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div className="h-full w-[92%] bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-700">Assignment Completion</span>
                    <span className="font-black text-green-600">88%</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div className="h-full w-[88%] bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-700">Class Attendance</span>
                    <span className="font-black text-purple-600">89%</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div className="h-full w-[89%] bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* QR Generator Modal */}
      <AnimatePresence>
        {showQRGenerator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowQRGenerator(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <QrCode size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Generate Attendance QR</h3>
                <p className="text-slate-600">Students will scan this to mark attendance</p>
              </div>

              <div className="mb-6">
                <label className="text-sm font-bold text-slate-700 mb-2 block">Select Course</label>
                <select className="w-full p-3 border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-blue-500">
                  <option>CS101 - Data Structures</option>
                  <option>CS201 - Machine Learning</option>
                  <option>CS301 - Web Development</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="text-sm font-bold text-slate-700 mb-2 block">Valid Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {['5 min', '10 min', '15 min'].map((duration) => (
                    <button key={duration} className="p-3 bg-slate-100 hover:bg-blue-100 hover:text-blue-600 rounded-xl font-bold transition-colors">
                      {duration}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" fullWidth onClick={() => setShowQRGenerator(false)}>
                  Cancel
                </Button>
                <Button variant="primary" fullWidth icon={QrCode}>
                  Generate QR
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FacultyDashboard;