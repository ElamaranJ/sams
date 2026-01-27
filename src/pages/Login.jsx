import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/shared/GlassCard';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    email: 'student@sams.edu', 
    password: '', 
    role: 'student' 
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    login({ 
      name: formData.role === 'student' ? 'Alex Johnson' : formData.role === 'faculty' ? 'Dr. Sarah Miller' : 'Admin User',
      email: formData.email,
      role: formData.role,
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden">
              <img 
                src="/logo.png" 
                alt="SAMS Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/></svg>';
                }}
              />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Welcome Back
            </h2>
            <p className="text-slate-600">Sign in to continue learning</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Select Your Role</label>
              <div className="grid grid-cols-3 gap-2">
                {['student', 'faculty', 'admin'].map(role => (
                  <button
                    key={role}
                    onClick={() => setFormData({...formData, role, email: `${role}@sams.edu`})}
                    className={`py-3 px-4 rounded-xl font-bold capitalize transition-all ${
                      formData.role === role
                        ? 'bg-slate-800 text-white shadow-lg'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-slate-800 transition-colors"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-slate-800 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button onClick={handleLogin} variant="primary" fullWidth className="mt-6">
              Sign In
            </Button>

            <p className="text-center text-sm text-slate-600 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-slate-900 font-bold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;