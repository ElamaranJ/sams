import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, BookOpen, Calendar, TrendingUp, Award, Clock,
  CheckCircle, FileText, QrCode, Bell, Plus, Activity,
  ClipboardList, MessageSquare, Video, Loader, BarChart3
} from 'lucide-react';
import Card from '../components/shared/GlassCard';
import Button from '../components/ui/Button';
import Chatbot from '../components/shared/Chatbot';
import { useAuth } from '../context/AuthContext';
import { getFacultyClasses, getFacultyAssignments, getAssignmentSubmissions } from '../firebase/database';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [pendingGrading, setPendingGrading] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [showQRGenerator, setShowQRGenerator] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const [classesRes, assignmentsRes] = await Promise.all([
          getFacultyClasses(user.uid),
          getFacultyAssignments(user.uid)
        ]);

        if (classesRes.success) {
          setClasses(classesRes.classes);
          // Count unique students across all classes
          const studentSet = new Set();
          classesRes.classes.forEach(cls => {
            if (cls.enrolledStudents) {
              cls.enrolledStudents.forEach(s => studentSet.add(s));
            }
          });
          setTotalStudents(classesRes.classes.reduce((sum, cls) => sum + (cls.studentsCount || 0), 0));
        }

        if (assignmentsRes.success) {
          setAssignments(assignmentsRes.assignments);
          // Count pending submissions across all assignments
          let pending = 0;
          for (const assignment of assignmentsRes.assignments) {
            const subRes = await getAssignmentSubmissions(assignment.id);
            if (subRes.success) {
              pending += subRes.submissions.filter(s => s.status === 'submitted').length;
            }
          }
          setPendingGrading(pending);
        }
      } catch (error) {
        console.error('Error loading faculty dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const quickActions = [
    { id: 'qr', label: 'Generate QR', icon: QrCode, color: 'from-blue-500 to-blue-600' },
    { id: 'assignment', label: 'Create Assignment', icon: Plus, color: 'from-purple-500 to-purple-600' },
    { id: 'announcement', label: 'Announcements', icon: Bell, color: 'from-orange-500 to-orange-600' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, color: 'from-green-500 to-green-600' }
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Good day, Prof. {user?.name?.split(' ').slice(-1)[0]}! 👋
              </h1>
              <p className="text-lg text-slate-600">Here's what's happening with your classes today</p>
            </div>
            <Button variant="primary" icon={Video}>
              Start Live Class
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-4">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => action.id === 'qr' && setShowQRGenerator(true)}
                className={`bg-gradient-to-br ${action.color} text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all group`}
              >
                <action.icon size={28} className="mb-3 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-lg">{action.label}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Real Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Active Courses', value: classes.length, icon: BookOpen, color: 'from-purple-500 to-purple-600' },
            { label: 'Pending Grading', value: pendingGrading, icon: FileText, color: 'from-orange-500 to-red-500', urgent: pendingGrading > 0 },
            { label: 'Assignments Created', value: assignments.length, icon: ClipboardList, color: 'from-amber-500 to-yellow-600' },
            { label: 'Classes/Week', value: classes.length * 2, icon: Calendar, color: 'from-pink-500 to-rose-600' }
          ].map((stat, i) => (
            <Card key={i} delay={i * 0.05} className="p-6 hover:shadow-xl transition-shadow relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-16 -mt-16`}></div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg relative z-10`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <div className="text-sm font-bold text-slate-500 mb-1">{stat.label}</div>
              <div className={`text-3xl font-black ${stat.urgent ? 'text-red-600' : 'text-slate-900'}`}>
                {stat.value}
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Courses */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-6">Your Courses</h2>
              {classes.length === 0 ? (
                <Card className="p-8 text-center">
                  <BookOpen size={48} className="text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Classes Yet</h3>
                  <p className="text-slate-600 mb-4">
                    Create your first class to get started. Students will be automatically enrolled.
                  </p>
                  <p className="text-sm text-slate-500 bg-blue-50 p-3 rounded-xl">
                    Go to <strong>My Classes</strong> in the sidebar to create a class.
                  </p>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {classes.map((course, i) => (
                    <Card key={i} hover className="p-6">
                      <div className="flex gap-6">
                        <div
                          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 shadow-lg"
                          style={{ background: course.image || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                        >
                          {course.icon || '📚'}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-slate-500 mb-1">{course.code}</div>
                          <h3 className="text-xl font-black text-slate-900 mb-1">{course.name}</h3>
                          <p className="text-sm text-slate-600 mb-3">{course.schedule || 'Schedule TBA'}</p>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-50 rounded-xl p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Users size={16} className="text-blue-600" />
                                <span className="text-xs font-bold text-slate-500">Room</span>
                              </div>
                              <div className="text-sm font-black text-slate-900">{course.room || 'TBA'}</div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Calendar size={16} className="text-green-600" />
                                <span className="text-xs font-bold text-slate-500">Semester</span>
                              </div>
                              <div className="text-sm font-black text-green-600">{course.semester || 'Current'}</div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <FileText size={16} className="text-orange-600" />
                                <span className="text-xs font-bold text-slate-500">Credits</span>
                              </div>
                              <div className="text-sm font-black text-orange-600">{course.credits || 3}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Assignments */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-slate-900">Recent Assignments</h3>
              </div>
              {assignments.length === 0 ? (
                <div className="text-center py-6">
                  <FileText size={40} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No assignments created yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.slice(0, 4).map((a, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText size={22} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-black text-slate-900">{a.title}</div>
                        <div className="text-sm text-slate-500">{a.className} • Due {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'TBA'}</div>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        a.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {a.status || 'active'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Performance Overview */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp size={24} className="text-blue-600" />
                Overview
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-700">Total Courses</span>
                    <span className="font-black text-blue-600">{classes.length}</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: `${Math.min(classes.length * 20, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-700">Assignments</span>
                    <span className="font-black text-green-600">{assignments.length}</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" style={{ width: `${Math.min(assignments.length * 10, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-700">Pending Grading</span>
                    <span className="font-black text-orange-600">{pendingGrading}</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{ width: `${Math.min(pendingGrading * 5, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tips Card */}
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <h3 className="text-xl font-black text-slate-900 mb-4">Quick Tips 💡</h3>
              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex gap-2"><CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" /><span>Go to <strong>My Classes</strong> to create new courses</span></div>
                <div className="flex gap-2"><CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" /><span>Students <strong>auto-enroll</strong> when you create a class</span></div>
                <div className="flex gap-2"><CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" /><span>Use <strong>Create Assignment</strong> to post tasks to students</span></div>
                <div className="flex gap-2"><CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" /><span>Generate QR codes to take attendance easily</span></div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* QR Generator Modal */}
      <AnimatePresence>
        {showQRGenerator && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowQRGenerator(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <QrCode size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Generate Attendance QR</h3>
                <p className="text-slate-600">Go to "Generate QR" in the sidebar for full attendance functionality</p>
              </div>
              <Button variant="primary" fullWidth onClick={() => setShowQRGenerator(false)}>Got it!</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Chatbot />
    </div>
  );
};

export default FacultyDashboard;