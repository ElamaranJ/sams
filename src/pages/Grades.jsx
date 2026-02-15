import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, TrendingUp, TrendingDown, BookOpen, 
  Calendar, Filter, Download, ChevronDown,
  BarChart3, Target, Star, CheckCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';
import { useAuth } from '../context/AuthContext';

const Grades = () => {
  const { user } = useAuth();
  const [selectedSemester, setSelectedSemester] = useState('current');

  const stats = [
    { label: 'Current GPA', value: '3.8', icon: Award, color: 'from-blue-500 to-blue-600', trend: '+0.2' },
    { label: 'Credits Earned', value: '45', icon: CheckCircle, color: 'from-green-500 to-emerald-600', trend: '+12' },
    { label: 'Courses Completed', value: '12', icon: BookOpen, color: 'from-purple-500 to-purple-600', trend: '+4' },
    { label: 'Class Rank', value: 'Top 15%', icon: Star, color: 'from-orange-500 to-red-500', trend: '+5%' }
  ];

  const courses = [
    {
      code: 'CS 101',
      name: 'Introduction to Programming',
      instructor: 'Dr. Sarah Miller',
      credits: 4,
      grade: 'A',
      percentage: 92,
      color: 'blue',
      components: [
        { name: 'Assignments', weight: 30, score: 95 },
        { name: 'Midterm', weight: 25, score: 88 },
        { name: 'Final Exam', weight: 35, score: 92 },
        { name: 'Participation', weight: 10, score: 90 }
      ]
    },
    {
      code: 'MATH 201',
      name: 'Discrete Mathematics',
      instructor: 'Prof. John Davis',
      credits: 3,
      grade: 'B+',
      percentage: 87,
      color: 'purple',
      components: [
        { name: 'Homework', weight: 25, score: 90 },
        { name: 'Quizzes', weight: 20, score: 85 },
        { name: 'Midterm', weight: 25, score: 82 },
        { name: 'Final Exam', weight: 30, score: 88 }
      ]
    },
    {
      code: 'CS 202',
      name: 'Data Structures',
      instructor: 'Dr. Emily Chen',
      credits: 4,
      grade: 'A-',
      percentage: 90,
      color: 'green',
      components: [
        { name: 'Coding Projects', weight: 40, score: 92 },
        { name: 'Labs', weight: 20, score: 88 },
        { name: 'Midterm', weight: 20, score: 85 },
        { name: 'Final Exam', weight: 20, score: 95 }
      ]
    },
    {
      code: 'WEB 301',
      name: 'Web Development',
      instructor: 'Prof. Michael Brown',
      credits: 3,
      grade: 'A',
      percentage: 94,
      color: 'orange',
      components: [
        { name: 'Projects', weight: 50, score: 96 },
        { name: 'Assignments', weight: 30, score: 92 },
        { name: 'Final Project', weight: 20, score: 94 }
      ]
    }
  ];

  const gradeHistory = [
    { semester: 'Fall 2024', gpa: 3.6, credits: 15 },
    { semester: 'Spring 2025', gpa: 3.7, credits: 18 },
    { semester: 'Fall 2025', gpa: 3.8, credits: 12 }
  ];

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-100';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-100';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-100';
    if (grade.startsWith('D')) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2">
                Grades 🎓
              </h1>
              <p className="text-lg text-slate-600">Track your academic performance</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" icon={Filter}>
                Filter
              </Button>
              <Button icon={Download}>
                Download Transcript
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <Card key={i} delay={i * 0.1} className="p-6 bg-gradient-to-br hover:shadow-xl transition-shadow">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <div className="text-sm font-bold text-slate-500 mb-1">{stat.label}</div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-black text-slate-900">{stat.value}</div>
                <span className="text-sm font-bold text-green-600">{stat.trend}</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Course Grades */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900">Current Semester</h2>
              <div className="text-sm text-slate-600">
                <span className="font-bold">{totalCredits}</span> Credits
              </div>
            </div>

            {courses.map((course, i) => (
              <Card key={i} hover className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                        {course.code}
                      </span>
                      <span className={`text-2xl font-black px-3 py-1 rounded-lg ${getGradeColor(course.grade)}`}>
                        {course.grade}
                      </span>
                      <span className="text-sm font-bold text-slate-500">
                        {course.percentage}%
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                      {course.name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {course.instructor} • {course.credits} Credits
                    </p>
                  </div>
                </div>

                {/* Grade Components */}
                <div className="space-y-3">
                  {course.components.map((comp, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-slate-700">
                          {comp.name} ({comp.weight}%)
                        </span>
                        <span className={`font-black ${
                          comp.score >= 90 ? 'text-green-600' :
                          comp.score >= 80 ? 'text-blue-600' :
                          comp.score >= 70 ? 'text-yellow-600' :
                          'text-orange-600'
                        }`}>
                          {comp.score}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            comp.score >= 90 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                            comp.score >= 80 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                            comp.score >= 70 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                            'bg-gradient-to-r from-orange-500 to-orange-600'
                          }`}
                          style={{ width: `${comp.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t-2 border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-700">Overall Grade</span>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-32 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            course.percentage >= 90 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                            course.percentage >= 80 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                            course.percentage >= 70 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                            'bg-gradient-to-r from-orange-500 to-orange-600'
                          }`}
                          style={{ width: `${course.percentage}%` }}
                        />
                      </div>
                      <span className="text-lg font-black text-slate-900">{course.percentage}%</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* GPA Calculator */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <BarChart3 size={24} className="text-blue-600" />
                GPA Breakdown
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-xl">
                  <div className="text-sm text-slate-600 mb-1">Current Semester</div>
                  <div className="text-3xl font-black text-blue-600">3.8</div>
                </div>
                <div className="p-4 bg-white rounded-xl">
                  <div className="text-sm text-slate-600 mb-1">Cumulative GPA</div>
                  <div className="text-3xl font-black text-slate-900">3.7</div>
                </div>
                <div className="p-4 bg-white rounded-xl">
                  <div className="text-sm text-slate-600 mb-1">Credits This Sem</div>
                  <div className="text-3xl font-black text-purple-600">{totalCredits}</div>
                </div>
              </div>
            </Card>

            {/* Grade Distribution */}
            <Card className="p-6">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Target size={24} className="text-green-600" />
                Grade Distribution
              </h3>
              <div className="space-y-3">
                {[
                  { grade: 'A', count: 2, color: 'green' },
                  { grade: 'A-', count: 1, color: 'green' },
                  { grade: 'B+', count: 1, color: 'blue' },
                  { grade: 'B', count: 0, color: 'blue' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                      item.color === 'green' ? 'bg-green-100 text-green-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {item.grade}
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            item.color === 'green' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                            'bg-gradient-to-r from-blue-500 to-blue-600'
                          }`}
                          style={{ width: `${(item.count / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-black text-slate-900 w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Grade History */}
            <Card className="p-6">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp size={24} className="text-orange-600" />
                GPA History
              </h3>
              <div className="space-y-3">
                {gradeHistory.map((item, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold text-slate-900">{item.semester}</div>
                      <div className="text-2xl font-black text-blue-600">{item.gpa}</div>
                    </div>
                    <div className="text-sm text-slate-600">
                      {item.credits} Credits
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grades;