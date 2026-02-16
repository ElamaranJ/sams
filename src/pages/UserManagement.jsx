import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Shield, Edit, Trash2, Loader, UserPlus, CheckCircle, XCircle, BookOpen, Mail } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';
import { getAllUsers, updateUser, deleteUser } from '../firebase/database';

const roleColors = { admin: 'bg-red-100 text-red-700', faculty: 'bg-blue-100 text-blue-700', student: 'bg-green-100 text-green-700' };
const roleIcons = { admin: '🎛️', faculty: '👨‍🏫', student: '👨‍🎓' };

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    const result = await getAllUsers();
    if (result.success) setUsers(result.users);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter(u => {
    const matchSearch = !searchTerm || u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = selectedRole === 'all' || u.role === selectedRole;
    return matchSearch && matchRole;
  });

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Remove user "${userName}"? This cannot be undone.`)) return;
    setDeletingId(userId);
    const result = await deleteUser(userId);
    if (result.success) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      setSuccessMsg('User removed successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      alert('Error: ' + result.error);
    }
    setDeletingId(null);
  };

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    faculty: users.filter(u => u.role === 'faculty').length,
    admins: users.filter(u => u.role === 'admin').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-700">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-2">User Management 👥</h1>
          <p className="text-lg text-slate-600">Manage all users on the platform</p>
        </motion.div>

        {successMsg && (
          <div className="p-4 mb-6 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="text-green-600" size={20} />
            <p className="text-green-700 font-bold">{successMsg}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Users', value: stats.total, color: 'from-blue-500 to-blue-600', icon: Users },
            { label: 'Students', value: stats.students, color: 'from-green-500 to-emerald-600', icon: Users },
            { label: 'Faculty', value: stats.faculty, color: 'from-purple-500 to-purple-600', icon: BookOpen },
            { label: 'Admins', value: stats.admins, color: 'from-red-500 to-red-600', icon: Shield }
          ].map((stat, i) => (
            <Card key={i} className="p-6">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                <stat.icon size={22} className="text-white" />
              </div>
              <div className="text-sm font-bold text-slate-500 mb-1">{stat.label}</div>
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500" />
          </div>
          <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}
            className="px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500">
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <Card className="p-12 text-center">
            <Users size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No users found</h3>
            <p className="text-slate-600">{searchTerm ? 'Try a different search term.' : 'No users registered yet.'}</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-100">
                    <th className="text-left px-6 py-4 text-sm font-black text-slate-700">User</th>
                    <th className="text-left px-6 py-4 text-sm font-black text-slate-700">Role</th>
                    <th className="text-left px-6 py-4 text-sm font-black text-slate-700">Department</th>
                    <th className="text-left px-6 py-4 text-sm font-black text-slate-700">Joined</th>
                    <th className="text-left px-6 py-4 text-sm font-black text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={u.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-sm">
                            {u.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{u.name}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1"><Mail size={10} />{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${roleColors[u.role] || 'bg-slate-100 text-slate-600'}`}>
                          {roleIcons[u.role]} {u.role?.charAt(0).toUpperCase() + u.role?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{u.department || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          disabled={deletingId === u.id}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove user"
                        >
                          {deletingId === u.id ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserManagement;