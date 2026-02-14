import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, BookOpen, Calendar, TrendingUp, Award, 
  Settings, Shield, Activity, Database, Server,
  CheckCircle, AlertCircle, BarChart3, PieChart,
  Zap, Target, Globe, Lock
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Users', value: '1,245', icon: Users, color: 'from-blue-500 to-blue-600', trend: '+12%' },
    { label: 'Active Courses', value: '48', icon: BookOpen, color: 'from-purple-500 to-purple-600', trend: '+5%' },
    { label: 'System Uptime', value: '99.9%', icon: Server, color: 'from-green-500 to-emerald-600', trend: '+0.1%' },
    { label: 'Data Storage', value: '847GB', icon: Database, color: 'from-orange-500 to-red-500', trend: '+18%' },
  ];

  const systemHealth = [
    { name: 'API Response Time', value: 98, color: 'green' },
    { name: 'Database Performance', value: 95, color: 'green' },
    { name: 'Server Load', value: 72, color: 'orange' },
    { name: 'Network Latency', value: 88, color: 'green' },
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'New user registered',
      user: 'John Smith',
      time: '2 min ago',
      type: 'user',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      id: 2,
      action: 'Course published',
      user: 'Dr. Sarah Miller',
      time: '15 min ago',
      type: 'course',
      icon: BookOpen,
      color: 'text-purple-600'
    },
    {
      id: 3,
      action: 'System backup completed',
      user: 'System',
      time: '1 hour ago',
      type: 'system',
      icon: Shield,
      color: 'text-green-600'
    },
    {
      id: 4,
      action: 'Security update applied',
      user: 'System',
      time: '3 hours ago',
      type: 'security',
      icon: Lock,
      color: 'text-orange-600'
    },
  ];

  const pendingTasks = [
    { id: 1, task: 'Review pending user verifications', count: 8, priority: 'high' },
    { id: 2, task: 'Approve course material updates', count: 12, priority: 'medium' },
    { id: 3, task: 'System maintenance scheduled', count: 1, priority: 'high' },
    { id: 4, task: 'Review faculty applications', count: 5, priority: 'low' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
            System Overview 🎛️
          </h1>
          <p className="text-lg text-slate-600">Monitor and manage your academic platform</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <Card key={i} delay={i * 0.1} className="p-6 bg-gradient-to-br hover:shadow-xl transition-shadow">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <div className="text-sm font-bold text-slate-500 mb-1">{stat.label}</div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-black text-slate-900">{stat.value}</div>
                <span className="text-sm font-bold text-green-600">{stat.trend}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* System Health */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Activity size={24} className="text-blue-600" />
                System Health
              </h2>
              <div className="space-y-6">
                {systemHealth.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-slate-700">{item.name}</span>
                      <span className={`font-black ${
                        item.value >= 90 ? 'text-green-600' :
                        item.value >= 70 ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {item.value}%
                      </span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.value >= 90 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                          item.value >= 70 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                          'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                        style={{ width: `${item.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Activities */}
            <Card className="p-8">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Activity size={24} className="text-purple-600" />
                Recent Activities
              </h2>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      <activity.icon size={18} className={activity.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 font-semibold">
                        {activity.action}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="font-semibold">{activity.user}</span>
                        <span>•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" fullWidth size="sm" className="mt-4">
                View All Activities
              </Button>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Zap size={24} className="text-blue-600" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button variant="secondary" fullWidth size="sm" icon={Users}>
                  Add New User
                </Button>
                <Button variant="secondary" fullWidth size="sm" icon={BookOpen}>
                  Create Course
                </Button>
                <Button variant="secondary" fullWidth size="sm" icon={Shield}>
                  Security Audit
                </Button>
                <Button variant="secondary" fullWidth size="sm" icon={BarChart3}>
                  Generate Report
                </Button>
              </div>
            </Card>

            {/* Pending Tasks */}
            <Card className="p-6">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Target size={24} className="text-orange-600" />
                Pending Tasks
              </h3>
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                          {task.task}
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          task.priority === 'high' ? 'bg-red-100 text-red-600' :
                          task.priority === 'medium' ? 'bg-orange-100 text-orange-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-black text-sm flex-shrink-0 ml-2">
                        {task.count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" fullWidth size="sm" className="mt-4">
                View All Tasks
              </Button>
            </Card>

            {/* System Status */}
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircle size={32} className="text-white" />
                </div>
                <div className="font-black text-slate-900 text-lg mb-2">All Systems Operational</div>
                <div className="text-sm text-slate-600 mb-4">Last checked: 2 minutes ago</div>
                <Button variant="ghost" size="sm" icon={Activity}>
                  View Status Page
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;