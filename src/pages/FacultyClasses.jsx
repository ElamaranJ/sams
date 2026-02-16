import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Users, Clock, Calendar, TrendingUp,
  FileText, Award, Plus, Edit, Download,
  BarChart3, CheckCircle, Settings, Bell, Video, QrCode, Upload, Loader,
  Trash2, X, ChevronRight, MoreVertical
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';
import { useAuth } from '../context/AuthContext';
import { getFacultyClasses, createClass, deleteClass } from '../firebase/database';

const gradients = [
  { color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-200' },
  { color: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-200' },
  { color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-200' },
  { color: 'from-rose-500 to-red-600', shadow: 'shadow-rose-200' },
];

const FacultyClasses = ({ onNavigate }) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [newClass, setNewClass] = useState({
    code: '',
    name: '',
    schedule: '',
    room: '',
    semester: 'Spring 2026',
    credits: 3
  });

  const fetchClasses = async () => {
    if (!user?.uid) return;
    setLoading(true);
    const result = await getFacultyClasses(user.uid);
    if (result.success) setClasses(result.classes);
    setLoading(false);
  };

  useEffect(() => { fetchClasses(); }, [user]);

  const handleCreateClass = async () => {
    if (!newClass.code || !newClass.name) {
      alert("Please fill in the Class Code and Name");
      return;
    }
    setCreating(true);
    const result = await createClass({
      ...newClass,
      facultyId: user.uid,
      instructor: user.name,
      enrolled: 0
    });
    
    if (result.success) {
      setShowCreateModal(false);
      fetchClasses();
      setNewClass({ code: '', name: '', schedule: '', room: '', semester: 'Spring 2026', credits: 3 });
    }
    setCreating(false);
  };

  const handleDeleteClass = async (e, classId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure? This will remove all students from this class.")) return;
    const result = await deleteClass(classId);
    if (result.success) fetchClasses();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 pt-24 pb-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-black text-slate-900 mb-2">My Classes 📚</h1>
            <p className="text-slate-600 font-medium text-lg">Manage your curriculum and student engagement</p>
          </motion.div>
          <Button variant="primary" size="lg" icon={Plus} onClick={() => setShowCreateModal(true)}>
            Create New Class
          </Button>
        </div>

        {/* Classes Grid */}
        {classes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <BookOpen size={64} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-400">No classes found</h3>
            <p className="text-slate-500 mb-6">Start by creating your first course</p>
            <Button variant="secondary" onClick={() => setShowCreateModal(true)}>Get Started</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {classes.map((cls, index) => {
              const grad = gradients[index % gradients.length];
              return (
                <motion.div 
                  key={cls.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-none bg-white">
                    {/* Header Image/Color */}
                    <div className={`h-32 bg-gradient-to-br ${grad.color} p-6 relative`}>
                      <div className="flex justify-between items-start text-white">
                        <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded-md backdrop-blur-md">
                          {cls.code}
                        </span>
                        <button 
                          onClick={(e) => handleDeleteClass(e, cls.id)}
                          className="p-2 bg-white/10 hover:bg-red-500 rounded-lg transition-colors text-white"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <h3 className="text-2xl font-black text-white mt-2 truncate">{cls.name}</h3>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Users size={16} className="text-blue-500" />
                          <span className="text-sm font-bold">{cls.enrolled || 0} Students</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock size={16} className="text-purple-500" />
                          <span className="text-sm font-bold">{cls.credits} Credits</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2 text-slate-500">
                          <Calendar size={16} className="text-emerald-500" />
                          <span className="text-sm font-bold truncate">{cls.schedule || 'Schedule not set'}</span>
                        </div>
                      </div>

                      {/* FIXED: Functional Quick Action Buttons */}
                      <div className="space-y-2 border-t pt-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Management Tools</p>
                        <div className="grid grid-cols-2 gap-2">
                          <QuickActionBtn 
                            icon={QrCode} 
                            label="Attendance" 
                            onClick={() => onNavigate('generate-qr')} 
                          />
                          <QuickActionBtn 
                            icon={Plus} 
                            label="+ Assignment" 
                            onClick={() => onNavigate('create-assignment')} 
                          />
                          <QuickActionBtn 
                            icon={FileText} 
                            label="Grading" 
                            onClick={() => onNavigate('evaluate')} 
                          />
                          <QuickActionBtn 
                            icon={Users} 
                            label="Students" 
                            onClick={() => onNavigate('students')} 
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateModal(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl">
              <h2 className="text-3xl font-black text-slate-900 mb-6">New Course</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                   <div className="col-span-1">
                     <label className="text-xs font-black text-slate-400 uppercase mb-2 block">Code</label>
                     <input type="text" placeholder="CS101" className="w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-blue-500 font-bold" value={newClass.code} onChange={e => setNewClass({...newClass, code: e.target.value})} />
                   </div>
                   <div className="col-span-2">
                     <label className="text-xs font-black text-slate-400 uppercase mb-2 block">Course Name</label>
                     <input type="text" placeholder="Advanced React" className="w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-blue-500 font-bold" value={newClass.name} onChange={e => setNewClass({...newClass, name: e.target.value})} />
                   </div>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase mb-2 block">Schedule</label>
                  <input type="text" placeholder="Mon, Wed - 10:00 AM" className="w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none focus:border-blue-500 font-bold" value={newClass.schedule} onChange={e => setNewClass({...newClass, schedule: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="ghost" fullWidth onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button variant="primary" fullWidth onClick={handleCreateClass} disabled={creating}>{creating ? 'Creating...' : 'Launch Course'}</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper Component for the buttons inside the card
const QuickActionBtn = ({ icon: Icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-700 rounded-xl text-xs font-black hover:bg-blue-600 hover:text-white transition-all duration-200 border border-slate-100"
  >
    <Icon size={14} />
    {label}
  </button>
);

export default FacultyClasses;