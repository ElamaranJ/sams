import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Calendar, FileText, Award, CheckCircle, 
  Clock, ArrowRight, Loader, Bell
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';
import Chatbot from '../components/shared/Chatbot';
import { useAuth } from '../context/AuthContext';
import { 
  getStudentClasses, 
  getStudentAssignments,
  getStudentAttendance,
  getStudentGrades,
  getStudentSubmissions
} from '../firebase/database';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const [classesRes, assignmentsRes, attendanceRes, gradesRes, subRes] = await Promise.all([
          getStudentClasses(user.uid),
          getStudentAssignments(user.uid),
          getStudentAttendance(user.uid),
          getStudentGrades(user.uid),
          getStudentSubmissions(user.uid)
        ]);
        if (classesRes.success) setClasses(classesRes.classes);
        if (assignmentsRes.success) setAssignments(assignmentsRes.assignments);
        if (attendanceRes.success) setAttendance(attendanceRes.attendance);
        if (gradesRes.success) setGrades(gradesRes.grades);
        if (subRes.success) setSubmissions(subRes.submissions);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  // Calculate stats
  const submittedIds = new Set(submissions.map(s => s.assignmentId));
  const pendingAssignments = assignments.filter(a => {
    const dueDate = new Date(a.dueDate);
    return dueDate > new Date() && !submittedIds.has(a.id);
  });
  
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const attendanceRate = attendance.length > 0 
    ? Math.round((presentCount / attendance.length) * 100) 
    : 0;

  const averageGrade = grades.length > 0
    ? (grades.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.length).toFixed(1)
    : null;

  const upcomingAssignments = assignments
    .filter(a => new Date(a.dueDate) > new Date() && !submittedIds.has(a.id))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-lg text-slate-600">Ready to continue your learning journey?</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card delay={0} className="p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <BookOpen size={24} className="text-white" />
            </div>
            <div className="text-sm font-bold text-slate-500 mb-1">Active Courses</div>
            <div className="text-3xl font-black text-slate-900">{classes.length}</div>
          </Card>

          <Card delay={0.1} className="p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <FileText size={24} className="text-white" />
            </div>
            <div className="text-sm font-bold text-slate-500 mb-1">Assignments Due</div>
            <div className="text-3xl font-black text-slate-900">{pendingAssignments.length}</div>
          </Card>

          <Card delay={0.2} className="p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <CheckCircle size={24} className="text-white" />
            </div>
            <div className="text-sm font-bold text-slate-500 mb-1">Attendance Rate</div>
            <div className="text-3xl font-black text-slate-900">
              {attendance.length > 0 ? `${attendanceRate}%` : '—'}
            </div>
          </Card>

          <Card delay={0.3} className="p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <Award size={24} className="text-white" />
            </div>
            <div className="text-sm font-bold text-slate-500 mb-1">Avg Grade</div>
            <div className="text-3xl font-black text-slate-900">{averageGrade || '—'}</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Your Courses</h2>
            
            {classes.length === 0 ? (
              <Card className="p-8 text-center">
                <BookOpen size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Classes Yet</h3>
                <p className="text-slate-600">
                  You'll be automatically enrolled when your faculty creates classes. Check back soon!
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {classes.map((course, i) => (
                  <Card key={i} hover className="p-6">
                    <div className="flex gap-4">
                      <div 
                        className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl"
                        style={{ background: course.image || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                      >
                        {course.icon || '📚'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">{course.code}</span>
                          {course.semester && <span className="text-xs text-slate-400">{course.semester}</span>}
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-1">{course.name}</h3>
                        <p className="text-sm text-slate-600 mb-2">{course.instructor}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          {course.schedule && <span className="flex items-center gap-1"><Clock size={14} />{course.schedule}</span>}
                          {course.room && <span className="flex items-center gap-1"><Calendar size={14} />{course.room}</span>}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-6">Upcoming</h2>
            <div className="space-y-4">
              {upcomingAssignments.length === 0 ? (
                <Card className="p-5 text-center">
                  <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600">All caught up! 🎉</p>
                  <p className="text-xs text-slate-500 mt-1">No pending assignments</p>
                </Card>
              ) : (
                upcomingAssignments.map((assignment, i) => (
                  <Card key={i} className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <FileText size={24} className="text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900">{assignment.title}</div>
                        <div className="text-sm text-slate-500">
                          Due {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'TBA'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <BookOpen size={12} />
                      <span>{assignment.className || assignment.classCode}</span>
                      <span>•</span>
                      <Award size={12} />
                      <span>{assignment.totalPoints} pts</span>
                    </div>
                  </Card>
                ))
              )}

              <Card className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <div className="text-center">
                  <Bell size={28} className="text-purple-600 mx-auto mb-2" />
                  <div className="font-bold text-slate-900 mb-1">Attendance</div>
                  <div className="text-4xl font-black text-purple-600 mb-1">{presentCount}</div>
                  <div className="text-xs text-slate-600">Sessions attended</div>
                  {attendance.length > 0 && (
                    <div className="mt-2 text-sm font-bold text-purple-700">{attendanceRate}% rate</div>
                  )}
                </div>
              </Card>

              {grades.length > 0 && (
                <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <div className="text-center">
                    <Award size={28} className="text-green-600 mx-auto mb-2" />
                    <div className="font-bold text-slate-900 mb-1">Recent Grade</div>
                    <div className="text-4xl font-black text-green-600 mb-1">{grades[0].grade}</div>
                    <div className="text-xs text-slate-600">Latest graded assignment</div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <Chatbot />
    </div>
  );
};

export default StudentDashboard;