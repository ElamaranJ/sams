import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Clock, Calendar, FileText, Award, TrendingUp, ChevronRight, Loader, Video } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';
import { useAuth } from '../context/AuthContext';
import { getStudentClasses } from '../firebase/database';

const Classes = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const result = await getStudentClasses(user.uid);
        if (result.success) {
          setCourses(result.classes);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to load classes');
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [user]);

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
          <h1 className="text-4xl font-black text-slate-900 mb-2">My Classes 📚</h1>
          <p className="text-lg text-slate-600">All classes you're enrolled in</p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-red-600 font-semibold">{error}</p>
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Enrolled Courses', value: courses.length.toString(), icon: BookOpen, color: 'from-blue-500 to-blue-600' },
            { label: 'This Semester', value: courses.filter(c => c.semester?.includes('2026')).length.toString(), icon: Calendar, color: 'from-green-500 to-emerald-600' },
            { label: 'Total Credits', value: courses.reduce((sum, c) => sum + (c.credits || 3), 0).toString(), icon: Award, color: 'from-orange-500 to-red-500' }
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

        {/* Courses */}
        {courses.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen size={56} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">No Classes Yet</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              You will be automatically enrolled in classes when your faculty creates them.
              Check back once your faculty has set up their courses!
            </p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {courses.map((course, i) => (
              <Card key={i} hover className="overflow-hidden">
                <div className="flex">
                  <div className="w-2 flex-shrink-0" style={{ background: course.image || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} />
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">{course.code}</span>
                          {course.semester && <span className="text-xs font-semibold text-slate-400">{course.semester}</span>}
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-1">{course.name}</h3>
                        <p className="text-sm text-slate-600 flex items-center gap-2 mb-2">
                          <Users size={14} /> {course.instructor}
                        </p>
                        {course.description && <p className="text-sm text-slate-500 mb-3">{course.description}</p>}
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          {course.schedule && <span className="flex items-center gap-1"><Clock size={14} />{course.schedule}</span>}
                          {course.room && <span className="flex items-center gap-1"><Calendar size={14} />{course.room}</span>}
                          {course.credits && <span className="flex items-center gap-1"><Award size={14} />{course.credits} credits</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Classes;