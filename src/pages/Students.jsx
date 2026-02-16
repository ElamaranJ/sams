import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, BookOpen, Loader, Award, Mail, Calendar } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';
import { useAuth } from '../context/AuthContext';
import { getFacultyClasses, getClassStudents } from '../firebase/database';

const Students = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user?.uid) return;
      setLoading(true);
      const result = await getFacultyClasses(user.uid);
      if (result.success) {
        setClasses(result.classes);
        if (result.classes.length > 0) setSelectedClass(result.classes[0]);
      }
      setLoading(false);
    };
    fetchClasses();
  }, [user]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) return;
      setLoadingStudents(true);
      const result = await getClassStudents(selectedClass.id);
      if (result.success) setStudents(result.students);
      setLoadingStudents(false);
    };
    fetchStudents();
  }, [selectedClass]);

  const filtered = students.filter(s =>
    !searchTerm ||
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Students 👨‍🎓</h1>
          <p className="text-lg text-slate-600">View students enrolled in your classes</p>
        </motion.div>

        {classes.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Classes Yet</h3>
            <p className="text-slate-600">Create a class first to see enrolled students.</p>
          </Card>
        ) : (
          <>
            <div className="flex gap-4 mb-6">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">Select Class</label>
                <select value={selectedClass?.id || ''} onChange={e => setSelectedClass(classes.find(c => c.id === e.target.value))}
                  className="px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500">
                  {classes.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                </select>
              </div>
              <div className="flex-1 relative">
                <label className="text-sm font-bold text-slate-700 mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search students..."
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>

            {loadingStudents ? (
              <div className="text-center py-12"><Loader className="animate-spin w-10 h-10 text-blue-600 mx-auto" /></div>
            ) : filtered.length === 0 ? (
              <Card className="p-12 text-center">
                <Users size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {searchTerm ? 'No students found' : 'No students enrolled yet'}
                </h3>
                <p className="text-slate-600">
                  {searchTerm ? 'Try a different search.' : 'Students will appear here once they register and are auto-enrolled in this class.'}
                </p>
              </Card>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black text-slate-900">
                    {selectedClass?.name} — {filtered.length} Students
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((s, i) => (
                    <Card key={i} hover className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                          {s.name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-slate-900 truncate">{s.name}</h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                            <Mail size={11} /> {s.email}
                          </p>
                          {s.studentId && <p className="text-xs text-slate-500 mt-1">ID: {s.studentId}</p>}
                          {s.department && <p className="text-xs text-blue-600 font-semibold mt-1">{s.department}</p>}
                          {s.createdAt && (
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                              <Calendar size={10} /> Joined: {new Date(s.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Students;