import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, Plus, Edit, Trash2, Users, Calendar, Award, Loader, X, CheckCircle, Clock } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';
import { getAllClasses, createClass, deleteClass, getAllUsers } from '../firebase/database';

const gradients = [
  { color: 'from-blue-500 to-blue-600', image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { color: 'from-purple-500 to-purple-600', image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { color: 'from-green-500 to-emerald-600', image: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { color: 'from-orange-500 to-red-500', image: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
];

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [newCourse, setNewCourse] = useState({
    name: '', code: '', description: '', schedule: '', room: '',
    semester: 'Spring 2026', credits: 3, facultyId: '', department: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const [classesRes, usersRes] = await Promise.all([getAllClasses(), getAllUsers()]);
    if (classesRes.success) setCourses(classesRes.classes);
    if (usersRes.success) setFaculty(usersRes.users.filter(u => u.role === 'faculty'));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = courses.filter(c =>
    !searchTerm ||
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newCourse.name || !newCourse.code) { alert('Please fill in class name and code.'); return; }
    setCreating(true);
    const gradIdx = courses.length % gradients.length;
    const selectedFaculty = faculty.find(f => f.id === newCourse.facultyId);
    const result = await createClass({
      ...newCourse,
      credits: parseInt(newCourse.credits),
      instructor: selectedFaculty?.name || 'TBA',
      color: gradients[gradIdx].color,
      image: gradients[gradIdx].image,
      icon: '📚'
    });
    if (result.success) {
      setSuccessMsg('Course created and students auto-enrolled!');
      setTimeout(() => setSuccessMsg(''), 4000);
      setShowModal(false);
      setNewCourse({ name: '', code: '', description: '', schedule: '', room: '', semester: 'Spring 2026', credits: 3, facultyId: '', department: '' });
      fetchData();
    } else {
      alert('Error: ' + result.error);
    }
    setCreating(false);
  };

  const handleDelete = async (courseId, courseName) => {
    if (!window.confirm(`Delete course "${courseName}"?`)) return;
    setDeleting(courseId);
    const result = await deleteClass(courseId);
    if (result.success) {
      setCourses(prev => prev.filter(c => c.id !== courseId));
      setSuccessMsg('Course deleted successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      alert('Error: ' + result.error);
    }
    setDeleting(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-700">Loading courses...</p>
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
              <h1 className="text-4xl font-black text-slate-900 mb-2">Course Management 📚</h1>
              <p className="text-lg text-slate-600">Create and manage all courses on the platform</p>
            </div>
            <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>Add Course</Button>
          </div>
        </motion.div>

        {successMsg && (
          <div className="p-4 mb-6 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="text-green-600" size={20} />
            <p className="text-green-700 font-bold">{successMsg}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'from-blue-500 to-blue-600' },
            { label: 'Faculty Members', value: faculty.length, icon: Users, color: 'from-purple-500 to-purple-600' },
            { label: 'Active Semester', value: 'Spring 2026', icon: Calendar, color: 'from-green-500 to-emerald-600' }
          ].map((stat, i) => (
            <Card key={i} className="p-6">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                <stat.icon size={22} className="text-white" />
              </div>
              <div className="text-sm font-bold text-slate-500 mb-1">{stat.label}</div>
              <div className="text-2xl font-black text-slate-900">{stat.value}</div>
            </Card>
          ))}
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">{searchTerm ? 'No courses found' : 'No courses yet'}</h3>
            <p className="text-slate-600 mb-4">{searchTerm ? 'Try a different search.' : 'Create your first course to get started.'}</p>
            {!searchTerm && <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>Create First Course</Button>}
          </Card>
        ) : (
          <div className="grid gap-4">
            {filtered.map((course, i) => (
              <Card key={i} hover className="overflow-hidden">
                <div className="flex">
                  <div className="w-2 flex-shrink-0" style={{ background: course.image }} />
                  <div className="flex-1 p-6 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">{course.code}</span>
                        {course.semester && <span className="text-xs text-slate-400">{course.semester}</span>}
                      </div>
                      <h3 className="text-lg font-black text-slate-900">{course.name}</h3>
                      <p className="text-sm text-slate-600">{course.instructor || 'No faculty assigned'}</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-500">
                      {course.schedule && <span className="flex items-center gap-1"><Clock size={14} />{course.schedule}</span>}
                      {course.room && <span className="flex items-center gap-1"><Calendar size={14} />{course.room}</span>}
                      <span className="flex items-center gap-1"><Award size={14} />{course.credits || 3} credits</span>
                    </div>
                    <button onClick={() => handleDelete(course.id, course.name)} disabled={deleting === course.id}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      {deleting === course.id ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-slate-900">Add New Course</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200"><X size={16} /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Course Name *</label>
                    <input type="text" value={newCourse.name} onChange={e => setNewCourse({...newCourse, name: e.target.value})}
                      placeholder="e.g., Data Structures"
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Course Code *</label>
                    <input type="text" value={newCourse.code} onChange={e => setNewCourse({...newCourse, code: e.target.value})}
                      placeholder="e.g., CS 202"
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Assign Faculty</label>
                  <select value={newCourse.facultyId} onChange={e => setNewCourse({...newCourse, facultyId: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500">
                    <option value="">Select Faculty (optional)</option>
                    {faculty.map(f => <option key={f.id} value={f.id}>{f.name} - {f.department || 'No dept'}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Schedule</label>
                    <input type="text" value={newCourse.schedule} onChange={e => setNewCourse({...newCourse, schedule: e.target.value})}
                      placeholder="Mon, Wed - 10 AM"
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Room</label>
                    <input type="text" value={newCourse.room} onChange={e => setNewCourse({...newCourse, room: e.target.value})}
                      placeholder="Room 101"
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Semester</label>
                    <select value={newCourse.semester} onChange={e => setNewCourse({...newCourse, semester: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500">
                      <option>Spring 2026</option><option>Fall 2026</option><option>Summer 2026</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Credits</label>
                    <select value={newCourse.credits} onChange={e => setNewCourse({...newCourse, credits: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500">
                      <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option>
                    </select>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
                  <strong>Auto-enrollment:</strong> All registered students will be automatically enrolled in this course.
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" fullWidth onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button variant="primary" fullWidth onClick={handleCreate} disabled={creating}>
                    {creating ? 'Creating...' : 'Create Course'}
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

export default CourseManagement;