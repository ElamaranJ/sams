import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Users, Clock, Calendar, TrendingUp,
  FileText, Award, Plus, Edit, Download,
  BarChart3, CheckCircle, Settings, Bell, Video, QrCode, Upload, Loader,
  Trash2, X, ChevronRight
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';
import { useAuth } from '../context/AuthContext';
import { getFacultyClasses, createClass, deleteClass } from '../firebase/database';

const gradients = [
  { color: 'from-blue-500 to-blue-600', image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { color: 'from-purple-500 to-purple-600', image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { color: 'from-green-500 to-emerald-600', image: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { color: 'from-orange-500 to-red-500', image: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
  { color: 'from-teal-500 to-cyan-600', image: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
];

const FacultyClasses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [newClass, setNewClass] = useState({
    name: '', code: '', description: '', schedule: '', room: '', semester: 'Spring 2026', credits: 3
  });

  const fetchClasses = async () => {
    if (!user?.uid) return;
    setLoading(true);
    const result = await getFacultyClasses(user.uid);
    if (result.success) setCourses(result.classes);
    setLoading(false);
  };

  useEffect(() => { fetchClasses(); }, [user]);

  const handleCreateClass = async () => {
    if (!newClass.name || !newClass.code) {
      alert('Please fill in the class name and code.');
      return;
    }
    setCreating(true);
    const gradIdx = courses.length % gradients.length;
    const result = await createClass({
      ...newClass,
      credits: parseInt(newClass.credits),
      facultyId: user.uid,
      instructor: user.name,
      color: gradients[gradIdx].color,
      image: gradients[gradIdx].image,
      icon: '📚',
      studentsCount: 0
    });
    if (result.success) {
      alert('✅ Class created! All existing students have been auto-enrolled.');
      setShowCreateModal(false);
      setNewClass({ name: '', code: '', description: '', schedule: '', room: '', semester: 'Spring 2026', credits: 3 });
      fetchClasses();
    } else {
      alert('❌ Error: ' + result.error);
    }
    setCreating(false);
  };

  const handleDeleteClass = async (classId, className) => {
    if (!window.confirm(`Delete "${className}"? This cannot be undone.`)) return;
    setDeleting(classId);
    const result = await deleteClass(classId);
    if (result.success) {
      setCourses(prev => prev.filter(c => c.id !== classId));
    } else {
      alert('❌ Error: ' + result.error);
    }
    setDeleting(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-700">Loading your classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2">My Teaching Schedule 👨‍🏫</h1>
              <p className="text-lg text-slate-600">Manage your courses and students</p>
            </div>
            <Button variant="primary" icon={Plus} onClick={() => setShowCreateModal(true)}>
              Create New Class
            </Button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Active Courses', value: courses.length.toString(), icon: BookOpen, color: 'from-blue-500 to-blue-600' },
            { label: 'Total Assignments', value: '-', icon: FileText, color: 'from-orange-500 to-red-500' },
            { label: 'Avg Attendance', value: '-', icon: TrendingUp, color: 'from-green-500 to-emerald-600' }
          ].map((stat, i) => (
            <Card key={i} delay={i * 0.1} className="p-6 hover:shadow-xl transition-shadow">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <div className="text-sm font-bold text-slate-500 mb-1">{stat.label}</div>
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
            </Card>
          ))}
        </div>

        {courses.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen size={56} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">No Classes Created Yet</h3>
            <p className="text-slate-600 mb-6">
              Create your first class. Students will be <strong>automatically enrolled</strong> as soon as you create it!
            </p>
            <Button variant="primary" icon={Plus} onClick={() => setShowCreateModal(true)}>
              Create Your First Class
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6">
            {courses.map((course, i) => (
              <Card key={i} hover className="overflow-hidden">
                <div className="flex">
                  <div className="w-2 flex-shrink-0" style={{ background: course.image }} />
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                            {course.code}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">{course.semester}</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-1">{course.name}</h3>
                        {course.description && <p className="text-sm text-slate-600 mb-2">{course.description}</p>}
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          {course.schedule && <span className="flex items-center gap-1"><Clock size={14} />{course.schedule}</span>}
                          {course.room && <span className="flex items-center gap-1"><Calendar size={14} />{course.room}</span>}
                          <span className="flex items-center gap-1"><Award size={14} />{course.credits || 3} credits</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" icon={Trash2} onClick={() => handleDeleteClass(course.id, course.name)} disabled={deleting === course.id}>
                          {deleting === course.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <Button variant="outline" size="sm" icon={QrCode} className="flex-1">Generate QR</Button>
                      <Button variant="outline" size="sm" icon={Plus} className="flex-1">New Assignment</Button>
                      <Button variant="outline" size="sm" icon={BarChart3} className="flex-1">Analytics</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-slate-900">Create New Class</h3>
                <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Class Name *</label>
                  <input type="text" value={newClass.name} onChange={e => setNewClass({...newClass, name: e.target.value})}
                    placeholder="e.g., Introduction to Programming"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Class Code *</label>
                  <input type="text" value={newClass.code} onChange={e => setNewClass({...newClass, code: e.target.value})}
                    placeholder="e.g., CS 101"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Description</label>
                  <textarea value={newClass.description} onChange={e => setNewClass({...newClass, description: e.target.value})}
                    placeholder="Short description of the class..."
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Schedule</label>
                    <input type="text" value={newClass.schedule} onChange={e => setNewClass({...newClass, schedule: e.target.value})}
                      placeholder="e.g., Mon, Wed - 10AM"
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Room</label>
                    <input type="text" value={newClass.room} onChange={e => setNewClass({...newClass, room: e.target.value})}
                      placeholder="e.g., Lab 3"
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Semester</label>
                    <select value={newClass.semester} onChange={e => setNewClass({...newClass, semester: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500">
                      <option>Spring 2026</option>
                      <option>Fall 2026</option>
                      <option>Summer 2026</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Credits</label>
                    <select value={newClass.credits} onChange={e => setNewClass({...newClass, credits: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500">
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                    </select>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
                  <strong>✅ Auto-enrollment:</strong> All existing students will be automatically enrolled in this class when you create it.
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="ghost" fullWidth onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button variant="primary" fullWidth onClick={handleCreateClass} disabled={creating}>
                    {creating ? 'Creating...' : 'Create Class'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FacultyClasses;