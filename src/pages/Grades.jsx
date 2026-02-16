import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, BookOpen, Loader, TrendingUp, CheckCircle, Star, FileText } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';
import { useAuth } from '../context/AuthContext';
import { getStudentGrades, getStudentAssignments } from '../firebase/database';

const letterGrade = (percent) => {
  if (percent >= 90) return 'A';
  if (percent >= 80) return 'B';
  if (percent >= 70) return 'C';
  if (percent >= 60) return 'D';
  return 'F';
};

const Grades = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;
      setLoading(true);
      const [gradesRes, assignRes] = await Promise.all([
        getStudentGrades(user.uid),
        getStudentAssignments(user.uid)
      ]);
      if (gradesRes.success) setGrades(gradesRes.grades);
      if (assignRes.success) setAssignments(assignRes.assignments);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const averageGrade = grades.length > 0
    ? grades.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.length
    : null;

  const getAssignment = (assignmentId) => assignments.find(a => a.id === assignmentId);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-700">Loading grades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-2">My Grades 🏆</h1>
          <p className="text-lg text-slate-600">Track your academic performance</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <Award size={24} className="text-white" />
            </div>
            <div className="text-sm font-bold text-slate-500 mb-1">Average Score</div>
            <div className="text-3xl font-black text-slate-900">
              {averageGrade !== null ? `${averageGrade.toFixed(1)}` : 'N/A'}
            </div>
          </Card>
          <Card className="p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <CheckCircle size={24} className="text-white" />
            </div>
            <div className="text-sm font-bold text-slate-500 mb-1">Graded Assignments</div>
            <div className="text-3xl font-black text-slate-900">{grades.length}</div>
          </Card>
          <Card className="p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <Star size={24} className="text-white" />
            </div>
            <div className="text-sm font-bold text-slate-500 mb-1">Letter Grade</div>
            <div className="text-3xl font-black text-slate-900">
              {averageGrade !== null ? letterGrade((averageGrade / 100) * 100) : 'N/A'}
            </div>
          </Card>
        </div>

        {/* Grades List */}
        {grades.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText size={56} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">No Grades Yet</h3>
            <p className="text-slate-600">
              Your grades will appear here after your faculty evaluates your submitted assignments.
              Submit your assignments to get graded!
            </p>
          </Card>
        ) : (
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-6">Grade Details</h2>
            <div className="space-y-4">
              {grades.map((grade, i) => {
                const assignment = getAssignment(grade.assignmentId);
                const percentage = assignment?.totalPoints
                  ? ((grade.grade / assignment.totalPoints) * 100).toFixed(1)
                  : null;
                return (
                  <Card key={i} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 mb-1">
                          {assignment?.title || 'Assignment'}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {assignment?.className || assignment?.classCode || 'Class'}
                          {' · '}Graded: {grade.gradedAt ? new Date(grade.gradedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-black" style={{ color: grade.grade >= (assignment?.totalPoints || 100) * 0.7 ? '#16a34a' : '#dc2626' }}>
                          {grade.grade}
                        </div>
                        <div className="text-sm text-slate-500">/{assignment?.totalPoints || 100}</div>
                        {percentage && (
                          <div className="text-lg font-bold text-slate-600 mt-1">
                            {percentage}% · {letterGrade(parseFloat(percentage))}
                          </div>
                        )}
                      </div>
                    </div>
                    {percentage && (
                      <div className="mb-3">
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${percentage}%`,
                              background: parseFloat(percentage) >= 70 ? 'linear-gradient(to right, #22c55e, #16a34a)' : 'linear-gradient(to right, #ef4444, #dc2626)'
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {grade.feedback && (
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-sm font-bold text-blue-800 mb-1">Faculty Feedback:</p>
                        <p className="text-sm text-blue-700">{grade.feedback}</p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Grades;