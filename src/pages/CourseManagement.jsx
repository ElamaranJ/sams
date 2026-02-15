import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Search, Filter, Download, Plus, Edit,
  Trash2, Users, Calendar, Clock, Award, Settings,
  TrendingUp, BarChart3, Eye, MoreVertical, Star,
  CheckCircle, AlertCircle, FileText, Upload, Copy
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';

const CourseManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Sample course data
  const courses = [
    {
      id: 1,
      code: 'CS 101',
      name: 'Introduction to Programming',
      department: 'Computer Science',
      instructor: 'Dr. Sarah Miller',
      credits: 4,
      enrolled: 45,
      capacity: 50,
      schedule: 'Mon, Wed, Fri - 10:00 AM',
      room: 'Lecture Hall A',
      semester: 'Spring 2024',
      status: 'active',
      rating: 4.5,
      color: 'from-blue-500 to-blue-600',
      description: 'Introduction to programming concepts and algorithms'
    },
    {
      id: 2,
      code: 'MATH 201',
      name: 'Discrete Mathematics',
      department: 'Mathematics',
      instructor: 'Prof. John Davis',
      credits: 3,
      enrolled: 38,
      capacity: 40,
      schedule: 'Tue, Thu - 2:00 PM',
      room: 'Room 204',
      semester: 'Spring 2024',
      status: 'active',
      rating: 4.2,
      color: 'from-purple-500 to-purple-600',
      description: 'Fundamental concepts in discrete mathematics'
    },
    {
      id: 3,
      code: 'CS 202',
      name: 'Data Structures',
      department: 'Computer Science',
      instructor: 'Dr. Emily Chen',
      credits: 4,
      enrolled: 42,
      capacity: 45,
      schedule: 'Mon, Wed - 1:00 PM',
      room: 'Lab 3',
      semester: 'Spring 2024',
      status: 'active',
      rating: 4.7,
      color: 'from-green-500 to-emerald-600',
      description: 'Advanced data structures and algorithms'
    },
    {
      id: 4,
      code: 'WEB 301',
      name: 'Web Development',
      department: 'Computer Science',
      instructor: 'Prof. Michael Brown',
      credits: 3,
      enrolled: 35,
      capacity: 40,
      schedule: 'Tue, Thu - 11:00 AM',
      room: 'Computer Lab 1',
      semester: 'Spring 2024',
      status: 'active',
      rating: 4.6,
      color: 'from-orange-500 to-red-500',
      description: 'Modern web development technologies'
    },
    {
      id: 5,
      code: 'PHYS 101',
      name: 'Physics I',
      department: 'Physics',
      instructor: 'Dr. Robert Wilson',
      credits: 4,
      enrolled: 28,
      capacity: 35,
      schedule: 'Mon, Wed, Fri - 9:00 AM',
      room: 'Science Building 201',
      semester: 'Spring 2024',
      status: 'active',
      rating: 4.0,
      color: 'from-cyan-500 to-blue-600',
      description: 'Introduction to classical mechanics'
    },
    {
      id: 6,
      code: 'CS 401',
      name: 'Machine Learning',
      department: 'Computer Science',
      instructor: 'Dr. Sarah Miller',
      credits: 4,
      enrolled: 0,
      capacity: 30,
      schedule: 'TBD',
      room: 'TBD',
      semester: 'Fall 2024',
      status: 'upcoming',
      rating: 0,
      color: 'from-indigo-500 to-purple-600',
      description: 'Introduction to machine learning algorithms'
    }
  ];

  const departments = [
    { id: 'all', name: 'All Departments', count: courses.length },
    { id: 'cs', name: 'Computer Science', count: courses.filter(c => c.department === 'Computer Science').length },
    { id: 'math', name: 'Mathematics', count: courses.filter(c => c.department === 'Mathematics').length },
    { id: 'physics', name: 'Physics', count: courses.filter(c => c.department === 'Physics').length }
  ];

  const stats = {
    totalCourses: courses.length,
    activeCourses: courses.filter(c => c.status === 'active').length,
    totalStudents: courses.reduce((sum, c) => sum + c.enrolled, 0),
    avgEnrollment: Math.round(courses.reduce((sum, c) => sum + (c.enrolled / c.capacity * 100), 0) / courses.length)
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || 
                              course.department.toLowerCase().replace(' ', '') === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Active' },
      upcoming: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock, label: 'Upcoming' },
      completed: { bg: 'bg-slate-100', text: 'text-slate-700', icon: CheckCircle, label: 'Completed' }
    };
    const badge = badges[status];
    const Icon = badge.icon;
    return (
      <span className={`px-3 py-1 ${badge.bg} ${badge.text} text-xs font-bold rounded-full flex items-center gap-1 w-fit`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  const getEnrollmentColor = (enrolled, capacity) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2">
                Course Management 📚
              </h1>
              <p className="text-lg text-slate-600">Manage all courses and curricula</p>
            </div>
            <Button variant="primary" icon={Plus}>
              Add New Course
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: 'from-blue-500 to-blue-600', change: '+3' },
            { label: 'Active Courses', value: stats.activeCourses, icon: CheckCircle, color: 'from-green-500 to-emerald-600', change: '+2' },
            { label: 'Total Enrolled', value: stats.totalStudents, icon: Users, color: 'from-purple-500 to-purple-600', change: '+48' },
            { label: 'Avg Enrollment', value: `${stats.avgEnrollment}%`, icon: TrendingUp, color: 'from-orange-500 to-red-500', change: '+5%' }
          ].map((stat, i) => (
            <Card key={i} delay={i * 0.1} className="p-6 bg-gradient-to-br hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon size={24} className="text-white" />
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-500 mb-1">{stat.label}</div>
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
            </Card>
          ))}
        </div>

        {/* Department Filters */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDepartment(dept.id)}
              className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                selectedDepartment === dept.id
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-slate-50 shadow'
              }`}
            >
              {dept.name}
              <span className="ml-2 text-xs opacity-70">({dept.count})</span>
            </button>
          ))}
        </div>

        {/* Search and Actions */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by course name, code, or instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-semibold focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" icon={Upload} size="sm">
                Import
              </Button>
              <Button variant="outline" icon={Download} size="sm">
                Export
              </Button>
              <Button variant="outline" icon={Filter} size="sm">
                Filter
              </Button>
            </div>
          </div>
        </Card>

        {/* Courses Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {filteredCourses.map((course, i) => (
            <Card key={i} hover className="overflow-hidden">
              <div className="flex">
                {/* Color Bar */}
                <div 
                  className={`w-2 flex-shrink-0 bg-gradient-to-b ${course.color}`}
                />
                
                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                          {course.code}
                        </span>
                        {getStatusBadge(course.status)}
                      </div>
                      <h3 className="text-lg font-black text-slate-900 mb-1">
                        {course.name}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">{course.description}</p>
                    </div>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center gap-2 mb-4 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      👨‍🏫
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-500">Instructor</div>
                      <div className="text-sm font-bold text-slate-900">{course.instructor}</div>
                    </div>
                  </div>

                  {/* Course Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <div className="text-xs text-slate-500 mb-1">Credits</div>
                      <div className="text-lg font-black text-slate-900">{course.credits}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <div className="text-xs text-slate-500 mb-1">Department</div>
                      <div className="text-xs font-bold text-slate-900">{course.department}</div>
                    </div>
                  </div>

                  {/* Enrollment */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-slate-700">Enrollment</span>
                      <span className={`font-black ${getEnrollmentColor(course.enrolled, course.capacity)}`}>
                        {course.enrolled}/{course.capacity}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${course.color} rounded-full transition-all`}
                        style={{ width: `${(course.enrolled / course.capacity) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Rating */}
                  {course.rating > 0 && (
                    <div className="flex items-center gap-2 mb-4 p-2 bg-amber-50 rounded-lg border border-amber-200">
                      <Star size={16} className="text-amber-500 fill-amber-500" />
                      <span className="text-sm font-bold text-slate-900">{course.rating}</span>
                      <span className="text-xs text-slate-500">Student Rating</span>
                    </div>
                  )}

                  {/* Schedule */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <Clock size={14} className="text-blue-600" />
                      <span className="font-bold text-slate-900">{course.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={14} className="text-blue-600" />
                      <span className="text-slate-600">{course.room}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" icon={Eye} className="flex-1">
                      View
                    </Button>
                    <Button variant="outline" size="sm" icon={Edit} className="flex-1">
                      Edit
                    </Button>
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical size={18} className="text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <BookOpen size={32} className="text-blue-600 mb-4" />
            <h3 className="text-lg font-black text-slate-900 mb-2">Course Catalog</h3>
            <p className="text-sm text-slate-600 mb-4">View and manage the complete course catalog</p>
            <Button variant="primary" fullWidth size="sm">
              View Catalog
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <Copy size={32} className="text-purple-600 mb-4" />
            <h3 className="text-lg font-black text-slate-900 mb-2">Clone Courses</h3>
            <p className="text-sm text-slate-600 mb-4">Duplicate courses for the next semester</p>
            <Button variant="primary" fullWidth size="sm">
              Clone Courses
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <BarChart3 size={32} className="text-orange-600 mb-4" />
            <h3 className="text-lg font-black text-slate-900 mb-2">Analytics</h3>
            <p className="text-sm text-slate-600 mb-4">View course enrollment and performance metrics</p>
            <Button variant="primary" fullWidth size="sm">
              View Analytics
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;