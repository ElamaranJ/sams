import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Users, Clock, Calendar, Video, 
  FileText, Award, TrendingUp, ChevronRight,
  Play, Download, ExternalLink, Star
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';
import { useAuth } from '../context/AuthContext';

const Classes = () => {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState(null);

  const courses = [
    {
      id: 1,
      code: 'CS 101',
      name: 'Introduction to Programming',
      instructor: 'Dr. Sarah Miller',
      color: 'from-blue-500 to-blue-600',
      image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      enrolled: 45,
      schedule: 'Mon, Wed, Fri - 10:00 AM',
      room: 'Lecture Hall A',
      progress: 75,
      nextClass: 'Today, 10:00 AM',
      materials: 12,
      assignments: 8,
      grade: 'A-',
      attendance: 94
    },
    {
      id: 2,
      code: 'MATH 201',
      name: 'Discrete Mathematics',
      instructor: 'Prof. John Davis',
      color: 'from-purple-500 to-purple-600',
      image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      enrolled: 38,
      schedule: 'Tue, Thu - 2:00 PM',
      room: 'Room 204',
      progress: 82,
      nextClass: 'Tomorrow, 2:00 PM',
      materials: 15,
      assignments: 6,
      grade: 'B+',
      attendance: 91
    },
    {
      id: 3,
      code: 'CS 202',
      name: 'Data Structures',
      instructor: 'Dr. Emily Chen',
      color: 'from-green-500 to-emerald-600',
      image: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      enrolled: 42,
      schedule: 'Mon, Wed - 1:00 PM',
      room: 'Lab 3',
      progress: 68,
      nextClass: 'Monday, 1:00 PM',
      materials: 10,
      assignments: 7,
      grade: 'A',
      attendance: 96
    },
    {
      id: 4,
      code: 'WEB 301',
      name: 'Web Development',
      instructor: 'Prof. Michael Brown',
      color: 'from-orange-500 to-red-500',
      image: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      enrolled: 35,
      schedule: 'Tue, Thu - 11:00 AM',
      room: 'Computer Lab 1',
      progress: 71,
      nextClass: 'Tuesday, 11:00 AM',
      materials: 18,
      assignments: 9,
      grade: 'A',
      attendance: 89
    }
  ];

  const recentMaterials = [
    { id: 1, title: 'Week 5 Lecture Notes', course: 'CS 101', type: 'PDF', date: 'Feb 14' },
    { id: 2, title: 'Lab Exercise 3', course: 'WEB 301', type: 'Document', date: 'Feb 13' },
    { id: 3, title: 'Chapter 4 Slides', course: 'MATH 201', type: 'PPT', date: 'Feb 12' }
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
            My Classes 📚
          </h1>
          <p className="text-lg text-slate-600">Manage your enrolled courses</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Enrolled Courses', value: '4', icon: BookOpen, color: 'from-blue-500 to-blue-600' },
            { label: 'Total Materials', value: '55', icon: FileText, color: 'from-purple-500 to-purple-600' },
            { label: 'Avg Attendance', value: '93%', icon: Calendar, color: 'from-green-500 to-emerald-600' },
            { label: 'Avg Grade', value: 'A-', icon: Award, color: 'from-orange-500 to-red-500' }
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

        {/* Courses Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Your Courses</h2>
            
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
                            <span className={`text-2xl font-black bg-gradient-to-r ${course.color} bg-clip-text text-transparent`}>
                              {course.grade}
                            </span>
                          </div>
                          <h3 className="text-xl font-black text-slate-900 mb-1">
                            {course.name}
                          </h3>
                          <p className="text-sm text-slate-600 flex items-center gap-2">
                            <Users size={14} />
                            {course.instructor}
                          </p>
                        </div>
                        
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => setSelectedCourse(course)}
                        >
                          View Details
                        </Button>
                      </div>

                      {/* Course Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <div className="text-xs text-slate-500 mb-1">Materials</div>
                          <div className="text-lg font-black text-slate-900">{course.materials}</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <div className="text-xs text-slate-500 mb-1">Assignments</div>
                          <div className="text-lg font-black text-slate-900">{course.assignments}</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <div className="text-xs text-slate-500 mb-1">Attendance</div>
                          <div className="text-lg font-black text-green-600">{course.attendance}%</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-semibold text-slate-700">Course Progress</span>
                          <span className="font-black text-slate-900">{course.progress}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${course.color} rounded-full transition-all`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Schedule Info */}
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border-2 border-blue-100">
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
                Today's Schedule
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">
                      10
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">CS 101</div>
                      <div className="text-xs text-slate-600">Lecture Hall A</div>
                    </div>
                  </div>
                  <Button variant="primary" fullWidth size="sm" icon={Video}>
                    Join Class
                  </Button>
                </div>
              </div>
            </Card>

            {/* Recent Materials */}
            <Card className="p-6">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <FileText size={24} className="text-purple-600" />
                Recent Materials
              </h3>
              <div className="space-y-3">
                {recentMaterials.map((material) => (
                  <div key={material.id} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                        {material.title}
                      </div>
                      <Download size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{material.course}</span>
                      <span className="text-slate-400">{material.date}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" fullWidth size="sm" className="mt-4">
                View All Materials
              </Button>
            </Card>

            {/* Quick Links */}
            <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <h3 className="text-xl font-black text-slate-900 mb-4">
                Quick Links
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left p-3 bg-white rounded-xl hover:shadow-md transition-all flex items-center justify-between group">
                  <span className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                    Course Catalog
                  </span>
                  <ExternalLink size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>
                <button className="w-full text-left p-3 bg-white rounded-xl hover:shadow-md transition-all flex items-center justify-between group">
                  <span className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                    Library Resources
                  </span>
                  <ExternalLink size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>
                <button className="w-full text-left p-3 bg-white rounded-xl hover:shadow-md transition-all flex items-center justify-between group">
                  <span className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                    Study Groups
                  </span>
                  <ExternalLink size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Classes;