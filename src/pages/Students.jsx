import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Search, Filter, Download, Mail, Phone, 
  MapPin, Calendar, Award, TrendingUp, TrendingDown,
  Eye, Edit, MoreVertical, CheckCircle, XCircle,
  AlertCircle, BookOpen, FileText, Clock, Star,
  ChevronRight, UserCheck, UserX, Activity, BarChart3
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';
import { useAuth } from '../context/AuthContext';

const Students = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Sample student data
  const students = [
    {
      id: 1,
      name: 'Emma Johnson',
      email: 'emma.j@university.edu',
      phone: '+1 234-567-8901',
      studentId: 'STU001',
      course: 'CS 101',
      enrollmentDate: 'Jan 2024',
      avatar: '👩',
      grade: 'A',
      attendance: 96,
      assignmentsCompleted: 12,
      totalAssignments: 15,
      performance: 'excellent',
      lastActive: '2 hours ago',
      status: 'active'
    },
    {
      id: 2,
      name: 'James Smith',
      email: 'james.s@university.edu',
      phone: '+1 234-567-8902',
      studentId: 'STU002',
      course: 'CS 101',
      enrollmentDate: 'Jan 2024',
      avatar: '👨',
      grade: 'B+',
      attendance: 89,
      assignmentsCompleted: 11,
      totalAssignments: 15,
      performance: 'good',
      lastActive: '1 day ago',
      status: 'active'
    },
    {
      id: 3,
      name: 'Sophia Williams',
      email: 'sophia.w@university.edu',
      phone: '+1 234-567-8903',
      studentId: 'STU003',
      course: 'CS 202',
      enrollmentDate: 'Jan 2024',
      avatar: '👩',
      grade: 'A-',
      attendance: 94,
      assignmentsCompleted: 13,
      totalAssignments: 15,
      performance: 'excellent',
      lastActive: '5 hours ago',
      status: 'active'
    },
    {
      id: 4,
      name: 'Michael Brown',
      email: 'michael.b@university.edu',
      phone: '+1 234-567-8904',
      studentId: 'STU004',
      course: 'CS 202',
      enrollmentDate: 'Jan 2024',
      avatar: '👨',
      grade: 'B',
      attendance: 78,
      assignmentsCompleted: 9,
      totalAssignments: 15,
      performance: 'needs-attention',
      lastActive: '3 days ago',
      status: 'warning'
    },
    {
      id: 5,
      name: 'Olivia Davis',
      email: 'olivia.d@university.edu',
      phone: '+1 234-567-8905',
      studentId: 'STU005',
      course: 'CS 301',
      enrollmentDate: 'Jan 2024',
      avatar: '👩',
      grade: 'A',
      attendance: 98,
      assignmentsCompleted: 14,
      totalAssignments: 15,
      performance: 'excellent',
      lastActive: '30 minutes ago',
      status: 'active'
    },
    {
      id: 6,
      name: 'William Martinez',
      email: 'william.m@university.edu',
      phone: '+1 234-567-8906',
      studentId: 'STU006',
      course: 'CS 301',
      enrollmentDate: 'Jan 2024',
      avatar: '👨',
      grade: 'C+',
      attendance: 72,
      assignmentsCompleted: 8,
      totalAssignments: 15,
      performance: 'needs-attention',
      lastActive: '1 week ago',
      status: 'warning'
    }
  ];

  const courses = [
    { id: 'all', name: 'All Courses', count: students.length },
    { id: 'cs101', name: 'CS 101', count: students.filter(s => s.course === 'CS 101').length },
    { id: 'cs202', name: 'CS 202', count: students.filter(s => s.course === 'CS 202').length },
    { id: 'cs301', name: 'CS 301', count: students.filter(s => s.course === 'CS 301').length }
  ];

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    warning: students.filter(s => s.status === 'warning').length,
    avgAttendance: Math.round(students.reduce((acc, s) => acc + s.attendance, 0) / students.length)
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || student.course.toLowerCase().replace(' ', '') === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'excellent': return 'from-green-500 to-emerald-600';
      case 'good': return 'from-blue-500 to-blue-600';
      case 'needs-attention': return 'from-orange-500 to-red-500';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Active</span>;
      case 'warning':
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">Needs Attention</span>;
      default:
        return <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">Inactive</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-black text-slate-900 mb-2">
            Student Management 👨‍🎓
          </h1>
          <p className="text-lg text-slate-600">View and manage your students across all courses</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Students', value: stats.total, icon: Users, color: 'from-blue-500 to-blue-600', trend: '+12%' },
            { label: 'Active Students', value: stats.active, icon: UserCheck, color: 'from-green-500 to-emerald-600', trend: '+5%' },
            { label: 'Need Attention', value: stats.warning, icon: AlertCircle, color: 'from-orange-500 to-red-500', trend: '-3%' },
            { label: 'Avg Attendance', value: `${stats.avgAttendance}%`, icon: TrendingUp, color: 'from-purple-500 to-purple-600', trend: '+2%' }
          ].map((stat, i) => (
            <Card key={i} delay={i * 0.1} className="p-6 bg-gradient-to-br hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon size={24} className="text-white" />
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.trend}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-500 mb-1">{stat.label}</div>
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
            </Card>
          ))}
        </div>

        {/* Filters and Search */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-semibold focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Course Filter */}
            <div className="flex gap-2">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourse(course.id)}
                  className={`px-4 py-3 rounded-xl font-bold transition-all ${
                    selectedCourse === course.id
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {course.name}
                  <span className="ml-2 text-xs opacity-70">({course.count})</span>
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" icon={Download} size="sm">
                Export
              </Button>
              <Button variant="outline" icon={Filter} size="sm">
                Filter
              </Button>
            </div>
          </div>
        </Card>

        {/* Students Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Students List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-slate-900">
                Students ({filteredStudents.length})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  <Users size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  <BarChart3 size={18} />
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredStudents.map((student, i) => (
                <Card key={i} hover className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`w-16 h-16 bg-gradient-to-br ${getPerformanceColor(student.performance)} rounded-2xl flex items-center justify-center text-3xl shadow-lg flex-shrink-0`}>
                      {student.avatar}
                    </div>

                    {/* Student Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-black text-slate-900">{student.name}</h3>
                            {getStatusBadge(student.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <Mail size={14} />
                              {student.email}
                            </span>
                            <span className="font-bold text-slate-500">{student.studentId}</span>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                          <MoreVertical size={18} className="text-slate-400" />
                        </button>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="text-center p-2 bg-slate-50 rounded-lg">
                          <div className="text-xs text-slate-500 mb-1">Grade</div>
                          <div className={`text-lg font-black bg-gradient-to-r ${getPerformanceColor(student.performance)} bg-clip-text text-transparent`}>
                            {student.grade}
                          </div>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded-lg">
                          <div className="text-xs text-slate-500 mb-1">Attendance</div>
                          <div className={`text-lg font-black ${student.attendance >= 90 ? 'text-green-600' : student.attendance >= 75 ? 'text-orange-600' : 'text-red-600'}`}>
                            {student.attendance}%
                          </div>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded-lg">
                          <div className="text-xs text-slate-500 mb-1">Completed</div>
                          <div className="text-lg font-black text-slate-900">
                            {student.assignmentsCompleted}/{student.totalAssignments}
                          </div>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded-lg">
                          <div className="text-xs text-slate-500 mb-1">Course</div>
                          <div className="text-sm font-black text-blue-600">{student.course}</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-700">Assignment Progress</span>
                          <span className="font-black text-slate-900">
                            {Math.round((student.assignmentsCompleted / student.totalAssignments) * 100)}%
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${getPerformanceColor(student.performance)} rounded-full`}
                            style={{ width: `${(student.assignmentsCompleted / student.totalAssignments) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          icon={Eye}
                          onClick={() => setSelectedStudent(student)}
                        >
                          View Profile
                        </Button>
                        <Button variant="outline" size="sm" icon={Mail}>
                          Message
                        </Button>
                        <Button variant="outline" size="sm" icon={BarChart3}>
                          Analytics
                        </Button>
                      </div>

                      {/* Last Active */}
                      <div className="mt-3 text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={12} />
                        Last active: {student.lastActive}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Performance Overview */}
            <Card className="p-6">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Activity size={24} className="text-purple-600" />
                Performance Overview
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-700">Excellent</span>
                    <span className="font-black text-green-600">
                      {students.filter(s => s.performance === 'excellent').length}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                      style={{ width: `${(students.filter(s => s.performance === 'excellent').length / students.length) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-700">Good</span>
                    <span className="font-black text-blue-600">
                      {students.filter(s => s.performance === 'good').length}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                      style={{ width: `${(students.filter(s => s.performance === 'good').length / students.length) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-700">Needs Attention</span>
                    <span className="font-black text-orange-600">
                      {students.filter(s => s.performance === 'needs-attention').length}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                      style={{ width: `${(students.filter(s => s.performance === 'needs-attention').length / students.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* At Risk Students */}
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <AlertCircle size={24} className="text-orange-600" />
                At Risk Students
              </h3>
              <div className="space-y-3">
                {students.filter(s => s.status === 'warning').map((student, i) => (
                  <div key={i} className="p-3 bg-white rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl">{student.avatar}</div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 text-sm">{student.name}</div>
                        <div className="text-xs text-slate-600">{student.course}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-bold">
                        {student.attendance}% Attendance
                      </span>
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full font-bold">
                        {student.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="primary" fullWidth size="sm" className="mt-4">
                Intervention Plan
              </Button>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-xl font-black text-slate-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-between group">
                  <span className="font-semibold text-slate-700">Send Announcement</span>
                  <Mail size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>
                <button className="w-full text-left p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-between group">
                  <span className="font-semibold text-slate-700">Generate Report</span>
                  <Download size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>
                <button className="w-full text-left p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-between group">
                  <span className="font-semibold text-slate-700">Bulk Actions</span>
                  <Users size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;