import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Users, Clock, Calendar, TrendingUp,
  FileText, Award, ChevronRight, Plus, Edit,
  Download, ExternalLink, BarChart3, CheckCircle,
  AlertCircle, Settings, Bell, Video, QrCode, Upload
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';
import { useAuth } from '../context/AuthContext';

const FacultyClasses = () => {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Faculty courses - classes they teach
  const courses = [
    {
      id: 1,
      code: 'CS 101',
      name: 'Introduction to Programming',
      color: 'from-blue-500 to-blue-600',
      image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      enrolled: 45,
      schedule: 'Mon, Wed, Fri - 10:00 AM',
      room: 'Lecture Hall A',
      semester: 'Spring 2024',
      nextClass: 'Today, 10:00 AM',
      materials: 12,
      assignments: 8,
      pendingGrading: 5,
      avgGrade: 'B+',
      avgAttendance: 94,
      completionRate: 87
    },
    {
      id: 2,
      code: 'CS 202',
      name: 'Data Structures',
      color: 'from-purple-500 to-purple-600',
      image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      enrolled: 42,
      schedule: 'Tue, Thu - 2:00 PM',
      room: 'Lab 3',
      semester: 'Spring 2024',
      nextClass: 'Tomorrow, 2:00 PM',
      materials: 15,
      assignments: 10,
      pendingGrading: 8,
      avgGrade: 'A-',
      avgAttendance: 91,
      completionRate: 92
    },
    {
      id: 3,
      code: 'CS 301',
      name: 'Advanced Algorithms',
      color: 'from-green-500 to-emerald-600',
      image: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      enrolled: 38,
      schedule: 'Mon, Wed - 3:00 PM',
      room: 'Room 204',
      semester: 'Spring 2024',
      nextClass: 'Monday, 3:00 PM',
      materials: 18,
      assignments: 12,
      pendingGrading: 12,
      avgGrade: 'B',
      avgAttendance: 89,
      completionRate: 85
    }
  ];

  const upcomingClasses = [
    { course: 'CS 101', time: '10:00 AM', room: 'Lecture Hall A', students: 45, status: 'today' },
    { course: 'CS 202', time: '2:00 PM', room: 'Lab 3', students: 42, status: 'tomorrow' },
    { course: 'CS 301', time: '3:00 PM', room: 'Room 204', students: 38, status: 'monday' }
  ];

  const recentActivity = [
    { id: 1, action: 'Assignment graded', course: 'CS 101', time: '2 hours ago', icon: CheckCircle, color: 'text-green-600' },
    { id: 2, action: 'New submission', course: 'CS 202', time: '5 hours ago', icon: FileText, color: 'text-blue-600' },
    { id: 3, action: 'Material uploaded', course: 'CS 301', time: '1 day ago', icon: Upload, color: 'text-purple-600' }
  ];

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
            My Teaching Schedule 👨‍🏫
          </h1>
          <p className="text-lg text-slate-600">Manage your courses and students</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Active Courses', value: '3', icon: BookOpen, color: 'from-blue-500 to-blue-600' },
            { label: 'Total Students', value: '125', icon: Users, color: 'from-purple-500 to-purple-600' },
            { label: 'Pending Grading', value: '25', icon: FileText, color: 'from-orange-500 to-red-500' },
            { label: 'Avg Attendance', value: '91%', icon: TrendingUp, color: 'from-green-500 to-emerald-600' }
          ].map((stat, i) => (
            <Card key={i} delay={i * 0.1} className="p-6 bg-gradient-to-br hover:shadow-xl transition-shadow">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <div className="text-sm font-bold text-slate-500 mb-1">{stat.label}</div>
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Courses List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900">Your Courses</h2>
              <Button variant="primary" icon={Plus} size="sm">
                Request New Course
              </Button>
            </div>
            
            <div className="grid gap-6">
              {courses.map((course, i) => (
                <Card key={i} hover className="overflow-hidden">
                  <div className="flex">
                    {/* Course Color Bar */}
                    <div 
                      className="w-2 flex-shrink-0"
                      style={{ background: course.image }}
                    />
                    
                    {/* Course Content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                              {course.code}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">
                              {course.semester}
                            </span>
                          </div>
                          <h3 className="text-xl font-black text-slate-900 mb-1">
                            {course.name}
                          </h3>
                          <p className="text-sm text-slate-600 flex items-center gap-2">
                            <Users size={14} />
                            {course.enrolled} Students Enrolled
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            icon={BarChart3}
                          >
                            Analytics
                          </Button>
                          <Button 
                            variant="primary" 
                            size="sm"
                            icon={Settings}
                          >
                            Manage
                          </Button>
                        </div>
                      </div>

                      {/* Course Stats Grid */}
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="p-3 bg-slate-50 rounded-xl text-center">
                          <div className="text-xs text-slate-500 mb-1">Materials</div>
                          <div className="text-lg font-black text-slate-900">{course.materials}</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl text-center">
                          <div className="text-xs text-slate-500 mb-1">Assignments</div>
                          <div className="text-lg font-black text-slate-900">{course.assignments}</div>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-xl text-center border border-orange-200">
                          <div className="text-xs text-orange-600 mb-1">Pending</div>
                          <div className="text-lg font-black text-orange-600">{course.pendingGrading}</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-xl text-center border border-green-200">
                          <div className="text-xs text-green-600 mb-1">Avg Grade</div>
                          <div className="text-lg font-black text-green-600">{course.avgGrade}</div>
                        </div>
                      </div>

                      {/* Progress Bars */}
                      <div className="space-y-3 mb-4">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-slate-700">Course Completion</span>
                            <span className="font-black text-slate-900">{course.completionRate}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${course.color} rounded-full transition-all`}
                              style={{ width: `${course.completionRate}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-slate-700">Average Attendance</span>
                            <span className="font-black text-green-600">{course.avgAttendance}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all"
                              style={{ width: `${course.avgAttendance}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" icon={QrCode} className="flex-1">
                          Generate QR
                        </Button>
                        <Button variant="outline" size="sm" icon={FileText} className="flex-1">
                          Upload Material
                        </Button>
                        <Button variant="outline" size="sm" icon={Plus} className="flex-1">
                          New Assignment
                        </Button>
                      </div>

                      {/* Schedule Info */}
                      <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 rounded-xl border-2 border-blue-100">
                        <div className="flex items-center gap-3">
                          <Clock size={18} className="text-blue-600" />
                          <div>
                            <div className="text-xs text-slate-500">Next Class</div>
                            <div className="text-sm font-bold text-slate-900">{course.nextClass}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar size={16} />
                          {course.room}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Classes */}
            <Card className="p-6">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Calendar size={24} className="text-blue-600" />
                Upcoming Classes
              </h3>
              <div className="space-y-3">
                {upcomingClasses.map((cls, i) => (
                  <div key={i} className={`p-4 rounded-xl border-2 ${
                    cls.status === 'today' 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-black ${
                        cls.status === 'today' ? 'bg-blue-600' : 'bg-slate-400'
                      }`}>
                        {cls.time.split(':')[0]}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900">{cls.course}</div>
                        <div className="text-xs text-slate-600">{cls.room} • {cls.students} students</div>
                      </div>
                    </div>
                    {cls.status === 'today' && (
                      <div className="flex gap-2">
                        <Button variant="primary" fullWidth size="sm" icon={Video}>
                          Start Class
                        </Button>
                        <Button variant="outline" size="sm" icon={QrCode}>
                          QR
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Bell size={24} className="text-purple-600" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-start gap-3">
                      <activity.icon size={18} className={activity.color} />
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 text-sm">{activity.action}</div>
                        <div className="text-xs text-slate-500">{activity.course} • {activity.time}</div>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" fullWidth size="sm" className="mt-4">
                View All Activity
              </Button>
            </Card>

            {/* Quick Actions Card */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <h3 className="text-xl font-black text-slate-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left p-3 bg-white rounded-xl hover:shadow-md transition-all flex items-center justify-between group">
                  <span className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                    Bulk Grade Upload
                  </span>
                  <Upload size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>
                <button className="w-full text-left p-3 bg-white rounded-xl hover:shadow-md transition-all flex items-center justify-between group">
                  <span className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                    Generate Report
                  </span>
                  <Download size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>
                <button className="w-full text-left p-3 bg-white rounded-xl hover:shadow-md transition-all flex items-center justify-between group">
                  <span className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                    Course Settings
                  </span>
                  <Settings size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyClasses;