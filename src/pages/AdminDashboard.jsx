import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, BookOpen, Server, Database, Activity, Shield,
  CheckCircle, BarChart3, Zap, Lock, Loader, FileText,
  TrendingUp
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats, getAllUsers, getAllClasses } from '../firebase/database';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalStudents: 0, totalFaculty: 0, totalClasses: 0, totalAssignments: 0, pendingGrading: 0 });
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, usersRes] = await Promise.all([
          getDashboardStats(),
          getAllUsers()
        ]);
        if (statsRes.success) setStats(statsRes.stats);
        if (usersRes.success) {
          // Show 5 most recently registered users
          const sorted = [...usersRes.users].sort((a, b) =>
            new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          );
          setRecentUsers(sorted.slice(0, 5));
        }
      } catch (error) {
        console.error('Error loading admin dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const systemHealth = [
    { name: 'Firebase Auth', value: 100, color: 'green' },
    { name: 'Firestore Database', value: 100, color: 'green' },
    { name: 'User Enrollment System', value: 100, color: 'green' },
    { name: 'Assignment Tracking', value: 100, color: 'green' },
  ];

  const roleColors = { admin: 'bg-red-100 text-red-700', faculty: 'bg-blue-100 text-blue-700', student: 'bg-green-100 text-green-700' };
  const roleIcons = { admin: '🎛️', faculty: '👨‍🏫', student: '👨‍🎓' };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-700">Loading system overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
            System Overview 🎛️
          </h1>
          <p className="text-lg text-slate-600">Monitor and manage your academic platform</p>
        </motion.div>

        {/* Real Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-blue-600' },
            { label: 'Students', value: stats.totalStudents, icon: Users, color: 'from-green-500 to-emerald-600' },
            { label: 'Faculty', value: stats.totalFaculty, icon: BookOpen, color: 'from-purple-500 to-purple-600' },
            { label: 'Active Courses', value: stats.totalClasses, icon: BookOpen, color: 'from-teal-500 to-cyan-600' },
            { label: 'Assignments', value: stats.totalAssignments, icon: FileText, color: 'from-orange-500 to-red-500' },
            { label: 'Pending Grading', value: stats.pendingGrading, icon: TrendingUp, color: 'from-pink-500 to-rose-600', urgent: stats.pendingGrading > 0 },
          ].map((stat, i) => (
            <Card key={i} delay={i * 0.1} className="p-6 hover:shadow-xl transition-shadow">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <div className="text-sm font-bold text-slate-500 mb-1">{stat.label}</div>
              <div className={`text-3xl font-black ${stat.urgent ? 'text-red-600' : 'text-slate-900'}`}>{stat.value}</div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* System Health */}
            <Card className="p-8">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Activity size={24} className="text-blue-600" />
                System Health
              </h2>
              <div className="space-y-5">
                {systemHealth.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-slate-700">{item.name}</span>
                      <span className="font-black text-green-600">{item.value}% ✅</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" style={{ width: `${item.value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Users */}
            <Card className="p-8">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Users size={24} className="text-purple-600" />
                Recently Registered Users
              </h2>
              {recentUsers.length === 0 ? (
                <p className="text-slate-500 text-center py-6">No users registered yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentUsers.map((u, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-sm">
                        {u.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{u.name}</p>
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${roleColors[u.role] || 'bg-slate-100 text-slate-600'}`}>
                        {roleIcons[u.role]} {u.role}
                      </span>
                      <span className="text-xs text-slate-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Zap size={24} className="text-blue-600" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button variant="secondary" fullWidth size="sm" icon={Users}>Manage Users</Button>
                <Button variant="secondary" fullWidth size="sm" icon={BookOpen}>Manage Courses</Button>
                <Button variant="secondary" fullWidth size="sm" icon={Shield}>Security Settings</Button>
                <Button variant="secondary" fullWidth size="sm" icon={BarChart3}>View Reports</Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Database size={24} className="text-green-600" />
                Database Info
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Users', value: stats.totalUsers, icon: '👥' },
                  { label: 'Classes', value: stats.totalClasses, icon: '📚' },
                  { label: 'Assignments', value: stats.totalAssignments, icon: '📝' },
                  { label: 'Faculty', value: stats.totalFaculty, icon: '👨‍🏫' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-sm font-semibold text-slate-700">{item.icon} {item.label}</span>
                    <span className="text-sm font-black text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <h3 className="text-xl font-black text-slate-900 mb-3">Auto-Enrollment 🔄</h3>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex gap-2"><CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" /><span>New students auto-enroll in all classes</span></div>
                <div className="flex gap-2"><CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" /><span>New classes auto-enroll all students</span></div>
                <div className="flex gap-2"><CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" /><span>Assignments visible to all enrolled students</span></div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;