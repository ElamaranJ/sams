import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Search, Filter, Download, Mail, Phone, 
  Shield, UserPlus, Edit, Trash2, MoreVertical,
  CheckCircle, XCircle, AlertCircle, Lock, Unlock,
  Eye, Calendar, Award, BookOpen, Settings, Upload,
  UserCheck, UserX, Activity, BarChart3, Plus, TrendingUp
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Sample user data
  const users = [
    {
      id: 1,
      name: 'Dr. Sarah Miller',
      email: 'sarah.miller@university.edu',
      phone: '+1 234-567-8901',
      role: 'faculty',
      department: 'Computer Science',
      status: 'active',
      joinDate: 'Jan 2020',
      avatar: '👩‍🏫',
      courses: 3,
      students: 125,
      lastActive: '2 hours ago'
    },
    {
      id: 2,
      name: 'Prof. John Davis',
      email: 'john.davis@university.edu',
      phone: '+1 234-567-8902',
      role: 'faculty',
      department: 'Mathematics',
      status: 'active',
      joinDate: 'Mar 2019',
      avatar: '👨‍🏫',
      courses: 2,
      students: 80,
      lastActive: '1 day ago'
    },
    {
      id: 3,
      name: 'Emma Johnson',
      email: 'emma.j@university.edu',
      phone: '+1 234-567-8903',
      role: 'student',
      department: 'Computer Science',
      status: 'active',
      joinDate: 'Sep 2023',
      avatar: '👩‍🎓',
      courses: 5,
      gpa: 3.8,
      lastActive: '30 minutes ago'
    },
    {
      id: 4,
      name: 'James Smith',
      email: 'james.s@university.edu',
      phone: '+1 234-567-8904',
      role: 'student',
      department: 'Computer Science',
      status: 'active',
      joinDate: 'Sep 2023',
      avatar: '👨‍🎓',
      courses: 4,
      gpa: 3.5,
      lastActive: '2 hours ago'
    },
    {
      id: 5,
      name: 'Admin User',
      email: 'admin@university.edu',
      phone: '+1 234-567-8905',
      role: 'admin',
      department: 'Administration',
      status: 'active',
      joinDate: 'Jan 2018',
      avatar: '👨‍💼',
      lastActive: '5 minutes ago'
    },
    {
      id: 6,
      name: 'Dr. Emily Chen',
      email: 'emily.chen@university.edu',
      phone: '+1 234-567-8906',
      role: 'faculty',
      department: 'Computer Science',
      status: 'inactive',
      joinDate: 'Jun 2021',
      avatar: '👩‍🏫',
      courses: 2,
      students: 65,
      lastActive: '2 weeks ago'
    }
  ];

  const roles = [
    { id: 'all', name: 'All Users', count: users.length, icon: Users, color: 'blue' },
    { id: 'student', name: 'Students', count: users.filter(u => u.role === 'student').length, icon: UserCheck, color: 'green' },
    { id: 'faculty', name: 'Faculty', count: users.filter(u => u.role === 'faculty').length, icon: Award, color: 'purple' },
    { id: 'admin', name: 'Admins', count: users.filter(u => u.role === 'admin').length, icon: Shield, color: 'orange' }
  ];

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    newThisMonth: 12
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    const badges = {
      admin: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Shield },
      faculty: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Award },
      student: { bg: 'bg-blue-100', text: 'text-blue-700', icon: BookOpen }
    };
    const badge = badges[role];
    const Icon = badge.icon;
    return (
      <span className={`px-3 py-1 ${badge.bg} ${badge.text} text-xs font-bold rounded-full flex items-center gap-1 w-fit`}>
        <Icon size={12} />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    return status === 'active' ? (
      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
        <CheckCircle size={12} />
        Active
      </span>
    ) : (
      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center gap-1">
        <XCircle size={12} />
        Inactive
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2">
                User Management 👥
              </h1>
              <p className="text-lg text-slate-600">Manage all users in the system</p>
            </div>
            <Button variant="primary" icon={UserPlus} onClick={() => setShowAddModal(true)}>
              Add New User
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Users', value: stats.total, icon: Users, color: 'from-blue-500 to-blue-600', change: '+8%' },
            { label: 'Active Users', value: stats.active, icon: UserCheck, color: 'from-green-500 to-emerald-600', change: '+5%' },
            { label: 'Inactive Users', value: stats.inactive, icon: UserX, color: 'from-red-500 to-red-600', change: '-2%' },
            { label: 'New This Month', value: stats.newThisMonth, icon: TrendingUp, color: 'from-purple-500 to-purple-600', change: '+12%' }
          ].map((stat, i) => (
            <Card key={i} delay={i * 0.1} className="p-6 bg-gradient-to-br hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon size={24} className="text-white" />
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-500 mb-1">{stat.label}</div>
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
            </Card>
          ))}
        </div>

        {/* Role Filters */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`p-4 rounded-xl font-bold transition-all ${
                  selectedRole === role.id
                    ? 'bg-slate-900 text-white shadow-lg scale-105'
                    : 'bg-white text-slate-700 hover:bg-slate-50 shadow'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon size={20} />
                  <span className={`text-2xl font-black ${selectedRole === role.id ? 'text-white' : `text-${role.color}-600`}`}>
                    {role.count}
                  </span>
                </div>
                <div className="text-sm">{role.name}</div>
              </button>
            );
          })}
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-semibold focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" icon={Upload} size="sm">
                Import
              </Button>
              <Button variant="outline" icon={Download} size="sm">
                Export
              </Button>
              <Button variant="outline" icon={Filter} size="sm">
                Filter
              </Button>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">Stats</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-4 text-right text-xs font-black text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                          {user.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-sm text-slate-600 flex items-center gap-1">
                            <Mail size={12} />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-700">{user.department}</div>
                      <div className="text-xs text-slate-500">Since {user.joinDate}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {user.role === 'faculty' && (
                          <>
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded">
                              {user.courses} Courses
                            </span>
                            <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded">
                              {user.students} Students
                            </span>
                          </>
                        )}
                        {user.role === 'student' && (
                          <>
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded">
                              {user.courses} Courses
                            </span>
                            <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded">
                              GPA: {user.gpa}
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">{user.lastActive}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors group">
                          <Eye size={16} className="text-slate-400 group-hover:text-blue-600" />
                        </button>
                        <button className="p-2 hover:bg-purple-50 rounded-lg transition-colors group">
                          <Edit size={16} className="text-slate-400 group-hover:text-purple-600" />
                        </button>
                        <button className="p-2 hover:bg-green-50 rounded-lg transition-colors group">
                          <Mail size={16} className="text-slate-400 group-hover:text-green-600" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors group">
                          <MoreVertical size={16} className="text-slate-400 group-hover:text-slate-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Showing <span className="font-bold text-slate-900">{filteredUsers.length}</span> of <span className="font-bold text-slate-900">{users.length}</span> users
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;