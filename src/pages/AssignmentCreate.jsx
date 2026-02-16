import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Clock, BookOpen, Check, Loader, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';
import { useAuth } from '../context/AuthContext';
import { getFacultyClasses, createAssignment } from '../firebase/database';

const AssignmentCreate = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    dueDate: '',
    totalPoints: 100,
    instructions: ''
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user?.uid) return;
      setLoadingClasses(true);
      const result = await getFacultyClasses(user.uid);
      if (result.success) {
        setClasses(result.classes);
        if (result.classes.length > 0) {
          setFormData(prev => ({ ...prev, classId: result.classes[0].id }));
        }
      } else {
        setError('Failed to load classes: ' + result.error);
      }
      setLoadingClasses(false);
    };
    fetchClasses();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);

    if (!formData.classId) { setError('Please select a class'); setLoading(false); return; }
    if (!formData.title || !formData.description || !formData.instructions) { setError('Please fill in all required fields'); setLoading(false); return; }
    if (!formData.dueDate) { setError('Please set a due date'); setLoading(false); return; }

    const dueDate = new Date(formData.dueDate);
    if (dueDate <= new Date()) { setError('Due date must be in the future'); setLoading(false); return; }

    try {
      const selectedClass = classes.find(c => c.id === formData.classId);
      const assignmentData = {
        title: formData.title,
        description: formData.description,
        instructions: formData.instructions,
        classId: formData.classId,
        className: selectedClass?.name || '',
        classCode: selectedClass?.code || '',
        dueDate: formData.dueDate,
        totalPoints: parseInt(formData.totalPoints),
        facultyId: user.uid,
        facultyName: user.name,
        createdBy: user.name,
        status: 'active',
        submissions: 0
      };

      const result = await createAssignment(assignmentData);
      if (result.success) {
        setSuccess(true);
        setFormData({
          title: '', description: '',
          classId: classes.length > 0 ? classes[0].id : '',
          dueDate: '', totalPoints: 100, instructions: ''
        });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError('Error creating assignment: ' + result.error);
      }
    } catch (err) {
      setError('Unexpected error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingClasses) {
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
      <div className="max-w-4xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Create Assignment 📝</h1>
          <p className="text-lg text-slate-600">Create a new assignment for your students</p>
        </motion.div>

        {classes.length === 0 && (
          <Card className="p-8 mb-6 bg-yellow-50 border-yellow-200">
            <div className="text-center">
              <BookOpen size={48} className="text-yellow-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Classes Found</h3>
              <p className="text-slate-700">
                You need to create a class first before creating assignments.
                Go to <strong>My Classes</strong> in the sidebar to create one.
              </p>
            </div>
          </Card>
        )}

        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 mb-6 bg-green-50 border-2 border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Check className="text-green-600" size={24} />
              <div>
                <p className="text-green-700 font-bold">Assignment created successfully!</p>
                <p className="text-green-600 text-sm">All enrolled students can now see this assignment.</p>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="p-4 mb-6 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {classes.length > 0 && (
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Select Class *</label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({...formData, classId: e.target.value})}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-slate-800 transition-colors"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.code} - {cls.name}</option>
                  ))}
                </select>
                <p className="text-sm text-slate-500 mt-1">{classes.length} class(es) available</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Assignment Title *</label>
                <input type="text" value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Programming Assignment 1" required
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-slate-800 transition-colors" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description *</label>
                <textarea value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the assignment..." required rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-slate-800 transition-colors" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Detailed Instructions *</label>
                <textarea value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  placeholder="Provide detailed instructions for students..." required rows={6}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-slate-800 transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Due Date & Time *</label>
                  <input type="datetime-local" value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    required min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-slate-800 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Total Points *</label>
                  <input type="number" value={formData.totalPoints}
                    onChange={(e) => setFormData({...formData, totalPoints: parseInt(e.target.value)})}
                    min="1" required
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-slate-800 transition-colors" />
                </div>
              </div>

              <Button type="submit" variant="primary" fullWidth disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2"><Loader className="animate-spin" size={20} />Creating Assignment...</span>
                ) : (
                  <span className="flex items-center gap-2"><FileText size={20} />Create Assignment</span>
                )}
              </Button>
            </form>
          </Card>
        )}

        <Card className="p-6 mt-6 bg-blue-50 border-blue-200">
          <h3 className="font-bold text-slate-900 mb-2">📌 How it works</h3>
          <p className="text-sm text-slate-700 mb-2">
            Once you create an assignment, ALL students enrolled in the selected class will see it automatically on their dashboard — no button clicks needed!
          </p>
          <p className="text-sm text-slate-700">
            Students can then submit their work from the <strong>Assignments</strong> page.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AssignmentCreate;