import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Download, Calendar, Filter, 
  BarChart3, PieChart, Users, Award,
  FileText, CheckCircle, Clock, Target
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';
import { useAuth } from '../context/AuthContext';

const Reports = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [selectedReport, setSelectedReport] = useState('overview');

  // Sample data - replace with real data from your API
  const stats = [
    { label: 'Total Students', value: '156', change: '+12%', icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Avg Attendance', value: '89%', change: '+3%', icon: CheckCircle, color: 'from-green-500 to-emerald-600' },
    { label: 'Assignments Graded', value: '248', change: '+18%', icon: FileText, color: 'from-purple-500 to-purple-600' },
    { label: 'Avg Grade', value: 'B+', change: '+5%', icon: Award, color: 'from-orange-500 to-red-500' },
  ];

  const attendanceData = [
    { month: 'Jan', rate: 85 },
    { month: 'Feb', rate: 89 },
    { month: 'Mar', rate: 92 },
    { month: 'Apr', rate: 88 },
    { month: 'May', rate: 91 },
    { month: 'Jun', rate: 87 },
  ];

  const gradeDistribution = [
    { grade: 'A', count: 45, percentage: 29 },
    { grade: 'B', count: 62, percentage: 40 },
    { grade: 'C', count: 35, percentage: 22 },
    { grade: 'D', count: 10, percentage: 6 },
    { grade: 'F', count: 4, percentage: 3 },
  ];

  const topPerformers = [
    { name: 'Sarah Johnson', grade: 'A+', attendance: '98%' },
    { name: 'Michael Chen', grade: 'A+', attendance: '96%' },
    { name: 'Emily Davis', grade: 'A', attendance: '97%' },
    { name: 'James Wilson', grade: 'A', attendance: '95%' },
    { name: 'Jessica Brown', grade: 'A', attendance: '94%' },
  ];

  const recentAssignments = [
    { title: 'Database Design Project', submitted: 142, total: 156, avgGrade: 'B+' },
    { title: 'Web Development Quiz', submitted: 156, total: 156, avgGrade: 'A-' },
    { title: 'Algorithm Analysis', submitted: 138, total: 156, avgGrade: 'B' },
    { title: 'UI/UX Design Task', submitted: 145, total: 156, avgGrade: 'A' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2">
                Analytics & Reports 📊
              </h1>
              <p className="text-lg text-slate-600">Track performance and generate insights</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" icon={Filter}>
                Filter
              </Button>
              <Button icon={Download}>
                Export Report
              </Button>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2">
            {['Today', 'This Week', 'This Month', 'This Year'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period.toLowerCase().replace(' ', ''))}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  selectedPeriod === period.toLowerCase().replace(' ', '')
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
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
                <span className="text-sm font-bold text-green-600">{stat.change}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Attendance Chart */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <BarChart3 size={24} className="text-blue-600" />
                  Attendance Trends
                </h2>
                <Button variant="ghost" size="sm">View Details</Button>
              </div>

              {/* Simple Bar Chart */}
              <div className="space-y-4">
                {attendanceData.map((data, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-slate-700">{data.month}</span>
                      <span className="font-black text-slate-900">{data.rate}%</span>
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${data.rate}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Grade Distribution */}
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <PieChart size={24} className="text-purple-600" />
                  Grade Distribution
                </h2>
                <Button variant="ghost" size="sm">View Details</Button>
              </div>

              <div className="space-y-3">
                {gradeDistribution.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-black text-2xl ${
                      item.grade === 'A' ? 'bg-green-100 text-green-600' :
                      item.grade === 'B' ? 'bg-blue-100 text-blue-600' :
                      item.grade === 'C' ? 'bg-yellow-100 text-yellow-600' :
                      item.grade === 'D' ? 'bg-orange-100 text-orange-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {item.grade}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-slate-700">{item.count} students</span>
                        <span className="font-black text-slate-900">{item.percentage}%</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                          className={`h-full rounded-full ${
                            item.grade === 'A' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                            item.grade === 'B' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                            item.grade === 'C' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                            item.grade === 'D' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                            'bg-gradient-to-r from-red-500 to-red-600'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Assignments */}
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <FileText size={24} className="text-orange-600" />
                  Recent Assignments
                </h2>
                <Button variant="ghost" size="sm">View All</Button>
              </div>

              <div className="space-y-3">
                {recentAssignments.map((assignment, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-slate-900">{assignment.title}</div>
                      <span className="text-sm font-bold text-blue-600">{assignment.avgGrade}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <CheckCircle size={14} />
                        {assignment.submitted}/{assignment.total} submitted
                      </span>
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                          style={{ width: `${(assignment.submitted / assignment.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Top Performers */}
            <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Award size={24} className="text-amber-600" />
                Top Performers
              </h3>
              <div className="space-y-3">
                {topPerformers.map((student, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-900 text-sm">{student.name}</div>
                      <div className="text-xs text-slate-600 flex gap-2">
                        <span>Grade: {student.grade}</span>
                        <span>•</span>
                        <span>{student.attendance}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Target size={24} className="text-blue-600" />
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="text-sm text-slate-600 mb-1">Completion Rate</div>
                  <div className="text-2xl font-black text-slate-900">91%</div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full w-[91%]" />
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="text-sm text-slate-600 mb-1">Avg Response Time</div>
                  <div className="text-2xl font-black text-slate-900">2.3 days</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="text-sm text-slate-600 mb-1">Student Satisfaction</div>
                  <div className="text-2xl font-black text-slate-900">4.6/5.0</div>
                </div>
              </div>
            </Card>

            {/* Export Options */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <h3 className="text-xl font-black text-slate-900 mb-4">Export Reports</h3>
              <div className="space-y-2">
                <Button variant="secondary" fullWidth size="sm" icon={Download}>
                  Attendance Report
                </Button>
                <Button variant="secondary" fullWidth size="sm" icon={Download}>
                  Grade Report
                </Button>
                <Button variant="secondary" fullWidth size="sm" icon={Download}>
                  Performance Analytics
                </Button>
                <Button variant="secondary" fullWidth size="sm" icon={Download}>
                  Custom Report
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;